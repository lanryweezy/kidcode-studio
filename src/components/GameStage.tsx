
import React, { useRef, useEffect, useState } from 'react';
import { Grip } from 'lucide-react';
import { SpriteState, AppState } from '../types';
import { playSoundEffect } from '../services/soundService';

interface GameCanvasProps {
    spriteState: SpriteState;
    spriteStateRef: React.MutableRefObject<SpriteState>;
    appState: AppState;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isExecuting: boolean;
    shakeAmount: number;
    onUpdateSpriteState: (state: Partial<SpriteState>) => void;
    width?: number;
    height?: number;
    onResize?: (w: number, h: number) => void;
    onTick?: () => void;
}

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
    onResize,
    onTick
}: GameCanvasProps) => {
    const isPaintingTile = useRef(false);
    const tilemapRef = useRef(spriteState.tilemap || []);
    const [editorScrollX, setEditorScrollX] = useState(0);
    const gameParticles = useRef<any[]>([]);
    const weatherParticles = useRef<any[]>([]);
    const frameCache = useRef<Record<string, HTMLImageElement>>({});
    const ambientParticles = useRef<any[]>([]);

    useEffect(() => {
        tilemapRef.current = spriteState.tilemap || [];
    }, [spriteState.tilemap]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        let animationFrameId: number;
        
        // Setup ambient clouds if they don't exist
        if (ambientParticles.current.length === 0) {
            for (let i = 0; i < 5; i++) {
                ambientParticles.current.push({
                    x: Math.random() * width,
                    y: 20 + Math.random() * 100,
                    size: 20 + Math.random() * 30,
                    speed: 0.2 + Math.random() * 0.5,
                    type: 'cloud'
                });
            }
        }

        // Setup weather particles
        if (weatherParticles.current.length === 0) {
            for (let i = 0; i < 100; i++) {
                weatherParticles.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speed: 2 + Math.random() * 5,
                    size: 1 + Math.random() * 2
                });
            }
        }

        const render = () => {
          if (!ctx) return;
          if (isExecuting && onTick) onTick();
          const time = Date.now();
          
          const current = isExecuting ? spriteStateRef.current : spriteState;
          const target = isExecuting ? spriteStateRef.current : spriteState;
          const currentTilemap = isExecuting ? spriteStateRef.current.tilemap : spriteState.tilemap;

          // Camera Logic
          let cameraX = 0;
          let cameraY = 0;
          if (isExecuting) {
              cameraX = current.x - width / 2;
              cameraY = Math.max(0, current.y - height / 2);
          } else {
              cameraX = editorScrollX;
          }

          ctx.save();
          
          // Shake effect
          if (isExecuting && shakeAmount > 0) {
              ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
          }

          ctx.translate(-cameraX, -cameraY);

          // Sky Gradient
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#38bdf8');
          skyGrad.addColorStop(1, '#bae6fd');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(cameraX, cameraY, width, height);
          
          // Draw clouds
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ambientParticles.current.forEach(p => { 
              if (p.type === 'cloud') { 
                  p.x += p.speed; 
                  if (p.x > width + cameraX + 50) p.x = cameraX - 50; 
                  const drawX = (p.x + cameraX * 0.8) % (width + 200) - 100 + cameraX; 
                  ctx.beginPath(); 
                  ctx.arc(drawX, p.y + cameraY, p.size || 20, 0, Math.PI*2); 
                  ctx.arc(drawX + (p.size || 20)*0.8, p.y + cameraY + 5, (p.size || 20)*0.7, 0, Math.PI*2); 
                  ctx.arc(drawX - (p.size || 20)*0.8, p.y + cameraY + 5, (p.size || 20)*0.7, 0, Math.PI*2); 
                  ctx.fill(); 
              } 
          });
          
          // Draw Tilemap
          if (currentTilemap) { 
            currentTilemap.forEach((tile: any) => { 
                const x = tile.x * 40; 
                const y = tile.y * 40; 
                if (x < cameraX - 40 || x > cameraX + width || y < cameraY - 40 || y > cameraY + height) return; 
                
                ctx.save();
                ctx.translate(x, y);

                if (tile.type === 'brick') { 
                    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, 40, 40); 
                    ctx.fillStyle = '#92400e'; ctx.fillRect(2, 2, 36, 16); 
                    ctx.fillStyle = '#92400e'; ctx.fillRect(2, 20, 16, 18); 
                    ctx.fillStyle = '#92400e'; ctx.fillRect(20, 20, 18, 18); 
                } 
                else if (tile.type === 'grass') { 
                    const wave = Math.sin(time * 0.005 + x * 0.1) * 2;
                    ctx.fillStyle = '#22c55e'; ctx.fillRect(0, 5, 40, 35); 
                    ctx.fillStyle = '#4ade80'; 
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.quadraticCurveTo(10, 5 + wave, 20, 5);
                    ctx.quadraticCurveTo(30, 5 - wave, 40, 5);
                    ctx.lineTo(40, 15); ctx.lineTo(0, 15); 
                    ctx.fill();
                } 
                else if (tile.type === 'lava') {
                    const pulse = Math.sin(time * 0.008) * 2;
                    ctx.fillStyle = '#ea580c'; ctx.fillRect(0, 5 + pulse, 40, 35 - pulse);
                    ctx.fillStyle = '#f97316'; 
                    if ((Date.now() + x) % 2000 < 100) {
                        ctx.beginPath(); ctx.arc(Math.random() * 30 + 5, 10, 3, 0, Math.PI * 2); ctx.fill();
                    }
                }
                else if (tile.type === 'spike') {
                    ctx.fillStyle = '#94a3b8';
                    const pulse = Math.abs(Math.sin(time * 0.01)) * 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 40); ctx.lineTo(20, 10 - pulse); ctx.lineTo(40, 40);
                    ctx.fill();
                }
                else if (tile.type === 'flag') {
                    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(2, 0, 4, 40); 
                    const wave = Math.sin(time * 0.01) * 5;
                    ctx.fillStyle = '#ef4444'; 
                    ctx.beginPath();
                    ctx.moveTo(6, 2); 
                    ctx.quadraticCurveTo(20, 2 + wave, 35, 5);
                    ctx.quadraticCurveTo(20, 20 + wave, 6, 20);
                    ctx.fill();
                }
                else if (tile.type === 'spring') {
                    ctx.fillStyle = '#94a3b8'; ctx.fillRect(5, 30, 30, 10);
                    ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 4;
                    ctx.beginPath();
                    const compression = Math.sin(time * 0.02) * 5;
                    for(let i=0; i<4; i++) {
                        ctx.moveTo(10, 30 - i * 5 + compression);
                        ctx.lineTo(30, 30 - i * 5 + compression);
                    }
                    ctx.stroke();
                }
                else if (tile.type === 'coin') { 
                    const spin = Math.abs(Math.sin(time * 0.005)); 
                    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(20, 20, 10 * spin, 10, 0, 0, Math.PI*2); ctx.fill(); 
                    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.ellipse(20, 20, 6 * spin, 6, 0, 0, Math.PI*2); ctx.fill(); 
                } 
                else { ctx.fillStyle = '#64748b'; ctx.fillRect(0, 0, 40, 40); } 
                
                ctx.restore();
            }); 
          }

          // Draw Weather
          if (target.weather !== 'none') {
              ctx.save();
              ctx.translate(cameraX, cameraY);
              weatherParticles.current.forEach(p => {
                  p.y += p.speed;
                  if (p.y > height) p.y = -10;
                  
                  if (target.weather === 'rain') {
                      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                      ctx.lineWidth = 1;
                      ctx.beginPath();
                      ctx.moveTo(p.x, p.y);
                      ctx.lineTo(p.x - 2, p.y + 10);
                      ctx.stroke();
                  } else if (target.weather === 'snow') {
                      p.x += Math.sin(time * 0.002 + p.y * 0.01) * 0.5; // Sway
                      ctx.fillStyle = 'white';
                      ctx.beginPath();
                      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                      ctx.fill();
                  }
              });
              ctx.restore();
          }
          
          // Draw Particles
          if (gameParticles.current.length > 0) {
              for (let i = gameParticles.current.length - 1; i >= 0; i--) {
                  const p = gameParticles.current[i];
                  p.x += p.vx;
                  p.y += p.vy;
                  p.vy += 0.2; 
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

          // Entities
          target.items.forEach((item: any) => { 
              const bob = Math.sin(time * 0.005 + item.x) * 5; 
              ctx.font = '24px Arial'; 
              ctx.textAlign = 'center'; 
              ctx.fillText(item.emoji || '💎', item.x, item.y + bob); 
          });
          target.enemies.forEach((enemy: any) => { 
              ctx.save(); 
              ctx.translate(enemy.x, enemy.y); 
              ctx.fillText(enemy.emoji || '👾', 0, 0); 
              ctx.restore(); 
          });
          
          // Projectiles
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

          // Player
          let textureImg: HTMLImageElement | null = null;
          
          // Animation Logic
          if (target.frames && target.frames.length > 0) {
              let frameIndex = 0;
              if (target.currentAnimation && target.animations[target.currentAnimation]) {
                  const sequence = target.animations[target.currentAnimation];
                  const totalFrames = sequence.length;
                  const frameIdx = Math.floor((time * 0.001 * target.animationSpeed) % totalFrames);
                  frameIndex = sequence[frameIdx];
              } else {
                  frameIndex = Math.floor((time * 0.001 * target.animationSpeed) % target.frames.length);
              }
              
              const frameUrl = target.frames[frameIndex];
              if (frameUrl) {
                  if (!frameCache.current[frameUrl]) {
                      const img = new Image();
                      img.src = frameUrl;
                      frameCache.current[frameUrl] = img;
                  }
                  textureImg = frameCache.current[frameUrl];
              }
          } else if (target.texture) {
              if (!frameCache.current[target.texture]) {
                  const img = new Image();
                  img.src = target.texture;
                  frameCache.current[target.texture] = img;
              }
              textureImg = frameCache.current[target.texture];
          }

          ctx.save(); 
          ctx.translate(current.x, current.y); 
          ctx.rotate((current.rotation * Math.PI) / 180); 
          ctx.scale(current.scaleX || 1, current.scaleY || 1); 
          if (textureImg && textureImg.complete) { 
              ctx.drawImage(textureImg, -20, -20, 40, 40); 
          } else { 
              ctx.font = '40px Arial'; 
              ctx.textAlign = 'center'; 
              ctx.textBaseline = 'middle'; 
              ctx.fillText(target.emoji || '👤', 0, 0); 
          } 
          ctx.restore();
          
          ctx.restore();

          // Inventory HUD
          if (isExecuting) {
              ctx.save();
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.roundRect(10, 10, 80, 40, 10);
              ctx.fill();
              ctx.font = 'bold 20px Arial';
              ctx.fillStyle = 'white';
              ctx.fillText(`🔑 ${target.keys || 0}`, 25, 38);
              ctx.restore();
          }

          animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef, spriteState, isExecuting, shakeAmount, editorScrollX, width, height, onTick]); 

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

    const handleMouseDownResize = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = width;
        const startH = height;
        
        const onMove = (moveEvent: MouseEvent) => {
            const newW = Math.max(200, Math.min(800, startW + (moveEvent.clientX - startX)));
            const newH = Math.max(200, Math.min(600, startH + (moveEvent.clientY - startY)));
            onResize?.(newW, newH);
        };
        
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const handleTimelineDrag = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setEditorScrollX(percent * 20000 - width / 2);
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
                        <div className="absolute h-full bg-indigo-500/50 border-x-2 border-indigo-400" style={{ left: `${((editorScrollX + width/2) / 20000) * 100}%`, width: `${(width / 20000) * 100}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
});

const VirtualButton = ({ id, label, color, keys, onInput }: any) => {
    const [isPressed, setIsPressed] = useState(false);
    
    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if (keys.includes(e.code)) {
                setIsPressed(true);
                onInput(id, true);
            }
        };
        const handleUp = (e: KeyboardEvent) => {
            if (keys.includes(e.code)) {
                setIsPressed(false);
                onInput(id, false);
            }
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, [id, keys, onInput]);

    return (
        <button 
            onPointerDown={() => { setIsPressed(true); onInput(id, true); }}
            onPointerUp={() => { setIsPressed(false); onInput(id, false); }}
            onPointerLeave={() => { setIsPressed(false); onInput(id, false); }}
            className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform ${isPressed ? 'scale-90 brightness-75' : 'hover:scale-110'}`}
        >
            {label}
        </button>
    );
};

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

export default GameStage;
