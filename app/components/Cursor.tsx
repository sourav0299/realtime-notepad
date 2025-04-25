import React from 'react';

interface CursorProps {
  x: number;
  y: number;
  color: string;
  username: string;
}

const Cursor: React.FC<CursorProps> = React.memo(({ x, y, color, username }) => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        willChange: 'transform',
      }}
    >
      {/* Cursor */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* Username label */}
      <div
        className="absolute left-4 top-2 px-2 py-1 rounded-md text-xs whitespace-nowrap backdrop-blur-sm"
        style={{
          backgroundColor: `${color}40`,
          color: color,
          border: `1px solid ${color}`,
          boxShadow: `0 2px 4px ${color}20`,
        }}
      >
        {username}
      </div>
    </div>
  );
});

Cursor.displayName = 'Cursor';

export default Cursor; 