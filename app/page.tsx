"use client"
// app/page.tsx
import Notepad from './components/Notepad';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Notepad />
    </div>
  );
}
