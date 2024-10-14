"use client"
// app/page.tsx
import Notepad from './components/Notepad';
import GitHubButton from './components/GitHubButton'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <GitHubButton repoUrl="https://github.com/sourav0299/realtime-notepad" />
      
      <Notepad />
    </div>
  );
}