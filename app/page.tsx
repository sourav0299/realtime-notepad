"use client"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { generateRandomString } from '../utility/genrateRandomString';
import GitHubButton from './components/GitHubButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { ModeToggle } from "./components/ToggleButton"; 

interface NotepadRow {
  id: string;
  content: string;
}

export default function Page() {
  const router = useRouter();
  const [randomId, setRandomId] = useState(generateRandomString());
  const [notepads, setNotepads] = useState<NotepadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const createNewNotepad = () => {
    router.push(`/notepad/${randomId}`);
  };

  const copySlug = () => {
    const url = `https://notepad0299.vercel.app/notepad/${randomId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.success('URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        setCopied(false);
        toast.error('Failed to copy URL');
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRandomId(e.target.value);
  };

  const fetchNotepads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notepad')
      .select('id, content');
    if (error) {
      console.error('Error fetching notepads:', error);
    } else {
      setNotepads(data);
    }
    setLoading(false);
  };

  const deleteNotepad = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notepad')
        .delete()
        .eq('id', id);
  
      if (error) {
        console.error('Error deleting notepad:', error);
        toast.error('Failed to delete notepad');
      } else {
        // Update local state
        setNotepads(prevNotepads => prevNotepads.filter(notepad => notepad.id !== id));
        toast.success('Notepad deleted successfully');
        
        // Refresh the list to ensure sync with server
        await fetchNotepads();
      }
    } catch (err) {
      console.error('Error in deleteNotepad:', err);
      toast.error('Something went wrong while deleting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotepads();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <ModeToggle />
        <div className="flex justify-end w-full mb-4">
          <GitHubButton repoUrl="https://github.com/sourav0299/realtime-notepad" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold py-6 sm:py-8 text-center">
          Real-Time Notepad
        </h1>

        <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 mb-8">
          <Input
            type="text"
            value={`https://notepad0299.vercel.app/notepad/${randomId}`}
            onChange={handleInputChange}
            placeholder="Enter notepad ID"
            className="bg-white dark:bg-black flex-grow"
          />
          <div className="flex gap-2 sm:gap-4">
            <Button 
              onClick={copySlug}
              className="flex-1 sm:flex-none dark:bg-black dark:text-white dark:border" 
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button 
              onClick={createNewNotepad}
              className="flex-1 sm:flex-none dark:bg-black dark:text-white dark:border"
            >
              Go
            </Button>
          </div>
        </div>

        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">All Notepads</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-3">
              {notepads.map(notepad => (
                <li 
                  key={notepad.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-white dark:bg-black rounded-lg shadow gap-3"
                >
                  <span className="text-sm sm:text-base break-all">{notepad.id}</span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      variant="link" 
                      onClick={() => router.push(`/notepad/${notepad.id}`)}
                      className="flex-1 sm:flex-none"
                    >
                      Visit
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => deleteNotepad(notepad.id)}
                      className="flex-1 sm:flex-none"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}