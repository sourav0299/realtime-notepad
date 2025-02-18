"use client"
import { useRouter } from 'next/navigation';
import { generateRandomString } from '../utility/genrateRandomString';
import GitHubButton from './components/GitHubButton';

export default function Page() {
  const router = useRouter();

  const createNewNotepad = () => {
    const randomId = generateRandomString();
    router.push(`/notepad/${randomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <GitHubButton repoUrl="https://github.com/sourav0299/realtime-notepad" />
      <h1 className="text-4xl font-bold mb-8">Real-Time Notepad</h1>
      <button
        onClick={createNewNotepad}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New Notepad
      </button>
    </div>
  );
}