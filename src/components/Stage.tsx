
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { AppMode, HardwareState, SpriteState, AppState, CircuitComponent } from '../types';
import { playSoundEffect } from '../services/soundService';
import { Brain, Cpu, Volume2, Wifi, Battery, Fan, Move, Thermometer, Sun, Moon, Disc, ToggleLeft, Hash, Tv, Bluetooth, Radio, Signal, MapPin, Heart, Sliders, LayoutList, Search, Lock, Droplets, CloudRain, Flame, Activity, Scan, Fingerprint, Zap, Radar, Palette, MousePointer2, BarChart3, Video, Calendar, Clock, Cloud, Rewind, FastForward, Triangle, Key, DoorOpen, Camera, Home, ArrowLeft, Pencil, List, Trash2, CameraOff } from 'lucide-react';
import { CIRCUIT_PALETTE } from '../constants';

export interface StageHandle {
  takeScreenshot: () => void;
  getThumbnail: () => string | null;
}

interface StageProps {
  mode: AppMode;
  hardwareState: HardwareState;
  onHardwareInput?: (pin: number, value: any) => void;
  spriteState: SpriteState;
  spriteStateRef?: React.MutableRefObject<SpriteState>; 
  appState: AppState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  highlightPin?: number | null; 
  circuitComponents: CircuitComponent[];
  onCircuitUpdate: (components: CircuitComponent[]) => void;
  pcbColor?: string;
  setPcbColor?: (color: string) => void;
  isExecuting?: boolean;
  onAppInteraction?: (varName: string, value: any) => void;
  logs?: string[];
  onClearLogs?: () => void;
  showConfetti?: boolean;
  onUpdateSpriteState?: (newState: Partial<SpriteState>) => void;
  isDesignMode?: boolean; 
  selectedAppElementId?: string | null; 
  onSelectAppElement?: (id: string | null) => void; 
  shakeAmount?: number;
  inputState?: Set<string>;
  onInput?: (key: string, pressed: boolean) => void;
  onNavigate?: (screenName: string) => void; 
}

const PCB_COLORS = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Black', hex: '#1e293b' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'White', hex: '#f8fafc' },
];

const WIRE_COLORS = [
    { name: 'Red', hex: '#ef4444' }, 
    { name: 'Black', hex: '#1e293b' }, 
    { name: 'Yellow', hex: '#facc15' }, 
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'White', hex: '#f8fafc' },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 0-1
  decay: number;
}

const VirtualButton = ({ id, label, icon: Icon, color, keys, onInput }: { id: string, label: string, icon?: any, color: string, keys: string[], onInput?: (key: string, pressed: boolean) => void }) => {
    return (
        <button 
          className={`w-12 h-12 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-lg ${color}`}
          onPointerDown={(e) => { e.preventDefault(); onInput?.(id, true); }}
          onPointerUp={(e) => { e.preventDefault(); onInput?.(id, false); }}
          onPointerLeave={(e) => { e.preventDefault(); onInput?.(id, false); }}
        >
            {Icon ? <Icon size={20} className="text-white drop-shadow-sm" /> : <span className="font-black text-white text-lg drop-shadow-sm">{label}</span>}
        </button>
    );
};

