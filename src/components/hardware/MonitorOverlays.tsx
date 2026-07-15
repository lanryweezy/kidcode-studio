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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="animate-bounce bg-red-600 text-white font-black text-2xl px-8 py-4 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.8)] border-4 border-red-300">
                        ⚡ SHORT CIRCUIT ⚡
                        <div className="text-sm text-center mt-2 font-normal text-red-200">System Halted.</div>
                    </div>
                </div>
            )}
        </>
    );
};
