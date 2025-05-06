import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  response: string;
}

const AIResponseDialog: React.FC<AIResponseDialogProps> = ({
  isOpen,
  onClose,
  response,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Response</DialogTitle>
          <DialogDescription>
            Here's what the AI generated based on your selection
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AIResponseDialog;