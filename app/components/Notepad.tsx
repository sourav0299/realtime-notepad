import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import debounce from "lodash/debounce";
import toast, { Toaster } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface NotepadPorps {
  notepadId: string;
}

interface NotepadRow {
  id: number;
  content: string;
}

const Notepad : React.FC<NotepadPorps> = ({notepadId}) => {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{'header': [1, 2, 3, 4, 5, 6, false]}],
      ['blockquote', 'code-block'],
      [{ 'list': 'bullet' }],
      [{ 'background': ['yellow', 'red', 'green', 'white'] }],
    ],
  };

  const quillStyles = {
    '.ql-container': {
      border: 'none !important',
    },
    '.ql-toolbar': {
      border: 'none !important',
      borderBottom: '1px solid #edf2f7 !important',
      padding: '8px 12px',
      background: '#f8fafc',
    },
    '.ql-editor': {
      padding: '1.5rem !important',
      minHeight: 'calc(100vh - 250px)',
      fontSize: '16px',
    },
    '.ql-editor h1': {
    fontSize: '2em !important',
  },
  '.ql-editor h2': {
    fontSize: '1.5em !important',
  },
  '.ql-editor h3': {
    fontSize: '1.17em !important',
  },
  '.ql-editor h4': {
    fontSize: '1em !important',
  },
  '.ql-editor h5': {
    fontSize: '0.83em !important',
  },
  '.ql-editor h6': {
    fontSize: '0.67em !important',
  },
    '.ql-snow .ql-picker.ql-background .ql-picker-options': {
      padding: '3px 5px',
    },
    '.ql-snow .ql-picker.ql-background .ql-picker-item': {
      width: '100%',
      height: '25px',
      margin: '2px 0',
    },
  };

  const styleString = Object.entries(quillStyles)
    .map(([selector, rules]) => 
      `${selector} { ${typeof rules === 'string' ? rules : Object.entries(rules).map(([k, v]) => `${k}: ${v}`).join('; ')} }`
    )
    .join('\n');

  useEffect(() => {
    const fetchContent = async () => {
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
            setContent("");
          }
        } else {
          setError(`Failed to load content: ${error.message}`);
        }
      } else if (data) {
        setContent(data.content || "");
      }
    };

    fetchContent();
  }, [notepadId]);

  useEffect(() => {
    const channel: RealtimeChannel = supabase.channel(`notepad_${notepadId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notepad', filter: `id=eq.${notepadId}` },
        (payload) => {
          console.log("Received real-time update:", payload);
          const newContent = (payload.new as NotepadRow).content;
          setContent(newContent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notepadId]);

  const saveContent = useCallback(
    debounce(async (newContent: string) => {
      setIsSaving(true);
      setError(null);
      console.log("Saving content:", newContent);
      const { error } = await supabase
        .from("notepad")
        .update({ content: newContent })
        .eq("id", notepadId);

      if (error) {
        setError("Failed to save changes. Please try again.");
        toast.error("Failed to save changes");
      } else {
          
      }
      setIsSaving(false);
    }, 3000),
    [notepadId]
  );

  const handleChange = (newContent: string) => {
    setContent(newContent);
    saveContent(newContent);
  };

  return (
      <div className="container mx-auto p-4 max-w-[1440px]">
      <style>{styleString}</style>
        <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Real-Time Notepad</h1>
      <div className="relative bg-white shadow-md rounded-lg overflow-hidden">
        <ReactQuill
          theme="snow"
          className="w-full max-w-[1440px] h-[calc(100vh-200px)] p-6 text-lg text-gray-700 focus:outline-none resize-none"
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