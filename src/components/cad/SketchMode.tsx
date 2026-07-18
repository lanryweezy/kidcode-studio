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

type InternalTool = CADSketchTool | 'arc_tangent' | 'fillet' | 'offset' | 'mirror';

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
  const [internalTool, setInternalTool] = useState<InternalTool>('select');
  const [filletRadius, setFilletRadius] = useState<number>(20);
  const [offsetDistance, setOffsetDistance] = useState<number>(10);
  const [mirrorAxis, setMirrorAxis] = useState<'x' | 'y'>('x');
  const [filletShape1, setFilletShape1] = useState<string | null>(null);
  const [filletShape2, setFilletShape2] = useState<string | null>(null);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [offsetPreview, setOffsetPreview] = useState<CADPoint[] | null>(null);
  const [mirrorPreview, setMirrorPreview] = useState<CADPoint[] | null>(null);

  const effectiveTool: InternalTool = internalTool !== 'select' && internalTool !== activeTool
    ? internalTool
    : (activeTool as InternalTool);

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

  const computeTangentArc = useCallback((startPt: CADPoint, endPt: CADPoint, midPt: CADPoint): { center: CADPoint; radius: number; startAngle: number; endAngle: number } | null => {
    const ax = startPt.x - midPt.x;
    const ay = startPt.y - midPt.y;
    const bx = endPt.x - midPt.x;
    const by = endPt.y - midPt.y;
    const lenA = Math.sqrt(ax * ax + ay * ay);
    const lenB = Math.sqrt(bx * bx + by * by);
    if (lenA < 1 || lenB < 1) return null;
    const nx = ax / lenA;
    const ny = ay / lenA;
    const bx2 = endPt.x - startPt.x;
    const by2 = endPt.y - startPt.y;
    const len2 = Math.sqrt(bx2 * bx2 + by2 * by2);
    if (len2 < 1) return null;
    const mx = (startPt.x + endPt.x) / 2;
    const my = (startPt.y + endPt.y) / 2;
    const radius = len2 / 2;
    const center = { x: mx + ny * radius * 0.5, y: my - nx * radius * 0.5, id: '' };
    const startAngle = Math.atan2(startPt.y - center.y, startPt.x - center.x);
    const endAngle = Math.atan2(endPt.y - center.y, endPt.x - center.x);
    return { center, radius, startAngle, endAngle };
  }, []);

  const computeFilletArc = useCallback((l1Start: CADPoint, l1End: CADPoint, l2Start: CADPoint, l2End: CADPoint, radius: number): { center: CADPoint; radius: number; startAngle: number; endAngle: number; trimmed1End: CADPoint; trimmed2Start: CADPoint } | null => {
    const dx1 = l1End.x - l1Start.x;
    const dy1 = l1End.y - l1Start.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    if (len1 < 1) return null;
    const ux1 = dx1 / len1;
    const uy1 = dy1 / len1;
    const dx2 = l2End.x - l2Start.x;
    const dy2 = l2End.y - l2Start.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (len2 < 1) return null;
    const ux2 = dx2 / len2;
    const uy2 = dy2 / len2;
    const ix = l1End.x;
    const iy = l1End.y;
    const t1 = radius / Math.sqrt(1 - (ux1 * ux2 + uy1 * uy2) ** 2 || 1);
    const trimmed1End = { x: ix - ux1 * t1, y: iy - uy1 * t1, id: '' };
    const trimmed2Start = { x: ix + ux2 * t1, y: iy + uy2 * t1, id: '' };
    const nx1 = -uy1;
    const ny1 = ux1;
    const nx2 = -uy2;
    const ny2 = ux2;
    const cx = trimmed1End.x + nx1 * radius;
    const cy = trimmed1End.y + ny1 * radius;
    const center = { x: cx, y: cy, id: '' };
    const startAngle = Math.atan2(trimmed1End.y - cy, trimmed1End.x - cx);
    const endAngle = Math.atan2(trimmed2Start.y - cy, trimmed2Start.x - cx);
    return { center, radius, startAngle, endAngle, trimmed1End, trimmed2Start };
  }, []);

  const computeOffsetPolygon = useCallback((points: CADPoint[], dist: number): CADPoint[] => {
    if (points.length < 3) return [];
    const result: CADPoint[] = [];
    for (let i = 0; i < points.length; i++) {
      const prev = points[(i - 1 + points.length) % points.length];
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      if (len1 < 1) { result.push({ ...curr }); continue; }
      const nx1 = -dy1 / len1 * dist;
      const ny1 = dx1 / len1 * dist;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (len2 < 1) { result.push({ ...curr }); continue; }
      const nx2 = -dy2 / len2 * dist;
      const ny2 = dx2 / len2 * dist;
      const mx = (nx1 + nx2) / 2;
      const my = (ny1 + ny2) / 2;
      const mLen = Math.sqrt(mx * mx + my * my);
      if (mLen < 0.001) {
        result.push({ x: curr.x + nx1, y: curr.y + ny1, id: '' });
      } else {
        const d = dist / Math.cos(Math.atan2(my, mx) - Math.atan2(ny1, nx1));
        result.push({ x: curr.x + mx / mLen * d, y: curr.y + my / mLen * d, id: '' });
      }
    }
    return result;
  }, []);

  const computeOffsetLine = useCallback((start: CADPoint, end: CADPoint, dist: number): { start: CADPoint; end: CADPoint } => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return { start, end };
    const nx = -dy / len * dist;
    const ny = dx / len * dist;
    return {
      start: { x: start.x + nx, y: start.y + ny, id: '' },
      end: { x: end.x + nx, y: end.y + ny, id: '' },
    };
  }, []);

  const computeMirrorPoints = useCallback((points: CADPoint[], axis: 'x' | 'y'): CADPoint[] => {
    return points.map(p => ({
      ...p,
      x: axis === 'y' ? -p.x : p.x,
      y: axis === 'x' ? -p.y : p.y,
      id: '',
    }));
  }, []);

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
        const isHovered = effectiveTool === 'fillet' && (filletShape1 === shape.data.id || filletShape2 === shape.data.id) ||
          effectiveTool === 'mirror' && selectedShapes.includes(shape.data.id);
        drawShape(ctx, shape, isHovered);
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

    if (effectiveTool === 'arc_tangent' && points.length === 1) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      if (hoveredPoint) {
        ctx.lineTo(hoveredPoint.x, hoveredPoint.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (effectiveTool === 'arc_tangent' && points.length === 2) {
      const prevShape = sketch?.shapes.filter(s => s.type === 'line').pop();
      if (prevShape && prevShape.type === 'line') {
        const arc = computeTangentArc(prevShape.data.end, points[1], points[0]);
        if (arc) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.beginPath();
          ctx.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    if (effectiveTool === 'offset' && offsetPreview) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(offsetPreview[0].x, offsetPreview[0].y);
      for (let i = 1; i < offsetPreview.length; i++) {
        ctx.lineTo(offsetPreview[i].x, offsetPreview[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (effectiveTool === 'mirror' && mirrorPreview) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(mirrorPreview[0].x, mirrorPreview[0].y);
      for (let i = 1; i < mirrorPreview.length; i++) {
        ctx.lineTo(mirrorPreview[i].x, mirrorPreview[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
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
  }, [sketch, points, dragStart, dragCurrent, pan, zoom, hoveredPoint, activeTool, constraints, effectiveTool, filletShape1, filletShape2, selectedShapes, offsetPreview, mirrorPreview]);

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

  const hitTestShape = useCallback((worldPt: CADPoint): CADSketchShape | null => {
    if (!sketch) return null;
    const threshold = 10 / zoom;
    for (const shape of sketch.shapes) {
      switch (shape.type) {
        case 'line': {
          const dx = shape.data.end.x - shape.data.start.x;
          const dy = shape.data.end.y - shape.data.start.y;
          const lenSq = dx * dx + dy * dy;
          if (lenSq < 1) continue;
          let t = ((worldPt.x - shape.data.start.x) * dx + (worldPt.y - shape.data.start.y) * dy) / lenSq;
          t = Math.max(0, Math.min(1, t));
          const px = shape.data.start.x + t * dx;
          const py = shape.data.start.y + t * dy;
          const dist = Math.sqrt((worldPt.x - px) ** 2 + (worldPt.y - py) ** 2);
          if (dist < threshold) return shape;
          break;
        }
        case 'circle': {
          const dist = Math.sqrt((worldPt.x - shape.data.center.x) ** 2 + (worldPt.y - shape.data.center.y) ** 2);
          if (Math.abs(dist - shape.data.radius) < threshold) return shape;
          break;
        }
        case 'rectangle': {
          const x1 = Math.min(shape.data.corner1.x, shape.data.corner2.x);
          const y1 = Math.min(shape.data.corner1.y, shape.data.corner2.y);
          const x2 = Math.max(shape.data.corner1.x, shape.data.corner2.x);
          const y2 = Math.max(shape.data.corner1.y, shape.data.corner2.y);
          const onTop = Math.abs(worldPt.y - y1) < threshold && worldPt.x >= x1 && worldPt.x <= x2;
          const onBottom = Math.abs(worldPt.y - y2) < threshold && worldPt.x >= x1 && worldPt.x <= x2;
          const onLeft = Math.abs(worldPt.x - x1) < threshold && worldPt.y >= y1 && worldPt.y <= y2;
          const onRight = Math.abs(worldPt.x - x2) < threshold && worldPt.y >= y1 && worldPt.y <= y2;
          if (onTop || onBottom || onLeft || onRight) return shape;
          break;
        }
        case 'polygon': {
          for (let i = 0; i < shape.data.points.length; i++) {
            const a = shape.data.points[i];
            const b = shape.data.points[(i + 1) % shape.data.points.length];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const lenSq = dx * dx + dy * dy;
            if (lenSq < 1) continue;
            let t = ((worldPt.x - a.x) * dx + (worldPt.y - a.y) * dy) / lenSq;
            t = Math.max(0, Math.min(1, t));
            const px = a.x + t * dx;
            const py = a.y + t * dy;
            const dist = Math.sqrt((worldPt.x - px) ** 2 + (worldPt.y - py) ** 2);
            if (dist < threshold) return shape;
          }
          break;
        }
      }
    }
    return null;
  }, [sketch, zoom]);

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

    if (effectiveTool === 'fillet') {
      const hit = hitTestShape(snapped);
      if (hit) {
        if (!filletShape1) {
          setFilletShape1(hit.data.id);
        } else if (filletShape2) {
          return;
        } else if (hit.data.id !== filletShape1) {
          setFilletShape2(hit.data.id);
          const s1 = sketch?.shapes.find(s => s.data.id === filletShape1);
          if (s1 && s1.type === 'line' && hit.type === 'line') {
            const arc = computeFilletArc(
              s1.data.start, s1.data.end,
              hit.data.start, hit.data.end,
              filletRadius
            );
            if (arc) {
              onShapeAdd({
                type: 'arc',
                data: {
                  center: arc.center,
                  radius: arc.radius,
                  startAngle: arc.startAngle,
                  endAngle: arc.endAngle,
                  id: generateId(),
                  isConstruction: false,
                },
              });
              onShapeRemove(s1.data.id);
              onShapeRemove(hit.data.id);
              onShapeAdd({
                type: 'line',
                data: {
                  start: { ...s1.data.start, id: generateId() },
                  end: { ...arc.trimmed1End, id: generateId() },
                  id: generateId(),
                  isConstruction: s1.data.isConstruction,
                },
              });
              onShapeAdd({
                type: 'line',
                data: {
                  start: { ...arc.trimmed2Start, id: generateId() },
                  end: { ...hit.data.end, id: generateId() },
                  id: generateId(),
                  isConstruction: hit.data.isConstruction,
                },
              });
            }
          }
          setFilletShape1(null);
          setFilletShape2(null);
        }
        return;
      }
    }

    if (effectiveTool === 'mirror') {
      const hit = hitTestShape(snapped);
      if (hit) {
        setSelectedShapes(prev => {
          if (prev.includes(hit.data.id)) return prev.filter(id => id !== hit.data.id);
          return [...prev, hit.data.id];
        });
        return;
      }
    }

    if (effectiveTool === 'arc_tangent') {
      if (points.length === 0) {
        const prevLine = sketch?.shapes.filter(s => s.type === 'line').pop();
        if (prevLine && prevLine.type === 'line') {
          setPoints([prevLine.data.end]);
        }
      } else if (points.length === 1) {
        setPoints(prev => [...prev, snapped]);
      } else if (points.length === 2) {
        const prevLine = sketch?.shapes.filter(s => s.type === 'line').pop();
        if (prevLine && prevLine.type === 'line') {
          const arc = computeTangentArc(prevLine.data.end, points[1], snapped);
          if (arc) {
            onShapeAdd({
              type: 'arc',
              data: {
                center: arc.center,
                radius: arc.radius,
                startAngle: arc.startAngle,
                endAngle: arc.endAngle,
                id: generateId(),
                isConstruction: false,
              },
            });
          }
        }
        setPoints([]);
      }
      return;
    }

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

    if (effectiveTool === 'offset' && sketch) {
      const hit = hitTestShape(snapped);
      if (hit && hit.type === 'polygon') {
        setOffsetPreview(computeOffsetPolygon(hit.data.points, offsetDistance));
      } else {
        setOffsetPreview(null);
      }
    }

    if (effectiveTool === 'mirror' && selectedShapes.length > 0 && sketch) {
      const allPoints: CADPoint[] = [];
      sketch.shapes.forEach(shape => {
        if (selectedShapes.includes(shape.data.id)) {
          if (shape.type === 'polygon') allPoints.push(...shape.data.points);
          else if (shape.type === 'line') { allPoints.push(shape.data.start); allPoints.push(shape.data.end); }
          else if (shape.type === 'rectangle') { allPoints.push(shape.data.corner1); allPoints.push(shape.data.corner2); }
          else if (shape.type === 'circle') allPoints.push(shape.data.center);
        }
      });
      if (allPoints.length > 0) setMirrorPreview(computeMirrorPoints(allPoints, mirrorAxis));
      else setMirrorPreview(null);
    }

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

    if (effectiveTool === 'offset' && offsetPreview) {
      const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const hit = hitTestShape(world);
      if (hit && hit.type === 'polygon') {
        onShapeAdd({
          type: 'polygon',
          data: {
            points: [...offsetPreview],
            id: generateId(),
            isConstruction: false,
            closed: hit.data.closed,
          },
        });
      }
      setOffsetPreview(null);
      return;
    }

    if (effectiveTool === 'mirror' && selectedShapes.length > 0 && sketch) {
      selectedShapes.forEach(shapeId => {
        const shape = sketch.shapes.find(s => s.data.id === shapeId);
        if (!shape) return;
        if (shape.type === 'polygon') {
          const mirrored = computeMirrorPoints(shape.data.points, mirrorAxis);
          onShapeAdd({
            type: 'polygon',
            data: {
              points: mirrored,
              id: generateId(),
              isConstruction: shape.data.isConstruction,
              closed: shape.data.closed,
            },
          });
        } else if (shape.type === 'line') {
          const mirrored = computeMirrorPoints([shape.data.start, shape.data.end], mirrorAxis);
          onShapeAdd({
            type: 'line',
            data: {
              start: { ...mirrored[0], id: generateId() },
              end: { ...mirrored[1], id: generateId() },
              id: generateId(),
              isConstruction: shape.data.isConstruction,
            },
          });
        } else if (shape.type === 'rectangle') {
          const mirrored = computeMirrorPoints([shape.data.corner1, shape.data.corner2], mirrorAxis);
          onShapeAdd({
            type: 'rectangle',
            data: {
              corner1: { ...mirrored[0], id: generateId() },
              corner2: { ...mirrored[1], id: generateId() },
              id: generateId(),
              isConstruction: shape.data.isConstruction,
            },
          });
        } else if (shape.type === 'circle') {
          const mirrored = computeMirrorPoints([shape.data.center], mirrorAxis);
          onShapeAdd({
            type: 'circle',
            data: {
              center: { ...mirrored[0], id: generateId() },
              radius: shape.data.radius,
              id: generateId(),
              isConstruction: shape.data.isConstruction,
            },
          });
        }
      });
      setSelectedShapes([]);
      setMirrorPreview(null);
      return;
    }

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
        setInternalTool('select');
        setFilletShape1(null);
        setFilletShape2(null);
        setSelectedShapes([]);
        setOffsetPreview(null);
        setMirrorPreview(null);
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
              onClick={() => { onToolChange(tool); setInternalTool('select'); setFilletShape1(null); setFilletShape2(null); setSelectedShapes([]); }}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                activeTool === tool && internalTool === 'select'
                  ? 'bg-cyan-500 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tool === 'select' ? '↖' : tool === 'line' ? '/' : tool === 'rectangle' ? '▭' : tool === 'circle' ? '○' : '⬠'}
            </button>
          ))}
          {([
            { key: 'arc_tangent', label: '⌒', title: 'Tangent Arc' },
            { key: 'fillet', label: '⌐', title: 'Fillet' },
            { key: 'offset', label: '⇌', title: 'Offset' },
            { key: 'mirror', label: '∣', title: 'Mirror' },
          ] as const).map(item => (
            <button
              key={item.key}
              onClick={() => {
                setInternalTool(item.key);
                onToolChange('select' as CADSketchTool);
                setSelectedShapes([]);
                setFilletShape1(null);
                setFilletShape2(null);
                setOffsetPreview(null);
                setMirrorPreview(null);
                setPoints([]);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                effectiveTool === item.key
                  ? 'bg-amber-500 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              title={item.title}
            >
              {item.label}
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

        {effectiveTool === 'fillet' && (
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1">
            <label className="text-[10px] text-slate-500">R:</label>
            <input
              type="number"
              value={filletRadius}
              onChange={e => setFilletRadius(Number(e.target.value))}
              className="w-12 text-[10px] border border-slate-300 rounded px-1 py-0.5"
            />
          </div>
        )}

        {effectiveTool === 'offset' && (
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1">
            <label className="text-[10px] text-slate-500">D:</label>
            <input
              type="number"
              value={offsetDistance}
              onChange={e => setOffsetDistance(Number(e.target.value))}
              className="w-12 text-[10px] border border-slate-300 rounded px-1 py-0.5"
            />
          </div>
        )}

        {effectiveTool === 'mirror' && (
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1">
            <button
              onClick={() => setMirrorAxis('x')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${mirrorAxis === 'x' ? 'bg-purple-500 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              X
            </button>
            <button
              onClick={() => setMirrorAxis('y')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${mirrorAxis === 'y' ? 'bg-purple-500 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              Y
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="px-2 py-1 bg-white rounded-lg shadow-md border border-slate-200 text-[10px] font-bold text-slate-600 hover:text-red-500 transition-colors"
        >
          Done
        </button>
      </div>

      <div className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
        {(zoom * 100).toFixed(0)}% | {effectiveTool} {shiftHeld ? '| Snap' : ''} {activeConstraint ? `| ${activeConstraint}` : ''}
      </div>

      {points.length > 0 && effectiveTool === 'arc_tangent' && (
        <div className="absolute bottom-2 left-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          Click to place tangent arc endpoint | ESC to cancel
        </div>
      )}

      {points.length > 0 && effectiveTool !== 'arc_tangent' && (
        <div className="absolute bottom-2 left-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          Click to add points | Double-click to close | ESC to cancel | {points.length} points
        </div>
      )}

      {effectiveTool === 'fillet' && filletShape1 && !filletShape2 && (
        <div className="absolute bottom-2 left-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          Click second adjacent line to create fillet
        </div>
      )}

      {effectiveTool === 'mirror' && selectedShapes.length > 0 && (
        <div className="absolute bottom-2 left-2 z-10 bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          {selectedShapes.length} shapes selected | Click shapes to toggle
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
