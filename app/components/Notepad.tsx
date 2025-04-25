import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import debounce from "lodash/debounce";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { ModeToggle } from "../components/ToggleButton";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';
import 'react-quill/dist/quill.snow.css';
import Cursor from "./Cursor";
import ReactQuillLib from 'react-quill';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
}) as typeof ReactQuillLib;

interface NotepadPorps {
  notepadId: string;
}

interface NotepadRow {
  id: string;
  content: string;
}

interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  username: string;
  color: string;
}

const Notepad: React.FC<NotepadPorps> = ({ notepadId }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSavedContent = useRef(content);
  const quillRef = useRef<ReactQuillLib>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const userId = useRef(uuidv4());
  const cursorChannel = useRef<RealtimeChannel | null>(null);
  const userColor = useRef(`hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);
  const userName = useRef(`${Math.floor(Math.random() * 1000)}`);
  const [cursors, setCursors] = useState<{ [key: string]: CursorPosition }>({});

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ 'list': 'bullet' }],
      ['link']
    ]
  };

  // Initialize cursor handling
  useEffect(() => {
    if (!editorRef.current) return;

    let rafId: number;
    let lastPosition = { x: 0, y: 0 };

    const updateCursorPosition = (e: MouseEvent) => {
      if (!cursorChannel.current || !editorRef.current) return;

      const rect = editorRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only update if position changed significantly (by 1 or more pixels)
      if (Math.abs(x - lastPosition.x) >= 1 || Math.abs(y - lastPosition.y) >= 1) {
        lastPosition = { x, y };
        
        // Cancel previous frame if it exists
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        // Schedule new frame
        rafId = requestAnimationFrame(() => {
          cursorChannel.current?.send({
            type: 'broadcast',
            event: 'cursor_move',
            payload: {
              userId: userId.current,
              x,
              y,
              username: userName.current,
              color: userColor.current
            }
          });
        });
      }
    };

    const debouncedUpdateCursor = debounce(updateCursorPosition, 8); // Reduced from 16ms to 8ms

    // Set up cursor channel with lower throttle
    cursorChannel.current = supabase.channel(`cursors_${notepadId}`, {
      config: {
        broadcast: { ack: false } // Disable ack for faster broadcasting
      }
    })
    .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
      if (payload.userId !== userId.current) {
        setCursors(prev => ({
          ...prev,
          [payload.userId]: payload
        }));
      }
    })
    .on('presence', { event: 'sync' }, () => {
      const state = cursorChannel.current?.presenceState() || {};
      console.log('Presence state:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Join:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Leave:', key, leftPresences);
      // Remove cursor when user leaves
      setCursors(prev => {
        const newCursors = { ...prev };
        leftPresences.forEach((presence: any) => {
          delete newCursors[presence.userId];
        });
        return newCursors;
      });
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await cursorChannel.current?.track({
          userId: userId.current,
          username: userName.current
        });
      }
    });

    // Add mouse move listener
    editorRef.current.addEventListener('mousemove', debouncedUpdateCursor, { passive: true });

    // Cleanup
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      editorRef.current?.removeEventListener('mousemove', debouncedUpdateCursor);
      if (cursorChannel.current) {
        supabase.removeChannel(cursorChannel.current);
      }
    };
  }, [notepadId]);

  // Fetch initial content
  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("notepad")
        .select("content")
        .eq("id", notepadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: insertData, error: insertError } = await supabase
            .from("notepad")
            .insert({ id: notepadId, content: "" })
            .select();
          
          if (insertError) {
            setError(`Failed to initialize notepad: ${insertError.message}`);
          } else if (insertData) {
            lastSavedContent.current = "";
            setContent("");
          }
        } else {
          setError(`Failed to load content: ${error.message}`);
        }
      } else if (data) {
        lastSavedContent.current = data.content || "";
        setContent(data.content || "");
      }
      setIsInitialized(true);
    };

    fetchContent();
  }, [notepadId]);

  // Set up real-time content sync
  useEffect(() => {
    if (!isInitialized) return;

    const channel = supabase.channel(`notepad_${notepadId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'notepad', 
          filter: `id=eq.${notepadId}` 
        },
        (payload) => {
          const newContent = (payload.new as NotepadRow).content;
          if (newContent !== lastSavedContent.current) {
            lastSavedContent.current = newContent || "";
            setContent(newContent || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notepadId, isInitialized]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    saveContent(newContent);
  };

  const saveContent = useCallback(
    debounce(async (newContent: string) => {
      if (!isInitialized) return;
      
      setIsSaving(true);
      setError(null);
      
      if (newContent !== lastSavedContent.current) {
        const { error } = await supabase
          .from("notepad")
          .update({ content: newContent })
          .eq("id", notepadId);

        if (error) {
          setError("Failed to save changes. Please try again.");
          toast.error("Failed to save changes");
        } else {
          lastSavedContent.current = newContent;
        }
      }
      
      setIsSaving(false);
    }, 1000),
    [notepadId, isInitialized]
  );

  const removeExtraSpaces = () => {
    const cleanedContent = content
      .replace(/<p><br><\/p>/g, '')
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/(<p><br><\/p>)+/g, '<p><br></p>')
      .trim();
    setContent(cleanedContent);
    saveContent(cleanedContent);
    toast.success("Empty lines removed");
  };

  const styleString = `
    .ql-container {
      border: none !important;
    }
    .ql-toolbar {
      border: none !important;
      border-bottom: 1px solid var(--border) !important;
      padding: 8px 12px;
      background: var(--background);
    }
    .ql-editor {
      padding: 1.5rem !important;
      minHeight: calc(100vh - 250px);
      fontSize: 2em !important;
      color: ${theme === 'dark' ? 'white !important' : 'black !important'};
      @media(max-width: 768px) {
        paddingBottom: 8rem !important;
        fontSize: 1.5em !important;
      }
    }
    .ql-editor * {
      color: inherit !important;
    }
    .ql-editor p, .ql-editor span {
      color: inherit !important;
    }
    .dark .ql-editor {
      background: var(--background);
      color: white !important;
    }
    .dark .ql-editor * {
      color: inherit !important;
    }
  `;

  return (
    <div className="container px-3 max-w-[1440px]">
      <style>{styleString}</style>
      <Toaster />
      <div className="flex items-center justify-between px-3">
        <h1 className="text-lg md:text-xl lg:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Real-Time Notepad</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={removeExtraSpaces}>Remove Space</Button>
          <ModeToggle />
        </div>
      </div>
      <div 
        ref={editorRef}
        className="relative bg-white shadow-md rounded-lg overflow-hidden dark:bg-black dark:border dark:text-white"
      >
        {/* Render other users' cursors */}
        {Object.values(cursors).map((cursor) => (
          <Cursor
            key={cursor.userId}
            x={cursor.x}
            y={cursor.y}
            color={cursor.color}
            username={cursor.username}
          />
        ))}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          className="w-full max-w-[1440px] h-[calc(100vh-200px)] p-6 text-lg text-gray-800 dark:text-white dark:border focus:outline-none resize-none"
          value={content}
          modules={modules}
          onChange={handleChange}
          placeholder="Start typing..."
        />
        {isSaving && (
          <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Saving...
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Notepad;