import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eraser, Grid, Eye, EyeOff, Undo2, Redo2, PaintBucket, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { createEditorHistory, pushHistory, undo, redo, floodFill, EditorHistory } from '../../services/levelEditorExtended';

interface Tile {
  x: number;
  y: number;
  type: string;
  emoji: string;
}

interface VisualLevelEditorProps {
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[];
  activeTool: string;
  onTilesChange: (tiles: Tile[]) => void;
  gridVisible?: boolean;
}

const TILE_TYPES: { type: string; emoji: string; label: string }[] = [
  { type: 'grass', emoji: '🟩', label: 'Grass' },
  { type: 'brick', emoji: '🧱', label: 'Brick' },
  { type: 'stone', emoji: '🪨', label: 'Stone' },
  { type: 'dirt', emoji: '🟫', label: 'Dirt' },
  { type: 'water', emoji: '🟦', label: 'Water' },
  { type: 'lava', emoji: '🟥', label: 'Lava' },
  { type: 'spike', emoji: '🔺', label: 'Spike' },
  { type: 'coin', emoji: '🪙', label: 'Coin' },
  { type: 'crate', emoji: '📦', label: 'Crate' },
  { type: 'spring', emoji: '🟢', label: 'Spring' },
  { type: 'key', emoji: '🔑', label: 'Key' },
  { type: 'door', emoji: '🚪', label: 'Door' },
  { type: 'ladder', emoji: '🪜', label: 'Ladder' },
  { type: 'flag', emoji: '🚩', label: 'Flag' },
  { type: 'spawn', emoji: '🏁', label: 'Spawn' },
];

export const VisualLevelEditor: React.FC<VisualLevelEditorProps> = ({
  width,
  height,
  tileSize,
  tiles,
  activeTool,
  onTilesChange,
  gridVisible = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [historyState, setHistoryState] = useState<EditorHistory>(createEditorHistory());
  const [currentTiles, setCurrentTiles] = useState<any[]>(tiles);
  const [activeToolState, setActiveTool] = useState(activeTool);

  const cols = Math.floor(width / tileSize);
  const rows = Math.floor(height / tileSize);

  // Draw tiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw tiles
    tiles.forEach(tile => {
      const emoji = TILE_TYPES.find(t => t.type === tile.type)?.emoji || '⬛';
      ctx.font = `${tileSize * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, tile.x + tileSize / 2, tile.y + tileSize / 2);
    });

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }, [tiles, width, height, tileSize, showGrid]);

  const getTileAt = (x: number, y: number) => {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    return { x: col * tileSize, y: row * tileSize, col, row };
  };

  const addTile = useCallback((x: number, y: number) => {
    if (activeTool === 'eraser') {
      const newTiles = tiles.filter(t => !(t.x === x && t.y === y));
      onTilesChange(newTiles);
    } else {
      const tileType = TILE_TYPES.find(t => t.type === activeTool);
      if (!tileType) return;
      const existingIndex = tiles.findIndex(t => t.x === x && t.y === y);
      if (existingIndex >= 0) {
        const newTiles = [...tiles];
        newTiles[existingIndex] = { x, y, type: activeTool, emoji: tileType.emoji };
        onTilesChange(newTiles);
      } else {
        onTilesChange([...tiles, { x, y, type: activeTool, emoji: tileType.emoji }]);
      }
    }
  }, [tiles, activeTool, onTilesChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPainting(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pos = getTileAt(x, y);
    addTile(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPainting) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pos = getTileAt(x, y);
    addTile(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    if (isPainting) {
      setHistoryState(prev => pushHistory(prev, currentTiles as any));
    }
    setIsPainting(false);
  };

  const handleUndo = () => {
    const result = undo(historyState, currentTiles as any);
    if (result) {
      setHistoryState(result.history);
      setCurrentTiles(result.tiles as any[]);
      onTilesChange(result.tiles as any);
    }
  };

  const handleRedo = () => {
    const result = redo(historyState, currentTiles as any);
    if (result) {
      setHistoryState(result.history);
      setCurrentTiles(result.tiles as any[]);
      onTilesChange(result.tiles as any);
    }
  };

  const handleFill = () => {
    if (activeToolState !== 'eraser' && currentTiles.length > 0) {
      const firstTile = currentTiles[0];
      const filled = floodFill(currentTiles, firstTile.x * tileSize, firstTile.y * tileSize, activeToolState, tileSize);
      setHistoryState(prev => pushHistory(prev, currentTiles as any));
      setCurrentTiles(filled as any[]);
      onTilesChange(filled as any);
    }
  };

  const handleClearAll = () => {
    setHistoryState(prev => pushHistory(prev, currentTiles as any));
    setCurrentTiles([]);
    onTilesChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Editor</div>
        <div className="flex gap-1">
          <Button variant="ghost" size="xs" icon={<Grid size={12} />} onClick={() => setShowGrid(!showGrid)}>
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </Button>
          <Button variant="ghost" size="xs" icon={<Undo2 size={12} />} onClick={handleUndo} disabled={historyState.past.length === 0}>
            Undo
          </Button>
          <Button variant="ghost" size="xs" icon={<Redo2 size={12} />} onClick={handleRedo} disabled={historyState.future.length === 0}>
            Redo
          </Button>
          <Button variant="ghost" size="xs" icon={<PaintBucket size={12} />} onClick={handleFill}>
            Fill
          </Button>
          <Button variant="ghost" size="xs" icon={<Trash2 size={12} />} onClick={handleClearAll} className="text-red-500">
            Clear
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Quick Palette */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => {}}
          className={`p-1.5 rounded-lg text-sm ${
            activeTool === 'eraser'
              ? 'bg-red-100 border border-red-300'
              : 'bg-slate-100'
          }`}
        >
          <Eraser size={14} />
        </button>
        {TILE_TYPES.slice(0, 10).map(tile => (
          <button
            key={tile.type}
            className={`p-1.5 rounded-lg text-sm ${
              activeTool === tile.type
                ? 'bg-violet-100 border border-violet-300'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
            title={tile.label}
          >
            {tile.emoji}
          </button>
        ))}
      </div>

      <div className="text-[10px] text-slate-400 text-center">
        Click to place • Drag to paint • {tiles.length} tiles placed
      </div>
    </div>
  );
};
