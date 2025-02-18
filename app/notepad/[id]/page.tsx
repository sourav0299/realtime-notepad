"use client"
import { useParams } from 'next/navigation';
import Notepad from '../../components/Notepad';

export default function NotepadPage() {
  const params = useParams();
  const notepadId = params.id as string;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Notepad notepadId={notepadId} />
    </div>
  );
}