// --- ISOLATED GAME CANVAS ---
// This component handles the high-frequency rendering loop.
// It is heavily memoized to prevent re-renders when parent state (like Score) changes.
const GameCanvas = React.memo(({ 
    spriteState, 
    spriteStateRef, 
    appState, 
    canvasRef, 
    isExecuting, 
    shakeAmount, 
    onUpdateSpriteState 
}: any) => {
    const renderState = useRef({ x: spriteState.x, y: spriteState.y, vx: 0, vy: 0, rotation: spriteState.rotation, scaleX: 1, scaleY: 1 });
    const targetState = useRef(spriteState);
    const tilemapRef = useRef(spriteState.tilemap);
    const ambientParticles = useRef<{x: number, y: number, speed: number, type: 'rain'|'snow'|'cloud', size?: number}[]>([]);
    
    // High-performance particle system using Ref (no React State)
    const gameParticles = useRef<Particle[]>([]);
    
    const frameCache = useRef<Record<string, HTMLImageElement>>({});
    const isPaintingTile = useRef(false);
    const [editorScrollX, setEditorScrollX] = useState(0);

    // Timeline drag handler (only relevant in editor mode)
    const handleTimelineDrag = (e: React.MouseEvent) => {
        if (isExecuting) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setEditorScrollX((Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))) * 19600);
    };

    useEffect(() => {
        if (!isExecuting && !isPaintingTile.current) {
            targetState.current = spriteState;
            renderState.current.x = spriteState.x;
            renderState.current.y = spriteState.y;
            tilemapRef.current = spriteState.tilemap;
        }
    }, [spriteState, isExecuting]);

    useEffect(() => {
        if (ambientParticles.current.length === 0) {
            for(let i=0; i<5; i++) ambientParticles.current.push({ x: Math.random() * 400, y: Math.random() * 150, speed: Math.random() * 0.2 + 0.1, type: 'cloud', size: Math.random() * 30 + 20 });
        }
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        let animationFrameId: number;
        const ctx = canvasRef.current.getContext('2d');
        const currentFrames = spriteState.frames || [];
        const mainTexture = spriteState.texture;
        if (mainTexture && !frameCache.current[mainTexture]) { const img = new Image(); img.src = mainTexture; frameCache.current[mainTexture] = img; }
        currentFrames.forEach((src: string) => { if (!frameCache.current[src]) { const img = new Image(); img.src = src; frameCache.current[src] = img; } });
        
        const render = () => {
          if (!ctx) return;
          const time = Date.now();
          
          const target = isExecuting && spriteStateRef ? spriteStateRef.current : targetState.current; 
          const current = renderState.current;
          const currentTilemap = isPaintingTile.current ? tilemapRef.current : target.tilemap;
          
          // Check for particle triggers
          if (target.effectTrigger) {
              const { x, y, color, type } = target.effectTrigger;
              // Spawn Burst
              for(let i=0; i<12; i++) {
                  gameParticles.current.push({
                      x, y,
                      vx: (Math.random() - 0.5) * 10,
                      vy: (Math.random() - 0.5) * 10,
                      life: 1.0,
                      decay: Math.random() * 0.03 + 0.02,
                      color: color || (i % 2 === 0 ? '#fbbf24' : '#ef4444'),
                      size: Math.random() * 6 + 2
                  });
              }
              // Clear trigger to prevent infinite spawning
              target.effectTrigger = undefined;
          }

          const springStiffness = 0.15; const damping = 0.7;
          const ax = (target.x - current.x) * springStiffness; current.vx += ax; current.vx *= damping; current.x += current.vx;
          const ay = (target.y - current.y) * springStiffness; current.vy += ay; current.vy *= damping; current.y += current.vy;
          current.rotation += (target.rotation - current.rotation) * 0.2;
          const speedY = target.vy || 0;
          const targetScaleY = 1 + (Math.abs(speedY) * 0.02);
          const targetScaleX = 1 - (Math.abs(speedY) * 0.02);
          current.scaleX += (targetScaleX - current.scaleX) * 0.2;
          current.scaleY += (targetScaleY - current.scaleY) * 0.2;
          
          let cameraX = 0; let cameraY = 0;
          if (isExecuting) { if (target.cameraFollow) { cameraX = current.x - 200; if (cameraX < 0) cameraX = 0; cameraY = current.y - 200; } } else { cameraX = editorScrollX; cameraY = 0; }
          if (shakeAmount > 0) { cameraX += (Math.random() - 0.5) * shakeAmount * 20; cameraY += (Math.random() - 0.5) * shakeAmount * 20; }
          
          ctx.clearRect(0, 0, 400, 400); ctx.save(); ctx.translate(-cameraX, -cameraY);
          
          if (target.scene === 'space') { ctx.fillStyle = '#0f172a'; ctx.fillRect(cameraX, cameraY, 400, 400); ctx.fillStyle = 'white'; for(let i=0; i<30; i++) { const starX = (Math.sin(i*12)*400 + i*100) - (cameraX * 0.2); const starY = (Math.cos(i*23)*400 + i*50) - (cameraY * 0.2); const wrappedX = ((starX % 400) + 400) % 400 + cameraX; const wrappedY = ((starY % 400) + 400) % 400 + cameraY; const alpha = 0.5 + Math.sin(time * 0.005 + i) * 0.5; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(wrappedX, wrappedY, Math.random()*2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; } } else if (target.scene === 'forest') { ctx.fillStyle = '#ecfccb'; ctx.fillRect(cameraX, cameraY, 400, 400); ctx.fillStyle = '#84cc16'; ctx.beginPath(); const startX = Math.floor(cameraX / 100) * 100; ctx.moveTo(startX, 400); for(let i = startX; i < cameraX + 500; i+=50) { const h = Math.sin((i + cameraX*0.5) * 0.01) * 30 + 100; ctx.lineTo(i, 400 - h); } ctx.lineTo(cameraX + 400, 400); ctx.fill(); ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.moveTo(startX, 400); for(let i = startX; i < cameraX + 500; i+=100) { const height = Math.sin(i * 0.02) * 50 + 50; ctx.lineTo(i, 400 - height); ctx.lineTo(i + 100, 400); } ctx.lineTo(cameraX + 400, 500); ctx.lineTo(cameraX, 500); ctx.fill(); } else if (target.scene === 'desert') { ctx.fillStyle = '#fef3c7'; ctx.fillRect(cameraX, cameraY, 400, 400); } else { ctx.fillStyle = '#fff'; ctx.fillRect(cameraX, cameraY, 400, 400); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.beginPath(); const startGridX = Math.floor(cameraX / 40) * 40; const startGridY = Math.floor(cameraY / 40) * 40; for (let i = startGridX; i <= cameraX + 400; i += 40) { ctx.moveTo(i, cameraY); ctx.lineTo(i, cameraY + 400); } for (let i = startGridY; i <= cameraY + 400; i += 40) { ctx.moveTo(cameraX, i); ctx.lineTo(cameraX + 400, i); } ctx.stroke(); }
          
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ambientParticles.current.forEach(p => { if (p.type === 'cloud') { p.x += p.speed; if (p.x > 400 + cameraX + 50) p.x = cameraX - 50; const drawX = (p.x + cameraX * 0.8) % 600 - 100 + cameraX; ctx.beginPath(); ctx.arc(drawX, p.y + cameraY, p.size || 20, 0, Math.PI*2); ctx.arc(drawX + (p.size || 20)*0.8, p.y + cameraY + 5, (p.size || 20)*0.7, 0, Math.PI*2); ctx.arc(drawX - (p.size || 20)*0.8, p.y + cameraY + 5, (p.size || 20)*0.7, 0, Math.PI*2); ctx.fill(); } });
          
          if (currentTilemap) { currentTilemap.forEach((tile: any) => { const x = tile.x * 40; const y = tile.y * 40; if (x < cameraX - 40 || x > cameraX + 400 || y < cameraY - 40 || y > cameraY + 400) return; 
            if (tile.type === 'brick') { ctx.fillStyle = '#78350f'; ctx.fillRect(x, y, 40, 40); ctx.fillStyle = '#92400e'; ctx.fillRect(x+2, y+2, 36, 16); } 
            else if (tile.type === 'grass') { ctx.fillStyle = '#22c55e'; ctx.fillRect(x, y, 40, 40); ctx.fillStyle = '#86efac'; ctx.fillRect(x, y, 40, 5); } 
            else if (tile.type === 'coin') { const spin = Math.abs(Math.sin(time * 0.005)); ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(x+20, y+20, 10 * spin, 10, 0, 0, Math.PI*2); ctx.fill(); } 
            else { ctx.fillStyle = '#64748b'; ctx.fillRect(x, y, 40, 40); } 
          }); }
          
          // Draw Particles
          if (gameParticles.current.length > 0) {
              for (let i = gameParticles.current.length - 1; i >= 0; i--) {
                  const p = gameParticles.current[i];
                  p.x += p.vx;
                  p.y += p.vy;
                  p.vy += 0.2; // Gravity
                  p.life -= p.decay;
                  if (p.life <= 0) {
                      gameParticles.current.splice(i, 1);
                      continue;
                  }
                  ctx.globalAlpha = p.life;
                  ctx.fillStyle = p.color;
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
                  ctx.fill();
                  ctx.globalAlpha = 1;
              }
          }

          target.items.forEach((item: any) => { const bob = Math.sin(time * 0.005 + item.x) * 5; ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.fillText(item.emoji || '💎', item.x, item.y + bob); });
          target.enemies.forEach((enemy: any) => { ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.fillText(enemy.emoji || '👾', 0, 0); ctx.restore(); });
          
          let textureImg: HTMLImageElement | null = null; if (target.texture && frameCache.current[target.texture]) { textureImg = frameCache.current[target.texture]; }
          ctx.save(); ctx.translate(current.x, current.y); ctx.rotate((current.rotation * Math.PI) / 180); ctx.scale(current.scaleX, current.scaleY); 
          if (textureImg && textureImg.complete) { ctx.drawImage(textureImg, -20, -20, 40, 40); } else { ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(target.emoji, 0, 0); } ctx.restore();
          
          ctx.restore();
          animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef, spriteState.texture, spriteState.frames, spriteState.scene, spriteState.weather, spriteState.clones, spriteState.opacity, spriteState.scale, shakeAmount, editorScrollX, isExecuting]); 

    const placeTileAt = (clientX: number, clientY: number) => {
        if (appState.activeLevelTool && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const rawX = clientX - rect.left + editorScrollX;
            const x = Math.floor(rawX / 40);
            const y = Math.floor((clientY - rect.top) / 40);
            let newMap = [...tilemapRef.current];
            const existingIdx = newMap.findIndex((t: any) => t.x === x && t.y === y);
            if (existingIdx >= 0 && newMap[existingIdx].type === appState.activeLevelTool) return;
            if (existingIdx >= 0) newMap.splice(existingIdx, 1);
            if (appState.activeLevelTool !== 'eraser') newMap.push({ x, y, type: appState.activeLevelTool });
            tilemapRef.current = newMap;
        }
    };

    const handleMouseUp = () => {
        if (isPaintingTile.current) {
            isPaintingTile.current = false;
            onUpdateSpriteState({ tilemap: tilemapRef.current });
            playSoundEffect('click'); 
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="relative bg-white shadow-xl rounded-lg overflow-hidden">
                <canvas 
                    ref={canvasRef} width={400} height={400} 
                    className={`block bg-white ${appState.activeLevelTool ? 'cursor-cell' : 'cursor-crosshair'}`} 
                    onMouseDown={(e) => { if(appState.activeLevelTool) { isPaintingTile.current = true; placeTileAt(e.clientX, e.clientY); }}}
                    onMouseMove={(e) => { if(isPaintingTile.current) placeTileAt(e.clientX, e.clientY); }}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
            {!isExecuting && (
                <div className="w-[400px] h-12 bg-slate-800 rounded-lg flex flex-col justify-center px-2 relative select-none shadow-inner border border-slate-700">
                    <div className="h-4 bg-slate-700 rounded w-full relative cursor-pointer" 
                        onMouseDown={(e) => { e.buttons === 1 && handleTimelineDrag(e); }}
                        onMouseMove={(e) => { e.buttons === 1 && handleTimelineDrag(e); }}
                    >
                        <div className="absolute h-full bg-indigo-500/50 border-x-2 border-indigo-400" style={{ left: `${(editorScrollX / 20000) * 100}%`, width: `${(400 / 20000) * 100}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    // CRITICAL OPTIMIZATION:
    if (prev.isExecuting && next.isExecuting) {
        return prev.appState.activeLevelTool === next.appState.activeLevelTool && prev.shakeAmount === next.shakeAmount;
    }
    return prev.spriteState === next.spriteState && prev.isExecuting === next.isExecuting && prev.appState.activeLevelTool === next.appState.activeLevelTool && prev.editorScrollX === next.editorScrollX;
});

// --- GAME STAGE CONTAINER ---
const GameStage = React.memo(({ spriteState, spriteStateRef, appState, canvasRef, isExecuting, shakeAmount, onInput, onUpdateSpriteState }: any) => {
    return (
        <div className="flex flex-col gap-2 relative">
            <GameCanvas 
                spriteState={spriteState}
                spriteStateRef={spriteStateRef}
                appState={appState}
                canvasRef={canvasRef}
                isExecuting={isExecuting}
                shakeAmount={shakeAmount}
                onUpdateSpriteState={onUpdateSpriteState}
            />
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                <div className={`bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold font-mono border border-white/20 shadow-lg ${spriteState.score > 0 ? 'text-yellow-300' : ''}`}>SCORE: {spriteState.score}</div>
                <div className="flex items-center gap-1">{Array.from({length: spriteState.maxHealth}).map((_, i) => (<Heart key={i} size={24} fill={i < spriteState.health ? "#ef4444" : "rgba(0,0,0,0.2)"} className={`${i < spriteState.health ? "text-red-500" : "text-slate-400"}`} />))}</div>
            </div>

            {isExecuting && (
                <div className="w-[400px] bg-slate-800 rounded-b-3xl rounded-t-lg p-4 flex items-center justify-between shadow-2xl border-t-4 border-slate-700 relative">
                    <div className="relative w-28 h-28 bg-slate-700/50 rounded-full flex items-center justify-center border border-slate-600">
                        <div className="grid grid-cols-3 gap-1">
                            <div /><VirtualButton id="VirtualUp" label="" icon={Triangle} color="bg-slate-900 border-slate-950" keys={['ArrowUp', 'KeyW']} onInput={onInput} /><div />
                            <VirtualButton id="VirtualLeft" label="" icon={Triangle} color="bg-slate-900 border-slate-950 -rotate-90" keys={['ArrowLeft', 'KeyA']} onInput={onInput} /><div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center" /><VirtualButton id="VirtualRight" label="" icon={Triangle} color="bg-slate-900 border-slate-950 rotate-90" keys={['ArrowRight', 'KeyD']} onInput={onInput} />
                            <div /><VirtualButton id="VirtualDown" label="" icon={Triangle} color="bg-slate-900 border-slate-950 rotate-180" keys={['ArrowDown', 'KeyS']} onInput={onInput} /><div />
                        </div>
                    </div>
                    <div className="flex gap-4 items-end pb-2">
                        <div className="flex flex-col items-center gap-1"><VirtualButton id="VirtualB" label="B" color="bg-red-500 border-red-700" keys={['KeyX', 'KeyK']} onInput={onInput} /><span className="text-[10px] font-bold text-slate-500">ACTION</span></div>
                        <div className="flex flex-col items-center gap-1 -mt-4"><VirtualButton id="VirtualA" label="A" color="bg-green-500 border-green-700" keys={['Space', 'KeyZ']} onInput={onInput} /><span className="text-[10px] font-bold text-slate-500">JUMP</span></div>
                    </div>
                </div>
            )}
        </div>
    );
});

// --- HARDWARE STAGE ---
const HardwareStage = React.memo(({ hardwareState, circuitComponents, pcbColor, highlightPin, onCircuitUpdate, onHardwareInput, isExecuting }: any) => {
    const [localComponents, setLocalComponents] = useState<CircuitComponent[]>(circuitComponents);
    const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!draggingCompId) {
            setLocalComponents(circuitComponents);
        }
    }, [circuitComponents, draggingCompId]);

    const getPinCoords = (pin: number) => {
        const isLeft = pin % 2 === 0; const row = Math.floor(pin / 2); return { x: isLeft ? 40 : 260, y: 130 + (row * 20) };
    };

    const handleCompDragMove = (e: React.PointerEvent) => {
        if (!draggingCompId || !svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const rawX = e.clientX - svgRect.left - dragOffset.current.x;
        const rawY = e.clientY - svgRect.top - dragOffset.current.y;
        const snap = (val: number) => Math.round(val / 20) * 20;
        setLocalComponents(prev => prev.map(c => c.id === draggingCompId ? { ...c, x: Math.max(0, Math.min(300, snap(rawX))), y: Math.max(0, Math.min(400, snap(rawY))) } : c));
    };

    const handleDragEnd = (e: React.PointerEvent) => {
        if (draggingCompId) {
            onCircuitUpdate(localComponents);
            setDraggingCompId(null);
            (e.target as Element).releasePointerCapture(e.pointerId);
        }
    };

    return (
        <div 
            className="relative w-[300px] h-[400px] border-2 border-slate-300 bg-slate-100 rounded-xl shadow-inner overflow-hidden select-none"
            ref={svgRef as any}
            onPointerMove={handleCompDragMove}
            onPointerUp={handleDragEnd}
            onDrop={(e) => {
                e.preventDefault();
                try {
                    const raw = e.dataTransfer.getData('application/json');
                    if (!raw) return;
                    const tool = JSON.parse(raw);
                    if (tool && tool.type) {
                       onCircuitUpdate([...circuitComponents, { id: crypto.randomUUID(), type: tool.type, x: 150, y: 200, pin: tool.defaultPin || 0, rotation: 0 }]);
                       playSoundEffect('click');
                    }
                } catch(e) {}
            }}
            onDragOver={(e) => e.preventDefault()}
        >
            <svg width="100%" height="100%" viewBox="0 0 300 400" className="w-full h-full pointer-events-auto">
                <rect width="100%" height="100%" fill={pcbColor} />
                {localComponents.map((comp: any) => {
                    const pinCoords = getPinCoords(comp.pin); 
                    const isHigh = hardwareState.pins[comp.pin];
                    const wireColor = isHigh ? '#fbbf24' : 'rgba(255,255,255,0.2)';
                    const startX = comp.x + 10; const startY = comp.y + 10;
                    return (
                        <path key={`wire-${comp.id}`} d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke={wireColor} strokeWidth={isHigh ? 3 : 2} />
                    );
                })}
                <g transform="translate(150, 120)"><rect x="-60" y="-45" width="120" height="90" rx="4" fill="#1e293b" /><text x="0" y="-18" textAnchor="middle" fontSize="5" fill="#64748b" fontFamily="monospace" fontWeight="bold">MICRO-CONTROLLER</text></g>
                {localComponents.map((comp: any) => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`} 
                       onPointerDown={(e) => { e.stopPropagation(); setDraggingCompId(comp.id); dragOffset.current = { x: e.nativeEvent.offsetX - comp.x, y: e.nativeEvent.offsetY - comp.y }; (e.target as Element).setPointerCapture(e.pointerId); }}
                       className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    >
                        <circle cx="10" cy="10" r="12" fill={hardwareState.pins[comp.pin] ? "#ef4444" : "#334155"} />
                    </g>
                ))}
            </svg>
        </div>
    );
});

// --- APP STAGE ---
const AppStage = React.memo(({ appState, onNavigate, isDesignMode }: any) => {
    const currentAppElements = appState.screens?.[appState.activeScreen] || [];
    return (
      <div className="relative w-[340px] h-[680px] bg-slate-900 rounded-[3.5rem] shadow-2xl border-[10px] border-slate-800 overflow-hidden shrink-0">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-slate-900 rounded-b-2xl z-50 pointer-events-none flex justify-center items-end pb-1.5"><div className="w-16 h-1 bg-slate-800 rounded-full"></div></div>
           <div className="w-full h-full bg-white relative overflow-y-auto" style={{ backgroundColor: appState.backgroundColor }}>
                <div className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 p-4 z-30 shadow-sm flex items-center justify-between">
                    {appState.activeScreen !== 'main' && <button onClick={() => onNavigate?.('main')} className="p-1 rounded-full hover:bg-slate-100 mr-2 text-slate-500"><ArrowLeft size={18}/></button>}
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex-1 truncate">{appState.title}</h2>
                </div>
                <div className="p-4 space-y-4 min-h-[500px]">
                    {currentAppElements.map((el: any) => (
                        <div key={el.id} className="p-3 bg-slate-100 rounded-xl">
                            {el.type === 'button' ? <button className="w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg">{el.content}</button> : 
                             el.type === 'image' ? <div className="w-full aspect-video bg-slate-200 rounded-lg" /> :
                             <span className="font-bold text-slate-700">{el.content}</span>}
                        </div>
                    ))}
                </div>
           </div>
           <div className="absolute bottom-0 w-full h-10 bg-white/90 backdrop-blur border-t border-slate-100 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-slate-50 transition-colors z-50" onClick={() => onNavigate?.('main')}><div className="w-32 h-1 bg-slate-300 rounded-full"></div></div>
      </div>
    );
});

// --- MAIN STAGE COMPONENT ---
const Stage = forwardRef<StageHandle, StageProps>((props, ref) => {
  const { mode, showConfetti, canvasRef } = props;
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {},
    getThumbnail: () => canvasRef.current?.toDataURL('image/jpeg', 0.5) || null
  }));

  useEffect(() => {
    if (!showConfetti) {
        particlesRef.current = [];
        const ctx = confettiCanvasRef.current?.getContext('2d');
        ctx?.clearRect(0,0, 400, 500);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        return;
    }
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    for(let i=0; i<50; i++) {
        particlesRef.current.push({
            x: 200, y: 200, vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
            color: colors[Math.floor(Math.random() * colors.length)], size: Math.random() * 8 + 4,
            rotation: Math.random() * 360, vRotation: (Math.random() - 0.5) * 10,
            life: 1, decay: 0
        });
    }
    const renderParticles = () => {
        const ctx = confettiCanvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0,0,400,500); 
        particlesRef.current = particlesRef.current.map(p => ({
            ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5, vx: p.vx * 0.95, rotation: p.rotation + p.vRotation
        })).filter(p => p.y < 600);
        particlesRef.current.forEach(p => {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();
        });
        if (particlesRef.current.length > 0) animationFrameRef.current = requestAnimationFrame(renderParticles);
    };
    renderParticles();
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [showConfetti]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative">
      <canvas ref={confettiCanvasRef} width={400} height={500} className="absolute inset-0 z-50 pointer-events-none" />
      {mode === AppMode.GAME && <GameStage {...props} />}
      {mode === AppMode.APP && <AppStage {...props} />}
      {mode === AppMode.HARDWARE && <HardwareStage {...props} />}
    </div>
  );
});

export default React.memo(Stage);
