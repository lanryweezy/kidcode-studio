import React from 'react';
import { CircuitComponent, HardwareState } from '../../types';
import { isMicrocontroller } from './PinManager';

export function getPinCoords(pin: number): { x: number; y: number } {
    const isLeft = pin % 2 === 0;
    const row = Math.floor(pin / 2);
    const x = isLeft ? 90 : 210;
    const y = 130 + (row * 20);
    if (pin >= 90) return { x: 150 + (pin - 90) * 10 - 50, y: 350 };
    return { x, y };
}

export function getMicrocontrollerPinCoords(compType: string, pin: number, compX: number, compY: number): { x: number; y: number } {
    if (compType === 'ARDUINO_UNO' || compType === 'ARDUINO_NANO') {
        if (pin <= 13) return { x: compX + 8 + (pin * 7), y: compY - 8 };
        else if (pin >= 14 && pin <= 21) return { x: compX + 8 + ((pin - 14) * 7), y: compY + 42 };
        else if (pin === 22) return { x: compX + 5, y: compY + 15 };
        else if (pin === 23) return { x: compX + 5, y: compY + 25 };
        else if (pin === 24) return { x: compX + 60, y: compY + 15 };
        else if (pin === 25) return { x: compX + 60, y: compY + 25 };
    }
    return { x: compX + 10, y: compY + 10 };
}

interface WireRoutingProps {
    localComponents: CircuitComponent[];
    hardwareState: HardwareState;
    wireRefs: React.MutableRefObject<Map<string, SVGPathElement>>;
}

export const WireRouting: React.FC<WireRoutingProps> = ({ localComponents, hardwareState, wireRefs }) => {
    return (
        <>
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
        </>
    );
};
