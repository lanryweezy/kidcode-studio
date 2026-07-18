import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CADSketch, CADPoint, CADSketchShape, CADSketchTool, CADConstraint, CADConstraintType } from '../../types/cad';

interface SketchModeProps {
  sketch: CADSketch | null;
  activeTool: CADSketchTool;
  onShapeAdd: (shape: CADSketchShape) => void;
  onShapeRemove: (shapeId: string) => void;
  onToolChange: (tool: CADSketchTool) => void;
  onClose: () => void;
  onConstraintAdd?: (constraint: CADConstraint) => void;
}

const GRID_SPACING = 10;

const CONSTRAINT_ICONS: Record<CADConstraintType, string> = {
  horizontal: '━',
  vertical: '┃',
  equal: '=',
  parallel: '∥',
  perpendicular: '⊥',
  fixed: '🔒',
  dimension: '📐',
};

const SketchMode: React.FC<SketchModeProps> = ({
  sketch,
  activeTool,
  onShapeAdd,
  onShapeRemove,
  onToolChange,
  onClose,
  onConstraintAdd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<CADPoint[]>([]);
  const [dragStart, setDragStart] = useState<CADPoint | null>(null);
  const [dragCurrent, setDragCurrent] = useState<CADPoint | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [shiftHeld, setShiftHeld] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<CADPoint | null>(null);
  const [activeConstraint, setActiveConstraint] = useState<CADConstraintType | null>(null);
  const [constraints, setConstraints] = useState<CADConstraint[]>([]);
  const [dimensionValue, setDimensionValue] = useState<string>('');

  const screenToWorld = useCallback((sx: number, sy: number): CADPoint => {
    return {
      x: (sx - pan.x) / zoom,
      y: (sy - pan.y) / zoom,
      id: '',
    };
  }, [pan, zoom]);

  const snapToGrid = useCallback((p: CADPoint): CADPoint => {
    return {
      x: Math.round(p.x / GRID_SPACING) * GRID_SPACING,
      y: Math.round(p.y / GRID_SPACING) * GRID_SPACING,
      id: '',
    };
  }, []);

  const snapToHorizontalVertical = useCallback((start: CADPoint, end: CADPoint): CADPoint => {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    if (dx < dy) {
      return { x: start.x, y: end.y, id: '' };
    } else {
      return { x: end.x, y: start.y, id: '' };
    }
  }, []);

  const applyConstraintToPoints = useCallback((p1: CADPoint, p2: CADPoint, constraint: CADConstraintType): { start: CADPoint; end: CADPoint } => {
    switch (constraint) {
      case 'horizontal':
        return { start: p1, end: { ...p2, y: p1.y, id: '' } };
      case 'vertical':
        return { start: p1, end: { ...p2, x: p1.x, id: '' } };
      case 'equal': {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return { start: p1, end: p2 };
        return { start: p1, end: { x: p1.x + dx, y: p1.y + dy, id: '' } };
      }
      default:
        return { start: p1, end: p2 };
    }
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 10);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 600;
    const h = rect?.height || 400;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5 / zoom;
    for (let x = -2000; x <= 2000; x += GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(x, -2000);
      ctx.lineTo(x, 2000);
      ctx.stroke();
    }
    for (let y = -2000; y <= 2000; y += GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(-2000, y);
      ctx.lineTo(2000, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.moveTo(-2000, 0);
    ctx.lineTo(2000, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -2000);
    ctx.lineTo(0, 2000);
    ctx.stroke();

    if (sketch) {
      sketch.shapes.forEach(shape => {
        drawShape(ctx, shape, false);
      });
    }

    constraints.forEach(c => {
      drawConstraintIcon(ctx, c);
    });

    if (points.length > 1) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (dragStart && dragCurrent) {
      if (activeTool === 'rectangle') {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        const x = Math.min(dragStart.x, dragCurrent.x);
        const y = Math.min(dragStart.y, dragCurrent.y);
        const rw = Math.abs(dragCurrent.x - dragStart.x);
        const rh = Math.abs(dragCurrent.y - dragStart.y);
        ctx.strokeRect(x, y, rw, rh);
        ctx.setLineDash([]);

        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${(rw / 10).toFixed(1)} x ${(rh / 10).toFixed(1)}`, x + 3 / zoom, y - 5 / zoom);
      } else if (activeTool === 'circle') {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`R ${(radius / 10).toFixed(1)}`, dragStart.x + 5 / zoom, dragStart.y - 5 / zoom);
      } else if (activeTool === 'line') {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const len = Math.sqrt((dragCurrent.x - dragStart.x) ** 2 + (dragCurrent.y - dragStart.y) ** 2);
        const mx = (dragStart.x + dragCurrent.x) / 2;
        const my = (dragStart.y + dragCurrent.y) / 2;
        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${(len / 10).toFixed(1)}`, mx + 5 / zoom, my - 5 / zoom);
      }
    }

    ctx.restore();

    if (dragStart) {
      const sx = dragStart.x * zoom + pan.x;
      const sy = dragStart.y * zoom + pan.y;
      drawPointMarker(ctx, sx, sy, '#06b6d4');
    }
    points.forEach(p => {
      const sx = p.x * zoom + pan.x;
      const sy = p.y * zoom + pan.y;
      drawPointMarker(ctx, sx, sy, '#0891b2');
    });
    if (hoveredPoint) {
      const sx = hoveredPoint.x * zoom + pan.x;
      const sy = hoveredPoint.y * zoom + pan.y;
      drawPointMarker(ctx, sx, sy, '#22d3ee');
    }
  }, [sketch, points, dragStart, dragCurrent, pan, zoom, hoveredPoint, activeTool, constraints]);

  const drawShape = (ctx: CanvasRenderingContext2D, shape: CADSketchShape, _hover: boolean) => {
    ctx.strokeStyle = shape.data.isConstruction ? '#94a3b8' : '#06b6d4';
    ctx.lineWidth = (_hover ? 3 : 2) / zoom;
    if (shape.data.isConstruction) ctx.setLineDash([6 / zoom, 4 / zoom]);

    switch (shape.type) {
      case 'line': {
        ctx.beginPath();
        ctx.moveTo(shape.data.start.x, shape.data.start.y);
        ctx.lineTo(shape.data.end.x, shape.data.end.y);
        ctx.stroke();
        const len = Math.sqrt(
          (shape.data.end.x - shape.data.start.x) ** 2 + (shape.data.end.y - shape.data.start.y) ** 2
        );
        const mx = (shape.data.start.x + shape.data.end.x) / 2;
        const my = (shape.data.start.y + shape.data.end.y) / 2;
        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${(len / 10).toFixed(1)}`, mx + 5 / zoom, my - 5 / zoom);
        break;
      }
      case 'rectangle': {
        const { corner1, corner2 } = shape.data;
        const rx = Math.min(corner1.x, corner2.x);
        const ry = Math.min(corner1.y, corner2.y);
        const rw = Math.abs(corner2.x - corner1.x);
        const rh = Math.abs(corner2.y - corner1.y);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${(rw / 10).toFixed(1)} x ${(rh / 10).toFixed(1)}`, rx + 3 / zoom, ry - 5 / zoom);
        break;
      }
      case 'circle': {
        ctx.beginPath();
        ctx.arc(shape.data.center.x, shape.data.center.y, shape.data.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(`R ${(shape.data.radius / 10).toFixed(1)}`, shape.data.center.x + 5 / zoom, shape.data.center.y - 5 / zoom);
        break;
      }
      case 'polygon': {
        if (shape.data.points.length < 2) break;
        ctx.beginPath();
        ctx.moveTo(shape.data.points[0].x, shape.data.points[0].y);
        shape.data.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        if (shape.data.closed) ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'arc': {
        ctx.beginPath();
        ctx.arc(shape.data.center.x, shape.data.center.y, shape.data.radius, shape.data.startAngle, shape.data.endAngle);
        ctx.stroke();
        break;
      }
    }
    ctx.setLineDash([]);
  };

  const drawPointMarker = (ctx: CanvasRenderingContext2D, sx: number, sy: number, color: string) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const drawConstraintIcon = (ctx: CanvasRenderingContext2D, constraint: CADConstraint) => {
    const icon = CONSTRAINT_ICONS[constraint.type];
    if (!icon) return;

    ctx.font = `${14 / zoom}px sans-serif`;
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';

    if (sketch) {
      const firstShape = sketch.shapes.find(s => s.data.id === constraint.shapeIds[0]);
      if (firstShape) {
        let cx = 0, cy = 0;
        if (firstShape.type === 'line') {
          cx = (firstShape.data.start.x + firstShape.data.end.x) / 2;
          cy = (firstShape.data.start.y + firstShape.data.end.y) / 2 - 15 / zoom;
        } else if (firstShape.type === 'rectangle') {
          cx = (firstShape.data.corner1.x + firstShape.data.corner2.x) / 2;
          cy = Math.min(firstShape.data.corner1.y, firstShape.data.corner2.y) - 15 / zoom;
        } else if (firstShape.type === 'circle') {
          cx = firstShape.data.center.x;
          cy = firstShape.data.center.y - firstShape.data.radius - 15 / zoom;
        }
        ctx.fillText(icon, cx, cy);
      }
    }
    ctx.textAlign = 'left';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const snapped = shiftHeld ? snapToHorizontalVertical(points[points.length - 1] || { x: 0, y: 0, id: '' }, world) : snapToGrid(world);

    if (activeTool === 'rectangle' || activeTool === 'circle') {
      setDragStart(snapped);
      setDragCurrent(snapped);
    } else if (activeTool === 'line' || activeTool === 'polygon') {
      if (activeConstraint === 'fixed') {
        const fixedConstraint: CADConstraint = {
          id: generateId(),
          type: 'fixed',
          shapeIds: [],
        };
        setConstraints(prev => [...prev, fixedConstraint]);
        onConstraintAdd?.(fixedConstraint);
        return;
      }
      setPoints(prev => [...prev, { ...snapped, id: generateId() }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const snapped = snapToGrid(world);
    setHoveredPoint(snapped);

    if (dragStart) {
      if (shiftHeld || activeConstraint === 'horizontal' || activeConstraint === 'vertical') {
        const constrained = activeConstraint === 'horizontal'
          ? { x: snapped.x, y: dragStart.y, id: '' }
          : activeConstraint === 'vertical'
            ? { x: dragStart.x, y: snapped.y, id: '' }
            : snapToHorizontalVertical(dragStart, snapped);
        setDragCurrent(constrained);
      } else {
        setDragCurrent(snapped);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (dragStart && dragCurrent) {
      if (activeTool === 'rectangle') {
        onShapeAdd({
          type: 'rectangle',
          data: {
            corner1: { ...dragStart, id: generateId() },
            corner2: { ...dragCurrent, id: generateId() },
            id: generateId(),
            isConstruction: false,
          },
        });
        if (activeConstraint) {
          const shapeId = generateId();
          setConstraints(prev => [...prev, { id: generateId(), type: activeConstraint, shapeIds: [shapeId] }]);
        }
      } else if (activeTool === 'circle') {
        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        onShapeAdd({
          type: 'circle',
          data: {
            center: { ...dragStart, id: generateId() },
            radius,
            id: generateId(),
            isConstruction: false,
          },
        });
      } else if (activeTool === 'line') {
        const applied = activeConstraint
          ? applyConstraintToPoints(dragStart, dragCurrent, activeConstraint)
          : { start: dragStart, end: dragCurrent };
        onShapeAdd({
          type: 'line',
          data: {
            start: { ...applied.start, id: generateId() },
            end: { ...applied.end, id: generateId() },
            id: generateId(),
            isConstruction: false,
          },
        });
      }
    }

    if (activeTool === 'line' && points.length === 2) {
      const applied = activeConstraint
        ? applyConstraintToPoints(points[0], points[1], activeConstraint)
        : { start: points[0], end: points[1] };
      onShapeAdd({
        type: 'line',
        data: {
          start: { ...applied.start, id: generateId() },
          end: { ...applied.end, id: generateId() },
          id: generateId(),
          isConstruction: false,
        },
      });
      setPoints([]);
    }

    setDragStart(null);
    setDragCurrent(null);
  };

  const handleDoubleClick = () => {
    if (activeTool === 'polygon' && points.length >= 3) {
      onShapeAdd({
        type: 'polygon',
        data: {
          points: [...points],
          id: generateId(),
          isConstruction: false,
          closed: true,
        },
      });
      setPoints([]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(5, Math.max(0.1, z * delta)));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setShiftHeld(e.shiftKey);
      if (e.key === 'Escape') {
        setPoints([]);
        setDragStart(null);
        setDragCurrent(null);
        setActiveConstraint(null);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (points.length > 0) {
          setPoints(prev => prev.slice(0, -1));
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setShiftHeld(e.shiftKey);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [points.length]);

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-cyan-300">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-0.5">
          {(['select', 'line', 'rectangle', 'circle', 'polygon'] as CADSketchTool[]).map(tool => (
            <button
              key={tool}
              onClick={() => onToolChange(tool)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                activeTool === tool
                  ? 'bg-cyan-500 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tool === 'select' ? '↖' : tool === 'line' ? '/' : tool === 'rectangle' ? '▭' : tool === 'circle' ? '○' : '⬠'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-0.5">
          {(['horizontal', 'vertical', 'equal', 'parallel', 'perpendicular', 'fixed'] as CADConstraintType[]).map(ct => (
            <button
              key={ct}
              onClick={() => setActiveConstraint(activeConstraint === ct ? null : ct)}
              className={`px-1.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
                activeConstraint === ct
                  ? 'bg-amber-500 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              title={ct}
            >
              {CONSTRAINT_ICONS[ct]}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-2 py-1 bg-white rounded-lg shadow-md border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-red-500 transition-colors"
        >
          Done
        </button>
      </div>

      <div className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
        {(zoom * 100).toFixed(0)}% | {activeTool} {shiftHeld ? '| Snap' : ''} {activeConstraint ? `| ${activeConstraint}` : ''}
      </div>

      {points.length > 0 && (
        <div className="absolute bottom-2 left-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          Click to add points | Double-click to close | ESC to cancel | {points.length} points
        </div>
      )}

      {constraints.length > 0 && (
        <div className="absolute bottom-2 right-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          {constraints.length} constraints active
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default React.memo(SketchMode);
