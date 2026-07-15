import React from 'react';
import { HardwareState } from '../../types';
import { isMicrocontroller } from './PinManager';

interface ComponentRenderersProps {
    comp: any;
    hardwareState: HardwareState;
    onHardwareInput: (pin: number, value: any) => void;
}

export const ComponentRenderers: React.FC<ComponentRenderersProps> = ({ comp, hardwareState, onHardwareInput }) => {
    return (
        <>
            {comp.type.startsWith('LED') && comp.type !== 'RGB_LED' && comp.type !== 'RGB_STRIP' && (
                <g>
                    <path d="M 8 15 L 8 28" stroke="url(#metal)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 12 15 L 12 30" stroke="url(#metal)" strokeWidth="1.5" strokeLinecap="round" />
                    <ellipse cx="10" cy="15" rx="7.5" ry="2" fill="rgba(0,0,0,0.3)" />
                    <path d="M 3 15 Q 3 2 10 2 Q 17 2 17 15 Z" fill={
                        hardwareState.pins[comp.pin] ?
                            (comp.type.includes('RED') ? '#ef4444' : comp.type.includes('BLUE') ? '#3b82f6' : comp.type.includes('YELLOW') ? '#eab308' : comp.type.includes('ORANGE') ? '#f97316' : comp.type.includes('WHITE') ? '#f8fafc' : '#22c55e') :
                            (comp.type.includes('RED') ? '#7f1d1d' : comp.type.includes('BLUE') ? '#1e3a8a' : comp.type.includes('YELLOW') ? '#713f12' : comp.type.includes('ORANGE') ? '#7c2d12' : comp.type.includes('WHITE') ? '#94a3b8' : '#14532d')
                    } className="light-part" />
                    <path d="M 8 15 L 8 8 L 10 8 L 10 15 Z" fill="rgba(0,0,0,0.4)" />
                    <path d="M 12 15 L 12 10 L 11 10 L 11 15 Z" fill="rgba(0,0,0,0.4)" />
                    <path d="M 4 14 Q 4 4 9 3 Q 6 4 6 12 Z" fill="white" opacity="0.6" className="pointer-events-none" />
                </g>
            )}

            {comp.type === 'BULB' && (
                <g transform="translate(0, -10)">
                    <rect x="5" y="22" width="10" height="8" fill="url(#metal-dark)" rx="1" />
                    <path d="M 4 23 L 16 24 M 4 25 L 16 26 M 4 27 L 16 28 M 4 29 L 16 30" stroke="#334155" strokeWidth="0.5" />
                    <path d="M 8 30 L 12 30 L 11 32 L 9 32 Z" fill="#1e293b" />
                    <path d="M 5 22 C 3 15 -2 10 10 0 C 22 10 17 15 15 22 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                    <path d="M 9 22 L 9 12 M 11 22 L 11 12" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <path d="M 8 10 L 9 12 L 11 12 L 12 10" stroke="#525252" strokeWidth="0.5" fill="none" className="bulb-filament" />
                    <circle cx="10" cy="10" r="15" fill="url(#bulb-glow)" opacity="0" className="bulb-glow pointer-events-none" />
                    <path d="M 3 15 C 2 10 4 5 8 2 C 5 4 4 9 5 14" fill="white" opacity="0.5" />
                </g>
            )}

            {(comp.type === 'BUTTON' || comp.type === 'BUTTON_TACTILE') && (
                <g>
                    <path d="M -2 2 L 2 2 L 2 5 M 22 2 L 18 2 L 18 5 M -2 18 L 2 18 L 2 15 M 22 18 L 18 18 L 18 15" stroke="url(#metal)" strokeWidth="1.5" fill="none" />
                    <rect x="2" y="2" width="16" height="16" rx="2" fill="url(#plastic-dark)" stroke="#0f172a" strokeWidth="0.5" />
                    <circle cx="10" cy="10" r="6" fill="#1e293b" />
                    <circle cx="10" cy="10" r="4.5" fill="#ef4444" className="btn-plunger transition-transform duration-75" style={{ transformOrigin: '10px 10px' }} />
                    <circle cx="9" cy="9" r="2" fill="white" opacity="0.3" pointerEvents="none" />
                </g>
            )}

            {comp.type === 'SWITCH_TOGGLE' && (
                <g>
                    <rect x="4" y="14" width="12" height="6" fill="#1e293b" rx="1" />
                    <rect x="6" y="8" width="8" height="6" fill="url(#metal-dark)" />
                    <path d="M 6 9 L 14 9 M 6 11 L 14 11 M 6 13 L 14 13" stroke="#334155" strokeWidth="0.5" />
                    <path d="M 5 14 L 15 14 L 14 16 L 6 16 Z" fill="url(#metal)" />
                    <g className="toggle-bat transition-transform duration-100" transform={hardwareState.pins[comp.pin] ? 'rotate(30 10 10)' : 'rotate(-30 10 10)'}>
                        <path d="M 8 8 L 12 8 L 11 -2 L 9 -2 Z" fill="url(#metal)" />
                        <circle cx="10" cy="-2" r="1.5" fill="url(#metal)" />
                    </g>
                    <path d="M 6 20 L 6 24 M 10 20 L 10 24 M 14 20 L 14 24" stroke="url(#metal)" strokeWidth="1.5" />
                </g>
            )}

            {comp.type === 'SWITCH_SLIDE' && (
                <g>
                    <rect x="2" y="6" width="16" height="8" fill="url(#metal-dark)" rx="1" stroke="#334155" />
                    <rect x="4" y="8" width="12" height="4" fill="#0f172a" rx="1" />
                    <g className="slide-knob transition-transform duration-100" transform={hardwareState.pins[comp.pin] ? 'translate(4, 0)' : 'translate(-4, 0)'}>
                        <rect x="8" y="7" width="4" height="6" fill="#1e293b" rx="0.5" />
                        <line x1="10" y1="8" x2="10" y2="12" stroke="#475569" strokeWidth="0.5" />
                    </g>
                    <path d="M 5 2 L 5 6 M 10 2 L 10 6 M 15 2 L 15 6" stroke="url(#metal)" strokeWidth="1.5" />
                </g>
            )}

            {comp.type === 'POTENTIOMETER' && (
                <g>
                    <path d="M 4 20 L 4 25 M 10 20 L 10 25 M 16 20 L 16 25" stroke="url(#metal)" strokeWidth="1.5" />
                    <circle cx="10" cy="10" r="9" fill="url(#metal-dark)" stroke="#475569" strokeWidth="0.5" />
                    <rect x="7" y="16" width="6" height="4" fill="#1e293b" />
                    <circle cx="10" cy="10" r="7.5" fill="#0f172a" />
                    <g transform={`rotate(${(hardwareState.potentiometerValue / 1023) * 270 - 135} 10 10)`}>
                        <circle cx="10" cy="10" r="7" fill="#1e293b" />
                        {[...Array(12)].map((_, i) => (
                            <line key={i} x1="10" y1="3" x2="10" y2="4.5" stroke="#475569" strokeWidth="0.5" transform={`rotate(${i * 30} 10 10)`} />
                        ))}
                        <rect x="9.5" y="4" width="1" height="4" fill="white" />
                    </g>
                </g>
            )}

            {comp.type === 'FAN' && (
                <g>
                    <rect x="-2" y="-2" width="24" height="24" rx="2" fill="url(#plastic-dark)" />
                    <circle cx="1" cy="1" r="1.5" fill="#000" />
                    <circle cx="19" cy="1" r="1.5" fill="#000" />
                    <circle cx="1" cy="19" r="1.5" fill="#000" />
                    <circle cx="19" cy="19" r="1.5" fill="#000" />
                    <circle cx="10" cy="10" r="10" fill="#000" />
                    <path d="M 10 10 L -2 -2 M 10 10 L 22 -2 M 10 10 L -2 22 M 10 10 L 22 22" stroke="#1e293b" strokeWidth="1" />
                    <g className="fan-blades" style={{ transformOrigin: '10px 10px' }}>
                        {[0, 72, 144, 216, 288].map(angle => (
                            <path key={angle} d="M 10 8 C 15 3 20 8 18 10 C 16 12 12 10 10 10 Z" fill="#334155" transform={`rotate(${angle} 10 10)`} />
                        ))}
                        <circle cx="10" cy="10" r="3.5" fill="#1e293b" />
                        <circle cx="10" cy="10" r="2" fill="url(#metal)" />
                    </g>
                </g>
            )}

            {comp.type === 'MOTOR_DC' && (
                <g>
                    <rect x="2" y="-5" width="16" height="25" fill="url(#metal-dark)" rx="8" />
                    <path d="M 5 -5 L 15 -5" stroke="url(#metal)" strokeWidth="2" />
                    <path d="M 6 20 L 6 24 M 14 20 L 14 24" stroke="url(#metal)" strokeWidth="1.5" />
                    <line x1="5" y1="5" x2="15" y2="5" stroke="#1e293b" strokeWidth="1" />
                    <line x1="5" y1="10" x2="15" y2="10" stroke="#1e293b" strokeWidth="1" />
                    <g className="motor-shaft text-cyan-600" style={{ transformOrigin: '10px -7px' }}>
                        <rect x="9" y="-12" width="2" height="7" fill="url(#metal)" />
                        <rect x="8.5" y="-12" width="3" height="1" fill="#1e293b" />
                    </g>
                    <foreignObject x="25" y="-10" width="80" height="40" className="opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-slate-800 p-2 rounded border border-slate-600 text-[8px] text-white flex flex-col gap-1 pointer-events-auto">
                            <label className="flex justify-between">
                                Load: {hardwareState.motorLoad || 0}%
                            </label>
                            <input
                                type="range"
                                min="0" max="100"
                                value={hardwareState.motorLoad || 0}
                                onChange={(e) => onHardwareInput(comp.pin, { type: 'motorLoad', value: Number(e.target.value) })}
                                className="w-full accent-yellow-500 h-1"
                            />
                        </div>
                    </foreignObject>
                </g>
            )}

            {comp.type === 'BUZZER' && (
                <g>
                    <path d="M 8 20 L 8 25 M 12 20 L 12 25" stroke="url(#metal)" strokeWidth="1.5" />
                    <circle cx="10" cy="10" r="9" fill="#0f172a" />
                    <circle cx="10" cy="10" r="7" fill="#1e293b" />
                    <circle cx="10" cy="10" r="2" fill="#000" />
                    <path d="M 13 4 L 17 4 M 15 2 L 15 6" stroke="#ef4444" strokeWidth="1" />
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
                    <path d="M 2 10 L 6 10 M 14 10 L 18 10" stroke="url(#metal)" strokeWidth="1.5" />
                    <rect x="5" y="7" width="10" height="6" rx="2" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="0.5" />
                    <rect x="6" y="7" width="1" height="6" fill="#78350f" />
                    <rect x="8" y="7" width="1" height="6" fill="#000" />
                    <rect x="10" y="7" width="1" height="6" fill="#dc2626" />
                    <rect x="13" y="7" width="1" height="6" fill="#eab308" />
                </g>
            )}

            {comp.type === 'BREADBOARD' && (
                <g transform="translate(-80, -30)">
                    <rect x="0" y="0" width="180" height="60" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                    <rect x="10" y="4" width="160" height="10" fill="#f1f5f9" />
                    <line x1="10" y1="6" x2="170" y2="6" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
                    <line x1="10" y1="12" x2="170" y2="12" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                    <rect x="10" y="46" width="160" height="10" fill="#f1f5f9" />
                    <line x1="10" y1="48" x2="170" y2="48" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
                    <line x1="10" y1="54" x2="170" y2="54" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                    {[...Array(30)].map((_, i) => (
                        <g key={`top-${i}`} transform={`translate(${14 + i * 5}, 18)`}>
                            {[...Array(5)].map((_, j) => (
                                <circle key={j} cx="0" cy={j * 2.5} r="0.8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.3" />
                            ))}
                        </g>
                    ))}
                    {[...Array(30)].map((_, i) => (
                        <g key={`bot-${i}`} transform={`translate(${14 + i * 5}, 34)`}>
                            {[...Array(5)].map((_, j) => (
                                <circle key={j} cx="0" cy={j * 2.5} r="0.8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.3" />
                            ))}
                        </g>
                    ))}
                    <rect x="10" y="30" width="160" height="2" fill="#e2e8f0" />
                </g>
            )}

            {comp.type === 'BATTERY_9V' && (
                <g transform="translate(0, -5)">
                    <rect x="4" y="8" width="12" height="20" rx="1" fill="#1e293b" />
                    <rect x="4" y="16" width="12" height="12" rx="1" fill="#fbbf24" />
                    <text x="10" y="25" textAnchor="middle" fontSize="4" fill="#000" fontWeight="black">9V</text>
                    <circle cx="7" cy="6" r="1.5" fill="url(#metal-dark)" />
                    <circle cx="13" cy="6" r="2" fill="url(#metal)" stroke="#475569" strokeWidth="0.5" />
                </g>
            )}

            {comp.type === 'BATTERY_AA' && (
                <g transform="translate(-5, -10)">
                    <rect x="10" y="8" width="10" height="25" rx="1" fill="#1e293b" />
                    <rect x="10" y="20" width="10" height="13" rx="1" fill="#ef4444" />
                    <rect x="13" y="6" width="4" height="2" rx="0.5" fill="url(#metal)" />
                    <text x="15" y="30" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">AA</text>
                    <text x="15" y="16" textAnchor="middle" fontSize="5" fill="white">+</text>
                </g>
            )}

            {(comp.type === 'SERVO' || comp.type === 'SERVO_CONTINUOUS') && (
                <g>
                    <rect x="3" y="6" width="14" height="18" rx="1" fill="#2563eb" />
                    <rect x="1" y="12" width="2" height="6" rx="0.5" fill="#2563eb" />
                    <rect x="17" y="12" width="2" height="6" rx="0.5" fill="#2563eb" />
                    <circle cx="2" cy="15" r="0.8" fill="#0f172a" />
                    <circle cx="18" cy="15" r="0.8" fill="#0f172a" />
                    <path d="M 10 24 L 10 26 C 10 28, 8 28, 8 30" stroke="#facc15" strokeWidth="1" fill="none" />
                    <circle cx="10" cy="8" r="4" fill="#1e293b" />
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
                    <path d="M 8 15 L 8 20 M 12 15 L 12 20" stroke="url(#metal)" strokeWidth="1.5" />
                    <circle cx="10" cy="10" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    <path d="M 6 10 C 7 8, 8 12, 10 10 C 12 8, 13 12, 14 10" stroke="#a16207" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <path d="M 6 8 C 7 6, 8 10, 10 8 C 12 6, 13 10, 14 8" stroke="#a16207" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <path d="M 6 12 C 7 10, 8 14, 10 12 C 12 10, 13 14, 14 12" stroke="#a16207" strokeWidth="1" strokeLinecap="round" fill="none" />
                </g>
            )}

            {(comp.type === 'DHT11' || comp.type === 'DHT22') && (
                <g>
                    <rect x="2" y="2" width="16" height="16" rx="1" fill={comp.type === 'DHT11' ? "#0ea5e9" : "#f8fafc"} stroke={comp.type === 'DHT11' ? "#0284c7" : "#cbd5e1"} strokeWidth="1" />
                    {[...Array(6)].map((_, i) => (
                        <line key={i} x1="4" y1={4 + i * 2.5} x2="16" y2={4 + i * 2.5} stroke={comp.type === 'DHT11' ? "#0369a1" : "#94a3b8"} strokeWidth="1" />
                    ))}
                    <path d="M 4 18 L 4 22 M 8 18 L 8 22 M 12 18 L 12 22 M 16 18 L 16 22" stroke="url(#metal)" strokeWidth="1.5" />
                </g>
            )}

            {(comp.type === 'RELAY' || comp.type === 'RELAY_MODULE') && (
                <g>
                    <rect x="0" y="0" width="20" height="30" rx="1" fill="#ef4444" />
                    <rect x="2" y="2" width="16" height="18" rx="1" fill="#2563eb" />
                    <path d="M 4 22 L 16 22 M 4 25 L 16 25 M 4 28 L 16 28" stroke="url(#metal)" strokeWidth="1.5" />
                    <rect x="3" y="21" width="14" height="8" fill="#1e293b" />
                    <circle cx="5" cy="23" r="1.5" fill="url(#metal)" />
                    <circle cx="10" cy="25" r="1.5" fill="url(#metal)" />
                    <circle cx="15" cy="27" r="1.5" fill="url(#metal)" />
                    <circle cx="10" cy="11" r="1.5" fill="#064e3b" className="relay-led" />
                    <text x="10" y="7" textAnchor="middle" fontSize="3" fill="white" opacity="0.8">5V RELAY</text>
                </g>
            )}

            {(comp.type === 'LASER' || comp.type === 'LASER_DIODE') && (
                <g>
                    <rect x="6" y="8" width="8" height="12" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
                    <rect x="7" y="6" width="6" height="2" fill="#d97706" />
                    <rect x="5" y="20" width="10" height="4" fill="#1e293b" />
                    <path d="M 7 24 L 7 28 M 13 24 L 13 28" stroke="url(#metal)" strokeWidth="1.5" />
                    <circle cx="10" cy="5" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
                    <path d="M 10 2 L 5 -50 L 15 -50 Z" fill="url(#bulb-glow)" className="laser-beam pointer-events-none" opacity="0" style={{ mixBlendMode: 'screen' }} />
                </g>
            )}

            {(comp.type === 'PUMP' || comp.type === 'MOTOR_PUMP') && (
                <g>
                    <rect x="4" y="6" width="12" height="18" rx="6" fill="#f8fafc" stroke="#94a3b8" />
                    <rect x="8" y="0" width="4" height="6" fill="#f8fafc" stroke="#94a3b8" />
                    <rect x="0" y="10" width="4" height="4" fill="#f8fafc" stroke="#94a3b8" />
                    <rect x="5" y="24" width="10" height="4" rx="1" fill="#1e293b" />
                    <path d="M 8 28 L 8 32 M 12 28 L 12 32" stroke="url(#metal)" strokeWidth="1.5" />
                    <circle cx="10" cy="15" r="4" fill="#e2e8f0" stroke="#cbd5e1" />
                </g>
            )}

            {comp.type === 'MULTIMETER' && (
                <g>
                    <rect x="0" y="0" width="30" height="40" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                    <rect x="3" y="3" width="24" height="12" rx="1" fill="#1e293b" />
                    <text x="15" y="11" textAnchor="middle" fontSize="6" fill="#10b981" fontFamily="monospace">0.00</text>
                    <circle cx="15" cy="24" r="6" fill="#334155" stroke="#000" strokeWidth="1" />
                    <circle cx="15" cy="24" r="4" fill="#1e293b" />
                    <path d="M 15 24 L 15 20" stroke="#fff" strokeWidth="1" />
                    <circle cx="10" cy="35" r="2" fill="#ef4444" />
                    <circle cx="20" cy="35" r="2" fill="#1e293b" />
                </g>
            )}

            {comp.type === 'OSCILLOSCOPE' && (
                <g>
                    <rect x="0" y="0" width="40" height="30" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                    <rect x="3" y="3" width="24" height="20" rx="1" fill="#020617" />
                    <path d="M 3 13 Q 9 3 15 13 T 27 13" fill="none" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="34" cy="8" r="3" fill="#334155" />
                    <circle cx="34" cy="16" r="3" fill="#334155" />
                    <circle cx="34" cy="24" r="3" fill="#334155" />
                </g>
            )}

            {comp.type === 'I2C_SENSOR' && (
                <g>
                    <rect x="0" y="0" width="20" height="15" rx="1" fill="#0d9488" stroke="#0f766e" strokeWidth="1" />
                    <text x="10" y="9" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">I2C</text>
                    <path d="M 4 15 L 4 18 M 8 15 L 8 18 M 12 15 L 12 18 M 16 15 L 16 18" stroke="url(#metal)" strokeWidth="1" />
                </g>
            )}

            {comp.type === 'SPI_SENSOR' && (
                <g>
                    <rect x="0" y="0" width="25" height="15" rx="1" fill="#0369a1" stroke="#075985" strokeWidth="1" />
                    <text x="12.5" y="9" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">SPI</text>
                    <path d="M 5 15 L 5 18 M 10 15 L 10 18 M 15 15 L 15 18 M 20 15 L 20 18" stroke="url(#metal)" strokeWidth="1" />
                </g>
            )}

            {!comp.type.startsWith('LED') && comp.type !== 'BUTTON' && comp.type !== 'BUTTON_TACTILE' && comp.type !== 'POTENTIOMETER' && comp.type !== 'FAN' && comp.type !== 'ULTRASONIC' && !isMicrocontroller(comp.type) && comp.type !== 'LCD' && comp.type !== 'OLED' && comp.type !== 'SWITCH_TOGGLE' && comp.type !== 'SWITCH_SLIDE' && comp.type !== 'BULB' && comp.type !== 'MOTOR_DC' && comp.type !== 'BUZZER' && comp.type !== 'RESISTOR' && comp.type !== 'BATTERY_9V' && comp.type !== 'BATTERY_AA' && comp.type !== 'SERVO' && comp.type !== 'SERVO_CONTINUOUS' && comp.type !== 'LIGHT_SENSOR' && comp.type !== 'DHT11' && comp.type !== 'DHT22' && comp.type !== 'RELAY' && comp.type !== 'RELAY_MODULE' && comp.type !== 'LASER' && comp.type !== 'LASER_DIODE' && comp.type !== 'PUMP' && comp.type !== 'MOTOR_PUMP' && comp.type !== 'BREADBOARD' && comp.type !== 'MULTIMETER' && comp.type !== 'OSCILLOSCOPE' && comp.type !== 'I2C_SENSOR' && comp.type !== 'SPI_SENSOR' && (
                <g>
                    <rect x="0" y="0" width="20" height="20" rx="2" fill="#334155" />
                    <text x="10" y="12" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">{comp.type.slice(0, 3)}</text>
                </g>
            )}

            <g transform="translate(20, 0)">
                <circle r="4.5" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                <text y="1.5" textAnchor="middle" fontSize="4.5" fill="#000" fontWeight="black">{comp.pin}</text>
            </g>
        </>
    );
};
