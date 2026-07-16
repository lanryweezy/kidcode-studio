
import React, { useEffect, useRef, useState } from 'react';
import { HardwareState, CircuitComponent } from '../types';
import { playSoundEffect } from '../services/soundService';
import { serialService } from '../services/webSerialService';
import { useStore } from '../store/useStore';
import { Usb, Cpu, Lightbulb, ArrowDown } from 'lucide-react';
import { ComponentRenderers } from './hardware/ComponentRenderers';
import { WireRouting } from './hardware/WireRouting';
import { MonitorOverlays } from './hardware/MonitorOverlays';
import { isMicrocontroller } from './hardware/PinManager';
import { useToast } from './ui/Toast';

interface HardwareStageProps {
    hardwareState: HardwareState;
    hardwareStateRef?: React.MutableRefObject<HardwareState>;
    circuitComponents: CircuitComponent[];
    pcbColor: string;
    onCircuitUpdate: (components: CircuitComponent[]) => void;
    isExecuting: boolean;
    onHardwareInput: (pin: number, value: any) => void;
    wires?: any[];
    onWiresUpdate?: (wires: any[]) => void;
}

const HardwareStage: React.FC<HardwareStageProps> = React.memo(({
    hardwareState,
    hardwareStateRef,
    circuitComponents,
    pcbColor,
    onCircuitUpdate,
    isExecuting,
    onHardwareInput,
    wires,
    onWiresUpdate
}) => {
    const { isBoardConnected, setIsBoardConnected } = useStore();
    const { toast } = useToast();
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
                toast('warning', 'Could not connect to board. Make sure you use a compatible browser (Chrome/Edge) and have a board plugged in!');
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

            let currentPowerDraw = 0;
            circuitComponents.forEach(comp => {
                if (state.pins[comp.pin]) {
                    if (comp.type === 'MOTOR_DC') {
                        currentPowerDraw += 50 + (state.motorLoad || 0) * 2;
                    } else if (comp.type.startsWith('LED')) {
                        currentPowerDraw += 20;
                    } else if (comp.type === 'BUZZER') {
                        currentPowerDraw += 30;
                    } else {
                        currentPowerDraw += 10;
                    }
                }
            });
            currentPowerDraw += 45;

            if (state.powerDraw === undefined || Math.abs(state.powerDraw - currentPowerDraw) > 5) {
                setTimeout(() => {
                    onHardwareInput(-1, { type: 'powerDraw', value: currentPowerDraw });
                }, 0);
            }

            const currentPins = [state.pins[0] ? 1 : 0, state.pins[1] ? 1 : 0, state.pins[2] ? 1 : 0];
            historyRef.current = [...historyRef.current.slice(-50), currentPins];

            let totalVoltage = 0;
            let maxCurrent = 0;
            let minResistance = 9999;
            let hasShort = false;

            let numActive = 0;
            circuitComponents.forEach(comp => {
                if (state.pins[comp.pin]) {
                    numActive++;
                    totalVoltage = 5.0;
                    maxCurrent += 0.02;
                    if (comp.type === 'MOTOR_DC') maxCurrent += 0.1;
                }
            });

            if (numActive > 5) {
                hasShort = true;
                maxCurrent = 2.5;
            }

            minResistance = maxCurrent > 0 ? totalVoltage / maxCurrent : 9999;

            if (state.multimeterVoltage !== totalVoltage ||
                state.multimeterCurrent !== maxCurrent ||
                state.isShortCircuit !== hasShort) {
                setTimeout(() => {
                    onHardwareInput(-1, { type: 'multimeter', value: { v: totalVoltage, i: maxCurrent, r: minResistance, short: hasShort } });
                }, 0);
            }

            wireRefs.current.forEach((path, id) => {
                const comp = circuitComponents.find((c: any) => `wire-${c.id}` === id);
                if (comp) {
                    const isActive = state.pins[comp.pin];
                    if (isActive) {
                        path.classList.add('wire-active');
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

                if (comp.type.startsWith('LED')) {
                    const isOn = state.pins[comp.pin];
                    const lightCircle = el.querySelector('.light-part') as SVGCircleElement;
                    if (lightCircle) {
                        const color = comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : '#22c55e';
                        lightCircle.setAttribute('fill', isOn ? color : '#334155');

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
                        const load = state.motorLoad || 0;
                        const speed = Math.max(1, 20 - (load * 0.15));

                        const currentRot = Number(shaft.getAttribute('data-rotation') || 0);
                        const newRot = (currentRot + speed) % 360;
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

                {/* Empty State - No Components */}
                {localComponents.length === 0 && (
                    <g transform="translate(150, 200)" className="pointer-events-none">
                        <Cpu size={32} className="text-white/20 mx-auto mb-3" />
                        <text x="0" y="45" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontWeight="bold">No Components Yet</text>
                        <text x="0" y="60" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.25)">Drag parts from the sidebar</text>
                        <ArrowDown size={16} className="text-white/20 mx-auto mt-2" />
                    </g>
                )}

                <WireRouting localComponents={localComponents} hardwareState={hardwareState} wireRefs={wireRefs} />

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
                        <ComponentRenderers comp={comp} hardwareState={hardwareState} onHardwareInput={onHardwareInput} />
                    </g>
                ))}
            </svg>

            <MonitorOverlays hardwareState={hardwareState} historyRef={historyRef} />
        </div>
    );
});

export default HardwareStage;
