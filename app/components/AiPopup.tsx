import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AIPopupProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onResolve: () => void;
  isLoading?: boolean;
}

const AIPopup: React.FC<AIPopupProps> = ({ 
  position, 
  onClose, 
  onResolve,
  isLoading = false 
}) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border dark:border-gray-700"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="default"
          onClick={onResolve}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            'Resolve with AI'
          )}
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

export default AIPopup;