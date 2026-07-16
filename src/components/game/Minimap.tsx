import React, { useRef, useEffect, useState } from 'react';

interface MinimapEntity {
  x: number; y: number;
  type: 'player' | 'enemy' | 'item' | 'trigger' | 'boss';
  color?: string;
}

interface MinimapTerrain {
  x: number; y: number; type: string;
}

interface MinimapProps {
  worldWidth: number;
  worldHeight: number;
  playerX: number;
  playerY: number;
  entities?: MinimapEntity[];
  terrain?: MinimapTerrain[];
  cameraX?: number;
  cameraY?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showViewport?: boolean;
  showGrid?: boolean;
  fogOfWar?: boolean;
  className?: string;
  areaNames?: { x: number; y: number; width: number; height: number; name: string }[];
}

const SIZE_MAP = { xs: 60, sm: 100, md: 140, lg: 200 };

const TERRAIN_COLORS: Record<string, string> = {
  brick: '#78716c', grass: '#22c55e', stone: '#a8a29e',
  dirt: '#92400e', water: '#3b82f6', lava: '#ef4444',
  spike: '#dc2626', crate: '#d97706', ground: '#65a30d',
  wall: '#57534e', decoration: '#16a34a',
};

const ENTITY_COLORS: Record<string, string> = {
  player: '#3b82f6', enemy: '#ef4444', item: '#22c55e',
  trigger: '#a855f7', boss: '#f97316',
};

export const Minimap: React.FC<MinimapProps> = ({
  worldWidth, worldHeight,
  playerX, playerY,
  entities = [],
  terrain = [],
  cameraX = 0, cameraY = 0,
  viewportWidth = 800, viewportHeight = 600,
  size = 'sm',
  showViewport = true,
  showGrid = false,
  fogOfWar = false,
  className = '',
  areaNames = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || areaNames.length === 0) {
      setTooltip(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const px = SIZE_MAP[size];
    const py = Math.floor(px * (worldHeight / worldWidth));
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const worldMx = (mx / px) * worldWidth;
    const worldMy = (my / py) * worldHeight;

    const area = areaNames.find(a =>
      worldMx >= a.x && worldMx <= a.x + a.width &&
      worldMy >= a.y && worldMy <= a.y + a.height
    );
    if (area) {
      setTooltip({ x: mx, y: my, name: area.name });
    } else {
      setTooltip(null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const px = SIZE_MAP[size];
    const py = Math.floor(px * (worldHeight / worldWidth));
    canvas.width = px;
    canvas.height = py;
    const scaleX = px / worldWidth;
    const scaleY = py / worldHeight;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, px, py);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
      ctx.lineWidth = 0.5;
      const gridStep = Math.max(4, Math.floor(px / 20));
      for (let x = 0; x < px; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, py); ctx.stroke();
      }
      for (let y = 0; y < py; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(px, y); ctx.stroke();
      }
    }

    // Terrain
    terrain.forEach(t => {
      const color = TERRAIN_COLORS[t.type] || '#475569';
      ctx.fillStyle = color;
      const tw = Math.max(2, 40 * scaleX);
      const th = Math.max(2, 40 * scaleY);
      ctx.fillRect(t.x * scaleX, t.y * scaleY, tw, th);
    });

    // Fog of war
    if (fogOfWar) {
      const fogRadius = Math.max(px, py) * 0.35;
      const fogX = playerX * scaleX;
      const fogY = playerY * scaleY;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      const grad = ctx.createRadialGradient(fogX, fogY, fogRadius * 0.3, fogX, fogY, fogRadius);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.7, 'rgba(255,255,255,0.5)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, px, py);
      ctx.restore();
    }

    // Viewport rectangle
    if (showViewport) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        cameraX * scaleX, cameraY * scaleY,
        viewportWidth * scaleX, viewportHeight * scaleY
      );
      ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.fillRect(
        cameraX * scaleX, cameraY * scaleY,
        viewportWidth * scaleX, viewportHeight * scaleY
      );
    }

    // Entities
    entities.forEach(e => {
      const ex = e.x * scaleX;
      const ey = e.y * scaleY;
      const color = e.color || ENTITY_COLORS[e.type] || '#94a3b8';
      if (e.type === 'boss') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (e.type === 'player') {
        // Player is drawn last
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(ex - 1, ey - 1, 2, 2);
      }
    });

    // Player (always on top, with pulse)
    const pulse = 2 + Math.sin(Date.now() * 0.005) * 1;
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(playerX * scaleX, playerY * scaleY, pulse + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // World border
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, px, py);
  }, [worldWidth, worldHeight, playerX, playerY, entities, terrain, cameraX, cameraY, viewportWidth, viewportHeight, size, showViewport, showGrid, fogOfWar]);

  const px = SIZE_MAP[size];
  const py = Math.floor(px * (worldHeight / worldWidth));

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden shadow-lg relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <canvas ref={canvasRef} width={px} height={py} style={{ width: px, height: py }} />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded shadow-lg border border-slate-600 whitespace-nowrap"
          style={{ left: tooltip.x + 8, top: tooltip.y - 24 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
};
