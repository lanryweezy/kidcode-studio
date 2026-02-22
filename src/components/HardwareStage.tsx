
import React, { useEffect, useRef, useState } from 'react';
import { HardwareState, CircuitComponent } from '../types';
import { playSoundEffect } from '../services/soundService';
import { serialService } from '../services/webSerialService';
import { useStore } from '../store/useStore';
import { Usb, Zap } from 'lucide-react';

interface HardwareStageProps {
  hardwareState: HardwareState;
  hardwareStateRef?: React.MutableRefObject<HardwareState>;
  circuitComponents: CircuitComponent[];
  pcbColor: string;
  onCircuitUpdate: (components: CircuitComponent[]) => void;
  isExecuting: boolean;
  onHardwareInput: (pin: number, value: any) => void;
}

const HardwareStage: React.FC<HardwareStageProps> = React.memo(({ 
  hardwareState, 
  hardwareStateRef, 
  circuitComponents, 
  pcbColor, 
  onCircuitUpdate, 
  isExecuting, 
  onHardwareInput 
}) => {
    const { isBoardConnected, setIsBoardConnected } = useStore();
    const [localComponents, setLocalComponents] = useState<CircuitComponent[]>(circuitComponents);
    
    const handleConnect = async () => {
        if (isBoardConnected) {
            await serialService.disconnect();
            setIsBoardConnected(false);
        } else {
            const success = await serialService.connect();
            if (success) {
                setIsBoardConnected(true);
                playSoundEffect('powerup');
            } else {
                alert("Could not connect to board. Make sure you use a compatible browser (Chrome/Edge) and have a board plugged in!");
            }
        }
    };
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

    const historyRef = useRef<number[][]>([]);

    useEffect(() => {
        let frameId: number;
        const updateVisuals = () => {
            const state = hardwareStateRef?.current || hardwareState;
            
            // Update signal history for monitor
            const currentPins = [state.pins[0] ? 1 : 0, state.pins[1] ? 1 : 0, state.pins[2] ? 1 : 0];
            historyRef.current = [...historyRef.current.slice(-50), currentPins];

            // Enhanced wire visualization... (omitted but preserved)
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
                    const lightCircle = el.querySelector('.light-part') as SVGCircleElement;
                    if (lightCircle) {
                        const color = comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : '#22c55e';
                        lightCircle.setAttribute('fill', isOn ? color : '#334155');
                        
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
                    const lightCircle = el.querySelector('.light-part') as SVGCircleElement;
                    if (lightCircle) {
                        lightCircle.setAttribute('fill', state.rgbLedColor || '#FF0000');
                    }
                }
                
                if (comp.type === 'FAN') {
                    const blades = el.querySelector('.fan-blades');
                    if (blades && state.fanSpeed > 0) {
                        const currentRot = Number(blades.getAttribute('data-rotation') || 0);
                        const newRot = (currentRot + state.fanSpeed * 2) % 360;
                        blades.setAttribute('transform', `rotate(${newRot} 10 10)`);
                        blades.setAttribute('data-rotation', String(newRot));
                    }
                }
                
                if (comp.type === 'SERVO') {
                    const arm = el.querySelector('.servo-arm');
                    if (arm) {
                        arm.setAttribute('transform', `rotate(${state.servoAngle} 10 10)`);
                    }
                }
                
                if (comp.type === 'BUTTON') {
                    const isPressed = state.pins[comp.pin];
                    const btnCircle = el.querySelector('circle:last-child') as SVGCircleElement;
                    if (btnCircle) {
                        btnCircle.setAttribute('fill', isPressed ? '#991b1b' : '#ef4444');
                        btnCircle.setAttribute('r', isPressed ? '3.5' : '4');
                    }
                }
                
                if (comp.type === 'POTENTIOMETER') {
                    const knob = el.querySelector('g[transform*="rotate"]');
                    if (knob) {
                        const deg = ((state.potentiometerValue / 1023) * 270) - 135;
                        knob.setAttribute('transform', `rotate(${deg} 10 10)`);
                    }
                }
            });
            frameId = requestAnimationFrame(updateVisuals);
        };
        frameId = requestAnimationFrame(updateVisuals);
        return () => cancelAnimationFrame(frameId);
    }, [circuitComponents, hardwareState, hardwareStateRef]);

    const getPinCoords = (pin: number) => {
        const isLeft = pin % 2 === 0; 
        const row = Math.floor(pin / 2); 
        const x = isLeft ? 90 : 210;
        const y = 130 + (row * 20);
        if (pin >= 90) return { x: 150 + (pin - 90) * 10 - 50, y: 350 };
        return { x, y };
    };
    
    const getMicrocontrollerPinCoords = (compType: string, pin: number, compX: number, compY: number) => {
        if (compType === 'ARDUINO_UNO' || compType === 'ARDUINO_NANO') {
            if (pin <= 13) return { x: compX + 8 + (pin * 7), y: compY - 8 };
            else if (pin >= 14 && pin <= 21) return { x: compX + 8 + ((pin - 14) * 7), y: compY + 42 };
            else if (pin === 22) return { x: compX + 5, y: compY + 15 };
            else if (pin === 23) return { x: compX + 5, y: compY + 25 };
            else if (pin === 24) return { x: compX + 60, y: compY + 15 };
            else if (pin === 25) return { x: compX + 60, y: compY + 25 };
        }
        return { x: compX + 10, y: compY + 10 };
    };
    
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
            
            {/* Connection Overlay */}
            <div className="absolute top-2 right-2 z-50">
                <button 
                    onClick={handleConnect}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${isBoardConnected ? 'bg-emerald-500 text-white animate-pulse-glow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                    <Usb size={14} /> {isBoardConnected ? 'BOARD CONNECTED' : 'CONNECT BOARD'}
                </button>
            </div>

            <svg width="100%" height="100%" viewBox="0 0 300 400" className="w-full h-full pointer-events-auto">
                <defs>
                    <pattern id="pcb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.2" fill="rgba(0,0,0,0.1)"/>
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                    </pattern>
                    <filter id="comp-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                        <feOffset dx="1" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5"/>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="50%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <radialGradient id="glass-shine" cx="30%" cy="30%" r="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                    <filter id="ultra-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                </defs>

                <rect width="100%" height="100%" fill={pcbColor || '#059669'} />
                <rect width="100%" height="100%" fill="url(#pcb-grid)" />

                <path d="M 10 10 L 290 10 L 290 390 L 10 390 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10,5" />

                {localComponents.map((comp: any) => {
                    const isMC = isMicrocontroller(comp.type);
                    let pinCoords;
                    if (isMC) {
                        pinCoords = getMicrocontrollerPinCoords(comp.type, comp.pin, comp.x, comp.y);
                    } else {
                        pinCoords = getPinCoords(comp.pin);
                    }
                    
                    const isHigh = hardwareState.pins[comp.pin]; 
                    const wireColor = isHigh ? '#fbbf24' : 'rgba(255,255,255,0.6)';
                    
                    const startX = isMC ? pinCoords.x : comp.x + 10;
                    const startY = isMC ? pinCoords.y : comp.y + 10;
                    
                    return (
                        <g key={`wire-group-${comp.id}`}>
                            <path d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke="black" opacity="0.2" strokeWidth={isHigh ? 6 : 4} transform="translate(2, 3)" />
                            <path key={`wire-${comp.id}`} id={`wire-${comp.id}`} ref={(el) => { if(el) wireRefs.current.set(`wire-${comp.id}`, el); else wireRefs.current.delete(`wire-${comp.id}`); }} d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${(startY + pinCoords.y)/2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke={wireColor} strokeWidth={isHigh ? 4 : 3} strokeLinecap="round" className="transition-all duration-300" />
                        </g>
                    );
                })}

                <g transform="translate(150, 200)" filter="url(#comp-shadow)">
                    <rect x="-65" y="-30" width="130" height="60" rx="6" fill="#0066cc" stroke="#004499" strokeWidth="2" />
                    <rect x="-70" y="-15" width="20" height="15" rx="2" fill="url(#metal)" stroke="#475569" />
                    <rect x="-70" y="10" width="22" height="16" rx="2" fill="#1e293b" />
                    <circle cx="-50" cy="18" r="4" fill="#334155" />
                    <rect x="-5" y="-10" width="30" height="20" rx="2" fill="#1e293b" />
                    {[...Array(6)].map((_, i) => (
                        <g key={i}>
                            <rect x={-4 + i * 5} y="-13" width="2" height="4" fill="url(#metal)" />
                            <rect x={-4 + i * 5} y="9" width="2" height="4" fill="url(#metal)" />
                        </g>
                    ))}
                    <text x="10" y="2" textAnchor="middle" fontSize="3" fill="#94a3b8" fontWeight="bold">ATMEGA</text>
                    <g transform="translate(-55, -35)">
                        <rect x="0" y="0" width="112" height="10" fill="#1e293b" rx="1" />
                        {Array.from({length: 14}).map((_, i) => (
                            <g key={i} transform={`translate(${i * 8}, 0)`}>
                                <rect x="1" y="1" width="6" height="6" fill="#475569" rx="1" />
                                <text x="4" y="11" textAnchor="middle" fontSize="3" fill="white" opacity="0.7">D{i}</text>
                            </g>
                        ))}
                    </g>
                    <g transform="translate(-55, 30)">
                        <rect x="0" y="0" width="64" height="10" fill="#1e293b" rx="1" />
                        {Array.from({length: 8}).map((_, i) => (
                            <g key={i} transform={`translate(${i * 8}, 0)`}>
                                <rect x="1" y="1" width="6" height="6" fill="#475569" rx="1" />
                                <text x="4" y="-3" textAnchor="middle" fontSize="3" fill="white" opacity="0.7">A{i}</text>
                            </g>
                        ))}
                    </g>
                    <text x="0" y="-15" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.4)" fontWeight="black" letterSpacing="1">KIDCODE UNO</text>
                </g>

                {localComponents.map((comp: any) => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`} filter="url(#comp-shadow)" ref={(el) => { if(el) componentRefs.current.set(comp.id, el); else componentRefs.current.delete(comp.id); }} onPointerDown={(e) => { e.stopPropagation(); setDraggingCompId(comp.id); dragOffset.current = { x: e.nativeEvent.offsetX - comp.x, y: e.nativeEvent.offsetY - comp.y }; (e.target as Element).setPointerCapture(e.pointerId); }} onContextMenu={(e) => handleContextMenu(e, comp.id)} className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                        {comp.type.startsWith('LED') && (
                            <g>
                                <line x1="8" y1="15" x2="8" y2="25" stroke="url(#metal)" strokeWidth="1.5" />
                                <line x1="12" y1="15" x2="12" y2="25" stroke="url(#metal)" strokeWidth="1.5" />
                                <circle cx="10" cy="11" r="7.5" fill="rgba(0,0,0,0.2)" />
                                <circle cx="10" cy="11" r="6" fill={
                                    hardwareState.pins[comp.pin] ?
                                    (comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : '#22c55e') :
                                    (comp.type.includes('RED') ? '#7f1d1d' : comp.type.includes('BLUE') ? '#1e3a8a' : '#14532d')
                                } className="light-part" />
                                <circle cx="10" cy="11" r="6" fill="url(#glass-shine)" pointerEvents="none" />
                            </g>
                        )}

                        {comp.type === 'BUTTON' && (
                            <g>
                                <rect x="2" y="2" width="2" height="4" fill="url(#metal)" />
                                <rect x="16" y="2" width="2" height="4" fill="url(#metal)" />
                                <rect x="2" y="14" width="2" height="4" fill="url(#metal)" />
                                <rect x="16" y="14" width="2" height="4" fill="url(#metal)" />
                                <rect x="4" y="4" width="12" height="12" rx="1" fill="#1e293b" />
                                <circle cx="10" cy="10" r={hardwareState.pins[comp.pin] ? 3.5 : 4} fill={hardwareState.pins[comp.pin] ? "#b91c1c" : "#334155"} stroke="#000" strokeWidth="0.5" />
                                <circle cx="10" cy="10" r="3" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </g>
                        )}

                        {comp.type === 'POTENTIOMETER' && (
                            <g>
                                <circle cx="10" cy="10" r="9" fill="url(#metal)" stroke="#475569" strokeWidth="0.5" />
                                <rect x="7" y="18" width="6" height="5" fill="#1e293b" />
                                <circle cx="10" cy="10" r="7" fill="#334155" />
                                <g transform={`rotate(${(hardwareState.potentiometerValue / 1023) * 270 - 135} 10 10)`}>
                                    <rect x="9" y="3" width="2" height="4" fill="white" rx="0.5" />
                                </g>
                                <text x="10" y="25" textAnchor="middle" fontSize="3" fill="white" opacity="0.5">POT</text>
                            </g>
                        )}

                        {comp.type === 'FAN' && (
                            <g>
                                <circle cx="10" cy="10" r="10" fill="rgba(0,0,0,0.5)" />
                                <g className="fan-blades">
                                    <path d="M 10 2 Q 18 4 10 10 Q 18 8 10 18 Q 2 8 10 10 Q 2 4 10 2" fill="#94a3b8" />
                                </g>
                                <circle cx="10" cy="10" r="3" fill="#1e293b" stroke="url(#metal)" />
                            </g>
                        )}

                        {comp.type === 'ULTRASONIC' && (
                            <g transform="scale(0.3) translate(-50, -25)">
                                <rect x="0" y="0" width="100" height="50" rx="4" fill="#004d99" />
                                <circle cx="25" cy="25" r="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" />
                                <circle cx="75" cy="25" r="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" />
                                <text x="50" y="45" textAnchor="middle" fontSize="8" fill="white" opacity="0.5">ULTRASONIC</text>
                            </g>
                        )}

                        {comp.type === 'ARDUINO_NANO' && (
                          <g transform="translate(-8, -4)">
                            <rect x="0" y="0" width="16" height="38" rx="2" fill="#0071a0" stroke="#004499" />
                            <rect x="2" y="1" width="12" height="6" fill="url(#metal)" rx="1" />
                            <rect x="3" y="18" width="10" height="10" rx="1" fill="#1e293b" />
                            {Array.from({length: 4}).map((_, i) => (
                                <circle key={i} cx={4 + i * 2.5} cy="10" r="0.8" fill={i === 0 ? "#22c55e" : "#fbbf24"} />
                            ))}
                            <text x="8" y="34" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">NANO</text>
                          </g>
                        )}

                        {comp.type === 'ARDUINO_MEGA' && (
                          <g transform="translate(-15, -10)">
                            <rect x="0" y="0" width="30" height="55" rx="3" fill="#0066cc" stroke="#004499" />
                            <rect x="2" y="2" width="26" height="5" fill="#1e293b" rx="1" />
                            <rect x="2" y="48" width="26" height="5" fill="#1e293b" rx="1" />
                            <rect x="10" y="20" width="10" height="10" rx="1" fill="#1e293b" stroke="#000" />
                            <text x="15" y="35" textAnchor="middle" fontSize="4" fill="white" fontWeight="black">MEGA 2560</text>
                          </g>
                        )}

                        {comp.type === 'ESP32_DEVKIT' && (
                          <g transform="translate(-15, -10)">
                            <rect x="0" y="0" width="30" height="50" rx="2" fill="#1e293b" stroke="#000" />
                            <rect x="5" y="5" width="20" height="15" rx="1" fill="url(#metal)" />
                            <rect x="7" y="7" width="16" height="11" fill="none" stroke="rgba(0,0,0,0.1)" />
                            <text x="15" y="15" textAnchor="middle" fontSize="3" fill="#334155" fontWeight="bold">ESP32</text>
                            <path d="M 5 2 L 25 2 L 25 4 L 5 4 L 5 2" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
                            <text x="15" y="45" textAnchor="middle" fontSize="4" fill="white" opacity="0.3">DEVKIT</text>
                          </g>
                        )}

                        {comp.type === 'RASPBERRY_PI_4' && (
                          <g transform="translate(-30, -20)">
                            <rect x="0" y="0" width="60" height="45" rx="4" fill="#166534" stroke="#064e3b" />
                            <rect x="45" y="5" width="18" height="12" fill="url(#metal)" rx="1" />
                            <rect x="45" y="20" width="18" height="10" fill="#2563eb" rx="1" />
                            <rect x="45" y="32" width="18" height="10" fill="url(#metal)" rx="1" />
                            <rect x="15" y="15" width="15" height="15" rx="1" fill="#1e293b" />
                            <text x="30" y="42" textAnchor="middle" fontSize="4" fill="white" opacity="0.5" fontWeight="black">RASPBERRY PI 4</text>
                          </g>
                        )}

                        {comp.type === 'MICROBIT' && (
                          <g transform="translate(-15, -15)">
                            <rect x="0" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#000" />
                            <rect x="5" y="5" width="20" height="20" rx="1" fill="#000" />
                            {Array.from({length: 5}).map((_, r) => Array.from({length: 5}).map((_, c) => (
                                <circle key={`${r}-${c}`} cx={7.5 + c * 2.5} cy={7.5 + r * 2.5} r="0.8" fill="#334155" />
                            )))}
                            <text x="15" y="28" textAnchor="middle" fontSize="3" fill="#9ca3af">micro:bit</text>
                          </g>
                        )}

                        {comp.type === 'LCD' && (
                          <g transform="translate(-10, -5)">
                            <rect x="-10" y="-5" width="40" height="25" rx="2" fill="#1e3a8a" />
                            <rect x="-8" y="-3" width="36" height="16" rx="1" fill="#047857" />
                            <text x="10" y="8" textAnchor="middle" fontSize="5" fill="#6ee7b7" fontFamily="monospace">KIDCODE 1602</text>
                            <rect x="-8" y="16" width="36" height="2" fill="url(#metal)" />
                          </g>
                        )}

                        {comp.type === 'OLED' && (
                          <g transform="translate(-5, -5)">
                            <rect x="-5" y="-5" width="30" height="25" rx="1" fill="#1e293b" />
                            <rect x="-2" y="2" width="24" height="12" fill="#000" />
                            <text x="10" y="10" textAnchor="middle" fontSize="4" fill="#3b82f6" fontFamily="monospace">OLED 128x64</text>
                            {Array.from({length: 4}).map((_, i) => (
                              <circle key={i} cx={2 + i * 5} cy="-3" r="1.5" fill="url(#metal)" />
                            ))}
                          </g>
                        )}

                        {!comp.type.startsWith('LED') && comp.type !== 'BUTTON' && comp.type !== 'POTENTIOMETER' && comp.type !== 'FAN' && comp.type !== 'ULTRASONIC' && !isMicrocontroller(comp.type) && comp.type !== 'LCD' && comp.type !== 'OLED' && (
                          <g>
                            <rect x="0" y="0" width="20" height="20" rx="2" fill="#334155" />
                            <text x="10" y="12" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">{comp.type.slice(0,3)}</text>
                          </g>
                        )}
                        
                        <g transform="translate(20, 0)">
                            <circle r="4.5" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                            <text y="1.5" textAnchor="middle" fontSize="4.5" fill="#000" fontWeight="black">{comp.pin}</text>
                        </g>
                    </g>
                ))}
            </svg>

            {/* Pin Monitor (Oscilloscope) */}
            <div className="absolute bottom-2 left-2 right-2 h-16 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden pointer-events-none">
                <div className="absolute top-1 left-2 flex gap-4 text-[8px] font-black uppercase tracking-widest text-white/40">
                    <span className="text-red-400">PIN 0</span>
                    <span className="text-blue-400">PIN 1</span>
                    <span className="text-green-400">PIN 2</span>
                </div>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {[0, 1, 2].map(pinIdx => {
                        const colors = ['#ef4444', '#3b82f6', '#22c55e'];
                        const points = historyRef.current.map((h, i) => `${(i / 50) * 100},${h[pinIdx] ? 10 + pinIdx*8 : 25 + pinIdx*8}`).join(' ');
                        return <polyline key={pinIdx} points={points} fill="none" stroke={colors[pinIdx]} strokeWidth="1" opacity="0.8" />;
                    })}
                </svg>
            </div>
        </div>
    );
});

export default HardwareStage;
