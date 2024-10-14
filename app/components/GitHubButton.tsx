import React from 'react';
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

interface GitHubButtonProps {
  repoUrl: string;
}

const GitHubButton: React.FC<GitHubButtonProps> = ({ repoUrl }) => {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="hidden sm:flex"
    >
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2"
      >
        <Github className="w-4 h-4" />
        <span>Feedback / Contribute</span>
      </a>
    </Button>
  );
};

export default GitHubButton;