
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Grip, Pause, Play, RotateCcw, Volume2, VolumeX, X, ChevronRight } from 'lucide-react';
import { SpriteState, AppState } from '../types';
import { playSoundEffect } from '../services/soundService';
import {
    drawTile, drawPlayer, drawHUD, drawMinimap, drawVignette,
    drawDamageFlash, drawDustParticles, drawSpeedLines,
    drawDeathOverlay, drawLevelComplete, fireConfetti,
    createLandingDust, createCoinCollectParticles
} from './GameStage/renderHelpers';

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
    onPause?: () => void;
    onResume?: () => void;
    onRestart?: () => void;
    onQuit?: () => void;
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
    onTick,
    onPause,
    onResume,
    onRestart,
    onQuit
}: GameCanvasProps) => {
    const isPaintingTile = useRef(false);
    const tilemapRef = useRef(spriteState.tilemap || []);
    const [editorScrollX, setEditorScrollX] = useState(0);
    const gameParticles = useRef<any[]>([]);
    const weatherParticles = useRef<any[]>([]);
    const frameCache = useRef<Record<string, HTMLImageElement>>({});
    const ambientParticles = useRef<any[]>([]);
    const dustParticles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number }[]>([]);
    const trailHistory = useRef<{ x: number; y: number }[]>([]);
    const cameraPos = useRef({ x: 0, y: 0 });
    const squashVal = useRef(0);
    const prevY = useRef(0);
    const damageFlash = useRef(0);
    const deathTimer = useRef(0);
    const completeTimer = useRef(0);
    const startTime = useRef(0);
    const fpsCounter = useRef({ frames: 0, lastTime: Date.now(), fps: 60 });
    const [isPaused, setIsPaused] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [levelComplete, setLevelComplete] = useState(false);
    const [showPauseMenu, setShowPauseMenu] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const wasDead = useRef(false);
    const wasComplete = useRef(false);
    const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        tilemapRef.current = spriteState.tilemap || [];
    }, [spriteState.tilemap]);

    useEffect(() => {
        if (isExecuting) {
            startTime.current = Date.now();
            wasDead.current = false;
            wasComplete.current = false;
            deathTimer.current = 0;
            completeTimer.current = 0;
            setGameOver(false);
            setLevelComplete(false);
            cameraPos.current = { x: 0, y: 0 };
            trailHistory.current = [];
        }
    }, [isExecuting]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                pinchStart.current = { dist: Math.hypot(dx, dy), scale: zoom };
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && pinchStart.current) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.hypot(dx, dy);
                const newScale = pinchStart.current.scale * (dist / pinchStart.current.dist);
                setZoom(Math.max(0.5, Math.min(2, newScale)));
                e.preventDefault();
            }
        };
        const handleTouchEnd = () => { pinchStart.current = null; };
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [canvasRef, zoom]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        let animationFrameId: number;

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
            if (showPauseMenu) { animationFrameId = requestAnimationFrame(render); return; }
            if (isExecuting && onTick) onTick();
            const time = Date.now();

            const current = isExecuting ? spriteStateRef.current : spriteState;
            const target = isExecuting ? spriteStateRef.current : spriteState;
            const currentTilemap = isExecuting ? spriteStateRef.current.tilemap : spriteState.tilemap;

            const maxHp = target.maxHealth || 5;
            const hp = target.health ?? maxHp;
            if (isExecuting && hp <= 0 && !wasDead.current) {
                wasDead.current = true;
                deathTimer.current = 80;
                setGameOver(true);
            }
            if (deathTimer.current > 0) {
                deathTimer.current--;
                if (deathTimer.current <= 0 && wasDead.current) {
                    wasDead.current = false;
                    setGameOver(false);
                    onUpdateSpriteState({ health: maxHp });
                }
            }

            if (isExecuting && target.variables?._levelComplete && !wasComplete.current) {
                wasComplete.current = true;
                completeTimer.current = 120;
                setLevelComplete(true);
                fireConfetti();
            }
            if (completeTimer.current > 0) completeTimer.current--;

            const speed = Math.sqrt((target.vx || 0) ** 2 + (target.vy || 0) ** 2);

            if (wasDead.current && deathTimer.current > 40) {
                const spinAngle = (80 - deathTimer.current) * 15;
                ctx.clearRect(0, 0, width, height);
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.rotate(spinAngle * Math.PI / 180);
                ctx.globalAlpha = deathTimer.current / 80;
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(target.emoji || '🧑', 0, 0);
                ctx.restore();
                drawDeathOverlay(ctx, width, height, deathTimer.current);
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            let targetCameraX = 0;
            let targetCameraY = 0;
            if (isExecuting) {
                targetCameraX = current.x - (width / 2) / zoom;
                targetCameraY = Math.max(0, current.y - (height / 2) / zoom);
                if (currentTilemap && currentTilemap.length > 0) {
                    let maxX = 0, maxY = 0;
                    for (const t of currentTilemap) {
                        maxX = Math.max(maxX, (t.x + 1) * 40);
                        maxY = Math.max(maxY, (t.y + 1) * 40);
                    }
                    targetCameraX = Math.max(0, Math.min(targetCameraX, maxX - width / zoom));
                    targetCameraY = Math.max(0, Math.min(targetCameraY, maxY - height / zoom));
                }
            } else {
                targetCameraX = editorScrollX;
            }

            const lerpFactor = isExecuting ? 0.08 : 1;
            cameraPos.current.x += (targetCameraX - cameraPos.current.x) * lerpFactor;
            cameraPos.current.y += (targetCameraY - cameraPos.current.y) * lerpFactor;
            const cameraX = cameraPos.current.x;
            const cameraY = cameraPos.current.y;

            fpsCounter.current.frames++;
            if (time - fpsCounter.current.lastTime >= 1000) {
                fpsCounter.current.fps = fpsCounter.current.frames;
                fpsCounter.current.frames = 0;
                fpsCounter.current.lastTime = time;
            }

            ctx.save();
            if (isExecuting && shakeAmount > 0) {
                ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
            }

            ctx.translate(-cameraX, -cameraY);
            ctx.scale(zoom, zoom);

            const skyGrad = ctx.createLinearGradient(0, cameraY, 0, cameraY + height / zoom);
            skyGrad.addColorStop(0, '#0ea5e9');
            skyGrad.addColorStop(0.6, '#38bdf8');
            skyGrad.addColorStop(1, '#bae6fd');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(cameraX, cameraY, width / zoom, height / zoom);

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ambientParticles.current.forEach(p => {
                if (p.type === 'cloud') {
                    p.x += p.speed;
                    if (p.x > width + cameraX + 50) p.x = cameraX - 50;
                    const drawX = (p.x + cameraX * 0.8) % (width / zoom + 200) - 100 + cameraX;
                    ctx.beginPath();
                    ctx.arc(drawX, p.y + cameraY, p.size || 20, 0, Math.PI * 2);
                    ctx.arc(drawX + (p.size || 20) * 0.8, p.y + cameraY + 5, (p.size || 20) * 0.7, 0, Math.PI * 2);
                    ctx.arc(drawX - (p.size || 20) * 0.8, p.y + cameraY + 5, (p.size || 20) * 0.7, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            if (currentTilemap) {
                for (const tile of currentTilemap) {
                    const tx = tile.x * 40;
                    const ty = tile.y * 40;
                    if (tx < cameraX - 60 / zoom || tx > cameraX + width / zoom + 20 ||
                        ty < cameraY - 60 / zoom || ty > cameraY + height / zoom + 20) continue;
                    drawTile(ctx, tile, time);
                }
            }

            if (target.weather !== 'none') {
                ctx.save();
                ctx.fillStyle = target.weather === 'rain' ? 'rgba(150,200,255,0.3)' : 'white';
                weatherParticles.current.forEach(p => {
                    p.y += p.speed;
                    if (p.y > height / zoom) p.y = -10;
                    if (target.weather === 'rain') {
                        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x - 2, p.y + 10);
                        ctx.stroke();
                    } else {
                        p.x += Math.sin(time * 0.002 + p.y * 0.01) * 0.5;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                ctx.restore();
            }

            if (gameParticles.current.length > 0) {
                for (let i = gameParticles.current.length - 1; i >= 0; i--) {
                    const p = gameParticles.current[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.2;
                    p.life -= p.decay;
                    if (p.life <= 0) { gameParticles.current.splice(i, 1); continue; }
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            drawDustParticles(ctx, dustParticles.current);

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

            let textureImg: HTMLImageElement | null = null;
            if (target.frames && target.frames.length > 0) {
                let frameIndex;
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

            if (isExecuting) {
                trailHistory.current.push({ x: current.x, y: current.y });
                if (trailHistory.current.length > 8) trailHistory.current.shift();
            }

            if (prevY.current > current.y + 2 && current.vy >= 0 && isExecuting) {
                createLandingDust(current.x, current.y, dustParticles.current);
            }
            if (Math.abs(current.vy) > 2 && current.vy < 0 && isExecuting) {
                squashVal.current = 1;
            } else {
                squashVal.current *= 0.9;
            }
            prevY.current = current.y;

            drawPlayer(ctx, current, textureImg, time, trailHistory.current, squashVal.current,
                speed < 0.5 && isExecuting);

            drawSpeedLines(ctx, width / zoom, height / zoom, speed, time);

            ctx.restore();

            drawDamageFlash(ctx, width, height, damageFlash.current);
            damageFlash.current *= 0.95;

            drawVignette(ctx, width, height);

            if (isExecuting) {
                drawHUD(ctx, target, width, height, fpsCounter.current.fps, time, startTime.current);
                drawMinimap(ctx, currentTilemap || [], target.enemies || [], target.items || [],
                    current.x, current.y, width, height, time);
            }

            if (deathTimer.current > 0) {
                drawDeathOverlay(ctx, width, height, deathTimer.current);
            }

            if (completeTimer.current > 0) {
                const elapsed = Math.floor((time - startTime.current) / 1000);
                const coins = target.keys || 0;
                const stars = coins >= 5 ? 3 : coins >= 3 ? 2 : 1;
                drawLevelComplete(ctx, width, height, completeTimer.current, coins, time - startTime.current, stars);
            }

            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef, spriteState, isExecuting, shakeAmount, editorScrollX, width, height, onTick, showPauseMenu, zoom]);

    const placeTileAt = (clientX: number, clientY: number) => {
        if (appState.activeLevelTool && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const rawX = clientX - rect.left + editorScrollX;
            const x = Math.floor(rawX / 40);
            const y = Math.floor((clientY - rect.top) / 40);
            const newMap = [...tilemapRef.current];
            const existingIdx = newMap.findIndex((t: any) => t.x === x && t.y === y);
            if (existingIdx >= 0 && newMap[existingIdx].type === appState.activeLevelTool) return;
            if (existingIdx >= 0) newMap.splice(existingIdx, 1);
            if (appState.activeLevelTool !== 'eraser') newMap.push({ x, y, type: appState.activeLevelTool as any });
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

    const handleCanvasClick = () => {
        if (isExecuting && !gameOver && !levelComplete) {
            setShowPauseMenu(prev => !prev);
        }
    };

    return (
        <div className="flex flex-col gap-2" style={{ width }}>
            <div className="relative bg-white shadow-xl rounded-lg overflow-hidden group/canvas" style={{ width, height }}>
                <canvas
                    ref={canvasRef} width={width} height={height}
                    className={`block bg-white ${appState.activeLevelTool ? 'cursor-cell' : 'cursor-crosshair'}`}
                    onMouseDown={(e) => {
                        if (appState.activeLevelTool) {
                            isPaintingTile.current = true;
                            placeTileAt(e.clientX, e.clientY);
                        }
                    }}
                    onMouseMove={(e) => { if (isPaintingTile.current) placeTileAt(e.clientX, e.clientY); }}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={handleCanvasClick}
                />
                {!isExecuting && (
                    <div
                        className="absolute bottom-0 right-0 p-2 cursor-nwse-resize opacity-0 group-hover/canvas:opacity-100 transition-opacity bg-slate-200/50 hover:bg-slate-300 rounded-tl-lg z-20"
                        onMouseDown={handleMouseDownResize}
                    >
                        <Grip size={16} className="text-slate-500" />
                    </div>
                )}
                {showPauseMenu && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
                        <div className="bg-slate-900/95 rounded-2xl border border-slate-700 shadow-2xl p-6 w-64 flex flex-col gap-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-black text-lg">PAUSED</h3>
                                <button onClick={() => setShowPauseMenu(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <button onClick={() => { setShowPauseMenu(false); onResume?.(); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors">
                                <Play size={18} /> Resume
                            </button>
                            <button onClick={() => { setShowPauseMenu(false); onRestart?.(); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors">
                                <RotateCcw size={18} /> Restart Level
                            </button>
                            <button onClick={() => setSoundEnabled(!soundEnabled)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">
                                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                Sound: {soundEnabled ? 'On' : 'Off'}
                            </button>
                            <button onClick={() => { setShowPauseMenu(false); onQuit?.(); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">
                                <X size={18} /> Quit
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {!isExecuting && (
                <div className="h-12 bg-slate-800 rounded-lg flex flex-col justify-center px-2 relative select-none shadow-inner border border-slate-700" style={{ width: '100%' }}>
                    <div className="h-4 bg-slate-700 rounded w-full relative cursor-pointer"
                        onMouseDown={(e) => { if (e.buttons === 1) handleTimelineDrag(e); }}
                        onMouseMove={(e) => { if (e.buttons === 1) handleTimelineDrag(e); }}
                    >
                        <div className="absolute h-full bg-indigo-500/50 border-x-2 border-indigo-400" style={{ left: `${((editorScrollX + width / 2) / 20000) * 100}%`, width: `${(width / 20000) * 100}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
});

const VirtualButton = ({ id, label, color, keys, onInput, size = 'w-16 h-16' }: any) => {
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

    const handlePress = () => {
        setIsPressed(true);
        onInput(id, true);
        if (navigator.vibrate) navigator.vibrate(15);
    };

    return (
        <button
            onPointerDown={handlePress}
            onPointerUp={() => { setIsPressed(false); onInput(id, false); }}
            onPointerLeave={() => { setIsPressed(false); onInput(id, false); }}
            className={`${size} ${color} rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg transition-all active:scale-90 active:brightness-75 select-none ${isPressed ? 'scale-90 brightness-75' : ''}`}
        >
            {label}
        </button>
    );
};

const JoystickPad = ({ onInput }: { onInput: (id: string, active: boolean) => void }) => {
    const padRef = useRef<HTMLDivElement>(null);
    const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);
    const activeDir = useRef<string | null>(null);
    const RADIUS = 36;

    const emitDir = (dx: number, dy: number) => {
        const dist = Math.hypot(dx, dy);
        if (dist < 8) {
            if (activeDir.current) {
                onInput(activeDir.current, false);
                activeDir.current = null;
            }
            return;
        }
        let dir = 'right';
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'right' : 'left';
        } else {
            dir = dy > 0 ? 'down' : 'up';
        }
        if (dir !== activeDir.current) {
            if (activeDir.current) onInput(activeDir.current, false);
            activeDir.current = dir;
            onInput(dir, true);
            if (navigator.vibrate) navigator.vibrate(10);
        }
    };

    const handleStart = (clientX: number, clientY: number) => {
        if (!padRef.current) return;
        setActive(true);
        const rect = padRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.min(Math.hypot(dx, dy), RADIUS);
        const angle = Math.atan2(dy, dx);
        setKnobPos({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
        emitDir(dx, dy);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!padRef.current || !active) return;
        const rect = padRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.min(Math.hypot(dx, dy), RADIUS);
        const angle = Math.atan2(dy, dx);
        setKnobPos({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
        emitDir(dx, dy);
    };

    const handleEnd = () => {
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        if (activeDir.current) {
            onInput(activeDir.current, false);
            activeDir.current = null;
        }
    };

    useEffect(() => {
        const onMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onUp = () => handleEnd();
        if (active) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [active]);

    return (
        <div
            ref={padRef}
            className="relative w-[108px] h-[108px] rounded-full bg-white/15 border border-white/25 touch-none select-none"
            onPointerDown={(e) => handleStart(e.clientX, e.clientY)}
            onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
            onPointerUp={handleEnd}
            onPointerLeave={handleEnd}
        >
            <div
                className="absolute w-14 h-14 rounded-full bg-white/40 border-2 border-white/50 shadow-lg"
                style={{
                    left: `calc(50% - 28px + ${knobPos.x}px)`,
                    top: `calc(50% - 28px + ${knobPos.y}px)`,
                    transition: active ? 'none' : 'left 0.15s, top 0.15s'
                }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
        </div>
    );
};

const GameStage = React.memo((props: any) => {
    const { isExecuting, onInput, gameCanvasSize, onGameCanvasResize, onPause, onResume, onRestart, onQuit } = props;
    const [showTouchControls, setShowTouchControls] = useState(window.innerWidth < 768);
    const [touchVisible, setTouchVisible] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setShowTouchControls(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === 'Escape' && isExecuting) {
                onPause?.();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isExecuting, onPause]);

    const handleVirtualButton = useCallback((buttonId: string) => {
        if (!onInput) return;
        onInput(buttonId, true);
        setTimeout(() => onInput(buttonId, false), 100);
    }, [onInput]);

    const canvasW = gameCanvasSize?.w || 400;
    const canvasH = gameCanvasSize?.h || 400;

    return (
        <div className="relative group w-full h-full flex items-center justify-center flex-col">
            <div className="w-full max-w-[800px] aspect-[4/3] mx-auto">
                <GameCanvas
                    {...props}
                    width={canvasW}
                    height={canvasH}
                    onResize={onGameCanvasResize}
                    onPause={onPause}
                    onResume={onResume}
                    onRestart={onRestart}
                    onQuit={onQuit}
                />
            </div>
            {isExecuting && showTouchControls && touchVisible && (
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20 px-4 pb-4 flex justify-between items-end">
                    <div className="pointer-events-auto">
                        <JoystickPad onInput={onInput} />
                    </div>
                    <div className="pointer-events-auto flex gap-3 items-end">
                        <button
                            onPointerDown={() => handleVirtualButton('b')}
                            className="w-14 h-14 rounded-full bg-red-500/70 border-2 border-red-400/50 flex items-center justify-center text-white font-black text-lg shadow-lg active:scale-90 select-none"
                        >
                            B
                        </button>
                        <button
                            onPointerDown={() => handleVirtualButton('a')}
                            className="w-16 h-16 rounded-full bg-green-500/70 border-2 border-green-400/50 flex items-center justify-center text-white font-black text-xl shadow-lg active:scale-90 select-none"
                        >
                            A
                        </button>
                    </div>
                </div>
            )}
            {isExecuting && showTouchControls && (
                <button
                    onClick={() => setTouchVisible(!touchVisible)}
                    className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-black/40 text-white/60 flex items-center justify-center text-xs hover:bg-black/60"
                >
                    {touchVisible ? '👁' : '👁‍🗨'}
                </button>
            )}
            {isExecuting && !showTouchControls && (
                <div style={{ width: canvasW, height: canvasH }} className="absolute pointer-events-none mx-auto">
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
