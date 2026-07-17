import React from 'react';
import { CircuitComponent, HardwareState } from '../../types';
import { isMicrocontroller } from './PinManager';

interface ComponentRenderResult {
    isActive: boolean;
}

interface HardwareComponentProps {
    comp: CircuitComponent;
    simResult: ComponentRenderResult | undefined;
    hardwareState: HardwareState;
}

function getComponentColor(type: string): string {
    if (type.includes('RED')) return '#ef4444';
    if (type.includes('BLUE')) return '#3b82f6';
    if (type.includes('YELLOW')) return '#eab308';
    if (type.includes('ORANGE')) return '#f97316';
    if (type.includes('WHITE')) return '#f8fafc';
    return '#22c55e';
}

function getComponentDarkColor(type: string): string {
    if (type.includes('RED')) return '#7f1d1d';
    if (type.includes('BLUE')) return '#1e3a8a';
    if (type.includes('YELLOW')) return '#713f12';
    if (type.includes('ORANGE')) return '#7c2d12';
    if (type.includes('WHITE')) return '#94a3b8';
    return '#14532d';
}

export const HardwareComponentSVG: React.FC<HardwareComponentProps> = ({ comp, simResult, hardwareState }) => {
    const isActive = simResult?.isActive || false;

    if (comp.type.startsWith('LED') && comp.type !== 'RGB_LED' && comp.type !== 'RGB_STRIP' && comp.type !== 'LED_INFRARED') {
        return (
            <g>
                <path d="M 8 18 L 8 30" stroke="url(#metal-shiny)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 12 18 L 12 32" stroke="url(#metal-shiny)" strokeWidth="1.2" strokeLinecap="round" />
                <rect x="11.5" y="17" width="1" height="2" fill="#94a3b8" />
                <ellipse cx="10" cy="17" rx="6.5" ry="1.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.3" />
                <path d="M 3.5 17 Q 3.5 3 10 1 Q 16.5 3 16.5 17 Z" fill={isActive ? getComponentColor(comp.type) : getComponentDarkColor(comp.type)} className="light-part" opacity="0.85" />
                <path d="M 3.5 17 Q 3.5 3 10 1 Q 16.5 3 16.5 17" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                <rect x="8.5" y="10" width="3" height="5" rx="0.5" fill="rgba(0,0,0,0.3)" />
                <path d="M 10 10 L 10 8 Q 10 6 10 6" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" fill="none" />
                <path d="M 5 15 Q 5 5 9 2 Q 6 5 6 13" fill="white" opacity="0.5" />
                {isActive && (
                    <circle cx="10" cy="10" r="12" fill={getComponentColor(comp.type)} opacity="0.15" className="pointer-events-none" />
                )}
                <path d="M 16 17 L 16.5 17" stroke="#64748b" strokeWidth="0.8" />
            </g>
        );
    }

    if (comp.type === 'RGB_LED') {
        return (
            <g>
                <path d="M 7 18 L 7 32" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <path d="M 9 18 L 9 34" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <path d="M 11 18 L 11 34" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <path d="M 13 18 L 13 32" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <rect x="12.5" y="17" width="1" height="2" fill="#94a3b8" />
                <ellipse cx="10" cy="17" rx="6.5" ry="1.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.3" />
                <path d="M 3.5 17 Q 3.5 3 10 1 Q 16.5 3 16.5 17 Z" fill="rgba(200,200,200,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                <rect x="7" y="9" width="2" height="3" fill={isActive ? '#ef4444' : '#331111'} rx="0.3" />
                <rect x="9.5" y="9" width="2" height="3" fill={isActive ? '#22c55e' : '#113311'} rx="0.3" />
                <rect x="12" y="9" width="2" height="3" fill={isActive ? '#3b82f6' : '#111133'} rx="0.3" />
                {isActive && (
                    <circle cx="10" cy="10" r="10" fill={hardwareState.rgbLedColor || '#ff0000'} opacity="0.2" className="pointer-events-none" />
                )}
                <path d="M 5 15 Q 5 5 9 2 Q 6 5 6 13" fill="white" opacity="0.35" />
                <text x="7" y="36" textAnchor="middle" fontSize="1.5" fill="#ef4444">R</text>
                <text x="9" y="38" textAnchor="middle" fontSize="1.5" fill="#666">GND</text>
                <text x="11" y="38" textAnchor="middle" fontSize="1.5" fill="#22c55e">G</text>
                <text x="13" y="36" textAnchor="middle" fontSize="1.5" fill="#3b82f6">B</text>
            </g>
        );
    }

    if (comp.type === 'BULB') {
        return (
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
        );
    }

    if (comp.type === 'BUTTON' || comp.type === 'BUTTON_TACTILE') {
        return (
            <g>
                <path d="M -1 2 L 1 2 L 1 4" stroke="url(#metal-shiny)" strokeWidth="0.6" fill="none" />
                <path d="M 21 2 L 19 2 L 19 4" stroke="url(#metal-shiny)" strokeWidth="0.6" fill="none" />
                <path d="M -1 18 L 1 18 L 1 16" stroke="url(#metal-shiny)" strokeWidth="0.6" fill="none" />
                <path d="M 21 18 L 19 18 L 19 16" stroke="url(#metal-shiny)" strokeWidth="0.6" fill="none" />
                <rect x="1" y="1" width="18" height="18" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <rect x="2" y="2" width="16" height="16" rx="0.5" fill="#222" />
                <circle cx="10" cy="10" r="5.5" fill="#111" stroke="#444" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.3" className="btn-plunger transition-transform duration-75" style={{ transformOrigin: '10px 10px' }} />
                <circle cx="8.5" cy="8.5" r="1.5" fill="white" opacity="0.15" />
                <circle cx="10" cy="10" r="3" fill="none" stroke="#ef4444" strokeWidth="0.3" opacity="0.5" />
                <text x="10" y="18" textAnchor="middle" fontSize="1.5" fill="#555">6x6</text>
            </g>
        );
    }

    if (comp.type === 'SWITCH_TOGGLE') {
        return (
            <g>
                <rect x="4" y="14" width="12" height="6" fill="#1e293b" rx="1" />
                <rect x="6" y="8" width="8" height="6" fill="url(#metal-dark)" />
                <path d="M 5 14 L 15 14 L 14 16 L 6 16 Z" fill="url(#metal)" />
                <g className="toggle-bat transition-transform duration-100" transform={hardwareState.pins[comp.pin] ? 'rotate(30 10 10)' : 'rotate(-30 10 10)'}>
                    <path d="M 8 8 L 12 8 L 11 -2 L 9 -2 Z" fill="url(#metal)" />
                    <circle cx="10" cy="-2" r="1.5" fill="url(#metal)" />
                </g>
                <path d="M 6 20 L 6 24 M 10 20 L 10 24 M 14 20 L 14 24" stroke="url(#metal)" strokeWidth="1.5" />
            </g>
        );
    }

    if (comp.type === 'SWITCH_SLIDE') {
        return (
            <g>
                <rect x="2" y="6" width="16" height="8" fill="url(#metal-dark)" rx="1" stroke="#334155" />
                <rect x="4" y="8" width="12" height="4" fill="#0f172a" rx="1" />
                <g className="slide-knob transition-transform duration-100" transform={hardwareState.pins[comp.pin] ? 'translate(4, 0)' : 'translate(-4, 0)'}>
                    <rect x="8" y="7" width="4" height="6" fill="#1e293b" rx="0.5" />
                </g>
                <path d="M 5 2 L 5 6 M 10 2 L 10 6 M 15 2 L 15 6" stroke="url(#metal)" strokeWidth="1.5" />
            </g>
        );
    }

    if (comp.type === 'POTENTIOMETER') {
        return (
            <g>
                <path d="M 4 20 L 4 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 10 20 L 10 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 16 20 L 16 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <text x="4" y="26.5" textAnchor="middle" fontSize="1.5" fill="#94a3b8">CW</text>
                <text x="10" y="26.5" textAnchor="middle" fontSize="1.5" fill="#94a3b8">W</text>
                <text x="16" y="26.5" textAnchor="middle" fontSize="1.5" fill="#94a3b8">CCW</text>
                <circle cx="10" cy="10" r="9.5" fill="url(#metal-dark)" stroke="#64748b" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="8" fill="#475569" stroke="#334155" strokeWidth="0.2" />
                <rect x="6" y="17" width="8" height="3" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.2" />
                <g transform={`rotate(${(hardwareState.potentiometerValue / 1023) * 270 - 135} 10 10)`}>
                    <circle cx="10" cy="10" r="7.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                    {[...Array(16)].map((_, i) => (
                        <line key={i} x1="10" y1="3" x2="10" y2="4" stroke="#444" strokeWidth="0.4" transform={`rotate(${i * 22.5} 10 10)`} />
                    ))}
                    <circle cx="10" cy="10" r="5" fill="#222" stroke="#333" strokeWidth="0.2" />
                    <rect x="9.5" y="4" width="1" height="4" fill="#f8fafc" rx="0.3" />
                    <circle cx="8.5" cy="8.5" r="2" fill="white" opacity="0.06" />
                </g>
                <text x="10" y="11" textAnchor="middle" fontSize="2" fill="#666" fontWeight="bold">10K</text>
            </g>
        );
    }

    if (comp.type === 'FAN') {
        return (
            <g>
                <rect x="-2" y="-2" width="24" height="24" rx="2" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
                <circle cx="1" cy="1" r="1.2" fill="#000" stroke="#444" strokeWidth="0.2" />
                <circle cx="19" cy="1" r="1.2" fill="#000" stroke="#444" strokeWidth="0.2" />
                <circle cx="1" cy="19" r="1.2" fill="#000" stroke="#444" strokeWidth="0.2" />
                <circle cx="19" cy="19" r="1.2" fill="#000" stroke="#444" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="9.5" fill="#000" stroke="#222" strokeWidth="0.3" />
                <path d="M 10 10 L 0.5 0.5 M 10 10 L 19.5 0.5 M 10 10 L 0.5 19.5 M 10 10 L 19.5 19.5" stroke="#222" strokeWidth="1.2" />
                <g className="fan-blades" style={{ transformOrigin: '10px 10px' }}>
                    {[0, 72, 144, 216, 288].map(angle => (
                        <path key={angle} d="M 10 7 C 14 2 19 5 17 10 C 15 13 12 11 10 10 Z" fill="#374151" stroke="#4b5563" strokeWidth="0.2" transform={`rotate(${angle} 10 10)`} />
                    ))}
                    <circle cx="10" cy="10" r="3" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                    <circle cx="10" cy="10" r="2" fill="url(#metal-shiny)" />
                    <circle cx="9.5" cy="9.5" r="0.8" fill="white" opacity="0.2" />
                </g>
                {isActive && (
                    <g className="pointer-events-none fan-airflow" opacity="0">
                        <path d="M 10 -5 L 10 -12" stroke="#60a5fa" strokeWidth="0.4" strokeDasharray="2,2" opacity="0.5" />
                        <path d="M 5 -3 L 2 -10" stroke="#60a5fa" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.3" />
                        <path d="M 15 -3 L 18 -10" stroke="#60a5fa" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.3" />
                        <circle cx="10" cy="10" r="9" fill="none" stroke="#22c55e" strokeWidth="0.3" />
                    </g>
                )}
            </g>
        );
    }

    if (comp.type === 'MOTOR_DC') {
        return (
            <g className="motor-body">
                <rect x="2" y="-4" width="16" height="22" fill="url(#metal-shiny)" rx="8" stroke="#94a3b8" strokeWidth="0.3" />
                <path d="M 2 4 Q 0 4 0 8 Q 0 12 2 12" fill="#b45309" stroke="#92400e" strokeWidth="0.3" />
                <line x1="4" y1="2" x2="16" y2="2" stroke="#78716c" strokeWidth="0.4" />
                <line x1="4" y1="5" x2="16" y2="5" stroke="#78716c" strokeWidth="0.4" />
                <line x1="4" y1="8" x2="16" y2="8" stroke="#78716c" strokeWidth="0.4" />
                <rect x="5" y="10" width="10" height="6" rx="0.5" fill="#d6d3d1" />
                <text x="10" y="13" textAnchor="middle" fontSize="2" fill="#44403c" fontWeight="bold">DC 3-6V</text>
                <text x="10" y="15.5" textAnchor="middle" fontSize="1.5" fill="#78716c">RF-300</text>
                <rect x="4" y="18" width="3" height="3" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.2" />
                <rect x="13" y="18" width="3" height="3" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.2" />
                <text x="5.5" y="22" textAnchor="middle" fontSize="1.5" fill="#ef4444">+</text>
                <text x="14.5" y="22" textAnchor="middle" fontSize="1.5" fill="#3b82f6">-</text>
                <g className="motor-shaft" style={{ transformOrigin: '10px -6px' }}>
                    <rect x="9" y="-12" width="2" height="8" fill="url(#metal-shiny)" rx="0.5" />
                    <rect x="9" y="-11" width="2" height="1" fill="#94a3b8" />
                </g>
                <rect x="14" y="-2" width="2" height="18" rx="1" fill="white" opacity="0.06" />
            </g>
        );
    }

    if (comp.type === 'BUZZER') {
        return (
            <g>
                <path d="M 7 18 L 7 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 13 18 L 13 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <circle cx="10" cy="10" r="8" fill="#0f0f0f" stroke="#333" strokeWidth="0.4" />
                <circle cx="10" cy="10" r="7" fill="#1a1a1a" stroke="#444" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="1.5" fill="#000" />
                <circle cx="10" cy="6" r="0.8" fill="#0a0a0a" />
                <circle cx="13" cy="8" r="0.8" fill="#0a0a0a" />
                <circle cx="14" cy="11" r="0.8" fill="#0a0a0a" />
                <circle cx="12" cy="14" r="0.8" fill="#0a0a0a" />
                <circle cx="8" cy="14" r="0.8" fill="#0a0a0a" />
                <circle cx="6" cy="11" r="0.8" fill="#0a0a0a" />
                <circle cx="7" cy="8" r="0.8" fill="#0a0a0a" />
                <circle cx="10" cy="10" r="5.5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.3" opacity="0.85" />
                <text x="10" y="8.5" textAnchor="middle" fontSize="1.8" fill="#713f12" fontWeight="black">REMOVE</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.5" fill="#92400e">SEAL</text>
                <text x="10" y="13" textAnchor="middle" fontSize="1.5" fill="#92400e">BEFORE</text>
                <text x="10" y="14.5" textAnchor="middle" fontSize="1.5" fill="#92400e">USE</text>
                <text x="14" y="5" textAnchor="middle" fontSize="2" fill="#ef4444" fontWeight="bold">+</text>
                <g className="pointer-events-none">
                    <path d="M 18 8 Q 22 10 18 12" fill="none" stroke="#facc15" strokeWidth="0.5" opacity="0" className="buzzer-wave" style={{ transformOrigin: '10px 10px' }} />
                    <path d="M 20 5 Q 26 10 20 15" fill="none" stroke="#facc15" strokeWidth="0.4" opacity="0" className="buzzer-wave" style={{ transformOrigin: '10px 10px' }} />
                    <path d="M 22 3 Q 30 10 22 17" fill="none" stroke="#facc15" strokeWidth="0.3" opacity="0" className="buzzer-wave" style={{ transformOrigin: '10px 10px' }} />
                </g>
            </g>
        );
    }

    if (comp.type === 'ULTRASONIC') {
        return (
            <g transform="scale(0.4) translate(-25, -15)">
                <rect x="0" y="0" width="50" height="30" rx="2" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
                <circle cx="13" cy="12" r="10" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                <circle cx="13" cy="12" r="7" fill="#a8a29e" stroke="#78716c" strokeWidth="0.5" />
                <circle cx="13" cy="12" r="3" fill="#d6d3d1" />
                {[0,1,2,3,4].map(i => (
                    <line key={`ml${i}`} x1="8" y1={8 + i * 2} x2="18" y2={8 + i * 2} stroke="#a8a29e" strokeWidth="0.3" />
                ))}
                <circle cx="37" cy="12" r="10" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                <circle cx="37" cy="12" r="7" fill="#a8a29e" stroke="#78716c" strokeWidth="0.5" />
                <circle cx="37" cy="12" r="3" fill="#d6d3d1" />
                {[0,1,2,3,4].map(i => (
                    <line key={`mr${i}`} x1="32" y1={8 + i * 2} x2="42" y2={8 + i * 2} stroke="#a8a29e" strokeWidth="0.3" />
                ))}
                <rect x="20" y="20" width="10" height="6" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="25" y="24" textAnchor="middle" fontSize="2" fill="#666">CPU</text>
                <rect x="15" y="22" width="3" height="2" fill="url(#metal-shiny)" rx="0.3" />
                {[0,1,2,3,4].map(i => (
                    <g key={`pin${i}`}>
                        <rect x={8 + i * 8} y="28" width="1" height="4" fill="url(#metal-shiny)" />
                    </g>
                ))}
                <text x="13" y="28" textAnchor="middle" fontSize="2.5" fill="#93c5fd" fontWeight="bold">T</text>
                <text x="37" y="28" textAnchor="middle" fontSize="2.5" fill="#93c5fd" fontWeight="bold">R</text>
                <text x="25" y="6" textAnchor="middle" fontSize="3" fill="#93c5fd" fontWeight="black">HC-SR04</text>
            </g>
        );
    }

    if (comp.type === 'ARDUINO_NANO') {
        return (
            <g transform="translate(-8, -4)">
                <rect x="0" y="0" width="16" height="38" rx="2" fill="#0071a0" stroke="#004499" />
                <rect x="2" y="1" width="12" height="6" fill="url(#metal)" rx="1" />
                <text x="8" y="34" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">NANO</text>
            </g>
        );
    }

    if (comp.type === 'ESP32_DEVKIT') {
        return (
            <g transform="translate(-15, -12)">
                <rect x="0" y="0" width="30" height="52" rx="2" fill="#0f0f0f" stroke="#333" strokeWidth="0.4" />
                <rect x="4" y="8" width="22" height="14" rx="1" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <text x="15" y="16" textAnchor="middle" fontSize="3" fill="#475569" fontWeight="bold">ESP32</text>
                <path d="M 4 4 Q 2 2 4 0" fill="none" stroke="#d97706" strokeWidth="0.5" />
                <path d="M 6 4 Q 4 1 6 0" fill="none" stroke="#d97706" strokeWidth="0.5" />
                <rect x="10" y="-2" width="10" height="4" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <rect x="11" y="-1" width="8" height="2" rx="0.3" fill="#1e293b" />
                <rect x="22" y="24" width="4" height="3" rx="0.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.2" />
                <rect x="22" y="28" width="4" height="3" rx="0.5" fill="#3b82f6" stroke="#2563eb" strokeWidth="0.2" />
                <g transform="translate(-2, 4)">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <g key={i} transform={`translate(0, ${i * 3})`}>
                            <rect x="0" y="0" width="2" height="2" fill="url(#metal-shiny)" rx="0.2" />
                            <text x="-1" y="1.5" textAnchor="end" fontSize="1.5" fill="#666">{i < 14 ? `D${i}` : ['3V','GND','EN'][i-14]}</text>
                        </g>
                    ))}
                </g>
                <g transform="translate(30, 4)">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <g key={i} transform={`translate(0, ${i * 3})`}>
                            <rect x="0" y="0" width="2" height="2" fill="url(#metal-shiny)" rx="0.2" />
                            <text x="3" y="1.5" fontSize="1.5" fill="#666">{i < 8 ? `A${i}` : i < 14 ? `D${i+14}` : ['5V','GND'][i-14]}</text>
                        </g>
                    ))}
                </g>
                <rect x="5" y="26" width="3" height="2" rx="0.3" fill="#d97706" />
                <rect x="10" y="26" width="3" height="2" rx="0.3" fill="#d97706" />
                <text x="15" y="48" textAnchor="middle" fontSize="2.5" fill="#555" fontWeight="bold">DEVKIT V1</text>
            </g>
        );
    }

    if (comp.type === 'RASPBERRY_PI_4') {
        return (
            <g transform="translate(-32, -22)">
                <rect x="0" y="0" width="64" height="48" rx="3" fill="url(#pcb-green)" stroke="#14532d" strokeWidth="0.5" />
                <rect x="18" y="16" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="26" y="25" textAnchor="middle" fontSize="3" fill="#666" fontWeight="bold">BCM2711</text>
                <text x="26" y="28" textAnchor="middle" fontSize="2" fill="#555">A72</text>
                <rect x="20" y="5" width="10" height="8" rx="0.5" fill="#222" stroke="#444" strokeWidth="0.2" />
                <text x="25" y="10" textAnchor="middle" fontSize="2" fill="#666">4GB</text>
                <rect x="46" y="8" width="18" height="14" rx="1" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <rect x="48" y="10" width="14" height="10" rx="0.5" fill="#1e293b" />
                <text x="55" y="17" textAnchor="middle" fontSize="2" fill="#666">ETH</text>
                <rect x="46" y="24" width="18" height="8" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <rect x="48" y="25" width="6" height="6" rx="0.3" fill="#2563eb" />
                <rect x="56" y="25" width="6" height="6" rx="0.3" fill="#2563eb" />
                <rect x="46" y="34" width="18" height="8" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <rect x="48" y="35" width="6" height="6" rx="0.3" fill="#1e293b" />
                <rect x="56" y="35" width="6" height="6" rx="0.3" fill="#1e293b" />
                <g transform="translate(2, 2)">
                    <rect x="0" y="0" width="14" height="38" fill="#1a1a1a" rx="0.5" />
                    {Array.from({ length: 20 }).map((_, i) => (
                        <g key={i}>
                            <circle cx={3} cy={2 + i * 1.8} r="0.6" fill="url(#metal-shiny)" />
                            <circle cx={10} cy={2 + i * 1.8} r="0.6" fill="url(#metal-shiny)" />
                        </g>
                    ))}
                    <text x="7" y="-1" textAnchor="middle" fontSize="1.5" fill="#86efac">GPIO</text>
                </g>
                <rect x="18" y="38" width="8" height="4" rx="0.5" fill="#1e293b" stroke="#444" strokeWidth="0.2" />
                <rect x="30" y="38" width="8" height="4" rx="0.5" fill="#1e293b" stroke="#444" strokeWidth="0.2" />
                <circle cx="50" cy="6" r="1" fill="#ef4444" opacity="0.8" />
                <rect x="0" y="42" width="20" height="4" rx="0.5" fill="#1e293b" stroke="#333" strokeWidth="0.2" />
                <text x="32" y="46" textAnchor="middle" fontSize="2.5" fill="#15803d" fontWeight="black">Raspberry Pi 4</text>
            </g>
        );
    }

    if (comp.type === 'MICROBIT') {
        return (
            <g transform="translate(-15, -15)">
                <rect x="0" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#000" />
                <rect x="5" y="5" width="20" height="20" rx="1" fill="#000" />
                {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={7.5 + c * 2.5} cy={7.5 + r * 2.5} r="0.8" fill="#334155" />
                )))}
                <text x="15" y="28" textAnchor="middle" fontSize="3" fill="#9ca3af">micro:bit</text>
            </g>
        );
    }

    if (comp.type === 'LCD') {
        return (
            <g transform="translate(-14, -10)">
                <rect x="-14" y="-10" width="48" height="32" rx="1.5" fill="#065f46" stroke="#047857" strokeWidth="0.4" />
                <path d="M -12 -6 L -5 -6 L -5 0 L 5 0" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
                <path d="M -12 -3 L 0 -3 L 0 3 L 10 3" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
                <rect x="-12" y="-8" width="44" height="22" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <rect x="-10" y="-6" width="40" height="18" rx="0.5" fill="#9bbc0f" stroke="#8bac0f" strokeWidth="0.2" />
                <pattern id={`lcd-grid-${comp.id}`} width="2.5" height="3.5" patternUnits="userSpaceOnUse">
                    <rect width="2.5" height="3.5" fill="#8bac0f" />
                    <rect x="0.2" y="0.2" width="2.1" height="3.1" fill="#9bbc0f" rx="0.2" />
                </pattern>
                <rect x="-10" y="-6" width="40" height="18" rx="0.5" fill={`url(#lcd-grid-${comp.id})`} opacity="0.3" />
                {hardwareState.lcdLines && hardwareState.lcdLines.map((line: string, rowIdx: number) => (
                    <text key={rowIdx} x="-9" y={-2 + rowIdx * 5.5} fontSize="4" fill="#306230" fontFamily="'Courier New', monospace" fontWeight="bold" letterSpacing="0.3">
                        {line.substring(0, 16).split('').map((char: string, charIdx: number) => {
                            return (
                                <tspan key={charIdx} fill={char !== ' ' ? '#0f380f' : '#306230'} opacity={char !== ' ' ? 1 : 0.3}>
                                    {char}
                                </tspan>
                            );
                        })}
                    </text>
                ))}
                                        {(hardwareState as any).cursorVisible && (
                                            <rect
                                                x={-10 + (hardwareState.cursorCol || 0) * 2.5}
                                                y={-6 + (hardwareState.cursorRow || 0) * 5.5}
                                                width="2.2" height="4.5"
                                                fill="#0f380f"
                                                opacity={(hardwareState as any).cursorBlink ? (Date.now() % 1000 > 500 ? 0.8 : 0) : 0.8}
                                            />
                                        )}
                <rect x="-10" y="-6" width="40" height="18" rx="0.5" fill="#9bbc0f" opacity="0.08" />
                <path d="M -9 -5 Q -9 -6 -5 -6 L -9 -2 Z" fill="white" opacity="0.12" />
                <text x="10" y="-8" textAnchor="middle" fontSize="1.5" fill="#94a3b8" fontWeight="bold">HD44780</text>
                <g transform="translate(-12, 14)">
                    {Array.from({ length: 16 }, (_: unknown, i: number) => (
                        <g key={i} transform={`translate(${i * 2.8}, 0)`}>
                            <rect x="0" y="0" width="1.5" height="4" fill="url(#metal-shiny)" rx="0.2" />
                        </g>
                    ))}
                </g>
                <g transform="translate(-12, 19)">
                    {['VSS','VDD','V0','RS','RW','E','D0','D1','D2','D3','D4','D5','D6','D7','BL+','BL-'].map((label: string, i: number) => (
                        <text key={i} x={i * 2.8 + 0.75} y="3" textAnchor="middle" fontSize="1.2" fill="#64748b">{label}</text>
                    ))}
                </g>
                <rect x="-14" y="22" width="18" height="7" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.2" />
                <rect x="-12" y="23" width="6" height="4" rx="0.3" fill="#333" />
                <text x="-9" y="26" textAnchor="middle" fontSize="1.8" fill="#22c55e" fontWeight="bold">I2C</text>
                <text x="1" y="26" textAnchor="middle" fontSize="1.2" fill="#666">0x27</text>
                <circle cx="16" cy="25" r="2.5" fill="url(#metal-shiny)" stroke="#64748b" strokeWidth="0.2" />
                <line x1="16" y1="23" x2="16" y2="25" stroke="#475569" strokeWidth="0.3" />
                <circle cx="20" cy="25" r="1" fill={(hardwareState as any).backlightOn !== false ? '#22c55e' : '#333'} />
            </g>
        );
    }

    if (comp.type === 'OLED') {
        return (
            <g transform="translate(-8, -7)">
                <rect x="-8" y="-7" width="36" height="24" rx="1" fill="#0f0f0f" stroke="#333" strokeWidth="0.5" />
                <rect x="-6" y="-5" width="32" height="14" rx="0.5" fill="#000" stroke="#1a1a1a" strokeWidth="0.3" />
                <rect x="-6" y="-5" width="32" height="14" fill="url(#pcb-grid)" opacity="0.3" />
                <text x="10" y="3" textAnchor="middle" fontSize="4" fill="#3b82f6" fontFamily="monospace" fontWeight="bold">OLED</text>
                <text x="10" y="7" textAnchor="middle" fontSize="2" fill="#60a5fa" fontFamily="monospace">128x64 SSD1306</text>
                <g transform="translate(-5, -10)">
                    {[0,1,2,3].map(i => (
                        <g key={i} transform={`translate(${i * 4}, 0)`}>
                            <rect x="0" y="0" width="1.5" height="3" fill="url(#metal-shiny)" rx="0.2" />
                        </g>
                    ))}
                </g>
                <text x="-4" y="-9" fontSize="1.5" fill="#93c5fd">GND VCC SCL SDA</text>
                <rect x="18" y="8" width="3" height="2" rx="0.3" fill="#d97706" />
                <text x="10" y="14" textAnchor="middle" fontSize="1.5" fill="#475569">0.96" I2C</text>
            </g>
        );
    }

    if (comp.type === 'RESISTOR') {
        return (
            <g>
                <path d="M 0 10 L 5 10" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <path d="M 15 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <path d="M 4.5 9.5 L 5 10 L 4.5 10.5" stroke="#94a3b8" strokeWidth="0.3" fill="none" />
                <path d="M 15.5 9.5 L 15 10 L 15.5 10.5" stroke="#94a3b8" strokeWidth="0.3" fill="none" />
                <rect x="5" y="6.5" width="10" height="7" rx="1.5" fill="#d4c5a0" stroke="#b8a882" strokeWidth="0.4" />
                <rect x="5.5" y="7" width="9" height="2" rx="0.5" fill="white" opacity="0.15" />
                <rect x="6" y="6.5" width="1.2" height="7" rx="0.2" fill="#dc2626" opacity="0.9" />
                <rect x="8" y="6.5" width="1.2" height="7" rx="0.2" fill="#dc2626" opacity="0.9" />
                <rect x="10" y="6.5" width="1.2" height="7" rx="0.2" fill="#92400e" opacity="0.9" />
                <rect x="12.5" y="6.5" width="1.2" height="7" rx="0.2" fill="#eab308" opacity="0.8" />
                <rect x="6" y="7" width="1.2" height="1" rx="0.1" fill="white" opacity="0.2" />
                <rect x="8" y="7" width="1.2" height="1" rx="0.1" fill="white" opacity="0.2" />
                <rect x="5" y="13" width="10" height="1" rx="0.5" fill="black" opacity="0.1" />
            </g>
        );
    }

    if (comp.type === 'BREADBOARD') {
        return (
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
                <rect x="10" y="30" width="160" height="2" fill="#e2e8f0" />
            </g>
        );
    }

    if (comp.type === 'BATTERY_9V') {
        return (
            <g transform="translate(0, -5)">
                <rect x="4" y="6" width="12" height="22" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <rect x="4" y="14" width="12" height="14" rx="0.5" fill="#fbbf24" />
                <text x="10" y="21" textAnchor="middle" fontSize="5" fill="#713f12" fontWeight="black">9V</text>
                <text x="10" y="25" textAnchor="middle" fontSize="2" fill="#92400e">ALKALINE</text>
                <circle cx="8" cy="4" r="1.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <circle cx="13" cy="4" r="2.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <circle cx="13" cy="4" r="1.5" fill="#1e293b" />
                <rect x="14" y="7" width="1.5" height="20" rx="0.5" fill="white" opacity="0.06" />
                <text x="10" y="12" textAnchor="middle" fontSize="1.5" fill="#666">KIDCODE</text>
            </g>
        );
    }

    if (comp.type === 'BATTERY_AA') {
        return (
            <g transform="translate(-5, -10)">
                <rect x="10" y="8" width="10" height="25" rx="1" fill="#1e293b" />
                <rect x="10" y="20" width="10" height="13" rx="1" fill="#ef4444" />
                <rect x="13" y="6" width="4" height="2" rx="0.5" fill="url(#metal)" />
                <text x="15" y="30" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">AA</text>
            </g>
        );
    }

    if (comp.type === 'SERVO' || comp.type === 'SERVO_CONTINUOUS') {
        return (
            <g>
                <rect x="2" y="4" width="16" height="20" rx="1" fill="url(#plastic-blue)" stroke="#1d4ed8" strokeWidth="0.3" />
                <rect x="0" y="10" width="3" height="8" rx="0.5" fill="url(#plastic-blue)" stroke="#1d4ed8" strokeWidth="0.2" />
                <rect x="17" y="10" width="3" height="8" rx="0.5" fill="url(#plastic-blue)" stroke="#1d4ed8" strokeWidth="0.2" />
                <circle cx="1.5" cy="14" r="0.8" fill="#0f172a" />
                <circle cx="18.5" cy="14" r="0.8" fill="#0f172a" />
                <path d="M 10 24 L 10 26 Q 10 28 8 28 L 5 28" stroke="#facc15" strokeWidth="1" fill="none" />
                <path d="M 10 24 L 10 26 Q 10 28 12 28 L 15 28" stroke="#ef4444" strokeWidth="0.5" fill="none" />
                <path d="M 10 24 L 10 26 Q 10 28 10 28" stroke="#22c55e" strokeWidth="0.5" fill="none" />
                <circle cx="10" cy="6" r="4.5" fill="#1e293b" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="6" r="2.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <circle cx="10" cy="6" r="1.5" fill="#cbd5e1" />
                <g className="servo-arm transition-transform duration-200" style={{ transformOrigin: '10px 6px' }} transform={`rotate(${hardwareState.servoAngle || 90} 10 6)`}>
                    <rect x="7" y="0" width="6" height="1" rx="0.3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.2" />
                    <circle cx="10" cy="0" r="0.5" fill="#94a3b8" />
                    <circle cx="8" cy="0" r="0.3" fill="#94a3b8" />
                    <circle cx="12" cy="0" r="0.3" fill="#94a3b8" />
                    <circle cx="10" cy="6" r="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.2" />
                    <circle cx="10" cy="6" r="0.8" fill="url(#metal-shiny)" />
                </g>
                <text x="10" y="15" textAnchor="middle" fontSize="2" fill="#93c5fd" fontWeight="bold">SG90</text>
                <text x="10" y="17.5" textAnchor="middle" fontSize="1.5" fill="#60a5fa">{comp.type === 'SERVO_CONTINUOUS' ? '360' : '180'}</text>
                <rect x="14" y="5" width="2" height="17" rx="1" fill="white" opacity="0.06" />
            </g>
        );
    }

    if (comp.type === 'LIGHT_SENSOR') {
        return (
            <g>
                <path d="M 7 16 L 7 22" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <path d="M 13 16 L 13 22" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <circle cx="10" cy="10" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="0.4" />
                <path d="M 5 10 L 7 7 L 9 13 L 11 7 L 13 13 L 15 10" fill="none" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 5 8 L 7 5 L 9 11 L 11 5 L 13 11 L 15 8" fill="none" stroke="#a16207" strokeWidth="0.5" strokeLinecap="round" />
                <circle cx="10" cy="10" r="5" fill="none" stroke="#ca8a04" strokeWidth="0.2" />
                <path d="M 6 8 Q 6 6 10 5" stroke="white" strokeWidth="0.3" fill="none" opacity="0.3" />
                <text x="10" y="25" textAnchor="middle" fontSize="2" fill="#94a3b8">LDR</text>
            </g>
        );
    }

    if (comp.type === 'DHT11' || comp.type === 'DHT22') {
        return (
            <g>
                {[4,8,12,16].map(x => (
                    <path key={x} d={`M ${x} 18 L ${x} 24`} stroke="url(#metal-shiny)" strokeWidth="0.6" />
                ))}
                <rect x="2" y="2" width="16" height="16" rx="1" fill={comp.type === 'DHT11' ? '#0ea5e9' : '#f8fafc'} stroke={comp.type === 'DHT11' ? '#0284c7' : '#cbd5e1'} strokeWidth="0.5" />
                {[0,1,2,3,4,5].map(i => (
                    <line key={i} x1="4" y1={4 + i * 2.2} x2="16" y2={4 + i * 2.2} stroke={comp.type === 'DHT11' ? '#0369a1' : '#94a3b8'} strokeWidth="0.8" />
                ))}
                <text x="10" y="11" textAnchor="middle" fontSize="2.5" fill={comp.type === 'DHT11' ? '#0c4a6e' : '#334155'} fontWeight="bold">{comp.type === 'DHT11' ? 'DHT11' : 'DHT22'}</text>
                <text x="4" y="26.5" textAnchor="middle" fontSize="1.3" fill="#94a3b8">+</text>
                <text x="8" y="26.5" textAnchor="middle" fontSize="1.3" fill="#94a3b8">DATA</text>
                <text x="12" y="26.5" textAnchor="middle" fontSize="1.3" fill="#94a3b8">NC</text>
                <text x="16" y="26.5" textAnchor="middle" fontSize="1.3" fill="#94a3b8">-</text>
            </g>
        );
    }

    if (comp.type === 'RELAY' || comp.type === 'RELAY_MODULE') {
        return (
            <g>
                <rect x="-2" y="-2" width="24" height="34" rx="1" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.3" />
                <rect x="1" y="0" width="18" height="16" rx="0.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.3" />
                <text x="10" y="6" textAnchor="middle" fontSize="2.5" fill="white" fontWeight="bold">SRD-05VDC</text>
                <text x="10" y="9" textAnchor="middle" fontSize="2" fill="#bfdbfe">SLA-C</text>
                <text x="10" y="12" textAnchor="middle" fontSize="1.5" fill="#93c5fd">10A 250VAC</text>
                <circle cx="10" cy="18" r="1.5" fill={isActive ? '#22c55e' : '#064e3b'} className="relay-led" />
                <text x="10" y="21" textAnchor="middle" fontSize="1.5" fill="#86efac">PWR</text>
                <g transform="translate(0, 23)">
                    {[0,1,2].map(i => (
                        <g key={i} transform={`translate(${2 + i * 7}, 0)`}>
                            <rect x="0" y="0" width="5" height="5" rx="0.5" fill="#0f172a" stroke="#333" strokeWidth="0.2" />
                            <circle cx="2.5" cy="2.5" r="1" fill="url(#metal-shiny)" />
                            <text x="2.5" y="8" textAnchor="middle" fontSize="1.5" fill="#fca5a5">{['VCC','GND','IN'][i]}</text>
                        </g>
                    ))}
                </g>
                <g transform="translate(0, -5)">
                    {[0,1,2].map(i => (
                        <g key={i} transform={`translate(${2 + i * 7}, 0)`}>
                            <rect x="0" y="0" width="5" height="4" rx="0.3" fill="#1a1a1a" stroke="#444" strokeWidth="0.2" />
                            <circle cx="2.5" cy="2" r="0.8" fill="url(#metal-shiny)" />
                            <text x="2.5" y="-1" textAnchor="middle" fontSize="1.5" fill="#94a3b8">{['NO','COM','NC'][i]}</text>
                        </g>
                    ))}
                </g>
            </g>
        );
    }

    if (comp.type === 'LASER' || comp.type === 'LASER_DIODE') {
        return (
            <g>
                <rect x="6" y="4" width="8" height="14" rx="1" fill="#b45309" stroke="#92400e" strokeWidth="0.3" />
                <rect x="5" y="2" width="10" height="3" rx="0.5" fill="#d97706" stroke="#b45309" strokeWidth="0.2" />
                <circle cx="10" cy="2" r="2.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.2" />
                <circle cx="10" cy="2" r="1.5" fill="#450a0a" />
                <circle cx="10" cy="2" r="0.8" fill={isActive ? '#ef4444' : '#1a0000'} />
                <rect x="5" y="18" width="10" height="4" rx="0.5" fill="#1e293b" stroke="#333" strokeWidth="0.2" />
                {[0,1,2,3,4,5].map(i => (
                    <line key={i} x1={6 + i * 1.6} y1="3" x2={6 + i * 1.6} y2="5" stroke="#92400e" strokeWidth="0.2" />
                ))}
                <path d="M 7 22 L 7 26" stroke="#ef4444" strokeWidth="0.5" />
                <path d="M 13 22 L 13 26" stroke="#1e293b" strokeWidth="0.5" />
                {isActive && (
                    <g className="laser-beam pointer-events-none">
                        <path d="M 10 0 L 7 -40 L 13 -40 Z" fill="#ef4444" opacity="0.12" style={{ mixBlendMode: 'screen' }} />
                        <line x1="10" y1="0" x2="10" y2="-40" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
                        <circle cx="10" cy="0" r="3" fill="#ef4444" opacity="0.3" />
                    </g>
                )}
                <text x="10" y="14" textAnchor="middle" fontSize="2" fill="#fbbf24" fontWeight="bold">5mW</text>
                <text x="10" y="16.5" textAnchor="middle" fontSize="1.5" fill="#d97706">650nm</text>
            </g>
        );
    }

    if (comp.type === 'PUMP' || comp.type === 'MOTOR_PUMP') {
        return (
            <g>
                <rect x="4" y="6" width="12" height="18" rx="6" fill="#f8fafc" stroke="#94a3b8" />
                <rect x="8" y="0" width="4" height="6" fill="#f8fafc" stroke="#94a3b8" />
                <circle cx="10" cy="15" r="4" fill="#e2e8f0" stroke="#cbd5e1" />
            </g>
        );
    }

    if ((comp.type as string) === 'MULTIMETER') {
        return (
            <g>
                <rect x="0" y="0" width="30" height="40" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                <rect x="3" y="3" width="24" height="12" rx="1" fill="#1e293b" />
                <text x="15" y="11" textAnchor="middle" fontSize="6" fill="#10b981" fontFamily="monospace">0.00</text>
                <circle cx="15" cy="24" r="6" fill="#334155" stroke="#000" strokeWidth="1" />
            </g>
        );
    }

    if ((comp.type as string) === 'OSCILLOSCOPE') {
        return (
            <g>
                <rect x="0" y="0" width="40" height="30" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                <rect x="3" y="3" width="24" height="20" rx="1" fill="#020617" />
                <path d="M 3 13 Q 9 3 15 13 T 27 13" fill="none" stroke="#22c55e" strokeWidth="1" />
            </g>
        );
    }

    if ((comp.type as string) === 'I2C_SENSOR') {
        return (
            <g>
                <rect x="0" y="0" width="20" height="15" rx="1" fill="#0d9488" stroke="#0f766e" strokeWidth="1" />
                <text x="10" y="9" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">I2C</text>
                <path d="M 4 15 L 4 18 M 8 15 L 8 18 M 12 15 L 12 18 M 16 15 L 16 18" stroke="url(#metal)" strokeWidth="1" />
            </g>
        );
    }

    if ((comp.type as string) === 'SPI_SENSOR') {
        return (
            <g>
                <rect x="0" y="0" width="25" height="15" rx="1" fill="#0369a1" stroke="#075985" strokeWidth="1" />
                <text x="12.5" y="9" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">SPI</text>
                <path d="M 5 15 L 5 18 M 10 15 L 10 18 M 15 15 L 15 18 M 20 15 L 20 18" stroke="url(#metal)" strokeWidth="1" />
            </g>
        );
    }

    if (comp.type === 'CAPACITOR_ELEC') {
        return (
            <g>
                <path d="M 0 10 L 5 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 15 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <rect x="5" y="3" width="10" height="14" rx="1" fill="#1e3a8a" stroke="#1e40af" strokeWidth="0.5" />
                <path d="M 7 3 L 7 4.5 M 10 3 L 10 4.5 M 13 3 L 13 4.5" stroke="#3b82f6" strokeWidth="0.4" />
                <rect x="5.5" y="5" width="9" height="8" rx="0.5" fill="#1e40af" />
                <rect x="5" y="3" width="1.5" height="14" fill="#93c5fd" opacity="0.3" />
                <text x="6" y="7" fontSize="2.5" fill="#93c5fd" fontWeight="bold">+</text>
                <text x="10" y="10" textAnchor="middle" fontSize="2.5" fill="#bfdbfe" fontWeight="bold">100</text>
                <text x="10" y="13" textAnchor="middle" fontSize="2" fill="#93c5fd">uF</text>
                <rect x="5" y="16" width="10" height="1" rx="0.5" fill="#0f172a" />
                <rect x="12" y="4" width="1.5" height="11" rx="0.5" fill="white" opacity="0.08" />
            </g>
        );
    }

    if (comp.type === 'CAPACITOR_CERAMIC') {
        return (
            <g>
                <path d="M 7 14 L 7 20" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <path d="M 13 14 L 13 20" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <ellipse cx="10" cy="8" rx="7" ry="6" fill="#d97706" stroke="#b45309" strokeWidth="0.4" />
                <ellipse cx="9" cy="6" rx="4" ry="2.5" fill="white" opacity="0.12" />
                <text x="10" y="9" textAnchor="middle" fontSize="3" fill="#78350f" fontWeight="bold">104</text>
                <ellipse cx="10" cy="13" rx="6" ry="1" fill="black" opacity="0.1" />
            </g>
        );
    }

    if (comp.type === 'CAPACITOR_TANTALUM') {
        return (
            <g>
                <path d="M 7 12 L 7 18" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <path d="M 13 12 L 13 18" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <ellipse cx="10" cy="7" rx="6" ry="5" fill="#ca8a04" stroke="#a16207" strokeWidth="0.5" />
                <path d="M 4 7 Q 4 4 10 2 Q 16 4 16 7" fill="#facc15" opacity="0.4" />
                <text x="10" y="8" textAnchor="middle" fontSize="3" fill="#713f12" fontWeight="bold">+</text>
                <text x="10" y="11" textAnchor="middle" fontSize="2" fill="#854d0e">10uF</text>
                <ellipse cx="8" cy="5" rx="3" ry="2" fill="white" opacity="0.15" />
            </g>
        );
    }

    if (comp.type === 'TRANSISTOR_NPN' || comp.type === 'TRANSISTOR_PNP') {
        return (
            <g>
                <path d="M 7 14 L 7 22" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 10 14 L 10 22" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 13 14 L 13 22" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 4 14 L 4 8 Q 4 2 10 2 Q 16 2 16 8 L 16 14 Z" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <path d="M 4 8 L 16 8" stroke="#444" strokeWidth="0.3" />
                <text x="10" y="9" textAnchor="middle" fontSize="2.5" fill="#666" fontWeight="bold">{comp.type === 'TRANSISTOR_NPN' ? '2N2222' : '2N2907'}</text>
                <text x="10" y="12" textAnchor="middle" fontSize="2" fill={comp.type === 'TRANSISTOR_NPN' ? '#22d3ee' : '#f472b6'}>{comp.type === 'TRANSISTOR_NPN' ? 'NPN' : 'PNP'}</text>
                <text x="7" y="24" textAnchor="middle" fontSize="1.8" fill="#94a3b8">E</text>
                <text x="10" y="24" textAnchor="middle" fontSize="1.8" fill="#94a3b8">B</text>
                <text x="13" y="24" textAnchor="middle" fontSize="1.8" fill="#94a3b8">C</text>
                <path d="M 5 8 Q 5 3 10 2 Q 12 2 13 3" stroke="white" strokeWidth="0.3" fill="none" opacity="0.2" />
                <line x1="4" y1="6" x2="4" y2="14" stroke="#555" strokeWidth="0.5" />
            </g>
        );
    }

    if (comp.type === 'MOSFET_N' || comp.type === 'MOSFET_P') {
        return (
            <g>
                <path d="M 7 14 L 7 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 10 14 L 10 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 13 14 L 13 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <rect x="4" y="0" width="12" height="4" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <circle cx="10" cy="2" r="1.5" fill="#333" stroke="#666" strokeWidth="0.3" />
                <rect x="5" y="4" width="10" height="10" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <text x="10" y="9" textAnchor="middle" fontSize="2.5" fill="#888" fontWeight="bold">{comp.type === 'MOSFET_N' ? 'IRF520' : 'IRF9520'}</text>
                <text x="10" y="12" textAnchor="middle" fontSize="2" fill={comp.type === 'MOSFET_N' ? '#34d399' : '#a78bfa'}>{comp.type === 'MOSFET_N' ? 'N-MOS' : 'P-MOS'}</text>
                <text x="7" y="26" textAnchor="middle" fontSize="1.8" fill="#94a3b8">G</text>
                <text x="10" y="26" textAnchor="middle" fontSize="1.8" fill="#94a3b8">D</text>
                <text x="13" y="26" textAnchor="middle" fontSize="1.8" fill="#94a3b8">S</text>
            </g>
        );
    }

    if (comp.type === 'DIODE') {
        return (
            <g>
                <path d="M 0 10 L 4 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 16 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <rect x="4" y="5" width="12" height="10" rx="5" fill="#a78bfa" stroke="#7c3aed" strokeWidth="0.4" opacity="0.8" />
                <rect x="8" y="7" width="4" height="6" rx="0.5" fill="#6d28d9" opacity="0.5" />
                <rect x="14" y="5" width="1.5" height="10" rx="0.3" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="0.2" />
                <path d="M 5 8 Q 5 6 10 5.5 Q 8 6 6 8" fill="white" opacity="0.25" />
                <text x="10" y="11" textAnchor="middle" fontSize="2" fill="#4c1d95" fontWeight="bold">1N4001</text>
                <ellipse cx="10" cy="15.5" rx="5" ry="0.5" fill="black" opacity="0.08" />
            </g>
        );
    }

    if (comp.type === 'DIODE_SCHOTTKY') {
        return (
            <g>
                <path d="M 0 10 L 4 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 16 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <rect x="4" y="5" width="12" height="10" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <rect x="13.5" y="5" width="2" height="10" rx="0.3" fill="#c0c0c0" />
                <text x="10" y="11" textAnchor="middle" fontSize="2.5" fill="#888" fontWeight="bold">1N5819</text>
                <rect x="5" y="6" width="10" height="1.5" rx="0.3" fill="white" opacity="0.08" />
            </g>
        );
    }

    if (comp.type === 'DIODE_ZENER') {
        return (
            <g>
                <path d="M 0 10 L 4 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 16 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <rect x="4" y="5" width="12" height="10" rx="5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.4" opacity="0.85" />
                <rect x="13.5" y="5" width="1.5" height="10" rx="0.3" fill="#1e293b" />
                <text x="10" y="10" textAnchor="middle" fontSize="2" fill="#78350f" fontWeight="bold">5.1V</text>
                <text x="10" y="13" textAnchor="middle" fontSize="1.5" fill="#92400e">ZENER</text>
                <path d="M 5 8 Q 5 6 10 5.5" stroke="white" strokeWidth="0.3" fill="none" opacity="0.3" />
            </g>
        );
    }

    if (comp.type === 'LED_INFRARED') {
        return (
            <g>
                <path d="M 8 18 L 8 30" stroke="url(#metal-shiny)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 12 18 L 12 32" stroke="url(#metal-shiny)" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse cx="10" cy="17" rx="6.5" ry="1.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.3" />
                <path d="M 3.5 17 Q 3.5 3 10 1 Q 16.5 3 16.5 17 Z" fill="#4a0000" stroke="#660000" strokeWidth="0.3" opacity="0.9" />
                <text x="10" y="10" textAnchor="middle" fontSize="3" fill="#7f1d1d" fontWeight="bold">IR</text>
                {isActive && (
                    <circle cx="10" cy="10" r="10" fill="#7f1d1d" opacity="0.2" className="pointer-events-none" />
                )}
                <path d="M 5 15 Q 5 5 9 2" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15" />
            </g>
        );
    }

    if (comp.type === 'VREG_7805' || comp.type === 'VREG_317' || comp.type === 'VREG_LDO') {
        return (
            <g>
                <path d="M 7 16 L 7 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 10 16 L 10 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <path d="M 13 16 L 13 24" stroke="url(#metal-shiny)" strokeWidth="0.8" />
                <rect x="4" y="0" width="12" height="5" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <circle cx="10" cy="2.5" r="1.5" fill="#333" stroke="#666" strokeWidth="0.3" />
                <rect x="5" y="5" width="10" height="11" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <text x="10" y="10" textAnchor="middle" fontSize="2.8" fill="#aaa" fontWeight="bold">{comp.type === 'VREG_7805' ? 'L7805' : comp.type === 'VREG_317' ? 'LM317' : 'AMS1117'}</text>
                <text x="10" y="13" textAnchor="middle" fontSize="2" fill={comp.type === 'VREG_7805' ? '#60a5fa' : comp.type === 'VREG_317' ? '#4ade80' : '#2dd4bf'}>
                    {comp.type === 'VREG_7805' ? '5V' : comp.type === 'VREG_317' ? 'ADJ' : '3.3V'}
                </text>
                <text x="7" y="26" textAnchor="middle" fontSize="1.8" fill="#94a3b8">IN</text>
                <text x="10" y="26" textAnchor="middle" fontSize="1.8" fill="#94a3b8">GND</text>
                <text x="13" y="26" textAnchor="middle" fontSize="1.8" fill="#94a3b8">OUT</text>
                <rect x="6" y="6" width="8" height="2" rx="0.3" fill="white" opacity="0.06" />
            </g>
        );
    }

    if (comp.type === 'OPAMP_358' || comp.type === 'OPAMP_072') {
        return (
            <g>
                {[0,1,2,3].map(i => (
                    <g key={`l${i}`}>
                        <rect x={6 + i * 2.5} y="14" width="0.8" height="4" fill="url(#metal-shiny)" />
                        <rect x={6 + i * 2.5} y="-2" width="0.8" height="4" fill="url(#metal-shiny)" />
                    </g>
                ))}
                <rect x="4" y="2" width="12" height="12" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <path d="M 4 6 Q 3 6 3 7 Q 3 8 4 8" fill="#333" />
                <text x="10" y="8" textAnchor="middle" fontSize="2.5" fill="#888" fontWeight="bold">{comp.type === 'OPAMP_358' ? 'LM358' : 'TL072'}</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.8" fill="#666">DUAL</text>
                <circle cx="5.5" cy="4" r="0.5" fill="#555" />
                <rect x="5" y="3" width="10" height="1.5" rx="0.3" fill="white" opacity="0.05" />
            </g>
        );
    }

    if (comp.type === 'NEOPIXEL_RING') {
        return (
            <g>
                <circle cx="10" cy="10" r="9" fill="none" stroke="#ec4899" strokeWidth="1" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                    <circle key={angle} cx={10 + 7 * Math.cos(angle * Math.PI / 180)} cy={10 + 7 * Math.sin(angle * Math.PI / 180)} r="1.5"
                        fill={isActive ? ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][Math.floor(angle / 60)] : '#334155'} />
                ))}
                <text x="10" y="22" textAnchor="middle" fontSize="3" fill="#94a3b8">NeoPixel</text>
            </g>
        );
    }

    if (comp.type === 'TM1637') {
        return (
            <g>
                <rect x="0" y="0" width="24" height="12" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
                {[0, 6, 12, 18].map((x, i) => (
                    <g key={i} transform={`translate(${x + 1}, 2)`}>
                        <rect x="0" y="0" width="4" height="8" rx="0.5" fill={isActive ? '#ef4444' : '#1f2937'} />
                        <text x="2" y="6" textAnchor="middle" fontSize="4" fill={isActive ? '#fca5a5' : '#374151'} fontWeight="bold">{i}</text>
                    </g>
                ))}
                <text x="12" y="18" textAnchor="middle" fontSize="3" fill="#94a3b8">TM1637</text>
            </g>
        );
    }

    if (comp.type === 'MAX7219') {
        return (
            <g>
                <rect x="0" y="0" width="20" height="20" rx="1" fill="#1e293b" stroke="#f97316" strokeWidth="0.5" />
                {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 8 }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={2.5 + c * 2.2} cy={2.5 + r * 2.2} r="0.7" fill={isActive ? '#ef4444' : '#1f2937'} />
                )))}
                <text x="10" y="26" textAnchor="middle" fontSize="3" fill="#94a3b8">MAX7219</text>
            </g>
        );
    }

    if (comp.type === 'EINK') {
        return (
            <g>
                <rect x="0" y="0" width="24" height="16" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="12" y="8" textAnchor="middle" fontSize="4" fill="#1e293b" fontWeight="bold">E-INK</text>
                <text x="12" y="12" textAnchor="middle" fontSize="2.5" fill="#64748b">296x128</text>
                <text x="12" y="22" textAnchor="middle" fontSize="3" fill="#94a3b8">e-Paper</text>
            </g>
        );
    }

    if (comp.type === 'WIRE_SPOOL') {
        return (
            <g>
                <circle cx="10" cy="10" r="8" fill="none" stroke="#eab308" strokeWidth="2" />
                <circle cx="10" cy="10" r="4" fill="#1e293b" stroke="#eab308" strokeWidth="1" />
                <path d="M 10 2 Q 18 6 10 10 Q 2 14 10 18" fill="none" stroke="#fbbf24" strokeWidth="1" />
                <text x="10" y="22" textAnchor="middle" fontSize="3" fill="#94a3b8">Wire</text>
            </g>
        );
    }

    if (comp.type === 'SPEAKER') {
        return (
            <g>
                <path d="M 7 18 L 7 22" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <path d="M 13 18 L 13 22" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <circle cx="10" cy="10" r="9" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <circle cx="10" cy="10" r="7.5" fill="#222" stroke="#444" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="5" fill="#333" stroke="#555" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="2.5" fill="#1a1a1a" stroke="#444" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="8" fill="none" stroke="#555" strokeWidth="0.5" />
                <circle cx="10" cy="10" r="1" fill="url(#metal-shiny)" />
                {isActive && (
                    <g className="pointer-events-none">
                        <circle cx="10" cy="10" r="11" fill="none" stroke="#facc15" strokeWidth="0.3" opacity="0.3" />
                        <circle cx="10" cy="10" r="13" fill="none" stroke="#facc15" strokeWidth="0.2" opacity="0.15" />
                    </g>
                )}
                <text x="10" y="11" textAnchor="middle" fontSize="2" fill="#666">8ohm</text>
            </g>
        );
    }

    if (comp.type === 'VIBRATION') {
        return (
            <g>
                <circle cx="10" cy="10" r="9" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.4" />
                <circle cx="10" cy="10" r="7" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <path d="M 10 10 L 10 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="4" r="2" fill="#475569" stroke="#64748b" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="1.5" fill="url(#metal-shiny)" />
                {isActive && (
                    <g className="pointer-events-none">
                        <path d="M 2 6 L 0 4" stroke="#facc15" strokeWidth="0.5" opacity="0.4" />
                        <path d="M 2 10 L 0 10" stroke="#facc15" strokeWidth="0.5" opacity="0.4" />
                        <path d="M 2 14 L 0 16" stroke="#facc15" strokeWidth="0.5" opacity="0.4" />
                        <path d="M 18 6 L 20 4" stroke="#facc15" strokeWidth="0.5" opacity="0.4" />
                        <path d="M 18 10 L 20 10" stroke="#facc15" strokeWidth="0.5" opacity="0.4" />
                        <path d="M 18 14 L 20 16" stroke="#facc15" strokeWidth="0.5" opacity="0.4" />
                    </g>
                )}
                <path d="M 4 18 L 4 22 M 16 18 L 16 22" stroke="url(#metal-shiny)" strokeWidth="0.6" />
            </g>
        );
    }

    if (comp.type === 'SWITCH_DIP') {
        return (
            <g>
                <rect x="0" y="2" width="20" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                {[0,1,2,3,4,5,6,7].map(i => (
                    <g key={i} transform={`translate(${2 + i * 2.2}, 5)`}>
                        <rect x="0" y="0" width="1.5" height="4" rx="0.2" fill={i < 4 ? '#facc15' : '#555'} />
                        <text x="0.75" y="7" textAnchor="middle" fontSize="1.5" fill="#666">{i+1}</text>
                    </g>
                ))}
                <text x="10" y="16" textAnchor="middle" fontSize="2" fill="#555">DIP-8</text>
            </g>
        );
    }

    if (comp.type === 'SWITCH_ROTARY') {
        return (
            <g>
                <circle cx="10" cy="10" r="9" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <circle cx="10" cy="10" r="6" fill="#222" stroke="#444" strokeWidth="0.2" />
                {[0,45,90,135,180,225,270,315].map((a,i) => (
                    <circle key={i} cx={10 + 5 * Math.cos(a * Math.PI/180)} cy={10 + 5 * Math.sin(a * Math.PI/180)} r="0.8" fill={i === 0 ? '#facc15' : '#555'} />
                ))}
                <line x1="10" y1="10" x2="10" y2="5" stroke="url(#metal-shiny)" strokeWidth="1" strokeLinecap="round" />
                <circle cx="10" cy="10" r="1.5" fill="url(#metal-shiny)" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#666">ROT</text>
            </g>
        );
    }

    if (comp.type === 'SLIDE_POT') {
        return (
            <g>
                <rect x="2" y="3" width="16" height="14" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <rect x="4" y="5" width="12" height="3" rx="0.5" fill="#333" />
                <rect x="4" y="12" width="12" height="3" rx="0.5" fill="#333" />
                <rect x="5" y="8" width="10" height="2" rx="0.3" fill="#555" />
                <rect x="8" y="6" width="4" height="6" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.2" />
                <line x1="10" y1="7" x2="10" y2="11" stroke="#475569" strokeWidth="0.3" />
                <path d="M 5 22 L 5 25 M 10 22 L 10 25 M 15 22 L 15 25" stroke="url(#metal-shiny)" strokeWidth="0.6" />
                <text x="10" y="28" textAnchor="middle" fontSize="2" fill="#666">10K</text>
            </g>
        );
    }

    if (comp.type === 'JOYSTICK') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="6" fill="#222" stroke="#444" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="3" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="1.5" fill="#cbd5e1" />
                <path d="M 10 4 L 11 5 L 9 5 Z" fill="#666" />
                <path d="M 10 16 L 11 15 L 9 15 Z" fill="#666" />
                <path d="M 4 10 L 5 11 L 5 9 Z" fill="#666" />
                <path d="M 16 10 L 15 11 L 15 9 Z" fill="#666" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#666">XY</text>
            </g>
        );
    }

    if (comp.type === 'KEYPAD' || comp.type === 'KEYPAD_MATRIX') {
        return (
            <g>
                <rect x="0" y="0" width="20" height="20" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                {[0,1,2,3].map(r => [0,1,2,3].map(c => (
                    <g key={`${r}${c}`} transform={`translate(${2 + c * 4.5}, ${2 + r * 4.5})`}>
                        <rect x="0" y="0" width="3.5" height="3.5" rx="0.3" fill="#333" stroke="#555" strokeWidth="0.15" />
                        <text x="1.75" y="2.5" textAnchor="middle" fontSize="1.8" fill="#888">{['1','2','3','A','4','5','6','B','7','8','9','C','*','0','#','D'][r*4+c]}</text>
                    </g>
                )))}
                <text x="10" y="23" textAnchor="middle" fontSize="2" fill="#555">4x4</text>
            </g>
        );
    }

    if (comp.type === 'SEVEN_SEGMENT') {
        return (
            <g>
                <rect x="0" y="0" width="20" height="14" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <rect x="1" y="1" width="18" height="12" rx="0.5" fill="#0a0a0a" />
                <path d="M 4 2 L 8 2 L 7.5 3.5 L 4.5 3.5 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <path d="M 3 3.5 L 3.5 6 L 4.5 5.5 L 4 3.5 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <path d="M 8 3.5 L 8.5 6 L 9.5 5.5 L 9 3.5 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <path d="M 4 6.5 L 8 6.5 L 7.5 8 L 4.5 8 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <path d="M 3 8 L 3.5 10.5 L 4.5 10 L 4 8 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <path d="M 8 8 L 8.5 10.5 L 9.5 10 L 9 8 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <path d="M 4 11 L 8 11 L 7.5 12.5 L 4.5 12.5 Z" fill={isActive ? '#ef4444' : '#1f0505'} />
                <circle cx="10" cy="12" r="0.5" fill={isActive ? '#ef4444' : '#1f0505'} />
                {[0,1,2,3,4,5,6,7,8,9].map(i => (
                    <rect key={i} x={1 + i * 2} y="14" width="1" height="2" fill="url(#metal-shiny)" rx="0.1" />
                ))}
            </g>
        );
    }

    if (comp.type === 'MATRIX') {
        return (
            <g>
                <rect x="0" y="0" width="20" height="20" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                {Array.from({length:8}).map((_,r) => Array.from({length:8}).map((_,c) => (
                    <circle key={`${r}${c}`} cx={2.5 + c * 2.2} cy={2.5 + r * 2.2} r="0.8"
                        fill={isActive ? (r+c)%2===0 ? '#ef4444' : '#22c55e' : '#0f0505'} />
                )))}
                <text x="10" y="23" textAnchor="middle" fontSize="2" fill="#555">8x8</text>
            </g>
        );
    }

    if (comp.type === 'SOLAR') {
        return (
            <g>
                <rect x="0" y="2" width="20" height="16" rx="1" fill="#1e3a5f" stroke="#1e40af" strokeWidth="0.3" />
                {[0,1,2,3].map(r => [0,1,2,3,4].map(c => (
                    <rect key={`${r}${c}`} x={1 + c * 3.8} y={3 + r * 3.8} width="3.2" height="3.2" rx="0.2" fill="#1e40af" stroke="#2563eb" strokeWidth="0.15" />
                )))}
                <line x1="1" y1="6.5" x2="19" y2="6.5" stroke="#60a5fa" strokeWidth="0.3" />
                <line x1="1" y1="10.5" x2="19" y2="10.5" stroke="#60a5fa" strokeWidth="0.3" />
                <line x1="1" y1="14.5" x2="19" y2="14.5" stroke="#60a5fa" strokeWidth="0.3" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#60a5fa">5V 1W</text>
            </g>
        );
    }

    if (comp.type === 'STEPPER' || (comp.type as string) === 'MOTOR_STEPPER') {
        return (
            <g>
                <circle cx="10" cy="10" r="9" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.4" />
                <circle cx="10" cy="10" r="6" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="2" fill="url(#metal-shiny)" />
                <rect x="9" y="-3" width="2" height="5" fill="url(#metal-shiny)" rx="0.3" />
                {[0,90,180,270].map(a => (
                    <path key={a} d={`M 10 10 L ${10 + 5*Math.cos(a*Math.PI/180)} ${10 + 5*Math.sin(a*Math.PI/180)}`} stroke="#444" strokeWidth="0.5" />
                ))}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#94a3b8">{(comp.type as string) === 'MOTOR_STEPPER' ? 'NEMA17' : 'NEMA'}</text>
            </g>
        );
    }

    if (comp.type === '555_TIMER') {
        return (
            <g>
                {[0,1,2,3].map(i => (
                    <g key={i}>
                        <rect x={6 + i * 2.5} y="14" width="0.8" height="4" fill="url(#metal-shiny)" />
                        <rect x={6 + i * 2.5} y="-2" width="0.8" height="4" fill="url(#metal-shiny)" />
                    </g>
                ))}
                <rect x="4" y="2" width="12" height="12" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <path d="M 4 6 Q 3 6 3 7 Q 3 8 4 8" fill="#333" />
                <text x="10" y="8" textAnchor="middle" fontSize="2.5" fill="#888" fontWeight="bold">NE555</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.8" fill="#666">TIMER</text>
                <circle cx="5.5" cy="4" r="0.5" fill="#555" />
            </g>
        );
    }

    if (comp.type === 'LOGIC_AND' || comp.type === 'LOGIC_OR') {
        return (
            <g>
                {[0,1].map(i => (
                    <g key={i}>
                        <rect x={5 + i * 5} y="-2" width="0.8" height="4" fill="url(#metal-shiny)" />
                        <rect x={5 + i * 5} y="14" width="0.8" height="4" fill="url(#metal-shiny)" />
                    </g>
                ))}
                <rect x="16" y="6" width="0.8" height="4" fill="url(#metal-shiny)" />
                <rect x="4" y="2" width="14" height="12" rx="1" fill="#1a1a1a" stroke={comp.type === 'LOGIC_AND' ? '#eab308' : '#22c55e'} strokeWidth="0.5" />
                <text x="11" y="9" textAnchor="middle" fontSize="3" fill={comp.type === 'LOGIC_AND' ? '#eab308' : '#22c55e'} fontWeight="bold">{comp.type === 'LOGIC_AND' ? 'AND' : 'OR'}</text>
                <text x="11" y="12" textAnchor="middle" fontSize="1.5" fill="#666">74{comp.type === 'LOGIC_AND' ? '08' : '32'}</text>
            </g>
        );
    }

    if (comp.type === 'SOLENOID' || comp.type === 'MOTOR_SOL') {
        return (
            <g>
                <rect x="4" y="2" width="12" height="16" rx="2" fill="#b45309" stroke="#92400e" strokeWidth="0.3" />
                {[0,1,2,3,4,5,6].map(i => (
                    <path key={i} d={`M 5 ${4 + i * 2} Q 10 ${3 + i * 2} 15 ${4 + i * 2}`} fill="none" stroke="#d97706" strokeWidth="0.6" />
                ))}
                <rect x="8" y="0" width="4" height="4" fill="url(#metal-shiny)" rx="0.5" />
                <path d="M 7 18 L 7 22 M 13 18 L 13 22" stroke="url(#metal-shiny)" strokeWidth="0.6" />
                <text x="10" y="24" textAnchor="middle" fontSize="2" fill="#94a3b8">5V</text>
            </g>
        );
    }

    if (comp.type === 'RGB_STRIP') {
        return (
            <g>
                <rect x="0" y="6" width="20" height="8" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                {[0,1,2,3,4,5].map(i => (
                    <rect key={i} x={1 + i * 3.2} y="7" width="2" height="4" rx="0.3"
                        fill={isActive ? ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6'][i] : '#1f1f1f'} />
                ))}
                <path d="M 0 10 L -4 10" stroke="#ef4444" strokeWidth="0.5" />
                <path d="M 20 10 L 24 10" stroke="#22c55e" strokeWidth="0.5" />
                <text x="10" y="18" textAnchor="middle" fontSize="2" fill="#888">WS2812B x6</text>
            </g>
        );
    }

    if (comp.type === 'MOTION') {
        return (
            <g>
                <rect x="2" y="4" width="16" height="14" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.3" />
                {[0,1,2,3,4].map(i => (
                    <circle key={i} cx={10 + 3*Math.cos(i*72*Math.PI/180)} cy={10 + 3*Math.sin(i*72*Math.PI/180)} r="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.2" />
                ))}
                <circle cx="10" cy="10" r="2" fill="#94a3b8" />
                {isActive && (
                    <circle cx="10" cy="10" r="8" fill="#22c55e" opacity="0.15" className="pointer-events-none" />
                )}
                <path d="M 6 18 L 6 22 M 10 18 L 10 22 M 14 18 L 14 22" stroke="url(#metal-shiny)" strokeWidth="0.5" />
                <text x="10" y="25" textAnchor="middle" fontSize="2" fill="#666">HC-SR501</text>
            </g>
        );
    }

    if (comp.type === 'RFID') {
        return (
            <g>
                <rect x="0" y="0" width="20" height="20" rx="2" fill="#1e40af" stroke="#1e3a8a" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="7" fill="none" stroke="#60a5fa" strokeWidth="1" />
                <circle cx="10" cy="10" r="5" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                <text x="10" y="11" textAnchor="middle" fontSize="3" fill="#93c5fd" fontWeight="bold">RC522</text>
                <rect x="16" y="16" width="3" height="4" fill="url(#metal-shiny)" rx="0.3" />
                <text x="10" y="23" textAnchor="middle" fontSize="2" fill="#60a5fa">13.56MHz</text>
            </g>
        );
    }

    if (comp.type === 'SD_CARD') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <rect x="4" y="4" width="12" height="10" rx="0.5" fill="#333" />
                <text x="10" y="10" textAnchor="middle" fontSize="2.5" fill="#888" fontWeight="bold">SD</text>
                <text x="10" y="13" textAnchor="middle" fontSize="1.5" fill="#666">MMC</text>
                <path d="M 5 18 L 5 22 M 8 18 L 8 22 M 11 18 L 11 22 M 14 18 L 14 22 M 17 18 L 17 22" stroke="url(#metal-shiny)" strokeWidth="0.4" />
                <text x="10" y="25" textAnchor="middle" fontSize="2" fill="#555">SPI</text>
            </g>
        );
    }

    if (comp.type === 'BLUETOOTH') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="10" y="8" textAnchor="middle" fontSize="3" fill="#3b82f6" fontWeight="bold">BT</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.8" fill="#60a5fa">HC-05</text>
                <path d="M 14 3 L 16 2 L 17 4" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                {isActive && (
                    <g className="pointer-events-none">
                        <path d="M 17 2 Q 20 0 18 -2" fill="none" stroke="#3b82f6" strokeWidth="0.4" opacity="0.5" />
                        <path d="M 17 2 Q 22 -1 19 -4" fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.3" />
                    </g>
                )}
                <path d="M 5 18 L 5 22 M 15 18 L 15 22" stroke="url(#metal-shiny)" strokeWidth="0.5" />
            </g>
        );
    }

    if (comp.type === 'WIFI') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="10" y="8" textAnchor="middle" fontSize="2.5" fill="#22c55e" fontWeight="bold">WiFi</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.5" fill="#4ade80">ESP8266</text>
                <path d="M 14 3 Q 18 1 16 -2" fill="none" stroke="#22c55e" strokeWidth="0.5" />
                {isActive && (
                    <g className="pointer-events-none">
                        <path d="M 16 -2 Q 20 -4 18 -6" fill="none" stroke="#22c55e" strokeWidth="0.3" opacity="0.4" />
                    </g>
                )}
                <path d="M 5 18 L 5 22 M 15 18 L 15 22" stroke="url(#metal-shiny)" strokeWidth="0.5" />
            </g>
        );
    }

    if (comp.type === 'TEMP_SENSOR') {
        return (
            <g>
                <path d="M 8 18 L 8 22 M 12 18 L 12 22" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <rect x="5" y="4" width="10" height="14" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="10" y="9" textAnchor="middle" fontSize="2" fill="#888">LM35</text>
                <text x="10" y="12" textAnchor="middle" fontSize="1.8" fill="#666">TEMP</text>
                <text x="10" y="15" textAnchor="middle" fontSize="1.5" fill="#ef4444">C</text>
            </g>
        );
    }

    if (comp.type === 'THERMISTOR') {
        return (
            <g>
                <path d="M 0 10 L 5 10 M 15 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <rect x="5" y="6" width="10" height="8" rx="1" fill="#d4c5a0" stroke="#b8a882" strokeWidth="0.3" />
                <text x="10" y="11" textAnchor="middle" fontSize="2.5" fill="#78350f" fontWeight="bold">NTC</text>
                <text x="10" y="18" textAnchor="middle" fontSize="2" fill="#94a3b8">10K</text>
            </g>
        );
    }

    if (comp.type === 'COMPASS') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#0ea5e9" stroke="#0284c7" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="5" fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.2" />
                <path d="M 10 5 L 11 9 L 10 8 L 9 9 Z" fill="#ef4444" />
                <path d="M 10 15 L 11 11 L 10 12 L 9 11 Z" fill="#94a3b8" />
                <circle cx="10" cy="10" r="1" fill="#f8fafc" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#38bdf8">HMC5883</text>
            </g>
        );
    }

    if (comp.type === 'ENCODER') {
        return (
            <g>
                <circle cx="10" cy="10" r="9" fill="#1a1a1a" stroke="#333" strokeWidth="0.4" />
                <circle cx="10" cy="10" r="6" fill="#222" stroke="#444" strokeWidth="0.2" />
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                    <line key={i} x1="10" y1="5" x2="10" y2="6.5" stroke="#555" strokeWidth="0.3" transform={`rotate(${i * 30} 10 10)`} />
                ))}
                <circle cx="10" cy="10" r="3" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.2" />
                <circle cx="10" cy="10" r="1.5" fill="#cbd5e1" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#666">ENC</text>
            </g>
        );
    }

    if (comp.type === 'FINGERPRINT') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="2" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="6" fill="#1e293b" stroke="#334155" strokeWidth="0.3" />
                {[0,1,2,3,4].map(i => (
                    <path key={i} d={`M 6 ${7 + i * 1.5} Q 10 ${6 + i * 1.5} 14 ${7 + i * 1.5}`} fill="none" stroke="#475569" strokeWidth="0.3" />
                ))}
                {isActive && (
                    <circle cx="10" cy="10" r="6" fill="#22c55e" opacity="0.15" className="pointer-events-none" />
                )}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#666">R307</text>
            </g>
        );
    }

    if (comp.type === 'FLAME_SENSOR') {
        return (
            <g>
                <rect x="2" y="4" width="16" height="14" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="4" fill="#1e293b" stroke="#334155" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="2" fill="#7f1d1d" />
                {isActive && (
                    <g className="pointer-events-none">
                        <circle cx="10" cy="10" r="6" fill="#ef4444" opacity="0.2" />
                        <path d="M 10 3 Q 12 6 10 8 Q 8 6 10 3" fill="#f97316" opacity="0.6" />
                    </g>
                )}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#ef4444">FLAME</text>
            </g>
        );
    }

    if (comp.type === 'FLEX_SENSOR') {
        return (
            <g>
                <path d="M 0 10 L 4 10" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <path d="M 16 10 L 20 10" stroke="url(#metal-shiny)" strokeWidth="0.7" />
                <rect x="4" y="5" width="12" height="10" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="0.3" />
                {[0,1,2,3,4].map(i => (
                    <line key={i} x1={6 + i * 2.5} y1="6" x2={6 + i * 2.5} y2="14" stroke="#a78bfa" strokeWidth="0.3" />
                ))}
                <text x="10" y="11" textAnchor="middle" fontSize="2" fill="#c4b5fd">FLEX</text>
                <text x="10" y="18" textAnchor="middle" fontSize="2" fill="#94a3b8">Bend</text>
            </g>
        );
    }

    if (comp.type === 'GAS_SENSOR') {
        return (
            <g>
                <rect x="1" y="4" width="18" height="14" rx="2" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="6" fill="#333" stroke="#555" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="4" fill="#444" />
                {[0,1,2,3,4,5].map(i => (
                    <line key={i} x1={7 + i} y1="7" x2={7 + i} y2="13" stroke="#666" strokeWidth="0.2" />
                ))}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#fbbf24">MQ-2</text>
            </g>
        );
    }

    if (comp.type === 'GPS') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1e293b" stroke="#333" strokeWidth="0.3" />
                <rect x="4" y="4" width="12" height="8" rx="0.5" fill="#334155" />
                <text x="10" y="8" textAnchor="middle" fontSize="2.5" fill="#22c55e" fontWeight="bold">GPS</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.5" fill="#4ade80">NEO-6M</text>
                <rect x="5" y="13" width="10" height="3" rx="0.5" fill="#475569" />
                {isActive && (
                    <circle cx="10" cy="6" r="8" fill="none" stroke="#22c55e" strokeWidth="0.3" opacity="0.3" className="pointer-events-none" />
                )}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#666">5Hz</text>
            </g>
        );
    }

    if (comp.type === 'GYRO') {
        return (
            <g>
                <rect x="3" y="3" width="14" height="14" rx="1" fill="#0d9488" stroke="#0f766e" strokeWidth="0.3" />
                <rect x="6" y="6" width="8" height="8" rx="0.5" fill="#134e4a" stroke="#115e59" strokeWidth="0.2" />
                <text x="10" y="11" textAnchor="middle" fontSize="2" fill="#5eead4" fontWeight="bold">MPU</text>
                <text x="10" y="14" textAnchor="middle" fontSize="1.5" fill="#99f6e4">6050</text>
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#2dd4bf">6DOF</text>
            </g>
        );
    }

    if (comp.type === 'HALL_SENSOR') {
        return (
            <g>
                <path d="M 8 14 L 8 20 M 10 14 L 10 20 M 12 14 L 12 20" stroke="url(#metal-shiny)" strokeWidth="0.5" />
                <rect x="6" y="4" width="8" height="10" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="10" y="9" textAnchor="middle" fontSize="2" fill="#60a5fa">HALL</text>
                <text x="10" y="12" textAnchor="middle" fontSize="1.5" fill="#93c5fd">3144</text>
                <text x="10" y="23" textAnchor="middle" fontSize="2" fill="#94a3b8">MAG</text>
            </g>
        );
    }

    if (comp.type === 'HEARTBEAT') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <path d="M 5 10 L 7 10 L 8 7 L 9 13 L 10 5 L 11 12 L 12 9 L 13 10 L 15 10" fill="none" stroke="#ef4444" strokeWidth="0.8" />
                {isActive && (
                    <path d="M 5 10 L 7 10 L 8 7 L 9 13 L 10 5 L 11 12 L 12 9 L 13 10 L 15 10" fill="none" stroke="#ef4444" strokeWidth="1.2" opacity="0.5" className="pointer-events-none" />
                )}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#ef4444">PULSE</text>
            </g>
        );
    }

    if (comp.type === 'PRESSURE_SENSOR') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#0891b2" stroke="#0e7490" strokeWidth="0.3" />
                <rect x="5" y="5" width="10" height="10" rx="0.5" fill="#164e63" />
                <text x="10" y="10" textAnchor="middle" fontSize="2" fill="#67e8f9" fontWeight="bold">BMP</text>
                <text x="10" y="13" textAnchor="middle" fontSize="1.5" fill="#a5f3fc">280</text>
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#22d3ee">hPa</text>
            </g>
        );
    }

    if (comp.type === 'RAIN_SENSOR') {
        return (
            <g>
                <rect x="1" y="4" width="18" height="14" rx="1" fill="#1e3a5f" stroke="#1e40af" strokeWidth="0.3" />
                {[0,1,2,3,4].map(i => (
                    <g key={i}>
                        <line x1={4 + i * 3} y1="6" x2={4 + i * 3} y2="16" stroke="#3b82f6" strokeWidth="0.3" />
                        <line x1={3 + i * 3} y1="8" x2={5 + i * 3} y2="8" stroke="#3b82f6" strokeWidth="0.3" />
                    </g>
                ))}
                {isActive && (
                    <g className="pointer-events-none">
                        {[0,1,2].map(i => (
                            <path key={i} d={`M ${6 + i * 4} 2 Q ${7 + i * 4} 4 ${6 + i * 4} 6`} fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.5" />
                        ))}
                    </g>
                )}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#60a5fa">RAIN</text>
            </g>
        );
    }

    if (comp.type === 'RTC') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="5" fill="#333" stroke="#555" strokeWidth="0.2" />
                <text x="10" y="10" textAnchor="middle" fontSize="2" fill="#22c55e" fontWeight="bold">RTC</text>
                <text x="10" y="13" textAnchor="middle" fontSize="1.5" fill="#4ade80">DS3231</text>
                <circle cx="10" cy="18" r="2" fill="#475569" stroke="#64748b" strokeWidth="0.2" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#94a3b8">CR2032</text>
            </g>
        );
    }

    if (comp.type === 'SOIL_SENSOR') {
        return (
            <g>
                <rect x="6" y="2" width="8" height="8" rx="0.5" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="10" y="7" textAnchor="middle" fontSize="2" fill="#a16207">SOIL</text>
                <path d="M 8 10 L 7 20 M 10 10 L 10 22 M 12 10 L 13 20" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
                <text x="10" y="25" textAnchor="middle" fontSize="2" fill="#ca8a04">V2.0</text>
            </g>
        );
    }

    if (comp.type === 'SOUND_SENSOR') {
        return (
            <g>
                <rect x="2" y="4" width="16" height="14" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="4" fill="#333" stroke="#555" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="2" fill="#444" />
                <circle cx="10" cy="10" r="0.8" fill="#222" />
                {isActive && (
                    <g className="pointer-events-none">
                        <path d="M 15 8 Q 18 10 15 12" fill="none" stroke="#facc15" strokeWidth="0.4" opacity="0.4" />
                        <path d="M 17 6 Q 21 10 17 14" fill="none" stroke="#facc15" strokeWidth="0.3" opacity="0.25" />
                    </g>
                )}
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#94a3b8">MIC</text>
            </g>
        );
    }

    if (comp.type === 'TILT_SENSOR') {
        return (
            <g>
                <path d="M 8 14 L 8 20 M 12 14 L 12 20" stroke="url(#metal-shiny)" strokeWidth="0.6" />
                <rect x="6" y="4" width="8" height="10" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <circle cx="10" cy="9" r="2" fill={isActive ? '#ef4444' : '#555'} />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#94a3b8">TILT</text>
            </g>
        );
    }

    if (comp.type === 'RADIO') {
        return (
            <g>
                <rect x="2" y="2" width="16" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
                <text x="10" y="8" textAnchor="middle" fontSize="2.5" fill="#a855f7" fontWeight="bold">RF</text>
                <text x="10" y="11" textAnchor="middle" fontSize="1.5" fill="#c084fc">NRF24</text>
                <text x="10" y="14" textAnchor="middle" fontSize="1.5" fill="#d8b4fe">L01+</text>
                <path d="M 14 3 L 16 2 L 17 4 L 18 1" fill="none" stroke="#a855f7" strokeWidth="0.4" />
                <text x="10" y="22" textAnchor="middle" fontSize="2" fill="#94a3b8">2.4GHz</text>
            </g>
        );
    }

    // Fallback for unrendered components
    if (!isMicrocontroller(comp.type)) {
        return (
            <g>
                <rect x="0" y="0" width="20" height="20" rx="2" fill="#334155" />
                <text x="10" y="12" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">{comp.type.slice(0, 3)}</text>
            </g>
        );
    }

    return null;
};
