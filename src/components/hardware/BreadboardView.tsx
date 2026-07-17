import React from 'react';
import { CircuitComponent, HardwareState } from '../../types';

interface BreadboardViewProps {
  components: CircuitComponent[];
  hardwareState: HardwareState;
  width?: number;
  height?: number;
}

const HOLES_PER_ROW = 30;
const HOLE_SPACING = 8;
const HOLE_RADIUS = 1.5;
const RAIL_HOLE_RADIUS = 1.2;
const BOARD_PADDING = 12;
const POWER_RAIL_HEIGHT = 14;
const CENTER_GAP = 20;
const ROW_GROUPS = 5;

function getHoleX(col: number): number {
  return BOARD_PADDING + 20 + col * HOLE_SPACING;
}

function getHoleY(row: number, section: 'top' | 'bottom'): number {
  const baseY = BOARD_PADDING + POWER_RAIL_HEIGHT + 8;
  if (section === 'top') {
    return baseY + row * HOLE_SPACING;
  }
  return baseY + ROW_GROUPS * HOLE_SPACING + CENTER_GAP + row * HOLE_SPACING;
}

function getRailY(rail: 'red' | 'blue', section: 'top' | 'bottom'): number {
  if (section === 'top') {
    return BOARD_PADDING + (rail === 'red' ? 4 : POWER_RAIL_HEIGHT - 2);
  }
  return BOARD_PADDING + POWER_RAIL_HEIGHT + 8 + ROW_GROUPS * HOLE_SPACING + CENTER_GAP + ROW_GROUPS * HOLE_SPACING + 4 + (rail === 'red' ? 4 : POWER_RAIL_HEIGHT - 2);
}

function getRowLabel(row: number): string {
  return String.fromCharCode(65 + row);
}

function getColLabel(col: number): number {
  return col + 1;
}

