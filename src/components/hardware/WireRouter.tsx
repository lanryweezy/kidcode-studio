import React from 'react';
import { CircuitComponent, Wire } from '../../types';
import { getWireColor } from './PinManager';

interface WireRouterProps {
    wires: Wire[];
    localComponents: CircuitComponent[];
    hardwareState: { pins: boolean[] };
    wiringMode: boolean;
    wiringStart: { componentId: string; pin: number; x: number; y: number } | null;
    mousePos: { x: number; y: number };
    containerRef: React.RefObject<HTMLDivElement>;
    onWireClick: (wireId: string) => void;
    wireRefs: React.MutableRefObject<Map<string, SVGPathElement>>;
    getComponentCenter: (comp: CircuitComponent) => { x: number; y: number };
}

export function getComponentCenter(comp: CircuitComponent): { x: number; y: number } {
    return { x: comp.x + 10, y: comp.y + 10 };
}

export const WireRouter: React.FC<WireRouterProps> = ({
    wires,
    localComponents,
    hardwareState,
    wiringMode,
    wiringStart,
    mousePos,
    containerRef,
    onWireClick,
    wireRefs,
    getComponentCenter: getCenter,
}) => {
    return (
        <g>
            {/* Wires */}
            {wires.map((wire) => {
                const fromComp = localComponents.find(c => c.id === wire.fromComponentId);
                const toComp = localComponents.find(c => c.id === wire.toComponentId);
                if (!fromComp || !toComp) return null;

                const fromCenter = getCenter(fromComp);
                const toCenter = getCenter(toComp);
                const isActive = hardwareState.pins[fromComp.pin] || hardwareState.pins[toComp.pin];

                const dx = toCenter.x - fromCenter.x;
                const dy = toCenter.y - fromCenter.y;
                let pathD: string;
                if (Math.abs(dx) > Math.abs(dy)) {
                    pathD = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
                } else {
                    pathD = `M ${fromCenter.x} ${fromCenter.y} L ${fromCenter.x} ${toCenter.y} L ${toCenter.x} ${toCenter.y}`;
                }

                const autoColor = getWireColor(fromComp);
                const wireColor = wire.color || autoColor;

                return (
                    <g key={`wire-group-${wire.id}`}>
                        <path d={pathD} fill="none" stroke="black" opacity="0.15" strokeWidth={isActive ? 5 : 3} transform="translate(1, 2)" />
                        <path key={`wire-${wire.id}`} id={`wire-${wire.id}`}
                            ref={(el: SVGPathElement | null) => { if (el) wireRefs.current.set(`wire-${wire.id}`, el); else wireRefs.current.delete(`wire-${wire.id}`); }}
                            d={pathD} fill="none" stroke={wireColor} strokeWidth={isActive ? 3 : 2}
                            strokeLinecap="round" strokeLinejoin="round"
                            className="transition-all duration-300 cursor-pointer hover:stroke-yellow-400"
                            onClick={(e) => { e.stopPropagation(); onWireClick(wire.id); }}
                        />
                        <circle cx={fromCenter.x} cy={fromCenter.y} r="2.5" fill={wireColor} stroke="white" strokeWidth="0.5" opacity="0.8" />
                        <circle cx={toCenter.x} cy={toCenter.y} r="2.5" fill={wireColor} stroke="white" strokeWidth="0.5" opacity="0.8" />
                        {isActive && (
                            <>
                                <circle r="3" fill={wireColor} opacity="0.6">
                                    <animateMotion dur="1s" repeatCount="indefinite" path={pathD} />
                                </circle>
                                <circle r="2" fill={wireColor} opacity="0.8">
                                    <animateMotion dur="1s" repeatCount="indefinite" begin="0.3s" path={pathD} />
                                </circle>
                                <circle r="1.5" fill="white" opacity="0.4">
                                    <animateMotion dur="1s" repeatCount="indefinite" begin="0.6s" path={pathD} />
                                </circle>
                            </>
                        )}
                    </g>
                );
            })}

            {/* Wire preview during wiring */}
            {wiringMode && wiringStart && (
                <g>
                    <line
                        x1={wiringStart.x}
                        y1={wiringStart.y}
                        x2={(mousePos.x / (containerRef.current?.getBoundingClientRect().width || 600)) * 600}
                        y2={(mousePos.y / (containerRef.current?.getBoundingClientRect().height || 400)) * 400}
                        stroke={getWireColor(localComponents.find(c => c.id === wiringStart.componentId) || localComponents[0])}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.7"
                        pointerEvents="none"
                    />
                    <circle cx={wiringStart.x} cy={wiringStart.y} r="3" fill="#fbbf24" stroke="white" strokeWidth="1" />
                </g>
            )}
        </g>
    );
};
