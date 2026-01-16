
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
            
            // Enhanced wire visualization with power flow animation
            wireRefs.current.forEach((path, id) => {
                const comp = circuitComponents.find((c: any) => `wire-${c.id}` === id);
                if (comp) {
                    const isActive = state.pins[comp.pin];
                    if (isActive) {
                        path.classList.add('wire-active');
                        // Add animated power flow effect
                        const currentTime = Date.now();
                        const dashOffset = (currentTime * 0.1) % 20;
                        path.setAttribute('stroke-dasharray', '5,5');
                        path.setAttribute('stroke-dashoffset', dashOffset.toString());
                    } else {
                        path.classList.remove('wire-active');
                        path.removeAttribute('stroke-dasharray');
                        path.removeAttribute('stroke-dashoffset');
                    }
                }
            });
            
            componentRefs.current.forEach((el, id) => {
                const comp = circuitComponents.find((c: any) => c.id === id);
                if (!comp) return;
                
                // Enhanced LED visualization with pulsing effect
                if (comp.type.startsWith('LED')) {
                    const isOn = state.pins[comp.pin];
                    const lightCircle = el.querySelector('.light-part');
                    if (lightCircle) {
                        const color = comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : '#22c55e';
                        lightCircle.setAttribute('fill', isOn ? color : '#334155');
                        lightCircle.setAttribute('filter', isOn ? 'url(#glow)' : '');
                        
                        // Add pulsing effect when LED is on
                        if (isOn) {
                            const pulseIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
                            lightCircle.setAttribute('opacity', pulseIntensity.toString());
                        } else {
                            lightCircle.setAttribute('opacity', '1');
                        }
                    }
                }
                
                if (comp.type === 'RGB_LED') {
                    const lightCircle = el.querySelector('.light-part');
                    if (lightCircle) {
                        lightCircle.setAttribute('fill', state.rgbColor);
                        // Add RGB color cycling effect
                        const hue = (Date.now() * 0.05) % 360;
                        if (state.pins[comp.pin]) {
                            lightCircle.setAttribute('filter', 'url(#rgb-glow)');
                        } else {
                            lightCircle.setAttribute('filter', '');
                        }
                    }
                }
                
                if (comp.type === 'FAN') {
                    const blades = el.querySelector('.fan-blades');
                    if (blades && state.fanSpeed > 0) {
                        const currentRot = Number(blades.getAttribute('data-rotation') || 0);
                        const newRot = (currentRot + state.fanSpeed * 2) % 360; // Faster rotation
                        blades.setAttribute('transform', `rotate(${newRot} 10 10)`);
                        blades.setAttribute('data-rotation', String(newRot));
                        
                        // Add blur effect for fast spinning
                        if (state.fanSpeed > 50) {
                            blades.setAttribute('filter', 'url(#motion-blur)');
                        } else {
                            blades.removeAttribute('filter');
                        }
                    } else if (blades) {
                        blades.removeAttribute('filter');
                    }
                }
                
                if (comp.type === 'SERVO') {
                    const arm = el.querySelector('.servo-arm');
                    if (arm) {
                        arm.setAttribute('transform', `rotate(${state.servoAngle} 10 10)`);
                        // Smooth servo movement
                        const currentRot = Number(arm.getAttribute('data-current-angle') || 0);
                        const targetRot = state.servoAngle;
                        if (Math.abs(currentRot - targetRot) > 1) {
                            const newRot = currentRot + (targetRot > currentRot ? 2 : -2);
                            arm.setAttribute('transform', `rotate(${newRot} 10 10)`);
                            arm.setAttribute('data-current-angle', String(newRot));
                        }
                    }
                }
                
                if (comp.type === 'BUTTON') {
                    const isPressed = state.pins[comp.pin];
                    const btnCircle = el.querySelector('circle');
                    if (btnCircle) {
                        btnCircle.setAttribute('fill', isPressed ? '#991b1b' : '#ef4444');
                        btnCircle.setAttribute('r', isPressed ? '4.5' : '5');
                        
                        // Add press animation
                        if (isPressed) {
                            btnCircle.setAttribute('filter', 'url(#pressed-effect)');
                        } else {
                            btnCircle.removeAttribute('filter');
                        }
                    }
                }
                
                if (comp.type === 'VIBRATION' && state.pins[comp.pin]) {
                    const shakeX = (Math.random() - 0.5) * 4; // Increased shake
                    const shakeY = (Math.random() - 0.5) * 4;
                    el.setAttribute('transform', `translate(${comp.x + shakeX}, ${comp.y + shakeY}) rotate(${comp.rotation || 0} 10 10)`);
                } else if (comp.type === 'VIBRATION') {
                    el.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`);
                }
                
                if ((comp.type === 'SPEAKER' || comp.type === 'BUZZER') && state.pins[comp.pin]) {
                    const scale = 1 + Math.sin(Date.now() * 0.1) * 0.2; // More pronounced vibration
                    el.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10) scale(${scale})`);
                    
                    // Add sound wave visualization
                    const waves = el.querySelectorAll('.sound-wave');
                    waves.forEach((wave: any, i) => {
                        const opacity = Math.sin(Date.now() * 0.1 + i) * 0.5 + 0.5;
                        wave.setAttribute('opacity', opacity.toString());
                    });
                } else if (comp.type === 'SPEAKER' || comp.type === 'BUZZER') {
                    el.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`);
                }
                
                if (comp.type === 'SEVEN_SEGMENT') {
                    const val = state.sevenSegmentValue ?? 0;
                    const segs = [val!==1&&val!==4, val!==5&&val!==6, val!==2, val!==1&&val!==4&&val!==7, val===0||val===2||val===6||val===8, val!==1&&val!==2&&val!==3&&val!==7, val!==0&&val!==1&&val!==7];
                    segs.forEach((on, i) => { 
                        const segEl = el.querySelector(`.seg-${i}`); 
                        if (segEl) {
                            segEl.setAttribute('opacity', on ? '1' : '0.1');
                            segEl.setAttribute('filter', on ? 'url(#segment-glow)' : '');
                        }
                    });
                }
                
                if (comp.type === 'POTENTIOMETER' || comp.type === 'SLIDE_POT') {
                    const knob = el.querySelector('.pot-knob');
                    if (knob) { 
                        const deg = ((state.potentiometerValue / 1023) * 270) - 135; 
                        knob.setAttribute('transform', `rotate(${deg} 10 10)`);
                        
                        // Add value display
                        const valueDisplay = el.querySelector('.pot-value');
                        if (valueDisplay) {
                            valueDisplay.textContent = Math.round(state.potentiometerValue).toString();
                        }
                    }
                }
                
                if (comp.type === 'SWITCH_SLIDE') {
                    const isOn = state.pins[comp.pin];
                    const knob = el.querySelector('.switch-knob');
                    if (knob) {
                        knob.setAttribute('cx', isOn ? '14' : '6');
                        // Smooth sliding animation
                        const currentX = Number(knob.getAttribute('data-current-x') || '6');
                        const targetX = isOn ? 14 : 6;
                        if (Math.abs(currentX - targetX) > 0.5) {
                            const newX = currentX + (targetX > currentX ? 0.5 : -0.5);
                            knob.setAttribute('cx', newX.toString());
                            knob.setAttribute('data-current-x', newX.toString());
                        }
                    }
                }
                
                // Add microcontroller-specific visualizations
                if (isMicrocontroller(comp.type)) {
                    // Show WiFi/BT connectivity indicators
                    if (comp.type.includes('ESP') || comp.type.includes('RASPBERRY_PI')) {
                        const wifiIndicator = el.querySelector('.wifi-indicator');
                        if (wifiIndicator) {
                            wifiIndicator.setAttribute('opacity', state.wifiConnected ? '1' : '0.3');
                            if (state.wifiConnected) {
                                const signalStrength = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
                                wifiIndicator.setAttribute('opacity', signalStrength.toString());
                            }
                        }
                        
                        const btIndicator = el.querySelector('.bt-indicator');
                        if (btIndicator) {
                            btIndicator.setAttribute('opacity', state.bluetoothConnected ? '1' : '0.3');
                        }
                    }
                    
                    // Show CPU temperature indicator
                    const tempIndicator = el.querySelector('.temp-indicator');
                    if (tempIndicator) {
                        const tempColor = state.cpuTemperature > 70 ? '#ef4444' : state.cpuTemperature > 50 ? '#f59e0b' : '#22c55e';
                        tempIndicator.setAttribute('fill', tempColor);
                    }
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
    
    // Function to get pin coordinates for specific microcontrollers - REALISTIC LAYOUT
    const getMicrocontrollerPinCoords = (compType: string, pin: number, compX: number, compY: number) => {
        // Arduino Uno/Nano realistic pinout layout (like actual boards)
        if (compType === 'ARDUINO_UNO' || compType === 'ARDUINO_NANO') {
            // Digital pins 0-13 on top row
            if (pin <= 13) {
                return { x: compX + 8 + (pin * 7), y: compY - 8 };
            }
            // Analog pins A0-A7 on bottom row
            else if (pin >= 14 && pin <= 21) {
                return { x: compX + 8 + ((pin - 14) * 7), y: compY + 42 };
            }
            // Power pins
            else if (pin === 22) return { x: compX + 5, y: compY + 15 }; // 5V
            else if (pin === 23) return { x: compX + 5, y: compY + 25 }; // GND
            else if (pin === 24) return { x: compX + 60, y: compY + 15 }; // 3.3V
            else if (pin === 25) return { x: compX + 60, y: compY + 25 }; // GND
        }
        
        // Arduino Mega realistic layout
        else if (compType === 'ARDUINO_MEGA') {
            // Digital pins 0-53 (spaced wider)
            if (pin <= 53) {
                const col = pin % 12;
                const row = Math.floor(pin / 12);
                return { x: compX + 10 + (col * 6), y: compY - 15 + (row * 8) };
            }
            // Analog pins A0-A15
            else if (pin >= 54 && pin <= 69) {
                return { x: compX + 10 + ((pin - 54) * 6), y: compY + 55 };
            }
        }
        
        // ESP32 DevKit realistic layout
        else if (compType === 'ESP32_DEVKIT') {
            // GPIO pins arranged in two columns like real ESP32
            const leftPins = [0,2,4,5,12,13,14,15,16,17,18,19];
            const rightPins = [21,22,23,25,26,27,32,33,34,35,36,39];
            
            if (leftPins.includes(pin)) {
                const index = leftPins.indexOf(pin);
                return { x: compX + 5, y: compY + 10 + (index * 7) };
            } else if (rightPins.includes(pin)) {
                const index = rightPins.indexOf(pin);
                return { x: compX + 25, y: compY + 10 + (index * 7) };
            }
        }
        
        // ESP8266/NodeMCU layout
        else if (compType === 'ESP8266' || compType === 'NODEMCU') {
            // Standard NodeMCU pin arrangement
            const pinMap = {
                0: { x: compX + 15, y: compY - 8 }, // D0
                1: { x: compX + 25, y: compY - 8 }, // D1
                2: { x: compX + 35, y: compY - 8 }, // D2
                3: { x: compX + 45, y: compY - 8 }, // D3
                4: { x: compX + 15, y: compY + 42 }, // D4
                5: { x: compX + 25, y: compY + 42 }, // D5
                6: { x: compX + 35, y: compY + 42 }, // D6
                7: { x: compX + 45, y: compY + 42 }, // D7
                8: { x: compX + 5, y: compY + 15 },  // 3V3
                9: { x: compX + 5, y: compY + 25 },  // GND
                10: { x: compX + 55, y: compY + 15 }, // Vin
                11: { x: compX + 55, y: compY + 25 }  // RST
            };
            return pinMap[pin as keyof typeof pinMap] || { x: compX + 10, y: compY + 10 };
        }
        
        // Raspberry Pi realistic 40-pin header
        else if (compType === 'RASPBERRY_PI_ZERO' || compType === 'RASPBERRY_PI_4') {
            const row = Math.floor((pin - 1) / 2);
            const isOdd = pin % 2 === 1; // Odd pins on left (5V side), even on right (GND side)
            return { 
                x: compX + (isOdd ? 8 : 22), 
                y: compY + 15 + (row * 6)
            };
        }
        
        // micro:bit edge connector
        else if (compType === 'MICROBIT') {
            if (pin <= 25) {
                const side = pin <= 12 ? 'left' : 'right';
                const pos = side === 'left' ? pin : pin - 13;
                return { 
                    x: compX + (side === 'left' ? 5 : 25), 
                    y: compY + 12 + (pos * 5)
                };
            }
        }
        
        // Default fallback
        return { x: compX + 10, y: compY + 10 };
    };
    
    // Function to determine if a component is a microcontroller
    const isMicrocontroller = (type: string) => {
        return type.includes('ARDUINO') || type.includes('ESP') || type.includes('RASPBERRY_PI') || type === 'MICROBIT' || type === 'NODEMCU';
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
                    {/* Enhanced Grid Pattern inspired by reference */}
                    <pattern id="pcb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="#143629"/>
                    </pattern>
                    
                    {/* Ultra Glow Filter */}
                    <filter id="ultra-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                    
                    {/* Component Glow Effects */}
                    <filter id="component-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    {/* Sonar Animation */}
                    <filter id="sonar-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill={pcbColor || '#059669'} />
                <rect width="100%" height="100%" fill="url(#pcb-grid)" />
                {/* Removed decorative corner circles for realistic PCB look */}
                {localComponents.map((comp: any) => {
                    // Determine if this is a microcontroller
                    const isMC = isMicrocontroller(comp.type);
                    
                    // Get appropriate pin coordinates
                    let pinCoords;
                    if (isMC) {
                        pinCoords = getMicrocontrollerPinCoords(comp.type, comp.pin, comp.x, comp.y);
                    } else {
                        pinCoords = getPinCoords(comp.pin);
                    }
                    
                    const isHigh = hardwareState.pins[comp.pin]; 
                    const wireColor = isHigh ? '#fbbf24' : 'rgba(255,255,255,0.4)';
                    
                    // Start point depends on component type
                    const startX = isMC ? pinCoords.x : comp.x + 10;
                    const startY = isMC ? pinCoords.y : comp.y + 10;
                    
                    return ( <path key={`wire-${comp.id}`} id={`wire-${comp.id}`} ref={(el) => { if(el) wireRefs.current.set(`wire-${comp.id}`, el); else wireRefs.current.delete(`wire-${comp.id}`); }} d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke={wireColor} strokeWidth={isHigh ? 4 : 2} strokeLinecap="round" className="transition-all duration-300 drop-shadow-md" /> );
                })}
                <g transform="translate(150, 200)">
                    {/* Default Arduino-like microcontroller */}
                    <rect x="-60" y="-25" width="120" height="50" rx="4" fill="#0066cc" stroke="#004499" strokeWidth="2" />
                    <rect x="-55" y="-20" width="110" height="5" rx="2" fill="#333333" />
                    <rect x="-55" y="15" width="110" height="5" rx="2" fill="#333333" />
                    
                    {/* Digital Pin Headers - D0-D13 */}
                    <g transform="translate(-55, -30)">
                        {Array.from({length: 14}).map((_, i) => (
                            <g key={`d${i}`} transform={`translate(${i * 8}, 0)`}>
                                <rect x="0" y="0" width="6" height="8" rx="1" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.5" />
                                <text x="3" y="5" textAnchor="middle" fontSize="3" fill="#1e293b" fontWeight="bold">D{i}</text>
                            </g>
                        ))}
                    </g>
                    
                    {/* Analog Pin Headers - A0-A7 */}
                    <g transform="translate(-55, 25)">
                        {Array.from({length: 8}).map((_, i) => (
                            <g key={`a${i}`} transform={`translate(${i * 8}, 0)`}>
                                <rect x="0" y="0" width="6" height="8" rx="1" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.5" />
                                <text x="3" y="5" textAnchor="middle" fontSize="3" fill="#1e293b" fontWeight="bold">A{i}</text>
                            </g>
                        ))}
                    </g>
                    
                    {/* Power Pins */}
                    <g transform="translate(-65, 0)">
                        <rect x="0" y="-8" width="6" height="6" rx="1" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.5" />
                        <text x="3" y="-3" textAnchor="middle" fontSize="3" fill="#1e293b" fontWeight="bold">5V</text>
                        <rect x="0" y="5" width="6" height="6" rx="1" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.5" />
                        <text x="3" y="10" textAnchor="middle" fontSize="3" fill="#1e293b" fontWeight="bold">GND</text>
                    </g>
                    
                    {/* Power Pins (Right Side) */}
                    <g transform="translate(59, 0)">
                        <rect x="0" y="-8" width="6" height="6" rx="1" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.5" />
                        <text x="3" y="-3" textAnchor="middle" fontSize="3" fill="#1e293b" fontWeight="bold">3V</text>
                        <rect x="0" y="5" width="6" height="6" rx="1" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.5" />
                        <text x="3" y="10" textAnchor="middle" fontSize="3" fill="#1e293b" fontWeight="bold">GND</text>
                    </g>
                    
                    {/* Main Chip */}
                    <rect x="-10" y="-5" width="20" height="10" rx="2" fill="#222222" stroke="#000000" strokeWidth="1" />
                    <text x="0" y="1" textAnchor="middle" fontSize="3" fill="#aaaaaa" fontWeight="bold">ATMEGA</text>
                    
                    {/* Logo */}
                    <text x="0" y="-12" textAnchor="middle" fontSize="4" fill="#ffffff" fontWeight="bold">ARDUINO</text>
                    <text x="0" y="-7" textAnchor="middle" fontSize="3" fill="#ffffff">UNO</text>
                </g>
                {localComponents.map((comp: any) => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`} ref={(el) => { if(el) componentRefs.current.set(comp.id, el); else componentRefs.current.delete(comp.id); }} onPointerDown={(e) => { e.stopPropagation(); setDraggingCompId(comp.id); dragOffset.current = { x: e.nativeEvent.offsetX - comp.x, y: e.nativeEvent.offsetY - comp.y }; (e.target as Element).setPointerCapture(e.pointerId); }} onContextMenu={(e) => handleContextMenu(e, comp.id)} className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                        <rect x="0" y="0" width="20" height="20" rx="4" fill="#334155" stroke="rgba(255,255,255,0.2)" />
                        {comp.type.startsWith('LED') && (
                            <g className="led-component">
                                {/* LED Bulb */}
                                <ellipse cx="10" cy="11" rx="6" ry="8" fill={
                                    hardwareState.pins[comp.pin] ?
                                    (comp.type === 'LED_RED' ? '#f87171' :
                                     comp.type === 'LED_GREEN' ? '#4ade80' :
                                     comp.type === 'LED_BLUE' ? '#60a5fa' :
                                     comp.type === 'LED_YELLOW' ? '#facc15' :
                                     comp.type === 'LED_ORANGE' ? '#fb923c' :
                                     comp.type === 'LED_WHITE' ? '#f3f4f6' : '#f87171')
                                    :
                                    (comp.type === 'LED_RED' ? '#450a0a' :
                                     comp.type === 'LED_GREEN' ? '#064e3b' :
                                     comp.type === 'LED_BLUE' ? '#1e3a8a' :
                                     comp.type === 'LED_YELLOW' ? '#713f12' :
                                     comp.type === 'LED_ORANGE' ? '#7c2d12' :
                                     comp.type === 'LED_WHITE' ? '#374151' : '#374151')
                                } stroke="#6b7280" strokeWidth="1" />
                                
                                {/* LED Bulb Highlight */}
                                <ellipse cx="8" cy="8" rx="2" ry="3" fill="#ffffff" opacity="0.4" />
                                
                                {/* LED Base */}
                                <rect x="7" y="17" width="6" height="4" fill="#4b5563" stroke="#374151" strokeWidth="0.5" />
                                
                                {/* Two Wire Pins */}
                                <line x1="6" y1="19" x2="2" y2="22" stroke="#9ca3af" strokeWidth="1.5" />
                                <line x1="14" y1="19" x2="18" y2="22" stroke="#9ca3af" strokeWidth="1.5" />
                                
                                {/* LED Glow effect when on */}
                                {hardwareState.pins[comp.pin] && (
                                    <ellipse cx="10" cy="11" rx="9" ry="11" fill="none" stroke={
                                        comp.type === 'LED_RED' ? '#f87171' :
                                        comp.type === 'LED_GREEN' ? '#4ade80' :
                                        comp.type === 'LED_BLUE' ? '#60a5fa' :
                                        comp.type === 'LED_YELLOW' ? '#facc15' :
                                        comp.type === 'LED_ORANGE' ? '#fb923c' :
                                        comp.type === 'LED_WHITE' ? '#e5e7eb' : '#f87171'
                                    } strokeWidth="2" opacity="0.5" className="led-glow" />
                                )}
                            </g>
                        )}
                        {comp.type === 'SERVO' && (
                            <g className="servo-component">
                                {/* Servo Body */}
                                <rect x="2" y="4" width="16" height="12" rx="2" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Servo Horn */}
                                <g transform={`rotate(${hardwareState.servoAngle - 90} 10 10)`}>
                                    <rect className="servo-arm" x="9" y="2" width="2" height="8" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5" />
                                    <circle cx="10" cy="10" r="1.5" fill="#4b5563" />
                                </g>
                                
                                {/* Servo Label */}
                                <text x="10" y="12" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">SERVO</text>
                            </g>
                        )}
                        {comp.type === 'FAN' && (
                            <g className="fan-component">
                                {/* Fan Housing */}
                                <circle cx="10" cy="10" r="9" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Fan Blades - Animated when active */}
                                <g className="fan-blades" transform={`rotate(${hardwareState.fanSpeed > 0 ? Date.now() * 0.1 * (hardwareState.fanSpeed/100) : 0} 10 10)`}>
                                    <path d="M 10 2 Q 18 4 10 10 Q 18 8 10 18 Q 2 8 10 10 Q 2 4 10 2" fill="#93c5fd" stroke="#60a5fa" strokeWidth="0.5" />
                                    <path d="M 2 10 Q 4 2 10 10 Q 4 18 10 10 Q 18 18 10 10 Q 18 2 10 10" fill="#93c5fd" stroke="#60a5fa" strokeWidth="0.5" />
                                </g>
                                
                                {/* Fan Center Hub */}
                                <circle cx="10" cy="10" r="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
                                
                                {/* Fan Label */}
                                <text x="10" y="15" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">FAN</text>
                            </g>
                        )}
                        {comp.type === 'MOTOR_DC' && (
                            <g className="motor-dc-component">
                                {/* Motor Body */}
                                <rect x="2" y="4" width="16" height="12" rx="6" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Motor Shaft - Rotates when active */}
                                <g transform={`rotate(${hardwareState.pins[comp.pin] ? Date.now() * 0.2 * (hardwareState.fanSpeed/100 || 1) : 0} 10 10)`}>
                                    <rect x="9" y="2" width="2" height="4" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5" />
                                    <circle cx="10" cy="10" r="1.5" fill="#4b5563" />
                                </g>
                                
                                {/* Motor Label */}
                                <text x="10" y="12" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">MOTOR</text>
                            </g>
                        )}
                        {comp.type === 'BUTTON' && (
                            <g className="button-component">
                                {/* Button Outer Ring */}
                                <circle cx="10" cy="10" r="8" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Button Base */}
                                <circle cx="10" cy="10" r="6" fill="#6b7280" stroke="#4b5563" strokeWidth="1" />
                                
                                {/* Button Cap - changes when pressed */}
                                <circle cx="10" cy="10" r={hardwareState.pins[comp.pin] ? "4" : "5"} 
                                      fill={hardwareState.pins[comp.pin] ? "#dc2626" : "#f87171"} 
                                      stroke="#b91c1c" strokeWidth="1" 
                                      className="cursor-pointer" 
                                      onPointerDown={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, true); }} 
                                      onPointerUp={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, false); }} 
                                      onPointerLeave={(e) => { onHardwareInput?.(comp.pin, false); }} />
                                
                                {/* Button Highlight */}
                                <circle cx="8" cy="8" r="1.5" fill="#ffffff" opacity={hardwareState.pins[comp.pin] ? "0.3" : "0.5"} />
                            </g>
                        )}
                        {comp.type === 'LCD' && (
                            <g className="lcd-component">
                                {/* LCD Screen Border */}
                                <rect x="-5" y="0" width="30" height="20" rx="3" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                                
                                {/* LCD Screen */}
                                <rect x="-3" y="2" width="26" height="16" rx="1" fill="#0f766e" stroke="#047857" strokeWidth="1" />
                                
                                {/* LCD Content - Display Text */}
                                <text x="10" y="8" fontSize="3" fill="#6ee7b7" fontFamily="monospace" textAnchor="middle">HELLO</text>
                                <text x="10" y="14" fontSize="3" fill="#6ee7b7" fontFamily="monospace" textAnchor="middle">WORLD</text>
                                
                                {/* LCD Pin Markers */}
                                {Array.from({length: 4}).map((_, i) => (
                                    <rect key={i} x={-2 + i * 6} y="22" width="3" height="4" rx="0.5" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5" />
                                ))}
                            </g>
                        )}
                        {comp.type === 'OLED' && (
                            <g className="oled-component">
                                {/* OLED Screen Border */}
                                <rect x="-5" y="0" width="30" height="20" rx="3" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                                
                                {/* OLED Screen - Black when off, blue when on */}
                                <rect x="-3" y="2" width="26" height="16" rx="1" fill={hardwareState.pins[comp.pin] ? "#1e40af" : "#000000"} stroke="#1d4ed8" strokeWidth="1" />
                                
                                {/* OLED Content - Sample Text */}
                                <text x="10" y="8" fontSize="3" fill={hardwareState.pins[comp.pin] ? "#dbeafe" : "#333333"} fontFamily="monospace" textAnchor="middle">OLED</text>
                                <text x="10" y="14" fontSize="3" fill={hardwareState.pins[comp.pin] ? "#dbeafe" : "#333333"} fontFamily="monospace" textAnchor="middle">DISP</text>
                                
                                {/* OLED Pin Markers */}
                                {Array.from({length: 4}).map((_, i) => (
                                    <rect key={`oled-${i}`} x={-2 + i * 6} y="22" width="3" height="4" rx="0.5" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5" />
                                ))}
                            </g>
                        )}
                        {comp.type === 'SPEAKER' && (
                            <g className="speaker-component">
                                {/* Speaker Grill */}
                                <rect x="3" y="3" width="14" height="14" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                                
                                {/* Speaker Grille Pattern */}
                                {Array.from({length: 5}).map((_, i) => (
                                    <g key={i}>
                                        <line x1="4" y1={5 + i*2} x2="16" y2={5 + i*2} stroke="#374151" strokeWidth="0.5" />
                                    </g>
                                ))}
                                
                                {/* Speaker Cone */}
                                <circle cx="10" cy="10" r="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Sound Waves - when active */}
                                {hardwareState.pins[comp.pin] && (
                                    <g>
                                        <circle cx="18" cy="10" r="2" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.7" className="sound-wave" />
                                        <circle cx="18" cy="10" r="4" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.5" className="sound-wave" />
                                        <circle cx="18" cy="10" r="6" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.3" className="sound-wave" />
                                    </g>
                                )}
                                
                                {/* Speaker Label */}
                                <text x="10" y="18" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">SPKR</text>
                            </g>
                        )}
                        {comp.type === 'BUZZER' && (
                            <g className="buzzer-component">
                                {/* Buzzer Body */}
                                <circle cx="10" cy="10" r="8" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Buzzer Symbol */}
                                <path d="M 6 8 Q 10 6 14 8 M 6 12 Q 10 14 14 12" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
                                
                                {/* Sound Waves - when active */}
                                {hardwareState.pins[comp.pin] && (
                                    <g>
                                        <circle cx="18" cy="10" r="2" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.7" className="sound-wave" />
                                        <circle cx="18" cy="10" r="4" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5" className="sound-wave" />
                                        <circle cx="18" cy="10" r="6" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" className="sound-wave" />
                                    </g>
                                )}
                                
                                {/* Buzzer Label */}
                                <text x="10" y="18" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">BUZZ</text>
                            </g>
                        )}
                        {comp.type === 'VIBRATION' && (
                            <g className="vibration-component">
                                {/* Vibration Motor Body */}
                                <rect x="4" y="6" width="12" height="8" rx="4" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Vibration Effect - when active */}
                                {hardwareState.pins[comp.pin] && (
                                    <g>
                                        <path d="M 2 8 Q 4 6 6 8 T 10 8" stroke="#d8b4fe" strokeWidth="1" fill="none" opacity="0.7" className="vibration-line" />
                                        <path d="M 2 12 Q 4 14 6 12 T 10 12" stroke="#d8b4fe" strokeWidth="1" fill="none" opacity="0.7" className="vibration-line" />
                                    </g>
                                )}
                                
                                {/* Vibration Label */}
                                <text x="10" y="17" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">VIB</text>
                            </g>
                        )}
                        {comp.type === 'SEVEN_SEGMENT' && (
                            <g className="seven-segment-component" transform="translate(2, 2) scale(0.8)">
                                {/* Seven Segment Display Frame */}
                                <rect x="0" y="0" width="12" height="22" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                                
                                {/* Individual Segments */}
                                <polygon points="2,2 8,2 9,3 8,4 2,4 1,3" fill="#ef4444" className="seg-0" opacity={hardwareState.sevenSegmentValue === 0 || hardwareState.sevenSegmentValue === 1 || hardwareState.sevenSegmentValue === 2 || hardwareState.sevenSegmentValue === 3 || hardwareState.sevenSegmentValue === 4 || hardwareState.sevenSegmentValue === 7 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                <polygon points="8,4 9,3 10,4 10,10 9,11 8,10" fill="#ef4444" className="seg-1" opacity={hardwareState.sevenSegmentValue === 0 || hardwareState.sevenSegmentValue === 1 || hardwareState.sevenSegmentValue === 2 || hardwareState.sevenSegmentValue === 3 || hardwareState.sevenSegmentValue === 6 || hardwareState.sevenSegmentValue === 7 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                <polygon points="8,12 9,11 10,12 10,18 9,19 8,18" fill="#ef4444" className="seg-2" opacity={hardwareState.sevenSegmentValue === 0 || hardwareState.sevenSegmentValue === 1 || hardwareState.sevenSegmentValue === 3 || hardwareState.sevenSegmentValue === 4 || hardwareState.sevenSegmentValue === 5 || hardwareState.sevenSegmentValue === 6 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                <polygon points="2,18 8,18 9,19 8,20 2,20 1,19" fill="#ef4444" className="seg-3" opacity={hardwareState.sevenSegmentValue === 0 || hardwareState.sevenSegmentValue === 2 || hardwareState.sevenSegmentValue === 3 || hardwareState.sevenSegmentValue === 5 || hardwareState.sevenSegmentValue === 6 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                <polygon points="0,12 1,11 2,12 2,18 1,19 0,18" fill="#ef4444" className="seg-4" opacity={hardwareState.sevenSegmentValue === 0 || hardwareState.sevenSegmentValue === 2 || hardwareState.sevenSegmentValue === 4 || hardwareState.sevenSegmentValue === 5 || hardwareState.sevenSegmentValue === 6 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                <polygon points="0,4 1,3 2,4 2,10 1,11 0,10" fill="#ef4444" className="seg-5" opacity={hardwareState.sevenSegmentValue === 0 || hardwareState.sevenSegmentValue === 4 || hardwareState.sevenSegmentValue === 5 || hardwareState.sevenSegmentValue === 6 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                <polygon points="2,10 8,10 9,11 8,12 2,12 1,11" fill="#ef4444" className="seg-6" opacity={hardwareState.sevenSegmentValue === 2 || hardwareState.sevenSegmentValue === 3 || hardwareState.sevenSegmentValue === 4 || hardwareState.sevenSegmentValue === 5 || hardwareState.sevenSegmentValue === 6 || hardwareState.sevenSegmentValue === 8 || hardwareState.sevenSegmentValue === 9 ? "1" : "0.2"}/>
                                
                                {/* Decimal Point */}
                                <circle cx="10" cy="20" r="1" fill="#ef4444" opacity={hardwareState.pins[comp.pin] ? "1" : "0.2"}/>
                            </g>
                        )}
                        {comp.type === 'POTENTIOMETER' && (
                            <g className="potentiometer-component">
                                {/* Potentiometer Body */}
                                <circle cx="10" cy="10" r="8" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Potentiometer Label */}
                                <text x="10" y="14" textAnchor="middle" fontSize="3" fill="#ffffff" fontWeight="bold">POT</text>
                                
                                {/* Potentiometer Knob - Rotates based on value */}
                                <g transform={`rotate(${(hardwareState.potentiometerValue / 1023) * 270 - 135} 10 10)`}>
                                    <rect className="pot-knob" x="9" y="4" width="2" height="6" fill="#f3f4f6" rx="1" />
                                </g>
                                
                                {/* Potentiometer Value Display */}
                                <text x="10" y="20" textAnchor="middle" fontSize="2.5" fill="#9ca3af" fontWeight="normal" className="pot-value">{Math.round(hardwareState.potentiometerValue)}</text>
                            </g>
                        )}
                        {comp.type === 'SWITCH_SLIDE' && (
                            <g className="switch-slide-component">
                                {/* Switch Base */}
                                <rect x="2" y="7" width="16" height="6" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Switch Knob - moves based on state */}
                                <circle className="switch-knob" 
                                      cx={hardwareState.pins[comp.pin] ? "14" : "6"} 
                                      cy="10" r="4" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"
                                      onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, !hardwareState.pins[comp.pin]); }} />
                                
                                {/* Position Labels */}
                                <text x="4" y="6" fontSize="2.5" fill="#d1d5db">OFF</text>
                                <text x="13" y="6" fontSize="2.5" fill="#d1d5db">ON</text>
                            </g>
                        )}
                        {comp.type === 'KEYPAD' && (
                            <g className="keypad-component" transform="translate(-2, -2) scale(0.3)">
                                {/* Keypad Frame */}
                                <rect x="0" y="0" width="80" height="80" rx="5" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                                
                                {/* Keypad Buttons */}
                                {[0,1,2,3].map(r => [0,1,2,3].map(c => (
                                    <g key={`${r}-${c}`} transform={`translate(${c*20}, ${r*20})`}>
                                        <rect x="0" y="0" width="18" height="18" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                        <text x="9" y="12" textAnchor="middle" fontSize="8" fill="#f8fafc" fontWeight="bold">
                                            {r*4 + c + 1 === 13 ? '*' : r*4 + c + 1 === 15 ? '#' : r*4 + c + 1 > 15 ? '' : r*4 + c + 1}
                                        </text>
                                    </g>
                                )))}
                                
                                {/* Additional Keys */}
                                <g transform="translate(0, 60)">
                                    <rect x="0" y="0" width="18" height="18" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                    <text x="9" y="12" textAnchor="middle" fontSize="8" fill="#f8fafc" fontWeight="bold">*</text>
                                </g>
                                <g transform="translate(40, 60)">
                                    <rect x="0" y="0" width="18" height="18" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                    <text x="9" y="12" textAnchor="middle" fontSize="8" fill="#f8fafc" fontWeight="bold">0</text>
                                </g>
                                <g transform="translate(60, 60)">
                                    <rect x="0" y="0" width="18" height="18" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                    <text x="9" y="12" textAnchor="middle" fontSize="8" fill="#f8fafc" fontWeight="bold">#</text>
                                </g>
                            </g>
                        )}
                        {comp.type === 'RGB_LED' && (
                            <g className="rgb-led-component">
                                {/* RGB LED Bulb */}
                                <circle cx="10" cy="10" r="8" fill={
                                    hardwareState.pins[comp.pin] ? 
                                    (hardwareState.rgbLedColor || '#ff0000') : 
                                    '#374151'
                                } stroke="#6b7280" strokeWidth="1" />
                                
                                {/* RGB LED Highlight */}
                                <circle cx="7" cy="7" r="2" fill="#ffffff" opacity="0.4" />
                                
                                {/* RGB LED Base */}
                                <rect x="7" y="16" width="6" height="4" fill="#4b5563" stroke="#374151" strokeWidth="0.5" />
                                
                                {/* Two Wire Pins */}
                                <line x1="6" y1="18" x2="2" y2="22" stroke="#9ca3af" strokeWidth="1.5" />
                                <line x1="14" y1="18" x2="18" y2="22" stroke="#9ca3af" strokeWidth="1.5" />
                                
                                {/* RGB LED Glow effect when on */}
                                {hardwareState.pins[comp.pin] && (
                                    <circle cx="10" cy="10" r="11" fill="none" stroke={hardwareState.rgbLedColor || '#ff0000'} strokeWidth="2" opacity="0.5" className="led-glow" />
                                )}
                            </g>
                        )}
                        {comp.type === 'RGB_STRIP' && (
                            <g className="rgb-strip-component">
                                {/* RGB Strip - Multiple LEDs */}
                                <rect x="2" y="6" width="16" height="8" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                                
                                {/* Individual LED Elements */}
                                {Array.from({length: 5}).map((_, i) => (
                                    <circle 
                                        key={i} 
                                        cx={4 + i * 3} 
                                        cy="10" 
                                        r="1.5" 
                                        fill={hardwareState.pins[comp.pin] ? 
                                            (i === 0 ? (hardwareState.rgbLedColor || '#ff0000') : 
                                             i === 1 ? '#00ff00' : 
                                             i === 2 ? '#0000ff' : 
                                             i === 3 ? '#ffff00' : '#ff00ff') 
                                            : '#374151'}
                                    />
                                ))}
                                
                                {/* RGB Strip Label */}
                                <text x="10" y="18" textAnchor="middle" fontSize="2.5" fill="#9ca3af" fontWeight="normal">RGB STRIP</text>
                            </g>
                        )}
                        {comp.type === 'LASER' && (
                            <g className="laser-component">
                                {/* Laser Diode Body */}
                                <rect x="3" y="7" width="14" height="6" rx="3" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                                
                                {/* Laser Lens */}
                                <circle cx="10" cy="10" r="2" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
                                
                                {/* Laser Beam - when active */}
                                {hardwareState.pins[comp.pin] && (
                                    <g>
                                        <line x1="12" y1="10" x2="25" y2="10" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" className="laser-beam" />
                                        <circle cx="25" cy="10" r="1" fill="#ef4444" className="laser-dot" />
                                    </g>
                                )}
                                
                                {/* Laser Label */}
                                <text x="10" y="18" textAnchor="middle" fontSize="2.5" fill="#9ca3af" fontWeight="normal">LASER</text>
                            </g>
                        )}
                        {comp.type === 'SWITCH_TOGGLE' && (
                            <g className="switch-toggle-component">
                                {/* Toggle Switch Base */}
                                <rect x="4" y="7" width="12" height="6" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Toggle Handle - moves based on state */}
                                <rect 
                                    x={hardwareState.pins[comp.pin] ? "12" : "4"} 
                                    y="5" 
                                    width="4" 
                                    height="10" 
                                    rx="2" 
                                    fill="#9ca3af" 
                                    stroke="#6b7280" 
                                    strokeWidth="1"
                                    className="cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, !hardwareState.pins[comp.pin]); }}
                                />
                                
                                {/* Position Labels */}
                                <text x="3" y="9" fontSize="2.5" fill="#d1d5db">OFF</text>
                                <text x="16" y="9" fontSize="2.5" fill="#d1d5db">ON</text>
                            </g>
                        )}
                        {comp.type === 'SWITCH_DIP' && (
                            <g className="switch-dip-component">
                                {/* DIP Switch Pack */}
                                <rect x="2" y="5" width="16" height="10" rx="2" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Individual DIP Switches */}
                                {Array.from({length: 4}).map((_, i) => (
                                    <g key={i}>
                                        {/* Switch Base */}
                                        <rect x={4 + i * 3} y="6" width="2" height="4" rx="1" fill="#6b7280" stroke="#4b5563" strokeWidth="0.5" />
                                        
                                        {/* Switch Toggle */}
                                        <rect 
                                            x={4 + i * 3} 
                                            y={hardwareState.pins[comp.pin + i] ? "7" : "9"} 
                                            width="2" 
                                            height="1.5" 
                                            rx="0.5" 
                                            fill="#f3f4f6" 
                                            className="cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin + i, !hardwareState.pins[comp.pin + i]); }}
                                        />
                                    </g>
                                ))}
                                
                                {/* DIP Label */}
                                <text x="10" y="18" textAnchor="middle" fontSize="2.5" fill="#9ca3af" fontWeight="normal">DIP</text>
                            </g>
                        )}
                        {comp.type === 'SLIDE_POT' && (
                            <g className="slide-pot-component">
                                {/* Slide Pot Body */}
                                <rect x="2" y="8" width="16" height="4" rx="2" fill="#4b5563" stroke="#374151" strokeWidth="1" />
                                
                                {/* Slide Knob - moves based on value */}
                                <rect 
                                    className="pot-knob" 
                                    x={2 + (hardwareState.potentiometerValue / 1023) * 12} 
                                    y="6" 
                                    width="3" 
                                    height="8" 
                                    rx="1" 
                                    fill="#f3f4f6" 
                                />
                                
                                {/* Slide Pot Label */}
                                <text x="10" y="18" textAnchor="middle" fontSize="2.5" fill="#9ca3af" fontWeight="normal">SLIDE POT</text>
                                
                                {/* Slide Pot Value Display */}
                                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#9ca3af" fontWeight="normal" className="pot-value">{Math.round(hardwareState.potentiometerValue)}</text>
                            </g>
                        )}
                        {comp.type === 'ULTRASONIC' && (
                            <g className="ultrasonic-component" style={{filter: hardwareState.distance > 0 ? "url(#ultra-glow)" : "none"}}>
                                {/* Ultrasonic Sensor Base */}
                                <rect x="-50" y="-25" width="100" height="50" rx="4" fill="#004d99" stroke="#003366" />
                                
                                {/* Transmitter Circle */}
                                <g transform="translate(-25, 0)">
                                    <circle r="18" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                                    <circle r="14" fill="#1e293b" />
                                    <rect x="-10" y="-1" width="20" height="2" fill="#475569" opacity="0.5" />
                                    <rect x="-1" y="-10" width="2" height="20" fill="#475569" opacity="0.5" />
                                </g>
                                
                                {/* Receiver Circle */}
                                <g transform="translate(25, 0)">
                                    <circle r="18" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                                    <circle r="14" fill="#1e293b" />
                                    <rect x="-10" y="-1" width="20" height="2" fill="#475569" opacity="0.5" />
                                    <rect x="-1" y="-10" width="2" height="20" fill="#475569" opacity="0.5" />
                                </g>
                                
                                {/* Distance Indicator LEDs */}
                                <rect x="-15" y="25" width="4" height="10" fill="#eab308" />
                                <rect x="-5" y="25" width="4" height="10" fill="#eab308" />
                                <rect x="5" y="25" width="4" height="10" fill="#eab308" />
                                <rect x="15" y="25" width="4" height="10" fill="#eab308" />
                                
                                {/* Component Label */}
                                <text x="0" y="-10" fill="white" fontSize="6" textAnchor="middle" opacity="0.5">HC-SR04</text>
                                
                                {/* Sonar Wave Animation */}
                                {hardwareState.distance > 0 && (
                                    <path 
                                        d="M -25 0 Q 0 -50 25 0" 
                                        fill="none" 
                                        stroke="#3b82f6" 
                                        strokeWidth="2" 
                                        strokeDasharray="4 2"
                                    >
                                        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                                    </path>
                                )}
                            </g>
                        )}
                        {comp.type === 'MOTION' && (
                            <g className="motion-component" style={{filter: hardwareState.motionDetected ? "url(#ultra-glow)" : "none"}}>
                                {/* Motion Sensor Base */}
                                <rect x="-35" y="-35" width="70" height="70" rx="4" fill="#2D5A27" />
                                
                                {/* Radar Circles */}
                                <circle cx="0" cy="0" r="28" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" transform="translate(10, 10)" />
                                
                                {/* Radar Lines */}
                                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                                    <line 
                                        key={angle}
                                        x1="0" y1="0" x2="28" y2="0" 
                                        stroke="#cbd5e1" 
                                        strokeWidth="0.5" 
                                        transform={`translate(10, 10) rotate(${angle})`} 
                                    />
                                ))}
                                
                                {/* Motion Detection Indicator */}
                                {hardwareState.motionDetected && (
                                    <g transform="translate(10, 10)">
                                        <circle cx="0" cy="0" r="20" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7">
                                            <animate attributeName="r" values="20;25;20" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                    </g>
                                )}
                                
                                {/* Component Label */}
                                <text x="10" y="45" textAnchor="middle" fontSize="6" fill="white" opacity="0.5">PIR SENSOR</text>
                            </g>
                        )}
                        {/* Microcontroller visualizations */}
                        {comp.type === 'ARDUINO_UNO' && (
                          <g>
                            {/* Arduino Uno Board */}
                            <rect x="-8" y="-12" width="40" height="50" rx="3" fill="#0066cc" stroke="#004499" strokeWidth="1.5" />
                            <rect x="-6" y="-10" width="36" height="8" rx="2" fill="#333333" />
                            <rect x="-6" y="34" width="36" height="8" rx="2" fill="#333333" />
                            
                            {/* Silver Pin Headers - Digital Pins 0-13 */}
                            {Array.from({length: 14}).map((_, i) => (
                              <rect key={`d${i}`} x={-6 + i * 2.5} y="-14" width="1.5" height="4" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                            ))}
                            
                            {/* Silver Pin Headers - Analog Pins A0-A7 */}
                            {Array.from({length: 8}).map((_, i) => (
                              <rect key={`a${i}`} x={-6 + i * 2.5} y="42" width="1.5" height="4" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                            ))}
                            
                            {/* Power Pins */}
                            <rect x="-10" y="18" width="2" height="4" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                            <rect x="-10" y="26" width="2" height="4" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                            <rect x="32" y="18" width="2" height="4" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                            <rect x="32" y="26" width="2" height="4" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                            
                            {/* Status LEDs */}
                            <circle cx="-2" cy="0" r="1.2" fill="#ff0000" />
                            <circle cx="1" cy="0" r="1.2" fill="#ff7f00" />
                            <circle cx="4" cy="0" r="1.2" fill="#ffff00" />
                            <circle cx="7" cy="0" r="1.2" fill="#00ff00" />
                            
                            {/* Chip */}
                            <rect x="8" y="12" width="12" height="8" rx="1" fill="#222222" stroke="#000000" strokeWidth="0.5" />
                            <text x="14" y="17" fontSize="2" fill="#aaaaaa" textAnchor="middle">ATMEGA</text>
                            
                            <text x="12" y="5" fontSize="3" fill="#ffffff" textAnchor="middle" fontWeight="bold">ARDUINO</text>
                            <text x="12" y="9" fontSize="2.5" fill="#ffffff" textAnchor="middle">UNO</text>
                            <text x="12" y="48" textAnchor="middle" fontSize="2" fill="#dddddd">D{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'ARDUINO_NANO' && (
                          <g>
                            <rect x="-3" y="-6" width="20" height="24" rx="1" fill="#0071a0" stroke="#005a82" strokeWidth="1" />
                            <rect x="-1" y="-5" width="16" height="3" fill="#cccccc" />
                            <rect x="-1" y="15" width="16" height="3" fill="#cccccc" />
                            <circle cx="2" cy="-2" r="1" fill="#ff0000" />
                            <circle cx="5" cy="-2" r="1" fill="#ff7f00" />
                            <circle cx="8" cy="-2" r="1" fill="#ffff00" />
                            <circle cx="11" cy="-2" r="1" fill="#00ff00" />
                            <text x="10" y="8" fontSize="2.5" fill="#ffffff" textAnchor="middle">NANO</text>
                            <text x="10" y="22" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>D{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'ARDUINO_MEGA' && (
                          <g>
                            <rect x="-7" y="-10" width="40" height="44" rx="2" fill="#0071a0" stroke="#005a82" strokeWidth="1" />
                            <rect x="-4" y="-8" width="34" height="5" fill="#cccccc" />
                            <rect x="-4" y="28" width="34" height="5" fill="#cccccc" />
                            <circle cx="2" cy="-4" r="1.5" fill="#ff0000" />
                            <circle cx="6" cy="-4" r="1.5" fill="#ff7f00" />
                            <circle cx="10" cy="-4" r="1.5" fill="#ffff00" />
                            <circle cx="14" cy="-4" r="1.5" fill="#00ff00" />
                            <text x="13" y="15" fontSize="4" fill="#ffffff" textAnchor="middle">MEGA</text>
                            <text x="13" y="38" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>D{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'ESP32_DEVKIT' && (
                          <g>
                            {/* ESP32 DevKit Board */}
                            <rect x="-12" y="-15" width="44" height="50" rx="4" fill="#ff4444" stroke="#cc0000" strokeWidth="2" />
                            <rect x="-10" y="-12" width="40" height="8" rx="2" fill="#222222" />
                            <rect x="-10" y="30" width="40" height="8" rx="2" fill="#222222" />
                            
                            {/* Silver Pin Headers - Left Column */}
                            {Array.from({length: 12}).map((_, i) => (
                              <rect key={`l${i}`} x="-14" y={-8 + i * 3.5} width="2" height="1.5" rx="0.2" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.15" />
                            ))}
                            
                            {/* Silver Pin Headers - Right Column */}
                            {Array.from({length: 12}).map((_, i) => (
                              <rect key={`r${i}`} x="32" y={-8 + i * 3.5} width="2" height="1.5" rx="0.2" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.15" />
                            ))}
                            
                            {/* USB Connector */}
                            <rect x="15" y="-18" width="8" height="3" rx="1" fill="#333333" stroke="#000000" strokeWidth="0.5" />
                            
                            {/* Reset Button */}
                            <circle cx="25" cy="-12" r="1.5" fill="#666666" stroke="#333333" strokeWidth="0.3" />
                            
                            {/* Status LEDs */}
                            <circle cx="-6" cy="-4" r="0.8" fill="#ff0000" />
                            <circle cx="-2" cy="-4" r="0.8" fill="#00ff00" />
                            <circle cx="2" cy="-4" r="0.8" fill="#0000ff" />
                            
                            {/* ESP32-WROOM Module */}
                            <rect x="-4" y="8" width="24" height="12" rx="2" fill="#111111" stroke="#000000" strokeWidth="0.5" />
                            <text x="8" y="15" fontSize="2" fill="#aaaaaa" textAnchor="middle">ESP32-WROOM</text>
                            
                            <text x="8" y="2" fontSize="3" fill="#ffffff" textAnchor="middle" fontWeight="bold">ESP32</text>
                            <text x="8" y="6" fontSize="2" fill="#dddddd" textAnchor="middle">DEVKIT</text>
                            <text x="8" y="45" textAnchor="middle" fontSize="2" fill="#dddddd">GPIO{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'ESP8266' && (
                          <g>
                            <rect x="-4" y="-6" width="24" height="28" rx="2" fill="#e67e22" stroke="#d35400" strokeWidth="1" />
                            <rect x="-1" y="-4" width="18" height="3" fill="#cccccc" />
                            <rect x="-1" y="19" width="18" height="3" fill="#cccccc" />
                            <circle cx="3" cy="-1" r="1" fill="#ffffff" />
                            <circle cx="7" cy="-1" r="1" fill="#ffffff" />
                            <circle cx="11" cy="-1" r="1" fill="#ffffff" />
                            <text x="12" y="10" fontSize="3" fill="#ffffff" textAnchor="middle">ESP</text>
                            <text x="12" y="26" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>G{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'NODEMCU' && (
                          <g>
                            <rect x="-5" y="-8" width="30" height="36" rx="2" fill="#e74c3c" stroke="#c0392b" strokeWidth="1" />
                            <rect x="-2" y="-6" width="24" height="4" fill="#cccccc" />
                            <rect x="-2" y="22" width="24" height="4" fill="#cccccc" />
                            <circle cx="2" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="6" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="10" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="14" cy="0" r="1.5" fill="#ffffff" />
                            <rect x="4" y="-4" width="12" height="8" fill="#ffffff" />
                            <text x="10" y="12" fontSize="3" fill="#ffffff" textAnchor="middle">NODE</text>
                            <text x="10" y="30" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>D{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'RASPBERRY_PI_ZERO' && (
                          <g>
                            <rect x="-5" y="-8" width="30" height="36" rx="2" fill="#cc0000" stroke="#990000" strokeWidth="1" />
                            <rect x="-2" y="-6" width="24" height="4" fill="#cccccc" />
                            <rect x="-2" y="22" width="24" height="4" fill="#cccccc" />
                            <circle cx="2" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="6" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="10" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="14" cy="0" r="1.5" fill="#ffffff" />
                            <rect x="4" y="-4" width="12" height="8" fill="#ffffff" />
                            <text x="10" y="12" fontSize="3" fill="#ffffff" textAnchor="middle">RPi0</text>
                            <text x="10" y="30" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>GPIO{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'RASPBERRY_PI_4' && (
                          <g>
                            <rect x="-6" y="-10" width="36" height="44" rx="2" fill="#cc0000" stroke="#990000" strokeWidth="1" />
                            <rect x="-3" y="-8" width="30" height="5" fill="#cccccc" />
                            <rect x="-3" y="28" width="30" height="5" fill="#cccccc" />
                            <circle cx="2" cy="-4" r="1.5" fill="#ffffff" />
                            <circle cx="6" cy="-4" r="1.5" fill="#ffffff" />
                            <circle cx="10" cy="-4" r="1.5" fill="#ffffff" />
                            <circle cx="14" cy="-4" r="1.5" fill="#ffffff" />
                            <rect x="5" y="-5" width="10" height="10" fill="#ffffff" />
                            <text x="15" y="15" fontSize="3" fill="#ffffff" textAnchor="middle">RPi4</text>
                            <text x="15" y="38" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>GPIO{comp.pin}</text>
                          </g>
                        )}
                        {comp.type === 'MICROBIT' && (
                          <g>
                            <rect x="-5" y="-8" width="30" height="36" rx="3" fill="#007acc" stroke="#005ca3" strokeWidth="1" />
                            <rect x="-2" y="-6" width="24" height="4" fill="#cccccc" />
                            <rect x="-2" y="22" width="24" height="4" fill="#cccccc" />
                            <circle cx="2" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="6" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="10" cy="0" r="1.5" fill="#ffffff" />
                            <circle cx="14" cy="0" r="1.5" fill="#ffffff" />
                            <rect x="3" y="-4" width="14" height="8" fill="#ffff00" />
                            <text x="10" y="12" fontSize="3" fill="#ffffff" textAnchor="middle">µBIT</text>
                            <text x="10" y="30" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>P{comp.pin}</text>
                          </g>
                        )}
                        {!isMicrocontroller(comp.type) && (
                          <text x="10" y="30" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold" style={{textShadow: '0 1px 2px black'}}>P{comp.pin}</text>
                        )}
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