export const BreadboardView: React.FC<BreadboardViewProps> = ({
  components,
  hardwareState,
  width = 800,
  height = 320,
}) => {
  const boardWidth = HOLES_PER_ROW * HOLE_SPACING + BOARD_PADDING * 2 + 20;
  const boardHeight = POWER_RAIL_HEIGHT * 2 + ROW_GROUPS * HOLE_SPACING * 2 + CENTER_GAP + BOARD_PADDING * 2 + 16;

  const scaleX = width / boardWidth;
  const scaleY = height / boardHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  const totalWidth = boardWidth * scale;
  const totalHeight = boardHeight * scale;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${boardWidth} ${boardHeight}`}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    >
      <defs>
        <pattern id="breadboard-texture" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#f0f0f0" />
          <circle cx="2" cy="2" r="0.3" fill="#e0e0e0" />
        </pattern>
        <filter id="breadboard-shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
        </filter>
        <linearGradient id="breadboard-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="50%" stopColor="#eeeeee" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
      </defs>

      <g transform={`translate(${(width - totalWidth) / 2}, ${(height - totalHeight) / 2})`}>
        <rect
          x="0"
          y="0"
          width={boardWidth}
          height={boardHeight}
          rx="8"
          ry="8"
          fill="url(#breadboard-body)"
          stroke="#ccc"
          strokeWidth="1.5"
          filter="url(#breadboard-shadow)"
        />

        <rect x="4" y="4" width={boardWidth - 8} height={boardHeight - 8} rx="6" ry="6" fill="url(#breadboard-texture)" opacity="0.3" />

        {/* Top Power Rails */}
        <g id="top-power-rails">
          <rect x={BOARD_PADDING} y={BOARD_PADDING} width={HOLES_PER_ROW * HOLE_SPACING + 20} height={POWER_RAIL_HEIGHT} rx="3" fill="#f8f8f8" stroke="#ddd" strokeWidth="0.5" />
          <line
            x1={BOARD_PADDING}
            y1={getRailY('red', 'top')}
            x2={BOARD_PADDING + HOLES_PER_ROW * HOLE_SPACING + 20}
            y2={getRailY('red', 'top')}
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.7"
          />
          <line
            x1={BOARD_PADDING}
            y1={getRailY('blue', 'top')}
            x2={BOARD_PADDING + HOLES_PER_ROW * HOLE_SPACING + 20}
            y2={getRailY('blue', 'top')}
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.7"
          />
          {Array.from({ length: HOLES_PER_ROW }).map((_, col) => (
            <g key={`top-rail-${col}`}>
              <circle
                cx={getHoleX(col)}
                cy={getRailY('red', 'top')}
                r={RAIL_HOLE_RADIUS}
                fill="#444"
                stroke="#333"
                strokeWidth="0.3"
              />
              <circle
                cx={getHoleX(col)}
                cy={getRailY('blue', 'top')}
                r={RAIL_HOLE_RADIUS}
                fill="#444"
                stroke="#333"
                strokeWidth="0.3"
              />
            </g>
          ))}
          <text x={BOARD_PADDING - 2} y={getRailY('red', 'top') + 1.5} textAnchor="end" fontSize="4" fill="#ef4444" fontWeight="bold">+</text>
          <text x={BOARD_PADDING - 2} y={getRailY('blue', 'top') + 1.5} textAnchor="end" fontSize="4" fill="#3b82f6" fontWeight="bold">-</text>
        </g>

        {/* Top Connection Rows (a-e) */}
        <g id="top-rows">
          {Array.from({ length: ROW_GROUPS }).map((_, row) => (
            <g key={`top-row-${row}`}>
              <text x={BOARD_PADDING + 10} y={getHoleY(row, 'top') + 1.5} textAnchor="middle" fontSize="4" fill="#999" fontWeight="bold">
                {getRowLabel(row)}
              </text>
              {Array.from({ length: HOLES_PER_ROW }).map((_, col) => (
                <circle
                  key={`top-${row}-${col}`}
                  cx={getHoleX(col)}
                  cy={getHoleY(row, 'top')}
                  r={HOLE_RADIUS}
                  fill="#444"
                  stroke="#333"
                  strokeWidth="0.3"
                />
              ))}
            </g>
          ))}
        </g>

        {/* Center Channel */}
        <rect
          x={BOARD_PADDING}
          y={BOARD_PADDING + POWER_RAIL_HEIGHT + 8 + ROW_GROUPS * HOLE_SPACING - 4}
          width={HOLES_PER_ROW * HOLE_SPACING + 20}
          height={CENTER_GAP + 8}
          rx="2"
          fill="#e8e8e8"
          stroke="#ddd"
          strokeWidth="0.5"
        />
        <text
          x={boardWidth / 2}
          y={BOARD_PADDING + POWER_RAIL_HEIGHT + 8 + ROW_GROUPS * HOLE_SPACING + CENTER_GAP / 2 + 1}
          textAnchor="middle"
          fontSize="5"
          fill="#bbb"
          fontWeight="bold"
          letterSpacing="2"
        >
          KIDCODE STUDIO
        </text>

        {/* Bottom Connection Rows (f-j) */}
        <g id="bottom-rows">
          {Array.from({ length: ROW_GROUPS }).map((_, row) => (
            <g key={`bottom-row-${row}`}>
              <text x={BOARD_PADDING + 10} y={getHoleY(row, 'bottom') + 1.5} textAnchor="middle" fontSize="4" fill="#999" fontWeight="bold">
                {getRowLabel(row + ROW_GROUPS)}
              </text>
              {Array.from({ length: HOLES_PER_ROW }).map((_, col) => (
                <circle
                  key={`bottom-${row}-${col}`}
                  cx={getHoleX(col)}
                  cy={getHoleY(row, 'bottom')}
                  r={HOLE_RADIUS}
                  fill="#444"
                  stroke="#333"
                  strokeWidth="0.3"
                />
              ))}
            </g>
          ))}
        </g>

        {/* Bottom Power Rails */}
        <g id="bottom-power-rails">
          <rect x={BOARD_PADDING} y={getRailY('red', 'bottom') - 4} width={HOLES_PER_ROW * HOLE_SPACING + 20} height={POWER_RAIL_HEIGHT} rx="3" fill="#f8f8f8" stroke="#ddd" strokeWidth="0.5" />
          <line
            x1={BOARD_PADDING}
            y1={getRailY('red', 'bottom')}
            x2={BOARD_PADDING + HOLES_PER_ROW * HOLE_SPACING + 20}
            y2={getRailY('red', 'bottom')}
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.7"
          />
          <line
            x1={BOARD_PADDING}
            y1={getRailY('blue', 'bottom')}
            x2={BOARD_PADDING + HOLES_PER_ROW * HOLE_SPACING + 20}
            y2={getRailY('blue', 'bottom')}
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.7"
          />
          {Array.from({ length: HOLES_PER_ROW }).map((_, col) => (
            <g key={`bottom-rail-${col}`}>
              <circle
                cx={getHoleX(col)}
                cy={getRailY('red', 'bottom')}
                r={RAIL_HOLE_RADIUS}
                fill="#444"
                stroke="#333"
                strokeWidth="0.3"
              />
              <circle
                cx={getHoleX(col)}
                cy={getRailY('blue', 'bottom')}
                r={RAIL_HOLE_RADIUS}
                fill="#444"
                stroke="#333"
                strokeWidth="0.3"
              />
            </g>
          ))}
          <text x={BOARD_PADDING - 2} y={getRailY('red', 'bottom') + 1.5} textAnchor="end" fontSize="4" fill="#ef4444" fontWeight="bold">+</text>
          <text x={BOARD_PADDING - 2} y={getRailY('blue', 'bottom') + 1.5} textAnchor="end" fontSize="4" fill="#3b82f6" fontWeight="bold">-</text>
        </g>

        {/* Column numbers along top */}
        {Array.from({ length: HOLES_PER_ROW }).map((_, col) => (
          <text
            key={`col-num-${col}`}
            x={getHoleX(col)}
            y={BOARD_PADDING + POWER_RAIL_HEIGHT + 4}
            textAnchor="middle"
            fontSize="3"
            fill="#bbb"
          >
            {getColLabel(col)}
          </text>
        ))}
      </g>
    </svg>
  );
};

export default BreadboardView;
