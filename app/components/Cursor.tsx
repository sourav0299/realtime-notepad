import React from 'react';

interface CursorProps {
  x: number;
  y: number;
  color: string;
  username: string;
}

const Cursor: React.FC<CursorProps> = ({ x, y, color, username }) => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        style={{
          transform: 'rotate(-45deg)',
        }}
      >
        <path
          d="M 0,0 L 12,12 L 8,16 L 0,0"
          fill={color}
        />
      </svg>
      
      {/* Username label */}
      <div
        className="absolute left-4 top-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{
          backgroundColor: color,
        }}
      >
        {username}
      </div>
    </div>
  );
};

export default Cursor; 