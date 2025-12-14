
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { AppMode, HardwareState, SpriteState, AppState, CircuitComponent } from '../types';
import { playSoundEffect } from '../services/soundService';
import { Triangle, Heart, ArrowLeft, ToggleLeft, ToggleRight, Search, Menu, Send, Grip } from 'lucide-react';

export interface StageHandle {
  takeScreenshot: () => void;
  getThumbnail: () => string | null;
}

interface StageProps {
  mode: AppMode;
  hardwareState: HardwareState;
  hardwareStateRef?: React.MutableRefObject<HardwareState>;
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
  gameCanvasSize?: { w: number, h: number };
  onGameCanvasResize?: (size: { w: number, h: number }) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 0-1
  decay: number;
  rotation?: number;
  vRotation?: number;
}

const VirtualButton = ({ id, label, icon: Icon, color, keys, onInput }: { id: string, label: string, icon?: any, color: string, keys: string[], onInput?: (key: string, pressed: boolean) => void }) => {
    return (
        <button 
          className={`w-12 h-12 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-lg active:shadow-none active:scale-95 ${color}`}
          onPointerDown={(e) => { e.preventDefault(); onInput?.(keys[0], true); }}
          onPointerUp={(e) => { e.preventDefault(); onInput?.(keys[0], false); }}
          onPointerLeave={(e) => { e.preventDefault(); onInput?.(keys[0], false); }}
          // Touch events for mobile
          onTouchStart={(e) => { e.preventDefault(); onInput?.(keys[0], true); }}
          onTouchEnd={(e) => { e.preventDefault(); onInput?.(keys[0], false); }}
        >
            {Icon ? <Icon size={20} className="text-white drop-shadow-sm" /> : <span className="font-black text-white text-lg drop-shadow-sm">{label}</span>}
        </button>
    );
};

