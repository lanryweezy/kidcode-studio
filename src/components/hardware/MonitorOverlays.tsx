import React from 'react';
import { HardwareState } from '../../types';

interface MonitorOverlaysProps {
    hardwareState: HardwareState;
    historyRef: React.MutableRefObject<number[][]>;
}

export const MonitorOverlays: React.FC<MonitorOverlaysProps> = ({ hardwareState, historyRef }) => {
    return (
        <>
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
            {hardwareState.multimeterVoltage !== undefined && (
                <div className="absolute top-2 left-2 bg-zinc-900/90 text-red-500 font-mono text-xs p-2 rounded border border-zinc-700 shadow-xl pointer-events-none w-32">
                    <div className="text-zinc-500 text-[10px] mb-1">MULTIMETER</div>
                    <div className="flex justify-between"><span>V:</span> <span>{hardwareState.multimeterVoltage.toFixed(2)} V</span></div>
                    <div className="flex justify-between"><span>I:</span> <span>{(hardwareState.multimeterCurrent! * 1000).toFixed(1)} mA</span></div>
                    <div className="flex justify-between"><span>R:</span> <span>{hardwareState.multimeterResistance} Ω</span></div>
                </div>
            )}

            {hardwareState.powerDraw !== undefined && (
                <div className="absolute top-2 right-2 bg-black/80 text-emerald-400 font-mono text-xs p-2 rounded border border-emerald-900/50 shadow-xl pointer-events-none w-32">
                    <div className="text-emerald-700 text-[10px] mb-1">SYSTEM PWR</div>
                    <div className="flex justify-between"><span>Load:</span> <span>{hardwareState.powerDraw.toFixed(1)} mW</span></div>
                </div>
            )}

            {hardwareState.isShortCircuit && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    <svg width="100%" height="100%" viewBox="0 0 300 400" className="absolute inset-0">
                        <defs>
                            <radialGradient id="smoke-grad" cx="50%" cy="60%" r="50%">
                                <stop offset="0%" stopColor="#6b7280" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#374151" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#111827" stopOpacity="0" />
                            </radialGradient>
                            <filter id="smoke-blur">
                                <feGaussianBlur stdDeviation="8" />
                            </filter>
                        </defs>
                        <circle cx="150" cy="200" r="60" fill="url(#smoke-grad)" filter="url(#smoke-blur)" className="animate-pulse" />
                        <circle cx="140" cy="180" r="30" fill="#6b7280" opacity="0.5" filter="url(#smoke-blur)">
                            <animate attributeName="cy" values="180;120;80" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0.3;0" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="r" values="30;50;70" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="160" cy="190" r="20" fill="#9ca3af" opacity="0.4" filter="url(#smoke-blur)">
                            <animate attributeName="cy" values="190;130;90" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0.2;0" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="r" values="20;40;60" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="150" cy="200" r="15" fill="#ef4444" opacity="0.7">
                            <animate attributeName="r" values="15;25;15" dur="0.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.7;0.4;0.7" dur="0.5s" repeatCount="indefinite" />
                        </circle>
                        <path d="M 145 195 L 150 175 L 155 195 L 160 180 L 155 195" fill="#f97316" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.5;0.8" dur="0.3s" repeatCount="indefinite" />
                        </path>
                        <text x="150" y="260" textAnchor="middle" fontSize="14" fill="#ef4444" fontWeight="black" className="animate-bounce">
                            ⚡ SHORT CIRCUIT ⚡
                        </text>
                        <text x="150" y="275" textAnchor="middle" fontSize="8" fill="#fca5a5">
                            System Halted — Check wiring!
                        </text>
                    </svg>
                    <div className="absolute inset-0 bg-red-900/20 animate-pulse" />
                </div>
            )}
        </>
    );
};
