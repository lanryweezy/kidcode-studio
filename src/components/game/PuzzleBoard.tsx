import React, { useState, useEffect, useCallback } from 'react';

interface PuzzleBoardProps {
  grid?: string[][];
  onTileClick?: (row: number, col: number) => void;
  selectedTile?: { row: number; col: number } | null;
  size?: number;
}

const GEM_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316'];

export const PuzzleBoard: React.FC<PuzzleBoardProps> = React.memo(({ grid, onTileClick, selectedTile, size = 6 }) => {
  const [board, setBoard] = useState<string[][]>(() => {
    if (grid) return grid;
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)])
    );
  });

  const handleClick = (row: number, col: number) => {
    onTileClick?.(row, col);
  };

  const isSelected = (row: number, col: number) =>
    selectedTile?.row === row && selectedTile?.col === col;

  return (
    <div className="inline-block bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700 p-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.map((row, r) =>
          row.map((color, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                isSelected(r, c) ? 'ring-2 ring-white scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))
        )}
      </div>
    </div>
  );
});
