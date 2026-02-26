
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

                if (comp.type === 'LASER' || comp.type === 'LASER_DIODE') {
                    const isOn = state.pins[comp.pin];
                    const beam = el.querySelector('.laser-beam');
                    if (beam) {
                        beam.setAttribute('opacity', isOn ? '0.8' : '0');
                    }
                }

                if (comp.type === 'RELAY' || comp.type === 'RELAY_MODULE') {
                    const isOn = state.pins[comp.pin];
                    const led = el.querySelector('.relay-led');
                    if (led) {
                        led.setAttribute('fill', isOn ? '#22c55e' : '#064e3b');
                    }
                }

                if (comp.type === 'BUTTON' || comp.type === 'BUTTON_TACTILE') {
                    const isPressed = state.pins[comp.pin];
                    const plunger = el.querySelector('.btn-plunger');
                    if (plunger) {
                        plunger.setAttribute('transform', isPressed ? 'translate(0, 1) scale(0.95)' : '');
                        plunger.setAttribute('fill', isPressed ? '#dc2626' : '#ef4444');
                    }
                }

                if (comp.type === 'SWITCH_TOGGLE') {
                    const isOn = state.pins[comp.pin];
                    const bat = el.querySelector('.toggle-bat');
                    if (bat) {
                        bat.setAttribute('transform', isOn ? 'rotate(30 10 10)' : 'rotate(-30 10 10)');
                    }
                }

                if (comp.type === 'SWITCH_SLIDE') {
                    const isOn = state.pins[comp.pin];
                    const slider = el.querySelector('.slide-knob');
                    if (slider) {
                        slider.setAttribute('transform', isOn ? 'translate(4, 0)' : 'translate(-4, 0)');
                    }
                }

                if (comp.type === 'BULB') {
                    const isOn = state.pins[comp.pin];
                    const glow = el.querySelector('.bulb-glow') as SVGCircleElement;
                    const filament = el.querySelector('.bulb-filament') as SVGPathElement;
                    if (glow) {
                        glow.setAttribute('opacity', isOn ? '0.8' : '0');
                    }
                    if (filament) {
                        filament.setAttribute('stroke', isOn ? '#fef08a' : '#525252');
                        filament.setAttribute('filter', isOn ? 'url(#ultra-glow)' : 'none');
                    }
                }

                if (comp.type === 'MOTOR_DC') {
                    const shaft = el.querySelector('.motor-shaft');
                    if (shaft && state.pins[comp.pin]) {
                        const currentRot = Number(shaft.getAttribute('data-rotation') || 0);
                        const newRot = (currentRot + 20) % 360;
                        shaft.setAttribute('transform', `rotate(${newRot} 10 10)`);
                        shaft.setAttribute('data-rotation', String(newRot));
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
        <div className="relative w-[300px] h-[400px] border-4 border-slate-700 bg-slate-800 rounded-xl shadow-2xl overflow-hidden select-none" ref={svgRef as any} onPointerMove={handleCompDragMove} onPointerUp={handleDragEnd} onDrop={(e) => { e.preventDefault(); try { const raw = e.dataTransfer.getData('application/json'); if (!raw) return; const tool = JSON.parse(raw); if (tool && tool.type) { onCircuitUpdate([...circuitComponents, { id: crypto.randomUUID(), type: tool.type, x: 150, y: 280, pin: tool.defaultPin || 0, rotation: 0 }]); playSoundEffect('click'); } } catch (e) { } }} onDragOver={(e) => e.preventDefault()}>

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
                        <circle cx="2" cy="2" r="1.2" fill="rgba(0,0,0,0.1)" />
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                    <filter id="comp-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="1" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
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
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id="bulb-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#fde047" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="plastic-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="metal-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
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
                            <path d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y) / 2}, ${pinCoords.x} ${(startY + pinCoords.y) / 2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke="black" opacity="0.2" strokeWidth={isHigh ? 6 : 4} transform="translate(2, 3)" />
                            <path key={`wire-${comp.id}`} id={`wire-${comp.id}`} ref={(el) => { if (el) wireRefs.current.set(`wire-${comp.id}`, el); else wireRefs.current.delete(`wire-${comp.id}`); }} d={`M ${startX} ${startY} C ${startX} ${(startY + pinCoords.y) / 2}, ${pinCoords.x} ${(startY + pinCoords.y) / 2}, ${pinCoords.x} ${pinCoords.y}`} fill="none" stroke={wireColor} strokeWidth={isHigh ? 4 : 3} strokeLinecap="round" className="transition-all duration-300" />
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
                        {Array.from({ length: 14 }).map((_, i) => (
                            <g key={i} transform={`translate(${i * 8}, 0)`}>
                                <rect x="1" y="1" width="6" height="6" fill="#475569" rx="1" />
                                <text x="4" y="11" textAnchor="middle" fontSize="3" fill="white" opacity="0.7">D{i}</text>
                            </g>
                        ))}
                    </g>
                    <g transform="translate(-55, 30)">
                        <rect x="0" y="0" width="64" height="10" fill="#1e293b" rx="1" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <g key={i} transform={`translate(${i * 8}, 0)`}>
                                <rect x="1" y="1" width="6" height="6" fill="#475569" rx="1" />
                                <text x="4" y="-3" textAnchor="middle" fontSize="3" fill="white" opacity="0.7">A{i}</text>
                            </g>
                        ))}
                    </g>
                    <text x="0" y="-15" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.4)" fontWeight="black" letterSpacing="1">KIDCODE UNO</text>
                </g>

                {localComponents.map((comp: any) => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0} 10 10)`} filter="url(#comp-shadow)" ref={(el) => { if (el) componentRefs.current.set(comp.id, el); else componentRefs.current.delete(comp.id); }} onPointerDown={(e) => { e.stopPropagation(); setDraggingCompId(comp.id); dragOffset.current = { x: e.nativeEvent.offsetX - comp.x, y: e.nativeEvent.offsetY - comp.y }; (e.target as Element).setPointerCapture(e.pointerId); }} onContextMenu={(e) => handleContextMenu(e, comp.id)} className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                        {comp.type.startsWith('LED') && comp.type !== 'RGB_LED' && comp.type !== 'RGB_STRIP' && (
                            <g>
                                {/* Metal Legs */}
                                <path d="M 8 15 L 8 28" stroke="url(#metal)" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M 12 15 L 12 30" stroke="url(#metal)" strokeWidth="1.5" strokeLinecap="round" />
                                {/* Bottom Plastic Rim */}
                                <ellipse cx="10" cy="15" rx="7.5" ry="2" fill="rgba(0,0,0,0.3)" />
                                {/* Main Dome Base */}
                                <path d="M 3 15 Q 3 2 10 2 Q 17 2 17 15 Z" fill={
                                    hardwareState.pins[comp.pin] ?
                                        (comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : comp.type.includes('YELLOW') ? '#eab308' : comp.type.includes('ORANGE') ? '#f97316' : comp.type.includes('WHITE') ? '#f8fafc' : '#22c55e') :
                                        (comp.type.includes('RED') ? '#7f1d1d' : comp.type.includes('BLUE') ? '#1e3a8a' : comp.type.includes('YELLOW') ? '#713f12' : comp.type.includes('ORANGE') ? '#7c2d12' : comp.type.includes('WHITE') ? '#94a3b8' : '#14532d')
                                } className="light-part" />
                                {/* Inner Anvil/Post (Realism) */}
                                <path d="M 8 15 L 8 8 L 10 8 L 10 15 Z" fill="rgba(0,0,0,0.4)" />
                                <path d="M 12 15 L 12 10 L 11 10 L 11 15 Z" fill="rgba(0,0,0,0.4)" />
                                {/* Glass Shine/Reflection */}
                                <path d="M 4 14 Q 4 4 9 3 Q 6 4 6 12 Z" fill="white" opacity="0.6" className="pointer-events-none" />
                            </g>
                        )}

                        {comp.type === 'BULB' && (
                            <g transform="translate(0, -10)">
                                {/* Screw Base */}
                                <rect x="5" y="22" width="10" height="8" fill="url(#metal-dark)" rx="1" />
                                <path d="M 4 23 L 16 24 M 4 25 L 16 26 M 4 27 L 16 28 M 4 29 L 16 30" stroke="#334155" strokeWidth="0.5" />
                                <path d="M 8 30 L 12 30 L 11 32 L 9 32 Z" fill="#1e293b" />
                                {/* Glass Dome Outline */}
                                <path d="M 5 22 C 3 15 -2 10 10 0 C 22 10 17 15 15 22 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                                {/* Inner Stem */}
                                <path d="M 9 22 L 9 12 M 11 22 L 11 12" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                {/* Filament */}
                                <path d="M 8 10 L 9 12 L 11 12 L 12 10" stroke="#525252" strokeWidth="0.5" fill="none" className="bulb-filament" />
                                {/* Glow Effect */}
                                <circle cx="10" cy="10" r="15" fill="url(#bulb-glow)" opacity="0" className="bulb-glow pointer-events-none" />
                                {/* Glass Reflection */}
                                <path d="M 3 15 C 2 10 4 5 8 2 C 5 4 4 9 5 14" fill="white" opacity="0.5" />
                            </g>
                        )}

                        {(comp.type === 'BUTTON' || comp.type === 'BUTTON_TACTILE') && (
                            <g>
                                {/* Metal Legs */}
                                <path d="M -2 2 L 2 2 L 2 5 M 22 2 L 18 2 L 18 5 M -2 18 L 2 18 L 2 15 M 22 18 L 18 18 L 18 15" stroke="url(#metal)" strokeWidth="1.5" fill="none" />
                                {/* Plastic Body */}
                                <rect x="2" y="2" width="16" height="16" rx="2" fill="url(#plastic-dark)" stroke="#0f172a" strokeWidth="0.5" />
                                {/* Plunger Base */}
                                <circle cx="10" cy="10" r="6" fill="#1e293b" />
                                {/* Plunger (Red) */}
                                <circle cx="10" cy="10" r="4.5" fill="#ef4444" className="btn-plunger transition-transform duration-75" style={{ transformOrigin: '10px 10px' }} />
                                {/* Highlight */}
                                <circle cx="9" cy="9" r="2" fill="white" opacity="0.3" pointerEvents="none" />
                            </g>
                        )}

                        {comp.type === 'SWITCH_TOGGLE' && (
                            <g>
                                {/* Metal Sub-base */}
                                <rect x="4" y="14" width="12" height="6" fill="#1e293b" rx="1" />
                                {/* Threaded Base */}
                                <rect x="6" y="8" width="8" height="6" fill="url(#metal-dark)" />
                                <path d="M 6 9 L 14 9 M 6 11 L 14 11 M 6 13 L 14 13" stroke="#334155" strokeWidth="0.5" />
                                {/* Hex Nut */}
                                <path d="M 5 14 L 15 14 L 14 16 L 6 16 Z" fill="url(#metal)" />
                                {/* Bat Handle */}
                                <g className="toggle-bat transition-transform duration-100" transform={hardwareState.pins[comp.pin] ? 'rotate(30 10 10)' : 'rotate(-30 10 10)'}>
                                    <path d="M 8 8 L 12 8 L 11 -2 L 9 -2 Z" fill="url(#metal)" />
                                    <circle cx="10" cy="-2" r="1.5" fill="url(#metal)" />
                                </g>
                                {/* Pins */}
                                <path d="M 6 20 L 6 24 M 10 20 L 10 24 M 14 20 L 14 24" stroke="url(#metal)" strokeWidth="1.5" />
                            </g>
                        )}

                        {comp.type === 'SWITCH_SLIDE' && (
                            <g>
                                {/* Metal Casing */}
                                <rect x="2" y="6" width="16" height="8" fill="url(#metal-dark)" rx="1" stroke="#334155" />
                                {/* Inner track */}
                                <rect x="4" y="8" width="12" height="4" fill="#0f172a" rx="1" />
                                {/* Plastic Slider */}
                                <g className="slide-knob transition-transform duration-100" transform={hardwareState.pins[comp.pin] ? 'translate(4, 0)' : 'translate(-4, 0)'}>
                                    <rect x="8" y="7" width="4" height="6" fill="#1e293b" rx="0.5" />
                                    <line x1="10" y1="8" x2="10" y2="12" stroke="#475569" strokeWidth="0.5" />
                                </g>
                                {/* Pins */}
                                <path d="M 5 2 L 5 6 M 10 2 L 10 6 M 15 2 L 15 6" stroke="url(#metal)" strokeWidth="1.5" />
                            </g>
                        )}

                        {comp.type === 'POTENTIOMETER' && (
                            <g>
                                {/* Pins */}
                                <path d="M 4 20 L 4 25 M 10 20 L 10 25 M 16 20 L 16 25" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* Metal Base */}
                                <circle cx="10" cy="10" r="9" fill="url(#metal-dark)" stroke="#475569" strokeWidth="0.5" />
                                <rect x="7" y="16" width="6" height="4" fill="#1e293b" />
                                {/* Shadow/Recess */}
                                <circle cx="10" cy="10" r="7.5" fill="#0f172a" />
                                {/* Plastic Knob */}
                                <g transform={`rotate(${(hardwareState.potentiometerValue / 1023) * 270 - 135} 10 10)`}>
                                    <circle cx="10" cy="10" r="7" fill="#1e293b" />
                                    {/* Knurls */}
                                    {[...Array(12)].map((_, i) => (
                                        <line key={i} x1="10" y1="3" x2="10" y2="4.5" stroke="#475569" strokeWidth="0.5" transform={`rotate(${i * 30} 10 10)`} />
                                    ))}
                                    {/* Indicator */}
                                    <rect x="9.5" y="4" width="1" height="4" fill="white" />
                                </g>
                            </g>
                        )}

                        {comp.type === 'FAN' && (
                            <g>
                                {/* Black Casing */}
                                <rect x="-2" y="-2" width="24" height="24" rx="2" fill="url(#plastic-dark)" />
                                {/* Mounting Holes */}
                                <circle cx="1" cy="1" r="1.5" fill="#000" />
                                <circle cx="19" cy="1" r="1.5" fill="#000" />
                                <circle cx="1" cy="19" r="1.5" fill="#000" />
                                <circle cx="19" cy="19" r="1.5" fill="#000" />
                                {/* Inner Cutout */}
                                <circle cx="10" cy="10" r="10" fill="#000" />
                                {/* Central Frame lines */}
                                <path d="M 10 10 L -2 -2 M 10 10 L 22 -2 M 10 10 L -2 22 M 10 10 L 22 22" stroke="#1e293b" strokeWidth="1" />
                                {/* Spinning Blades */}
                                <g className="fan-blades" style={{ transformOrigin: '10px 10px' }}>
                                    {[0, 72, 144, 216, 288].map(angle => (
                                        <path key={angle} d="M 10 8 C 15 3 20 8 18 10 C 16 12 12 10 10 10 Z" fill="#334155" transform={`rotate(${angle} 10 10)`} />
                                    ))}
                                    {/* Central Motor Hub */}
                                    <circle cx="10" cy="10" r="3.5" fill="#1e293b" />
                                    <circle cx="10" cy="10" r="2" fill="url(#metal)" />
                                </g>
                            </g>
                        )}

                        {comp.type === 'MOTOR_DC' && (
                            <g>
                                {/* Metal Casing */}
                                <rect x="2" y="-5" width="16" height="25" fill="url(#metal-dark)" rx="8" />
                                <path d="M 5 -5 L 15 -5" stroke="url(#metal)" strokeWidth="2" />
                                {/* Pins */}
                                <path d="M 6 20 L 6 24 M 14 20 L 14 24" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* Vents */}
                                <line x1="5" y1="5" x2="15" y2="5" stroke="#1e293b" strokeWidth="1" />
                                <line x1="5" y1="10" x2="15" y2="10" stroke="#1e293b" strokeWidth="1" />
                                {/* Spinning Shaft */}
                                <g className="motor-shaft text-cyan-600" style={{ transformOrigin: '10px -7px' }}>
                                    <rect x="9" y="-12" width="2" height="7" fill="url(#metal)" />
                                    <rect x="8.5" y="-12" width="3" height="1" fill="#1e293b" />
                                </g>
                            </g>
                        )}

                        {comp.type === 'BUZZER' && (
                            <g>
                                {/* Pins */}
                                <path d="M 8 20 L 8 25 M 12 20 L 12 25" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* Plastic Cylinder */}
                                <circle cx="10" cy="10" r="9" fill="#0f172a" />
                                <circle cx="10" cy="10" r="7" fill="#1e293b" />
                                {/* Sound Hole */}
                                <circle cx="10" cy="10" r="2" fill="#000" />
                                {/* Positive marking */}
                                <path d="M 13 4 L 17 4 M 15 2 L 15 6" stroke="#ef4444" strokeWidth="1" />
                                {/* Remove sticker (aesthetic) */}
                                <rect x="5" y="7" width="10" height="6" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" opacity="0.8" transform="rotate(-15 10 10)" />
                                <text x="10" y="11" textAnchor="middle" fontSize="2" fontWeight="bold" transform="rotate(-15 10 10)">REMOVE</text>
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
                                {Array.from({ length: 4 }).map((_, i) => (
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
                                {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => (
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
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <circle key={i} cx={2 + i * 5} cy="-3" r="1.5" fill="url(#metal)" />
                                ))}
                            </g>
                        )}

                        {comp.type === 'RESISTOR' && (
                            <g>
                                {/* Wire Leads */}
                                <path d="M 2 10 L 6 10 M 14 10 L 18 10" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* Beige Body */}
                                <rect x="5" y="7" width="10" height="6" rx="2" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="0.5" />
                                {/* Color Bands (Brown, Black, Red, Gold = 1k Ohm typical) */}
                                <rect x="6" y="7" width="1" height="6" fill="#78350f" />
                                <rect x="8" y="7" width="1" height="6" fill="#000" />
                                <rect x="10" y="7" width="1" height="6" fill="#dc2626" />
                                <rect x="13" y="7" width="1" height="6" fill="#eab308" />
                            </g>
                        )}

                        {comp.type === 'BATTERY_9V' && (
                            <g transform="translate(0, -5)">
                                {/* Rectangular Body */}
                                <rect x="4" y="8" width="12" height="20" rx="1" fill="#1e293b" />
                                <rect x="4" y="16" width="12" height="12" rx="1" fill="#fbbf24" />
                                <text x="10" y="25" textAnchor="middle" fontSize="4" fill="#000" fontWeight="black">9V</text>
                                {/* Terminals */}
                                <circle cx="7" cy="6" r="1.5" fill="url(#metal-dark)" />
                                <circle cx="13" cy="6" r="2" fill="url(#metal)" stroke="#475569" strokeWidth="0.5" />
                            </g>
                        )}

                        {comp.type === 'BATTERY_AA' && (
                            <g transform="translate(-5, -10)">
                                {/* Cylindrical Body */}
                                <rect x="10" y="8" width="10" height="25" rx="1" fill="#1e293b" />
                                <rect x="10" y="20" width="10" height="13" rx="1" fill="#ef4444" />
                                {/* Positive Nub */}
                                <rect x="13" y="6" width="4" height="2" rx="0.5" fill="url(#metal)" />
                                <text x="15" y="30" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">AA</text>
                                <text x="15" y="16" textAnchor="middle" fontSize="5" fill="white">+</text>
                            </g>
                        )}

                        {(comp.type === 'SERVO' || comp.type === 'SERVO_CONTINUOUS') && (
                            <g>
                                {/* Blue Plastic Case */}
                                <rect x="3" y="6" width="14" height="18" rx="1" fill="#2563eb" />
                                {/* Mounting Tabs */}
                                <rect x="1" y="12" width="2" height="6" rx="0.5" fill="#2563eb" />
                                <rect x="17" y="12" width="2" height="6" rx="0.5" fill="#2563eb" />
                                <circle cx="2" cy="15" r="0.8" fill="#0f172a" />
                                <circle cx="18" cy="15" r="0.8" fill="#0f172a" />
                                {/* Wire lead out */}
                                <path d="M 10 24 L 10 26 C 10 28, 8 28, 8 30" stroke="#facc15" strokeWidth="1" fill="none" />
                                {/* Gear Hub */}
                                <circle cx="10" cy="8" r="4" fill="#1e293b" />
                                {/* Servo Arm (Animates) */}
                                <g className="servo-arm transition-transform duration-200" style={{ transformOrigin: '10px 8px' }} transform={`rotate(${hardwareState.servoAngle || 90} 10 8)`}>
                                    <path d="M 8 8 L 12 8 L 11 1 L 9 1 Z" fill="#f8fafc" />
                                    <circle cx="10" cy="8" r="2.5" fill="#f8fafc" />
                                    <circle cx="10" cy="8" r="1" fill="url(#metal)" />
                                    <circle cx="10" cy="3" r="0.5" fill="url(#metal)" />
                                </g>
                            </g>
                        )}

                        {comp.type === 'LIGHT_SENSOR' && (
                            <g>
                                {/* Metal Legs */}
                                <path d="M 8 15 L 8 20 M 12 15 L 12 20" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* LDR Head */}
                                <circle cx="10" cy="10" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                                {/* Photocadmium track */}
                                <path d="M 6 10 C 7 8, 8 12, 10 10 C 12 8, 13 12, 14 10" stroke="#a16207" strokeWidth="1" strokeLinecap="round" fill="none" />
                                <path d="M 6 8 C 7 6, 8 10, 10 8 C 12 6, 13 10, 14 8" stroke="#a16207" strokeWidth="1" strokeLinecap="round" fill="none" />
                                <path d="M 6 12 C 7 10, 8 14, 10 12 C 12 10, 13 14, 14 12" stroke="#a16207" strokeWidth="1" strokeLinecap="round" fill="none" />
                            </g>
                        )}

                        {(comp.type === 'DHT11' || comp.type === 'DHT22') && (
                            <g>
                                {/* Blue/White Grid Body */}
                                <rect x="2" y="2" width="16" height="16" rx="1" fill={comp.type === 'DHT11' ? "#0ea5e9" : "#f8fafc"} stroke={comp.type === 'DHT11' ? "#0284c7" : "#cbd5e1"} strokeWidth="1" />
                                {/* Grille */}
                                {[...Array(6)].map((_, i) => (
                                    <line key={i} x1="4" y1={4 + i * 2.5} x2="16" y2={4 + i * 2.5} stroke={comp.type === 'DHT11' ? "#0369a1" : "#94a3b8"} strokeWidth="1" />
                                ))}
                                {/* Pins */}
                                <path d="M 4 18 L 4 22 M 8 18 L 8 22 M 12 18 L 12 22 M 16 18 L 16 22" stroke="url(#metal)" strokeWidth="1.5" />
                            </g>
                        )}

                        {(comp.type === 'RELAY' || comp.type === 'RELAY_MODULE') && (
                            <g>
                                {/* PCB Base */}
                                <rect x="0" y="0" width="20" height="30" rx="1" fill="#ef4444" />
                                {/* Blue Cube (Relay itself) */}
                                <rect x="2" y="2" width="16" height="18" rx="1" fill="#2563eb" />
                                {/* Terminals */}
                                <path d="M 4 22 L 16 22 M 4 25 L 16 25 M 4 28 L 16 28" stroke="url(#metal)" strokeWidth="1.5" />
                                <rect x="3" y="21" width="14" height="8" fill="#1e293b" />
                                <circle cx="5" cy="23" r="1.5" fill="url(#metal)" />
                                <circle cx="10" cy="25" r="1.5" fill="url(#metal)" />
                                <circle cx="15" cy="27" r="1.5" fill="url(#metal)" />
                                {/* Status LED */}
                                <circle cx="10" cy="11" r="1.5" fill="#064e3b" className="relay-led" />
                                <text x="10" y="7" textAnchor="middle" fontSize="3" fill="white" opacity="0.8">5V RELAY</text>
                            </g>
                        )}

                        {(comp.type === 'LASER' || comp.type === 'LASER_DIODE') && (
                            <g>
                                {/* Brass Body */}
                                <rect x="6" y="8" width="8" height="12" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
                                <rect x="7" y="6" width="6" height="2" fill="#d97706" />
                                {/* Pin Base */}
                                <rect x="5" y="20" width="10" height="4" fill="#1e293b" />
                                <path d="M 7 24 L 7 28 M 13 24 L 13 28" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* Lens */}
                                <circle cx="10" cy="5" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
                                {/* Glow / Beam */}
                                <path d="M 10 2 L 5 -50 L 15 -50 Z" fill="url(#bulb-glow)" className="laser-beam pointer-events-none" opacity="0" style={{ mixBlendMode: 'screen' }} />
                            </g>
                        )}

                        {(comp.type === 'PUMP' || comp.type === 'MOTOR_PUMP') && (
                            <g>
                                {/* Main Body */}
                                <rect x="4" y="6" width="12" height="18" rx="6" fill="#f8fafc" stroke="#94a3b8" />
                                {/* Inlet / Outlet nozzles */}
                                <rect x="8" y="0" width="4" height="6" fill="#f8fafc" stroke="#94a3b8" />
                                <rect x="0" y="10" width="4" height="4" fill="#f8fafc" stroke="#94a3b8" />
                                {/* Motor Cap */}
                                <rect x="5" y="24" width="10" height="4" rx="1" fill="#1e293b" />
                                <path d="M 8 28 L 8 32 M 12 28 L 12 32" stroke="url(#metal)" strokeWidth="1.5" />
                                {/* Decorative lines */}
                                <circle cx="10" cy="15" r="4" fill="#e2e8f0" stroke="#cbd5e1" />
                            </g>
                        )}

                        {!comp.type.startsWith('LED') && comp.type !== 'BUTTON' && comp.type !== 'BUTTON_TACTILE' && comp.type !== 'POTENTIOMETER' && comp.type !== 'FAN' && comp.type !== 'ULTRASONIC' && !isMicrocontroller(comp.type) && comp.type !== 'LCD' && comp.type !== 'OLED' && comp.type !== 'SWITCH_TOGGLE' && comp.type !== 'SWITCH_SLIDE' && comp.type !== 'BULB' && comp.type !== 'MOTOR_DC' && comp.type !== 'BUZZER' && comp.type !== 'RESISTOR' && comp.type !== 'BATTERY_9V' && comp.type !== 'BATTERY_AA' && comp.type !== 'SERVO' && comp.type !== 'SERVO_CONTINUOUS' && comp.type !== 'LIGHT_SENSOR' && comp.type !== 'DHT11' && comp.type !== 'DHT22' && comp.type !== 'RELAY' && comp.type !== 'RELAY_MODULE' && comp.type !== 'LASER' && comp.type !== 'LASER_DIODE' && comp.type !== 'PUMP' && comp.type !== 'MOTOR_PUMP' && (


                            <g>
                                <rect x="0" y="0" width="20" height="20" rx="2" fill="#334155" />
                                <text x="10" y="12" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">{comp.type.slice(0, 3)}</text>
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
                        const points = historyRef.current.map((h, i) => `${(i / 50) * 100},${h[pinIdx] ? 10 + pinIdx * 8 : 25 + pinIdx * 8}`).join(' ');
                        return <polyline key={pinIdx} points={points} fill="none" stroke={colors[pinIdx]} strokeWidth="1" opacity="0.8" />;
                    })}
                </svg>
            </div>
        </div>
    );
});

export default HardwareStage;
