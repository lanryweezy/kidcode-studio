
import React, { useEffect, useRef, useState } from 'react';
import { AppMode, HardwareState, SpriteState, AppState, CircuitComponent, ComponentType } from '../types';
import { playSoundEffect, playSpeakerSound } from '../services/soundService';
import { GripVertical, Trash2, Settings, Palette, Brain, Cpu, Zap, Volume2, Wifi, Battery, Siren, Crosshair, Coins, Zap as ZapIcon } from 'lucide-react';
import { CIRCUIT_PALETTE } from '../constants';

interface StageProps {
  mode: AppMode;
  hardwareState: HardwareState;
  onHardwareInput?: (pin: number, value: any) => void;
  spriteState: SpriteState;
  appState: AppState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  highlightPin?: number | null; 
  circuitComponents: CircuitComponent[];
  onCircuitUpdate: (components: CircuitComponent[]) => void;
  pcbColor?: string;
  setPcbColor?: (color: string) => void;
  isExecuting?: boolean;
}

const PCB_COLORS = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Black', hex: '#1e293b' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'White', hex: '#f8fafc' },
];

const Stage: React.FC<StageProps> = ({ 
  mode, 
  hardwareState, 
  onHardwareInput, 
  spriteState, 
  appState, 
  canvasRef, 
  highlightPin,
  circuitComponents,
  onCircuitUpdate,
  pcbColor = '#059669',
  setPcbColor,
  isExecuting = false
}) => {
  
  // Refs for animation physics
  const renderState = useRef({
    x: spriteState.x,
    y: spriteState.y,
    vx: 0,
    vy: 0,
    rotation: spriteState.rotation
  });

  const targetState = useRef(spriteState);

  // Circuit Dragging State
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Sync target ref
  useEffect(() => {
    const dist = Math.hypot(spriteState.x - renderState.current.x, spriteState.y - renderState.current.y);
    if (dist > 100) {
      renderState.current.x = spriteState.x;
      renderState.current.y = spriteState.y;
      renderState.current.vx = 0;
      renderState.current.vy = 0;
      renderState.current.rotation = spriteState.rotation;
    }
    targetState.current = spriteState;
  }, [spriteState]);

  // Main Animation Loop
  useEffect(() => {
    if (mode !== AppMode.GAME || !canvasRef.current) return;
    let animationFrameId: number;
    const ctx = canvasRef.current.getContext('2d');
    const render = () => {
      if (!ctx) return;
      const springStiffness = 0.08;
      const damping = 0.75;
      const target = targetState.current;
      const current = renderState.current;
      const ax = (target.x - current.x) * springStiffness;
      current.vx += ax;
      current.vx *= damping;
      current.x += current.vx;
      const ay = (target.y - current.y) * springStiffness;
      current.vy += ay;
      current.vy *= damping;
      current.y += current.vy;
      current.rotation += (target.rotation - current.rotation) * 0.2;

      ctx.clearRect(0, 0, 400, 400);

      // Render Background Scene
      if (target.scene === 'space') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0,0,400,400);
          ctx.fillStyle = 'white';
          for(let i=0; i<30; i++) {
              ctx.beginPath();
              ctx.arc(Math.sin(i*12)*400, Math.cos(i*23)*400, Math.random()*2, 0, Math.PI*2);
              ctx.fill();
          }
      } else if (target.scene === 'forest') {
          ctx.fillStyle = '#ecfccb';
          ctx.fillRect(0,0,400,400);
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.moveTo(0,400); ctx.lineTo(100,200); ctx.lineTo(200,400);
          ctx.moveTo(150,400); ctx.lineTo(250,220); ctx.lineTo(350,400);
          ctx.fill();
      } else if (target.scene === 'underwater') {
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(0,0,400,400);
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(50, 350, 40, 0, Math.PI*2);
          ctx.arc(150, 380, 50, 0, Math.PI*2);
          ctx.arc(300, 360, 60, 0, Math.PI*2);
          ctx.fill();
      } else if (target.scene === 'desert') {
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(0,0,400,400);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(0,300,400,100);
          ctx.beginPath(); ctx.arc(350, 50, 30, 0, Math.PI*2); ctx.fillStyle='#f59e0b'; ctx.fill();
      } else {
          // Default Grid
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i <= 400; i += 40) {
            ctx.moveTo(i, 0); ctx.lineTo(i, 400);
            ctx.moveTo(0, i); ctx.lineTo(400, i);
          }
          ctx.stroke();
      }

      ctx.save();
      ctx.translate(current.x, current.y);
      ctx.rotate((current.rotation * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(target.emoji, 0, 0);
      ctx.restore();

      if (target.speech) {
        ctx.save();
        ctx.translate(current.x, current.y - 40);
        const text = target.speech;
        const width = ctx.measureText(text).width + 20;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-width/2, -30, width, 30, 8);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText(text, 0, -10);
        ctx.restore();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, canvasRef]);

  const handleAppButtonClick = (message?: string) => {
    playSoundEffect('ui');
    if (message) {
      setTimeout(() => alert(message), 100);
    }
  };

  // --- COMPONENT DRAG HANDLERS ---
  const handleCompDragStart = (e: React.PointerEvent, compId: string, x: number, y: number) => {
    e.stopPropagation();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    
    setDraggingCompId(compId);
    dragOffset.current = {
      x: e.clientX - svgRect.left - x,
      y: e.clientY - svgRect.top - y
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleCompDragMove = (e: React.PointerEvent) => {
    if (!draggingCompId || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    
    const rawX = e.clientX - svgRect.left - dragOffset.current.x;
    const rawY = e.clientY - svgRect.top - dragOffset.current.y;

    // Grid Snapping (20px)
    const snap = (val: number) => Math.round(val / 20) * 20;

    const clampedX = Math.max(0, Math.min(300, snap(rawX)));
    const clampedY = Math.max(0, Math.min(400, snap(rawY)));

    const updated = circuitComponents.map(c => 
      c.id === draggingCompId ? { ...c, x: clampedX, y: clampedY } : c
    );
    onCircuitUpdate(updated);
  };

  const handleCompDragEnd = (e: React.PointerEvent) => {
    // Check if dropped in trash zone (bottom right 50x50 area)
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      const relX = e.clientX - svgRect.left;
      const relY = e.clientY - svgRect.top;
      // Trash zone logic: bottom right corner
      if (relX > 250 && relY > 380) {
         if (draggingCompId) {
             handleCompDelete(draggingCompId);
         }
      }
    }

    setDraggingCompId(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handleCompDelete = (id: string) => {
    onCircuitUpdate(circuitComponents.filter(c => c.id !== id));
    playSoundEffect('click');
  };

  // Rotate component on double click
  const handleCompDoubleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    onCircuitUpdate(circuitComponents.map(c => 
      c.id === id ? { ...c, rotation: ((c.rotation || 0) + 90) % 360 } : c
    ));
    playSoundEffect('click');
  };

  const getPinCoords = (pin: number) => {
    // Special fixed pins
    if (pin === 90) return { x: 40, y: 80 };  // Top Left (Vibration)
    if (pin === 91) return { x: 260, y: 80 }; // Top Right (Motion)
    if (pin === 92) return { x: 40, y: 100 };  // Top Left (Ultrasonic)
    if (pin === 93) return { x: 260, y: 100 }; // Top Right (7-Seg)
    if (pin === 94) return { x: 260, y: 120 }; // Top Right (RGB)
    
    if (pin === 95) return { x: 260, y: 40 };  // Top Right (LCD)
    if (pin === 96) return { x: 260, y: 60 };  // Top Right (Servo)
    if (pin === 97) return { x: 40, y: 60 };   // Top Left (Potentiometer)
    if (pin === 98) return { x: 260, y: 40 };  // Top Right (Fan)
    if (pin === 99) return { x: 40, y: 40 };   // Top Left (Temp)
    if (pin === 100) return { x: 150, y: 240 }; // Bottom Center (Speaker default)

    const isLeft = pin % 2 === 0;
    const row = Math.floor(pin / 2);
    // Adjusted rail start Y to match Brain position at y=120
    return {
      x: isLeft ? 40 : 260,
      y: 130 + (row * 20)
    };
  };

  const isLightPcb = pcbColor === '#f8fafc' || pcbColor === '#ffffff';

  // Helper for Seven Segment Display
  const renderSevenSegment = (val: number | null) => {
      // Segments: a(top), b(tr), c(br), d(btm), e(bl), f(tl), g(mid)
      const map: Record<number, string> = {
          0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fbgc',
          5: 'afgcd', 6: 'afgcde', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg'
      };
      const activeSegs = (val !== null && map[val]) ? map[val] : '';
      const colorOn = '#ef4444';
      const colorOff = '#451a1a';

      return (
          <g transform="translate(-10, -15)">
              <rect x="0" y="0" width="20" height="30" fill="#1f1f1f" stroke="#000" rx="2" />
              {/* a */} <path d="M 4 2 L 16 2" stroke={activeSegs.includes('a') ? colorOn : colorOff} strokeWidth="2" />
              {/* b */} <path d="M 17 3 L 17 14" stroke={activeSegs.includes('b') ? colorOn : colorOff} strokeWidth="2" />
              {/* c */} <path d="M 17 16 L 17 27" stroke={activeSegs.includes('c') ? colorOn : colorOff} strokeWidth="2" />
              {/* d */} <path d="M 4 28 L 16 28" stroke={activeSegs.includes('d') ? colorOn : colorOff} strokeWidth="2" />
              {/* e */} <path d="M 3 16 L 3 27" stroke={activeSegs.includes('e') ? colorOn : colorOff} strokeWidth="2" />
              {/* f */} <path d="M 3 3 L 3 14" stroke={activeSegs.includes('f') ? colorOn : colorOff} strokeWidth="2" />
              {/* g */} <path d="M 4 15 L 16 15" stroke={activeSegs.includes('g') ? colorOn : colorOff} strokeWidth="2" />
          </g>
      );
  };

  // Generic Sensor Renderer for bulk tools
  const renderGenericModule = (type: string, isActive: boolean) => {
      const tool = CIRCUIT_PALETTE.find(t => t.type === type);
      const Icon = tool?.icon || Cpu;
      const color = tool?.color || 'text-slate-500';

      return (
          <g>
              <rect x="-15" y="-15" width="30" height="30" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" rx="4" />
              <foreignObject x="-10" y="-10" width="20" height="20">
                  <div className={`flex items-center justify-center h-full w-full ${isActive ? 'animate-pulse' : ''}`}>
                      <Icon size={16} className={color.replace('text-', 'stroke-')} strokeWidth={2.5} />
                  </div>
              </foreignObject>
              {/* Indicator LED */}
              <circle r="2" cx="10" cy="-10" fill={isActive ? '#ef4444' : '#cbd5e1'} />
          </g>
      );
  };

  return (
    <div className="w-full h-full flex gap-4 min-h-0">
      {/* --- PALETTE SIDEBAR (Only in Hardware Mode) --- */}
      {mode === AppMode.HARDWARE && (
        <div className="w-24 flex-shrink-0 bg-slate-200 rounded-xl p-2 flex flex-col gap-2 overflow-y-auto h-full">
           <div className="text-[10px] font-bold text-slate-500 text-center uppercase mb-1">Parts</div>
           {CIRCUIT_PALETTE.map(tool => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(tool));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="bg-white p-2 rounded-lg shadow-sm border border-slate-300 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing hover:border-slate-400 hover:scale-105 transition-all shrink-0"
                  title={`Drag to add ${tool.label}`}
                >
                   <Icon size={20} className={tool.color} />
                   <span className="text-[8px] font-bold text-slate-600 text-center leading-tight">{tool.label}</span>
                </div>
              )
           })}
        </div>
      )}

      {/* --- MAIN STAGE AREA --- */}
      <div className="flex-1 flex items-start justify-center bg-slate-200 rounded-3xl p-6 pt-8 shadow-inner overflow-hidden relative">
        
        {/* GAME MODE */}
        <div className={`relative bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 ${mode === AppMode.GAME ? 'block' : 'hidden'}`}>
          <canvas ref={canvasRef} width={400} height={400} className="block bg-white cursor-crosshair" />
          
          {/* Scoreboard Overlay */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold font-mono border border-white/20 shadow-lg pointer-events-none">
             SCORE: {spriteState.score}
          </div>
        </div>

        {/* APP MODE */}
        {mode === AppMode.APP && (
          <div className="relative w-[300px] h-[480px] bg-slate-800 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-300/50 flex flex-col">
            
            {/* Phone Status Bar */}
            <div className="bg-slate-900 w-full h-8 flex items-center justify-between px-6 text-white z-20 shrink-0">
               <span className="text-[10px] font-bold">12:30</span>
               <div className="flex gap-1">
                  <Wifi size={10} />
                  <Battery size={10} />
               </div>
            </div>

            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20 flex justify-center items-center">
              <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* App Content */}
            <div className="flex-1 w-full overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide pt-6" style={{ backgroundColor: appState.backgroundColor }}>
              {/* App Title Bar */}
              <div className="text-center pb-2 border-b border-black/5 mb-2 sticky top-0 bg-inherit z-10">
                  <h2 className="font-bold text-lg text-slate-800">{appState.title}</h2>
              </div>

               {/* Optional Score display in App Mode if > 0 */}
              {appState.score > 0 && (
                 <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg text-center font-bold border border-yellow-200">
                    🏆 Score: {appState.score}
                 </div>
              )}
              
              {/* Elements */}
              {appState.elements.map(el => {
                if (el.type === 'button') {
                  return (
                    <button key={el.id} onClick={() => handleAppButtonClick(el.actionMessage)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all">
                      {el.content}
                    </button>
                  );
                }
                if (el.type === 'input') {
                  return (
                    <input 
                      key={el.id} 
                      type="text" 
                      placeholder={el.content}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none" 
                    />
                  );
                }
                if (el.type === 'image') {
                  return (
                    <img 
                      key={el.id} 
                      src={el.content} 
                      alt="App asset"
                      className="w-full h-32 object-cover rounded-xl shadow-sm bg-slate-100"
                      onError={(e) => {
                         // Fallback if image fails
                         (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Image+Error';
                      }}
                    />
                  );
                }
                return (
                  <div key={el.id} className="bg-white/50 p-3 rounded-lg text-slate-700 text-center font-medium">
                    {el.content}
                  </div>
                );
              })}
            </div>
            
            {/* Phone Home Bar */}
            <div className="bg-slate-900 w-full h-4 relative shrink-0">
               <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-20"></div>
            </div>
          </div>
        )}

        {/* HARDWARE MODE (Interactive Builder) */}
        {mode === AppMode.HARDWARE && (
          <div className="relative w-[320px] h-[440px] animate-in zoom-in-95 duration-300 group/board shrink-0">
              {/* Settings Toggle */}
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-2 right-2 z-20 p-2 bg-white/80 hover:bg-white backdrop-blur rounded-full text-slate-600 shadow-sm opacity-0 group-hover/board:opacity-100 transition-opacity"
              >
                  {showSettings ? <Palette size={16} className="text-violet-600" /> : <Settings size={16} />}
              </button>
              
              {/* Settings Popover */}
              {showSettings && (
                 <div className="absolute top-12 right-2 z-20 bg-white p-3 rounded-xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 w-48">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Board Color</div>
                    <div className="grid grid-cols-3 gap-2">
                       {PCB_COLORS.map(c => (
                         <button 
                           key={c.name}
                           onClick={() => setPcbColor?.(c.hex)}
                           className={`w-full h-8 rounded-lg shadow-sm ring-2 ring-offset-1 transition-all ${pcbColor === c.hex ? 'ring-slate-400 scale-105' : 'ring-transparent hover:scale-105'}`}
                           style={{ backgroundColor: c.hex }}
                           title={c.name}
                         />
                       ))}
                    </div>
                 </div>
              )}

              <svg 
                ref={svgRef}
                viewBox="0 0 320 440" 
                className="w-full h-full drop-shadow-xl rounded-xl border border-slate-300 transition-colors duration-500 select-none"
                style={{ backgroundColor: pcbColor }}
                onPointerMove={handleCompDragMove}
                onPointerUp={handleCompDragEnd}
              >
                  {/* Background Grid */}
                  <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="1.5" fill={isLightPcb ? '#cbd5e1' : 'rgba(255,255,255,0.15)'} />
                      </pattern>
                      <radialGradient id="led-glare"><stop offset="0%" stopColor="white" stopOpacity="0.9" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* THE BRAIN (Microcontroller) - MOVED TO CENTER-TOP (y=120) */}
                  <g transform="translate(85, 120)">
                      {/* Carrier Board */}
                      <rect x="-10" y="-10" width="170" height="140" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="4" />
                      
                      {/* Gold Pins Top */}
                      {Array.from({length: 10}).map((_, i) => (
                        <rect key={`pin-t-${i}`} x={10 + i * 14} y="-16" width="6" height="10" fill="#fbbf24" stroke="#d97706" />
                      ))}
                      {/* Gold Pins Bottom */}
                      {Array.from({length: 10}).map((_, i) => (
                        <rect key={`pin-b-${i}`} x={10 + i * 14} y="126" width="6" height="10" fill="#fbbf24" stroke="#d97706" />
                      ))}

                      {/* Inner Area */}
                      <rect x="10" y="20" width="130" height="80" rx="8" fill="#1e293b" stroke="#475569" />

                      {/* CPU Core */}
                      <g transform="translate(45, 30)">
                         <rect x="0" y="0" width="60" height="60" rx="4" fill="#334155" />
                         {/* Activity Light */}
                         <circle cx="30" cy="30" r="15" fill={isExecuting ? "#8b5cf6" : "#475569"} className={isExecuting ? "animate-pulse" : ""} />
                         <Brain size={20} x="20" y="20" className={isExecuting ? "text-white" : "text-slate-500"} />
                      </g>
                      
                      {/* Processing Lines Animation */}
                      {isExecuting && (
                          <>
                            <path d="M 20 40 L 40 40" stroke="#8b5cf6" strokeWidth="2" className="animate-pulse" />
                            <path d="M 20 50 L 40 50" stroke="#8b5cf6" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.1s'}} />
                            <path d="M 20 60 L 40 60" stroke="#8b5cf6" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                            
                            <path d="M 110 40 L 130 40" stroke="#8b5cf6" strokeWidth="2" className="animate-pulse" />
                            <path d="M 110 50 L 130 50" stroke="#8b5cf6" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.1s'}} />
                            <path d="M 110 60 L 130 60" stroke="#8b5cf6" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                          </>
                      )}

                      {/* Label */}
                      <text x="75" y="115" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">THE BRAIN</text>
                      {isExecuting && <text x="75" y="15" textAnchor="middle" fill="#8b5cf6" fontSize="8" fontWeight="bold" className="animate-bounce">RUNNING...</text>}
                  </g>

                  {/* Power Pack - MOVED TO y=360 */}
                  <g transform="translate(130, 360)">
                      <rect x="0" y="0" width="60" height="40" rx="4" fill="#334155" />
                      <path d="M 30 0 L 30 -50 L 50 -80" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="4 2" />
                      <text x="30" y="25" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">BATTERY</text>
                  </g>
                  
                  {/* Trash Zone Indicator */}
                  {draggingCompId && (
                     <g transform="translate(280, 400)">
                         <circle r="25" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                         <Trash2 size={24} className="text-red-500" x="-12" y="-12" />
                     </g>
                  )}

                  {/* Dynamic Wires */}
                  {circuitComponents.map(comp => {
                    const pinLoc = getPinCoords(comp.pin);
                    // Control Point for Bezier - REDUCED DROOP (was +50, now +30)
                    const cX = (comp.x + pinLoc.x) / 2;
                    const cY = Math.min(comp.y, pinLoc.y) + 30; 
                    
                    // Determine if this component's pin is active (electricity flowing)
                    let isActive = false;
                    if (comp.pin < 4) isActive = hardwareState.pins[comp.pin]; // LEDS
                    if (comp.pin === 98 && hardwareState.fanSpeed > 0) isActive = true; // FAN
                    if (comp.pin === 4 && hardwareState.pins[4]) isActive = true; // BUTTON
                    if (comp.pin === 6 && hardwareState.pins[6]) isActive = true; // SWITCH
                    if (comp.pin === 100 && hardwareState.buzzerActive) isActive = true; // SPEAKER
                    if (comp.type === 'LCD' || comp.type === 'SERVO') isActive = true; // Always on
                    if (comp.type === 'RGB_LED') isActive = true;
                    if (comp.type === 'SEVEN_SEGMENT' && hardwareState.sevenSegmentValue !== null) isActive = true;
                    if (comp.type === 'VIBRATION' && hardwareState.vibrationActive) isActive = true;
                    if (comp.type === 'FLAME_SENSOR' || comp.type === 'GAS_SENSOR') isActive = true; // Power always on

                    return (
                       <g key={`wire-${comp.id}`}>
                           <path 
                             d={`M ${comp.x} ${comp.y} Q ${cX} ${cY} ${pinLoc.x} ${pinLoc.y}`}
                             stroke={highlightPin === comp.pin ? "#facc15" : (isLightPcb ? "#94a3b8" : "rgba(255,255,255,0.4)")} 
                             strokeWidth={highlightPin === comp.pin ? 4 : 2}
                             fill="none" 
                             opacity="0.8"
                             strokeLinecap="round"
                           />
                           {isActive && (
                               <path 
                                 d={`M ${comp.x} ${comp.y} Q ${cX} ${cY} ${pinLoc.x} ${pinLoc.y}`}
                                 stroke="#facc15"
                                 strokeWidth="2"
                                 fill="none"
                                 strokeDasharray="5,5"
                                 className="animate-pulse"
                               >
                                   <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                               </path>
                           )}
                       </g>
                    )
                  })}

                  {/* Dynamic Components */}
                  {circuitComponents.map(comp => {
                      const isHighlighted = highlightPin === comp.pin;

                      return (
                        <g 
                          key={comp.id} 
                          transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0})`}
                          onPointerDown={(e) => handleCompDragStart(e, comp.id, comp.x, comp.y)}
                          onDoubleClick={(e) => handleCompDoubleClick(e, comp.id)}
                          className="cursor-move hover:opacity-90 transition-transform duration-200"
                        >
                           {/* Selection Glow */}
                           {isHighlighted && <circle r="30" fill="none" stroke="#facc15" strokeWidth="3" className="animate-pulse" />}
                           
                           {/* LED */}
                           {comp.type.startsWith('LED') && comp.type !== 'RGB_LED' && (
                             <g>
                                <circle r="15" fill={comp.type === 'LED_RED' ? '#ef4444' : comp.type === 'LED_BLUE' ? '#3b82f6' : '#22c55e'} opacity={hardwareState.pins[comp.pin] ? 1 : 0.4} />
                                <circle r="15" fill="url(#led-glare)" opacity="0.4" />
                                {hardwareState.pins[comp.pin] && <circle r="20" fill={comp.type === 'LED_RED' ? '#ef4444' : comp.type === 'LED_BLUE' ? '#3b82f6' : '#22c55e'} opacity="0.3" className="animate-pulse" />}
                                <rect x="-10" y="15" width="20" height="10" rx="2" fill="#334155"/>
                             </g>
                           )}

                           {/* RGB LED */}
                           {comp.type === 'RGB_LED' && (
                             <g>
                                <circle r="15" fill={hardwareState.rgbColor} opacity="0.8" />
                                <circle r="15" fill="url(#led-glare)" opacity="0.4" />
                                <rect x="-10" y="15" width="20" height="10" rx="2" fill="#334155"/>
                                <circle r="2" cx="-5" cy="20" fill="#94a3b8" />
                                <circle r="2" cx="0" cy="20" fill="#94a3b8" />
                                <circle r="2" cx="5" cy="20" fill="#94a3b8" />
                             </g>
                           )}

                           {/* BUTTON */}
                           {comp.type === 'BUTTON' && (
                             <g 
                               onMouseDown={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, true) }}
                               onMouseUp={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, false) }}
                               onMouseLeave={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, false) }}
                               className="cursor-pointer"
                             >
                                <circle r="20" fill="#e11d48" stroke="#881337" strokeWidth="3" />
                                <circle r="16" fill="#f43f5e" className={hardwareState.pins[comp.pin] ? 'scale-90 brightness-75' : ''} />
                             </g>
                           )}

                           {/* TOGGLE SWITCH */}
                           {comp.type === 'SWITCH' && (
                             <g 
                               onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, !hardwareState.pins[comp.pin]) }}
                               className="cursor-pointer"
                             >
                                <rect x="-15" y="-25" width="30" height="50" fill="#94a3b8" rx="4" stroke="#475569" strokeWidth="2" />
                                <rect x="-10" y="-20" width="20" height="40" fill="#cbd5e1" rx="2" />
                                {/* Toggle Handle */}
                                <rect 
                                  x="-8" 
                                  y={hardwareState.pins[comp.pin] ? "-18" : "2"} 
                                  width="16" 
                                  height="16" 
                                  fill="#475569" 
                                  rx="2"
                                  className="transition-all duration-200"
                                />
                                <text x="20" y="5" fontSize="8" fill="#475569" fontWeight="bold">{hardwareState.pins[comp.pin] ? 'ON' : 'OFF'}</text>
                             </g>
                           )}

                           {/* LIGHT SENSOR */}
                           {comp.type === 'LIGHT_SENSOR' && (
                             <g onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, !hardwareState.pins[comp.pin]) }} className="cursor-pointer">
                                <rect x="-15" y="-15" width="30" height="30" fill="#facc15" stroke="#ca8a04" strokeWidth="2" rx="4" />
                                <path d="M -10 -10 L 10 -10 M -10 0 L 10 0 M -10 10 L 10 10" stroke="#a16207" strokeWidth="2" />
                                {!hardwareState.pins[comp.pin] && <circle r="18" fill="rgba(0,0,0,0.8)" />}
                             </g>
                           )}

                           {/* MOTION SENSOR */}
                           {comp.type === 'MOTION' && (
                             <g onClick={(e) => { e.stopPropagation(); onHardwareInput?.(comp.pin, !hardwareState.motionDetected) }} className="cursor-pointer">
                                <circle r="20" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
                                <path d="M -15 0 Q 0 -15 15 0 Q 0 15 -15 0" fill={hardwareState.motionDetected ? "#ef4444" : "#e2e8f0"} />
                                <path d="M -15 0 Q 0 -15 15 0 Q 0 15 -15 0" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                                {hardwareState.motionDetected && <circle r="25" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />}
                             </g>
                           )}

                           {/* ULTRASONIC SENSOR */}
                           {comp.type === 'ULTRASONIC' && (
                             <g>
                                <rect x="-25" y="-12" width="50" height="24" fill="#3b82f6" rx="4" />
                                <circle cx="-12" cy="0" r="10" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2" />
                                <circle cx="12" cy="0" r="10" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2" />
                                <foreignObject x="-30" y="15" width="60" height="20">
                                   <input 
                                     type="range" 
                                     min="0" max="200" 
                                     value={hardwareState.distance}
                                     onChange={(e) => onHardwareInput?.(comp.pin, parseInt(e.target.value))}
                                     className="w-full h-2 accent-blue-600"
                                     title={`Distance: ${hardwareState.distance}cm`}
                                   />
                                </foreignObject>
                             </g>
                           )}

                           {/* POTENTIOMETER */}
                           {comp.type === 'POTENTIOMETER' && (
                              <g>
                                 <circle r="20" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
                                 <circle r="15" fill="#e2e8f0" />
                                 <g transform={`rotate(${(hardwareState.potentiometerValue / 100) * 270 - 135})`}>
                                     <rect x="-2" y="-15" width="4" height="15" fill="#475569" rx="1" />
                                 </g>
                                 <foreignObject x="-20" y="22" width="40" height="20">
                                   <input 
                                     type="range" 
                                     min="0" max="100" 
                                     value={hardwareState.potentiometerValue}
                                     onChange={(e) => onHardwareInput?.(comp.pin, parseInt(e.target.value))}
                                     className="w-full h-2 accent-slate-600"
                                   />
                                </foreignObject>
                              </g>
                           )}

                           {/* TEMP SENSOR */}
                           {comp.type === 'TEMP_SENSOR' && (
                              <g>
                                 <rect x="-10" y="-15" width="20" height="30" fill="#1e293b" rx="4" />
                                 <circle cx="0" cy="0" r="6" fill="#000" />
                                 <foreignObject x="-20" y="20" width="40" height="20">
                                   <input 
                                     type="range" 
                                     min="0" max="50" 
                                     value={hardwareState.temperature}
                                     onChange={(e) => onHardwareInput?.(comp.pin, parseInt(e.target.value))}
                                     className="w-full h-2 accent-red-600"
                                     title={`Temp: ${hardwareState.temperature}°C`}
                                   />
                                </foreignObject>
                              </g>
                           )}

                           {/* FAN */}
                           {comp.type === 'FAN' && (
                             <g>
                               <rect x="-25" y="-25" width="50" height="50" fill="#222" rx="4" />
                               <g style={{ 
                                   animation: hardwareState.fanSpeed > 0 ? `spin ${15/hardwareState.fanSpeed}s linear infinite` : 'none',
                                   transformBox: 'fill-box',
                                   transformOrigin: 'center'
                               }}>
                                  <path d="M 0 0 L 20 -10 L 0 -20 Z" fill="#06b6d4" />
                                  <path d="M 0 0 L 20 10 L 0 20 Z" fill="#06b6d4" transform="rotate(90)" />
                                  <path d="M 0 0 L 20 10 L 0 20 Z" fill="#06b6d4" transform="rotate(180)" />
                                  <path d="M 0 0 L 20 10 L 0 20 Z" fill="#06b6d4" transform="rotate(270)" />
                               </g>
                               <circle r="8" fill="#555" />
                             </g>
                           )}

                           {/* SERVO */}
                           {comp.type === 'SERVO' && (
                             <g>
                               <rect x="-20" y="-15" width="40" height="30" fill="#0f172a" rx="2" />
                               <circle cx="10" cy="0" r="8" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
                               <g transform={`translate(10,0) rotate(${hardwareState.servoAngle - 90})`}>
                                  <rect x="-2" y="-15" width="4" height="30" fill="#ef4444" rx="1" />
                                  <circle r="2" fill="#000" />
                               </g>
                             </g>
                           )}

                           {/* SEVEN SEGMENT */}
                           {comp.type === 'SEVEN_SEGMENT' && renderSevenSegment(hardwareState.sevenSegmentValue)}

                           {/* VIBRATION MOTOR */}
                           {comp.type === 'VIBRATION' && (
                               <g>
                                   <circle r="15" fill="#a855f7" />
                                   {hardwareState.vibrationActive && (
                                       <>
                                         <path d="M -20 0 L -25 0" stroke="#a855f7" strokeWidth="2" className="animate-ping" />
                                         <path d="M 20 0 L 25 0" stroke="#a855f7" strokeWidth="2" className="animate-ping" />
                                       </>
                                   )}
                                   <text x="0" y="4" fontSize="10" textAnchor="middle" fill="white">M</text>
                               </g>
                           )}
                           
                           {/* LCD SCREEN */}
                           {comp.type === 'LCD' && (
                             <g>
                               <rect x="-60" y="-25" width="120" height="50" fill="#4ade80" stroke="#166534" strokeWidth="3" rx="4" />
                               <rect x="-55" y="-20" width="110" height="40" fill="#dcfce7" opacity="0.5" />
                               <text 
                                 x="0" 
                                 y="5" 
                                 textAnchor="middle" 
                                 fontFamily="'Share Tech Mono', monospace" 
                                 fontSize="14" 
                                 fill="#14532d"
                                 style={{ textShadow: '0 0 2px rgba(74, 222, 128, 0.5)' }}
                               >
                                 {hardwareState.lcdText.substring(0, 16)}
                               </text>
                             </g>
                           )}

                           {/* SPEAKER */}
                           {comp.type === 'SPEAKER' && (
                             <g>
                                <circle r="25" fill="#1e1e1e" stroke="#4b5563" strokeWidth="3" />
                                <circle r="10" fill="#374151" />
                                {hardwareState.buzzerActive && (
                                   <>
                                    <circle r="30" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" className="animate-ping" />
                                    <circle r="35" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3" className="animate-ping" style={{animationDelay: '0.1s'}} />
                                   </>
                                )}
                                
                                {/* Volume Slider & Tone Buttons (only if not dragging) */}
                                {!draggingCompId && (
                                    <foreignObject x="-40" y="30" width="80" height="50">
                                        <div className="flex flex-col items-center gap-1 bg-white/90 p-1 rounded-lg shadow-sm border border-slate-200">
                                            <input 
                                                type="range" 
                                                min="0" max="100" 
                                                value={hardwareState.speakerVolume}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onChange={(e) => onHardwareInput?.(comp.pin, parseInt(e.target.value))}
                                                className="w-full h-1 accent-violet-600 mb-1"
                                                title="Volume"
                                            />
                                            <div className="flex gap-1">
                                                <button onMouseDown={(e) => { e.stopPropagation(); playSpeakerSound('siren', hardwareState.speakerVolume/100) }} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500" title="Siren"></button>
                                                <button onMouseDown={(e) => { e.stopPropagation(); playSpeakerSound('laser', hardwareState.speakerVolume/100) }} className="w-3 h-3 rounded-full bg-blue-400 hover:bg-blue-500" title="Laser"></button>
                                                <button onMouseDown={(e) => { e.stopPropagation(); playSpeakerSound('coin', hardwareState.speakerVolume/100) }} className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500" title="Coin"></button>
                                                <button onMouseDown={(e) => { e.stopPropagation(); playSpeakerSound('powerup', hardwareState.speakerVolume/100) }} className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500" title="PowerUp"></button>
                                            </div>
                                        </div>
                                    </foreignObject>
                                )}
                             </g>
                           )}

                           {/* KEYPAD */}
                           {comp.type === 'KEYPAD' && (
                               <g>
                                   <rect x="-25" y="-30" width="50" height="60" fill="#334155" rx="4" stroke="#1e293b" />
                                   <grid />
                                   {Array.from({length: 12}).map((_, i) => (
                                       <rect 
                                         key={i} 
                                         x={-18 + (i%3)*14} 
                                         y={-22 + Math.floor(i/3)*12} 
                                         width="10" 
                                         height="8" 
                                         fill="#94a3b8" 
                                         rx="2" 
                                       />
                                   ))}
                               </g>
                           )}

                           {/* JOYSTICK */}
                           {comp.type === 'JOYSTICK' && (
                               <g>
                                   <rect x="-25" y="-25" width="50" height="50" fill="#1e293b" rx="4" />
                                   <circle r="18" fill="#334155" />
                                   <circle r="10" fill="#0ea5e9" stroke="#0284c7" strokeWidth="3" />
                                   <path d="M -5 -5 L -2 -2 L 0 0" stroke="white" opacity="0.5" />
                               </g>
                           )}

                           {/* GENERIC SENSOR/MODULE RENDERER (Fallthrough) */}
                           {!['LED_RED','LED_BLUE','LED_GREEN','RGB_LED','BUTTON','SWITCH','LIGHT_SENSOR','MOTION','ULTRASONIC','POTENTIOMETER','TEMP_SENSOR','FAN','SERVO','SEVEN_SEGMENT','VIBRATION','LCD','SPEAKER','KEYPAD','JOYSTICK'].includes(comp.type) && renderGenericModule(comp.type, true)}

                        </g>
                      )
                  })}
              </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage;