// --- ISOLATED GAME CANVAS ---
const GameCanvas = React.memo(({ 
    spriteState, 
    spriteStateRef, 
    appState, 
    canvasRef, 
    isExecuting, 
    shakeAmount, 
    onUpdateSpriteState,
    width = 400,
    height = 400,
    onResize
}: any) => {
    const renderState = useRef({ x: spriteState.x, y: spriteState.y, vx: 0, vy: 0, rotation: spriteState.rotation, scaleX: 1, scaleY: 1 });
    const targetState = useRef(spriteState);
    const tilemapRef = useRef(spriteState.tilemap);
    const ambientParticles = useRef<{x: number, y: number, speed: number, type: 'rain'|'snow'|'cloud', size?: number}[]>([]);
    
    // High-performance particle system using Ref
    const gameParticles = useRef<Particle[]>([]);
    
    const frameCache = useRef<Record<string, HTMLImageElement>>({});
    const isPaintingTile = useRef(false);
    const [editorScrollX, setEditorScrollX] = useState(0);

    const handleTimelineDrag = (e: React.MouseEvent) => {
        if (isExecuting) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setEditorScrollX((Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))) * 19600);
    };

    const handleMouseDownResize = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!onResize) return;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = width;
        const startH = height;

        const handleMouseMove = (ev: MouseEvent) => {
            const deltaX = ev.clientX - startX;
            const deltaY = ev.clientY - startY;
            // Use 2x multiplier for centered resizing feel to prevent cursor slip
            const newW = Math.max(300, startW + deltaX * 2);
            const newH = Math.max(300, startH + deltaY * 2);
            onResize({ w: newW, h: newH });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
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
            for(let i=0; i<5; i++) ambientParticles.current.push({ x: Math.random() * width, y: Math.random() * (height * 0.4), speed: Math.random() * 0.2 + 0.1, type: 'cloud', size: Math.random() * 30 + 20 });
        }
    }, [width, height]);

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
          
          // Check for particle triggers from the execution engine
          if (target.effectTrigger) {
              const { x, y, color, type } = target.effectTrigger;
              const count = type === 'explosion' ? 20 : 5;
              for(let i=0; i<count; i++) {
                  gameParticles.current.push({
                      x, y,
                      vx: (Math.random() - 0.5) * 12,
                      vy: (Math.random() - 0.5) * 12,
                      life: 1.0,
                      decay: Math.random() * 0.03 + 0.02,
                      color: color || (i % 2 === 0 ? '#fbbf24' : '#ef4444'),
                      size: Math.random() * 6 + 2
                  });
              }
              target.effectTrigger = undefined; // Consumed
          }

          // Physics Interpolation
          const springStiffness = 0.2; const damping = 0.6;
          const ax = (target.x - current.x) * springStiffness; current.vx += ax; current.vx *= damping; current.x += current.vx;
          const ay = (target.y - current.y) * springStiffness; current.vy += ay; current.vy *= damping; current.y += current.vy;
          current.rotation += (target.rotation - current.rotation) * 0.2;
          const speedY = target.vy || 0;
          const targetScaleY = 1 + (Math.abs(speedY) * 0.02);
          const targetScaleX = 1 - (Math.abs(speedY) * 0.02);
          current.scaleX += (targetScaleX - current.scaleX) * 0.2;
          current.scaleY += (targetScaleY - current.scaleY) * 0.2;
          
          let cameraX = 0; let cameraY = 0;
          if (isExecuting) { if (target.cameraFollow) { cameraX = current.x - width/2; if (cameraX < 0) cameraX = 0; cameraY = current.y - height/2; } } else { cameraX = editorScrollX; cameraY = 0; }
          if (shakeAmount > 0) { cameraX += (Math.random() - 0.5) * shakeAmount * 20; cameraY += (Math.random() - 0.5) * shakeAmount * 20; }
          
          ctx.clearRect(0, 0, width, height); ctx.save(); ctx.translate(-cameraX, -cameraY);
          
          // Backgrounds
          if (target.scene === 'space') { ctx.fillStyle = '#0f172a'; ctx.fillRect(cameraX, cameraY, width, height); ctx.fillStyle = 'white'; for(let i=0; i<30; i++) { const starX = (Math.sin(i*12)*400 + i*100) - (cameraX * 0.2); const starY = (Math.cos(i*23)*400 + i*50) - (cameraY * 0.2); const wrappedX = ((starX % width) + width) % width + cameraX; const wrappedY = ((starY % height) + height) % height + cameraY; const alpha = 0.5 + Math.sin(time * 0.005 + i) * 0.5; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(wrappedX, wrappedY, Math.random()*2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; } } else if (target.scene === 'forest') { ctx.fillStyle = '#ecfccb'; ctx.fillRect(cameraX, cameraY, width, height); ctx.fillStyle = '#84cc16'; ctx.beginPath(); const startX = Math.floor(cameraX / 100) * 100; ctx.moveTo(startX, height); for(let i = startX; i < cameraX + width + 100; i+=50) { const h = Math.sin((i + cameraX*0.5) * 0.01) * 30 + 100; ctx.lineTo(i, height - h); } ctx.lineTo(cameraX + width, height); ctx.fill(); ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.moveTo(startX, height); for(let i = startX; i < cameraX + width + 100; i+=100) { const h = Math.sin(i * 0.02) * 50 + 50; ctx.lineTo(i, height - h); ctx.lineTo(i + 100, height); } ctx.lineTo(cameraX + width, height + 100); ctx.lineTo(cameraX, height + 100); ctx.fill(); } else if (target.scene === 'desert') { ctx.fillStyle = '#fef3c7'; ctx.fillRect(cameraX, cameraY, width, height); } else { ctx.fillStyle = '#fff'; ctx.fillRect(cameraX, cameraY, width, height); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; ctx.beginPath(); const startGridX = Math.floor(cameraX / 40) * 40; const startGridY = Math.floor(cameraY / 40) * 40; for (let i = startGridX; i <= cameraX + width; i += 40) { ctx.moveTo(i, cameraY); ctx.lineTo(i, cameraY + height); } for (let i = startGridY; i <= cameraY + height; i += 40) { ctx.moveTo(cameraX, i); ctx.lineTo(cameraX + width, i); } ctx.stroke(); }
          
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ambientParticles.current.forEach(p => { if (p.type === 'cloud') { p.x += p.speed; if (p.x > width + cameraX + 50) p.x = cameraX - 50; const drawX = (p.x + cameraX * 0.8) % (width + 200) - 100 + cameraX; ctx.beginPath(); ctx.arc(drawX, p.y + cameraY, p.size || 20, 0, Math.PI*2); ctx.arc(drawX + (p.size || 20)*0.8, p.y + cameraY + 5, (p.size || 20)*0.7, 0, Math.PI*2); ctx.arc(drawX - (p.size || 20)*0.8, p.y + cameraY + 5, (p.size || 20)*0.7, 0, Math.PI*2); ctx.fill(); } });
          
          // Draw Tilemap
          if (currentTilemap) { currentTilemap.forEach((tile: any) => { const x = tile.x * 40; const y = tile.y * 40; if (x < cameraX - 40 || x > cameraX + width || y < cameraY - 40 || y > cameraY + height) return; 
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

          // Draw Entities (Items, Enemies)
          target.items.forEach((item: any) => { const bob = Math.sin(time * 0.005 + item.x) * 5; ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.fillText(item.emoji || '💎', item.x, item.y + bob); });
          target.enemies.forEach((enemy: any) => { ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.fillText(enemy.emoji || '👾', 0, 0); ctx.restore(); });
          
          // Draw Projectiles
          if (target.projectiles && target.projectiles.length > 0) {
              target.projectiles.forEach((proj: any) => {
                  ctx.save();
                  ctx.translate(proj.x, proj.y);
                  ctx.font = '20px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(proj.emoji || '⚡', 0, 0);
                  ctx.restore();
              });
          }

          // Draw Player
          let textureImg: HTMLImageElement | null = null; if (target.texture && frameCache.current[target.texture]) { textureImg = frameCache.current[target.texture]; }
          ctx.save(); ctx.translate(current.x, current.y); ctx.rotate((current.rotation * Math.PI) / 180); ctx.scale(current.scaleX, current.scaleY); 
          if (textureImg && textureImg.complete) { ctx.drawImage(textureImg, -20, -20, 40, 40); } else { ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(target.emoji, 0, 0); } ctx.restore();
          
          ctx.restore();
          animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef, spriteState.texture, spriteState.frames, spriteState.scene, spriteState.weather, spriteState.clones, spriteState.opacity, spriteState.scale, shakeAmount, editorScrollX, isExecuting, width, height]); 

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
        <div className="flex flex-col gap-2" style={{ width }}>
            <div className="relative bg-white shadow-xl rounded-lg overflow-hidden group/canvas" style={{ width, height }}>
                <canvas 
                    ref={canvasRef} width={width} height={height} 
                    className={`block bg-white ${appState.activeLevelTool ? 'cursor-cell' : 'cursor-crosshair'}`} 
                    onMouseDown={(e) => { if(appState.activeLevelTool) { isPaintingTile.current = true; placeTileAt(e.clientX, e.clientY); }}}
                    onMouseMove={(e) => { if(isPaintingTile.current) placeTileAt(e.clientX, e.clientY); }}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                {!isExecuting && (
                    <div 
                        className="absolute bottom-0 right-0 p-2 cursor-nwse-resize opacity-0 group-hover/canvas:opacity-100 transition-opacity bg-slate-200/50 hover:bg-slate-300 rounded-tl-lg z-20"
                        onMouseDown={handleMouseDownResize}
                    >
                        <Grip size={16} className="text-slate-500" />
                    </div>
                )}
            </div>
            {!isExecuting && (
                <div className="h-12 bg-slate-800 rounded-lg flex flex-col justify-center px-2 relative select-none shadow-inner border border-slate-700" style={{ width: '100%' }}>
                    <div className="h-4 bg-slate-700 rounded w-full relative cursor-pointer" 
                        onMouseDown={(e) => { e.buttons === 1 && handleTimelineDrag(e); }}
                        onMouseMove={(e) => { e.buttons === 1 && handleTimelineDrag(e); }}
                    >
                        <div className="absolute h-full bg-indigo-500/50 border-x-2 border-indigo-400" style={{ left: `${(editorScrollX / 20000) * 100}%`, width: `${(width / 20000) * 100}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    if (prev.isExecuting && next.isExecuting) {
        return prev.appState.activeLevelTool === next.appState.activeLevelTool && prev.shakeAmount === next.shakeAmount && prev.width === next.width && prev.height === next.height;
    }
    return prev.spriteState === next.spriteState && prev.isExecuting === next.isExecuting && prev.appState.activeLevelTool === next.appState.activeLevelTool && prev.editorScrollX === next.editorScrollX && prev.width === next.width && prev.height === next.height;
});

// --- GAME STAGE WRAPPER WITH CONTROLS ---
const GameStage = React.memo((props: any) => {
    const { isExecuting, onInput, gameCanvasSize, onGameCanvasResize } = props;
    
    return (
        <div className="relative group w-full h-full flex items-center justify-center flex-col">
             <GameCanvas 
                {...props} 
                width={gameCanvasSize?.w || 400} 
                height={gameCanvasSize?.h || 400} 
                onResize={onGameCanvasResize} 
             />
             {isExecuting && (
                 <div style={{ width: gameCanvasSize?.w || 400, height: gameCanvasSize?.h || 400 }} className="absolute pointer-events-none mx-auto">
                     {/* Controls overlay */}
                    <div className="absolute bottom-4 left-4 flex flex-col items-center gap-1 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity">
                         <VirtualButton id="up" label="↑" color="bg-slate-700/80" keys={['ArrowUp', 'KeyW']} onInput={onInput} />
                         <div className="flex gap-1">
                             <VirtualButton id="left" label="←" color="bg-slate-700/80" keys={['ArrowLeft', 'KeyA']} onInput={onInput} />
                             <VirtualButton id="down" label="↓" color="bg-slate-700/80" keys={['ArrowDown', 'KeyS']} onInput={onInput} />
                             <VirtualButton id="right" label="→" color="bg-slate-700/80" keys={['ArrowRight', 'KeyD']} onInput={onInput} />
                         </div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-4 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity">
                         <VirtualButton id="b" label="B" color="bg-red-500/80" keys={['KeyZ', 'Shift']} onInput={onInput} />
                         <VirtualButton id="a" label="A" color="bg-green-500/80" keys={['KeyX', 'Space', 'Enter']} onInput={onInput} />
                    </div>
                 </div>
             )}
        </div>
    );
});

// --- HARDWARE STAGE (RESTORED) ---
const HardwareStage = React.memo(({ hardwareState, hardwareStateRef, circuitComponents, pcbColor, onCircuitUpdate, isExecuting, onHardwareInput }: any) => {
    const [localComponents, setLocalComponents] = useState<CircuitComponent[]>(circuitComponents);
    const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    const componentRefs = useRef<Map<string, SVGGElement>>(new Map());
    const wireRefs = useRef<Map<string, SVGPathElement>>(new Map());

    useEffect(() => {
        if (!draggingCompId) {
            setLocalComponents(circuitComponents);
        }
    }, [circuitComponents, draggingCompId]);

    useEffect(() => {
        let frameId: number;
        const updateVisuals = () => {
            const state = hardwareStateRef?.current || hardwareState;
            wireRefs.current.forEach((path, id) => {
                const comp = circuitComponents.find((c: any) => `wire-${c.id}` === id);
                if (comp) {
                    const isActive = state.pins[comp.pin];
                    if (isActive) path.classList.add('wire-active');
                    else path.classList.remove('wire-active');
                }
            });
            componentRefs.current.forEach((el, id) => {
                const comp = circuitComponents.find((c: any) => c.id === id);
                if (!comp) return;
                if (comp.type.startsWith('LED')) {
                    const isOn = state.pins[comp.pin];
                    const lightCircle = el.querySelector('.light-part');
                    if (lightCircle) {
                        const color = comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : '#22c55e';
                        lightCircle.setAttribute('fill', isOn ? color : '#334155');
                        lightCircle.setAttribute('filter', isOn ? 'url(#glow)' : '');
                    }
                }
                if (comp.type === 'RGB_LED') {
                    const lightCircle = el.querySelector('.light-part');
                    if (lightCircle) lightCircle.setAttribute('fill', state.rgbColor);
                }
                if (comp.type === 'FAN') {
                    const blades = el.querySelector('.fan-blades');
                    if (blades && state.fanSpeed > 0) {
                        const currentRot = Number(blades.getAttribute('data-rotation') || 0);
                        const newRot = (currentRot + state.fanSpeed) % 360;
                        blades.setAttribute('transform', `rotate(${newRot} 10 10)`);
                        blades.setAttribute('data-rotation', String(newRot));
                    }
                }
                if (comp.type === 'SERVO') {
                    const arm = el.querySelector('.servo-arm');
                    if (arm) arm.setAttribute('transform', `rotate(${state.servoAngle} 10 10)`);
                }
                if (comp.type === 'BUTTON') {
                    const isPressed = state.pins[comp.pin];
                    const btnCircle = el.querySelector('circle');
                    if (btnCircle) {
                        btnCircle.setAttribute('fill', isPressed ? '#991b1b' : '#ef4444');
                        btnCircle.setAttribute('r', isPressed ? '4.5' : '5');
                    }
                }
                if (comp.type === 'VIBRATION' && state.pins[comp.pin]) {
                    const shakeX = (Math.random() - 0.5) * 2;
                    const shakeY = (Math.random() - 0.5) * 2;
                    el.setAttribute('transform', `translate(${comp.x + shakeX}, ${comp.y + shakeY}) rotate(${comp.rotation || 0} 10 10)`);
                } else if (comp.type === 'VIBRATION') {
                    el.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`);
                }
                if ((comp.type === 'SPEAKER' || comp.type === 'BUZZER') && state.pins[comp.pin]) {
                    const scale = 1 + Math.sin(Date.now() * 0.05) * 0.1;
                    el.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10) scale(${scale})`);
                } else if (comp.type === 'SPEAKER' || comp.type === 'BUZZER') {
                    el.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`);
                }
                if (comp.type === 'SEVEN_SEGMENT') {
                    const val = state.sevenSegmentValue ?? 0;
                    const segs = [val!==1&&val!==4, val!==5&&val!==6, val!==2, val!==1&&val!==4&&val!==7, val===0||val===2||val===6||val===8, val!==1&&val!==2&&val!==3&&val!==7, val!==0&&val!==1&&val!==7];
                    segs.forEach((on, i) => { const segEl = el.querySelector(`.seg-${i}`); if (segEl) segEl.setAttribute('opacity', on ? '1' : '0.1'); });
                }
                if (comp.type === 'POTENTIOMETER' || comp.type === 'SLIDE_POT') {
                    const knob = el.querySelector('.pot-knob');
                    if (knob) { const deg = ((state.potentiometerValue / 1023) * 270) - 135; knob.setAttribute('transform', `rotate(${deg} 10 10)`); }
                }
                if (comp.type === 'SWITCH_SLIDE') {
                    const isOn = state.pins[comp.pin];
                    const knob = el.querySelector('.switch-knob');
                    if (knob) knob.setAttribute('cx', isOn ? '14' : '6');
                }
            });
            frameId = requestAnimationFrame(updateVisuals);
        };
        frameId = requestAnimationFrame(updateVisuals);
        return () => cancelAnimationFrame(frameId);
    }, [circuitComponents]);

    const getPinCoords = (pin: number) => {
        const isLeft = pin % 2 === 0; 
        const row = Math.floor(pin / 2); 
        const x = isLeft ? 90 : 210;
        const y = 130 + (row * 20);
        if (pin >= 90) return { x: 150 + (pin - 90) * 10 - 50, y: 350 };
        return { x, y };
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

    const handleContextMenu = (e: React.MouseEvent, compId: string) => {
        e.preventDefault();
        onCircuitUpdate(localComponents.map(c => {
            if (c.id === compId) {
                return { ...c, rotation: (c.rotation || 0) + 90 };
            }
            return c;
        }));
    };

    return (
        <div className="relative w-[300px] h-[400px] border-4 border-slate-700 bg-slate-800 rounded-xl shadow-2xl overflow-hidden select-none" ref={svgRef as any} onPointerMove={handleCompDragMove} onPointerUp={handleDragEnd} onDrop={(e) => { e.preventDefault(); try { const raw = e.dataTransfer.getData('application/json'); if (!raw) return; const tool = JSON.parse(raw); if (tool && tool.type) { onCircuitUpdate([...circuitComponents, { id: crypto.randomUUID(), type: tool.type, x: 150, y: 280, pin: tool.defaultPin || 0, rotation: 0 }]); playSoundEffect('click'); } } catch(e) {} }} onDragOver={(e) => e.preventDefault()}>
            <svg width="100%" height="100%" viewBox="0 0 300 400" className="w-full h-full pointer-events-auto">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <pattern id="pcb-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(0,0,0,0.4)" /></pattern>
                </defs>
                <rect width="100%" height="100%" fill={pcbColor || '#059669'} />
                <rect width="100%" height="100%" fill="url(#pcb-grid)" />
                <circle cx="15" cy="15" r="6" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle cx="285" cy="15" r="6" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle cx="15" cy="385" r="6" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle cx="285" cy="385" r="6" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                {localComponents.map((comp: any) => {
                    const pinCoords = getPinCoords(comp.pin); 
                    const isHigh = hardwareState.pins[comp.pin]; 
                    const wireColor = isHigh ? '#fbbf24' : 'rgba(255,255,255,0.4)';
                    const startX = comp.x + 10; 
                    const startY = comp.y + 10;
                    return ( <path key={`wire-${comp.id}`} id={`wire-${comp.id}`} ref={(el) => { if(el) wireRefs.current.set(`wire-${comp.id}`, el); else wireRefs.current.delete(`wire-${comp.id}`); }} d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke={wireColor} strokeWidth={isHigh ? 4 : 2} strokeLinecap="round" className="transition-all duration-300 drop-shadow-md" /> );
                })}
                <g transform="translate(150, 120)">
                    <rect x="-60" y="-45" width="120" height="90" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                    <text x="0" y="-20" textAnchor="middle" fontSize="6" fill="#94a3b8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">CONTROLLER</text>
                    <rect x="-15" y="-48" width="30" height="6" fill="#cbd5e1" rx="1" />
                    <rect x="-20" y="-10" width="40" height="40" fill="#0f172a" rx="2" />
                    <text x="0" y="15" textAnchor="middle" fontSize="4" fill="#64748b" fontFamily="monospace">KIDCODE</text>
                    <g transform="translate(-60, 10)">{[0, 2, 4, 6].map((p, i) => (<g key={p} transform={`translate(0, ${i * 20})`}><text x="-8" y="3" fontSize="6" fill="#cbd5e1" textAnchor="end" fontWeight="bold">D{p}</text><circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" /></g>))}</g>
                    <g transform="translate(60, 10)">{[1, 3, 5, 7].map((p, i) => (<g key={p} transform={`translate(0, ${i * 20})`}><text x="8" y="3" fontSize="6" fill="#cbd5e1" textAnchor="start" fontWeight="bold">D{p}</text><circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" /></g>))}</g>
                </g>
                {localComponents.map((comp: any) => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`} ref={(el) => { if(el) componentRefs.current.set(comp.id, el); else componentRefs.current.delete(comp.id); }} onPointerDown={(e) => { e.stopPropagation(); setDraggingCompId(comp.id); dragOffset.current = { x: e.nativeEvent.offsetX - comp.x, y: e.nativeEvent.offsetY - comp.y }; (e.target as Element).setPointerCapture(e.pointerId); }} onContextMenu={(e) => handleContextMenu(e, comp.id)} className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                        <rect x="0" y="0" width="20" height="20" rx="4" fill="#334155" stroke="rgba(255,255,255,0.2)" />
                        {comp.type.startsWith('LED') && <circle className="light-part" cx="10" cy="10" r="6" fill={hardwareState.pins[comp.pin] ? "#ef4444" : "#1e293b"} />}
                        {comp.type === 'SERVO' && <rect className="servo-arm" x="2" y="8" width="16" height="4" fill="#fbbf24" rx="2" />}
                        {comp.type === 'FAN' && <g className="fan-blades" transform="translate(10, 10)"><path d="M0 -8 L3 -3 L8 0 L3 3 L0 8 L-3 3 L-8 0 L-3 -3 Z" fill="#22d3ee" /></g>}
                        {comp.type === 'BUTTON' && <circle cx="10" cy="10" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="2" className="cursor-pointer" onPointerDown={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, true); }} onPointerUp={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, false); }} onPointerLeave={(e) => { onHardwareInput?.(comp.pin, false); }} />}
                        {comp.type === 'LCD' && <><rect x="-5" y="0" width="30" height="20" fill="#22c55e" opacity="0.8" rx="2" /><text x="10" y="12" fontSize="4" textAnchor="middle" fontFamily="monospace">LCD</text></>}
                        {comp.type === 'OLED' && <><rect x="-5" y="0" width="30" height="20" fill="#000" stroke="#333" rx="2" /><text x="10" y="12" fontSize="4" fill="#22d3ee" textAnchor="middle" fontFamily="monospace">OLED</text></>}
                        {comp.type === 'SPEAKER' && <path d="M2 7 L6 7 L10 3 L10 17 L6 13 L2 13 Z" fill="#94a3b8" stroke="none" transform="translate(2,0)"/>}
                        {comp.type === 'VIBRATION' && <circle cx="10" cy="10" r="4" fill="#d8b4fe" />}
                        {comp.type === 'SEVEN_SEGMENT' && <g transform="translate(2, 2) scale(0.8)"><polygon points="2,2 8,2 9,3 8,4 2,4 1,3" fill="#ef4444" className="seg-0" opacity="0.1"/><polygon points="8,4 9,3 10,4 10,10 9,11 8,10" fill="#ef4444" className="seg-1" opacity="0.1"/><polygon points="8,12 9,11 10,12 10,18 9,19 8,18" fill="#ef4444" className="seg-2" opacity="0.1"/><polygon points="2,18 8,18 9,19 8,20 2,20 1,19" fill="#ef4444" className="seg-3" opacity="0.1"/><polygon points="0,12 1,11 2,12 2,18 1,19 0,18" fill="#ef4444" className="seg-4" opacity="0.1"/><polygon points="0,4 1,3 2,4 2,10 1,11 0,10" fill="#ef4444" className="seg-5" opacity="0.1"/><polygon points="2,10 8,10 9,11 8,12 2,12 1,11" fill="#ef4444" className="seg-6" opacity="0.1"/></g>}
                        {comp.type === 'POTENTIOMETER' && <><circle cx="10" cy="10" r="8" fill="#333" /><circle cx="10" cy="10" r="6" fill="#555" /><rect className="pot-knob" x="9" y="4" width="2" height="6" fill="white" rx="1" transform="rotate(-135 10 10)" /></>}
                        {comp.type === 'SWITCH_SLIDE' && <><rect x="2" y="5" width="16" height="10" fill="#1e293b" rx="2" /><circle className="switch-knob" cx="6" cy="10" r="4" fill="#94a3b8" onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, !hardwareState.pins[comp.pin]); }} /></>}
                        {comp.type === 'KEYPAD' && <g transform="translate(-2, -2) scale(0.3)">{[0,1,2,3].map(r => [0,1,2,3].map(c => (<rect key={`${r}-${c}`} x={c*20} y={r*20} width="18" height="18" rx="2" fill="#333" />)))}</g>}
                        <text x="10" y="30" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>P{comp.pin}</text>
                    </g>
                ))}
            </svg>
        </div>
    );
});

// --- APP STAGE ---
const AppStage = React.memo(({ appState, onNavigate, onAppInteraction }: any) => {
    const currentAppElements = appState.screens?.[appState.activeScreen] || [];
    
    const handleElementClick = (el: any) => {
        if (el.actionMessage) {
            alert(el.actionMessage);
        }
        if (el.targetScreen) {
            onNavigate?.(el.targetScreen);
        }
        playSoundEffect('click');
    };

    const handleInputChange = (varName: string, value: any) => {
        onAppInteraction?.(varName, value);
    };

    return (
      <div className="relative w-[340px] h-[680px] bg-slate-900 rounded-[3.5rem] shadow-2xl border-[10px] border-slate-800 overflow-hidden shrink-0 animate-in zoom-in-95 duration-500">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-slate-900 rounded-b-2xl z-50 pointer-events-none flex justify-center items-end pb-1.5"><div className="w-16 h-1 bg-slate-800 rounded-full"></div></div>
           
           <div className="w-full h-full bg-white relative overflow-y-auto" style={{ backgroundColor: appState.backgroundColor }}>
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 p-4 z-30 shadow-sm flex items-center justify-between">
                    {appState.activeScreen !== 'main' && (
                        <button onClick={() => onNavigate?.('main')} className="p-2 rounded-full hover:bg-slate-100 mr-2 text-slate-500 transition-colors">
                            <ArrowLeft size={20}/>
                        </button>
                    )}
                    <h2 className="text-lg font-black text-slate-800 tracking-tight flex-1 truncate text-center">{appState.title}</h2>
                    <div className="w-8" />
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 min-h-[500px]">
                    {currentAppElements.map((el: any) => (
                        <div key={el.id} className="animate-pop-in">
                            {/* --- WIDGET RENDERER --- */}
                            
                            {el.type === 'button' && (
                                <button 
                                    onClick={() => handleElementClick(el)}
                                    className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {el.content}
                                </button>
                            )}

                            {el.type === 'input' && (
                                <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 px-4 py-2 flex items-center gap-2 focus-within:border-blue-400 transition-colors">
                                    <Search size={18} className="text-slate-400" />
                                    <input 
                                        className="bg-transparent w-full outline-none text-slate-700 font-medium"
                                        placeholder={el.placeholder || "Type here..."}
                                        value={appState.variables[el.variableName] || ''}
                                        onChange={(e) => handleInputChange(el.variableName, e.target.value)}
                                    />
                                </div>
                            )}

                            {el.type === 'switch' && (
                                <button 
                                    onClick={() => handleInputChange(el.variableName, !appState.variables[el.variableName])}
                                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-slate-700">{el.content}</span>
                                    <div className={`transition-colors ${appState.variables[el.variableName] ? 'text-green-500' : 'text-slate-300'}`}>
                                        {appState.variables[el.variableName] ? <ToggleRight size={32} fill="currentColor" /> : <ToggleLeft size={32} />}
                                    </div>
                                </button>
                            )}

                            {el.type === 'slider' && (
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-700 text-sm">{el.content}</span>
                                        <span className="font-mono text-slate-500 text-xs">{appState.variables[el.variableName] || 0}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        className="w-full h-2 bg-slate-200 rounded-lg accent-blue-500 appearance-none cursor-pointer"
                                        value={appState.variables[el.variableName] || 0}
                                        onChange={(e) => handleInputChange(el.variableName, Number(e.target.value))}
                                    />
                                </div>
                            )}

                            {el.type === 'image' && (
                                <img src={el.content} className="w-full rounded-2xl shadow-sm border border-slate-100 object-cover" alt="App Image" />
                            )}

                            {el.type === 'text' && (
                                <p className={`font-medium ${el.textSize === 'xl' ? 'text-2xl font-black' : el.textSize === 'lg' ? 'text-xl font-bold' : 'text-base'}`} style={{ color: el.color || '#334155' }}>
                                    {el.content}
                                </p>
                            )}
                            
                            {el.type === 'divider' && <div className="h-px bg-slate-200 my-2" />}
                            
                            {el.type === 'spacer' && <div style={{ height: (el.max || 20) + 'px' }} />}

                        </div>
                    ))}
                </div>
           </div>
           
           {/* Home Indicator */}
           <div className="absolute bottom-0 w-full h-10 bg-white/90 backdrop-blur border-t border-slate-100 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-slate-50 transition-colors z-50" onClick={() => onNavigate?.('main')}>
               <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
           </div>
      </div>
    );
});

// --- MAIN STAGE COMPONENT ---
const Stage = forwardRef<StageHandle, StageProps>((props, ref) => {
  const { mode, showConfetti, canvasRef } = props;
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {},
    getThumbnail: () => canvasRef.current?.toDataURL('image/jpeg', 0.5) || null
  }));

  useEffect(() => {
    // Resize confetti canvas to match container
    if (containerRef.current && confettiCanvasRef.current) {
        confettiCanvasRef.current.width = containerRef.current.clientWidth;
        confettiCanvasRef.current.height = containerRef.current.clientHeight;
    }
  }, [mode]); // Re-measure on mode switch

  useEffect(() => {
    if (!showConfetti) {
        particlesRef.current = [];
        const ctx = confettiCanvasRef.current?.getContext('2d');
        if (ctx && confettiCanvasRef.current) ctx.clearRect(0,0, confettiCanvasRef.current.width, confettiCanvasRef.current.height);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        return;
    }
    
    // Ensure canvas size is fresh
    if (containerRef.current && confettiCanvasRef.current) {
        confettiCanvasRef.current.width = containerRef.current.clientWidth;
        confettiCanvasRef.current.height = containerRef.current.clientHeight;
    }

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const w = confettiCanvasRef.current?.width || 400;
    const h = confettiCanvasRef.current?.height || 500;

    for(let i=0; i<50; i++) {
        particlesRef.current.push({
            x: w / 2, y: h / 2, 
            vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
            color: colors[Math.floor(Math.random() * colors.length)], 
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360, vRotation: (Math.random() - 0.5) * 10,
            life: 1, decay: 0
        });
    }
    const renderParticles = () => {
        const cvs = confettiCanvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0,0, cvs.width, cvs.height); 
        
        particlesRef.current = particlesRef.current.map(p => ({
            ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5, vx: p.vx * 0.95, rotation: (p.rotation || 0) + (p.vRotation || 0)
        })).filter(p => p.y < cvs.height + 50);
        
        particlesRef.current.forEach(p => {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation || 0) * Math.PI / 180);
            ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();
        });
        
        if (particlesRef.current.length > 0) animationFrameRef.current = requestAnimationFrame(renderParticles);
    };
    renderParticles();
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [showConfetti]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden">
      <canvas ref={confettiCanvasRef} className="absolute inset-0 z-50 pointer-events-none" />
      {mode === AppMode.GAME && <GameStage {...props} />}
      {mode === AppMode.APP && <AppStage {...props} />}
      {mode === AppMode.HARDWARE && <HardwareStage {...props} />}
    </div>
  );
});

export default React.memo(Stage);
