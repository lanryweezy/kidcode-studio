import React from 'react';
import { CollaboratorInfo } from '../../services/collaboration';

interface CollaboratorCursorsProps {
  collaborators: CollaboratorInfo[];
  canvasWidth: number;
  canvasHeight: number;
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({
  collaborators,
  canvasWidth,
  canvasHeight,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {collaborators.map(collab => {
        if (collab.cursor === null) return null;
        // Convert cursor position to canvas coordinates
        const x = (collab.cursor % canvasWidth);
        const y = Math.floor(collab.cursor / canvasWidth) * 20; // rough mapping
        return (
          <div
            key={collab.id}
            className="absolute transition-all duration-100"
            style={{ left: x, top: y }}
          >
            {/* Cursor arrow */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0 0L16 12L8 12L12 16L10 16L6 12L0 14V0Z" fill={collab.color} />
            </svg>
            {/* Name label */}
            <div
              className="text-[10px] font-bold px-1 py-0.5 rounded ml-3 -mt-1"
              style={{ backgroundColor: collab.color, color: 'white' }}
            >
              {collab.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
