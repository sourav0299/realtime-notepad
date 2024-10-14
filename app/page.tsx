"use client"
// app/page.tsx
import Notepad from './components/Notepad';
import GitHubButton from '../app/components/GitHubButton'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <GitHubButton repoUrl="https://github.com/yourusername/your-repo-name" />
      <Notepad />
    </div>
  );
}
