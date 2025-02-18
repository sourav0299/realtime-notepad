"use client"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { generateRandomString } from '../utility/genrateRandomString';
import GitHubButton from './components/GitHubButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

interface NotepadRow {
  id: string;
  content: string;
}

export default function Page() {
  const router = useRouter();
  const [randomId, setRandomId] = useState(generateRandomString());
  const [notepads, setNotepads] = useState<NotepadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false)

  const createNewNotepad = () => {
    router.push(`/notepad/${randomId}`);
  };

  const copySlug = () => {
    const url = `https://notepad0299.vercel.app/notepad/${randomId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true)
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        setCopied(false)
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
    const { error } = await supabase
      .from('notepad')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting notepad:', error);
    } else {
      setNotepads(prevNotepads => prevNotepads.filter(notepad => notepad.id !== id));
    }
  };

  useEffect(() => {
    fetchNotepads();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <GitHubButton repoUrl="https://github.com/sourav0299/realtime-notepad" />
      <h1 className="text-4xl font-bold py-10">Real-Time Notepad</h1>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          value={`https://notepad0299.vercel.app/notepad/${randomId}`}
          onChange={handleInputChange}
          placeholder="Enter notepad ID"
          className='bg-white'
        />
        <Button onClick={copySlug}>
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button onClick={createNewNotepad}>
          Go
        </Button>
      </div>
      <div className="mt-10 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">All Notepads</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-4">
            {notepads.map(notepad => (
              <li key={notepad.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
                <span>{notepad.id}</span>
                <div className="space-x-2">
                  <Button variant="link" onClick={() => router.push(`/notepad/${notepad.id}`)}>
                    Visit
                  </Button>
                  <Button variant="destructive" onClick={() => deleteNotepad(notepad.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}