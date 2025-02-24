import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import debounce from "lodash/debounce";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useTheme } from "next-themes";
import { ModeToggle } from "../components/ToggleButton";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface NotepadPorps {
  notepadId: string;
}

interface NotepadRow {
  id: string;
  content: string;
}

const Notepad: React.FC<NotepadPorps> = ({ notepadId }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSavedContent = useRef(content);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{'header': [1, 2, 3, 4, 5, 6, false]}],
      ['blockquote', 'code-block'],
      [{ 'list': 'bullet' }],
      ['link']
    ],
  };

  const quillStyles = {
    '.ql-container': {
      border: 'none !important',
    },
    '.ql-toolbar': {
      border: 'none !important',
      borderBottom: '1px solid var(--border) !important',
      padding: '8px 12px',
      background: 'var(--background)',
    },
    '.ql-editor': {
      padding: '1.5rem !important',
      minHeight: 'calc(100vh - 250px)',
      fontSize: '2em',
      color: theme === 'dark' ? 'white !important' : 'black !important',
    },
    '.ql-editor *': {
      color: 'inherit !important',
    },
    '.ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6, .ql-editor p, .ql-editor span': {
      color: 'inherit !important',
    },
    '.dark .ql-editor': {
      background: 'var(--background)',
      color: 'white !important',
    },
    '.dark .ql-editor *': {
      color: 'inherit !important',
    },
  };

  const styleString = Object.entries(quillStyles)
    .map(([selector, rules]) => 
      `${selector} { ${typeof rules === 'string' ? rules : Object.entries(rules).map(([k, v]) => `${k}: ${v}`).join('; ')} }`
    )
    .join('\n');

  useEffect(() => {
    const fetchContent = async () => {
      console.log('Fetching content...');
      const { data, error } = await supabase
        .from("notepad")
        .select("content")
        .eq("id", notepadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No data found, creating initial row");
          const { data: insertData, error: insertError } = await supabase
            .from("notepad")
            .insert({ id: notepadId, content: "" })
            .select();
          
          if (insertError) {
            console.error("Error creating initial row:", insertError);
            setError(`Failed to initialize notepad: ${insertError.message}`);
          } else if (insertData) {
            console.log("Initial row created successfully:", insertData);
            lastSavedContent.current = "";
            setContent("");
          }
        } else {
          console.error("Error fetching content:", error);
          setError(`Failed to load content: ${error.message}`);
        }
      } else if (data) {
        console.log('Content fetched successfully:', data);
        lastSavedContent.current = data.content || "";
        setContent(data.content || "");
      }

      setIsInitialized(true);
    };

    fetchContent();
  }, [notepadId]);

  useEffect(() => {
    let channel: RealtimeChannel;

    if (isInitialized) {
      channel = supabase.channel(`notepad_${notepadId}`)
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'notepad', 
            filter: `id=eq.${notepadId}` 
          },
          (payload) => {
            console.log("Received real-time update:", payload);
            const newContent = (payload.new as NotepadRow).content;
            if (newContent !== lastSavedContent.current) {
              lastSavedContent.current = newContent || "";
              setContent(newContent || "");
            }
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });
    }

    return () => {
      if (channel) {
        console.log("Cleaning up channel subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [notepadId, isInitialized]);

  const saveContent = useCallback(
    debounce(async (newContent: string) => {
      if (!isInitialized) return;
      
      setIsSaving(true);
      setError(null);
      
      if (newContent !== lastSavedContent.current) {
        console.log("Saving content:", newContent);
        const { error } = await supabase
          .from("notepad")
          .update({ content: newContent })
          .eq("id", notepadId);

        if (error) {
          console.error("Error updating content:", error.message);
          setError("Failed to save changes. Please try again.");
          toast.error("Failed to save changes");
        } else {
          lastSavedContent.current = newContent;
        }
      }
      
      setIsSaving(false);
    }, 3000), 
    [notepadId, isInitialized]
  );

  const handleChange = (newContent: string) => {
    setContent(newContent);
    saveContent(newContent);
  };

  return (
    <div className="container mx-auto p-4 max-w-[1440px]">
      <style>{styleString}</style>
      <Toaster />
      <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Real-Time Notepad</h1>
        <ModeToggle />
      </div>
      <div className="relative bg-white shadow-md rounded-lg overflow-hidden dark:bg-black dark:border dark:text-white">
        <ReactQuill
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