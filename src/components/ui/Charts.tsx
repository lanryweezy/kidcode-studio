import React from 'react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showDot?: boolean;
  className?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  width = 120,
  height = 40,
  color,
  showArea = false,
  showDot = false,
  className = '',
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0];
  const strokeColor = color || (isUp ? '#10b981' : '#ef4444');

  const points = data.map((price, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((price - min) / range) * height;
    return { x, y };
  });

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const lastPoint = points[points.length - 1];

  return (
    <svg width={width} height={height} className={className}>
      {showArea && (
        <polygon
          points={`0,${height} ${pathPoints} ${width},${height}`}
          fill={strokeColor}
          fillOpacity={0.1}
        />
      )}
      <polyline
        points={pathPoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill={strokeColor} />
      )}
    </svg>
  );
};

interface LineChartProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  showGrid?: boolean;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  width = 800,
  height = 200,
  color,
  title,
  showGrid = true,
  className = '',
}) => {
  if (data.length < 2) return <div className="text-slate-500 text-sm">No data</div>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0];
  const strokeColor = color || (isUp ? '#10b981' : '#ef4444');

  const points = data.map((price, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((price - min) / range) * (height - 20) - 10;
    return { x, y };
  });

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const lastPoint = points[points.length - 1];

  return (
    <div className={`bg-slate-900 rounded-xl p-4 ${className}`}>
      {title && <div className="text-white font-bold mb-3">{title}</div>}
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`chart-gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {showGrid && (
          <g stroke="#334155" strokeWidth="0.5">
            {[0.25, 0.5, 0.75].map(ratio => (
              <line key={ratio} x1="0" y1={height * ratio} x2={width} y2={height * ratio} />
            ))}
          </g>
        )}
        <polygon
          points={`0,${height} ${pathPoints} ${width},${height}`}
          fill={`url(#chart-gradient-${title})`}
        />
        <polyline
          points={pathPoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill={strokeColor} />
      </svg>
    </div>
  );
};

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 150,
  className = '',
}) => {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className={`bg-slate-900 rounded-xl p-4 ${className}`}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = maxVal > 0 ? (item.value / maxVal) * height : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div className="text-xs text-slate-400 mb-1">{item.value}</div>
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: barHeight,
                  backgroundColor: item.color || '#8b5cf6',
                }}
              />
              <div className="text-xs text-slate-500 mt-1 truncate w-full text-center">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  title?: string;
  className?: string;
}

const PIE_COLORS = ['#8b5cf6', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  title,
  className = '',
}) => {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;

  let cumulativePercent = 0;

  const slices = data.map((item, i) => {
    const percent = item.value / total;
    const startAngle = cumulativePercent * 2 * Math.PI;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 2 * Math.PI;

    const x1 = cx + radius * Math.sin(startAngle);
    const y1 = cy - radius * Math.cos(startAngle);
    const x2 = cx + radius * Math.sin(endAngle);
    const y2 = cy - radius * Math.cos(endAngle);

    const largeArc = percent > 0.5 ? 1 : 0;

    const pathD = percent >= 1
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path: pathD,
      color: item.color || PIE_COLORS[i % PIE_COLORS.length],
      label: item.label,
      value: item.value,
      percent: (percent * 100).toFixed(1),
    };
  });

  return (
    <div className={`bg-slate-900 rounded-xl p-4 ${className}`}>
      {title && <div className="text-white font-bold mb-3">{title}</div>}
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} stroke="#0f172a" strokeWidth="2" />
          ))}
        </svg>
        <div className="flex flex-col gap-1.5">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-400">{slice.label}</span>
              <span className="text-slate-500">{slice.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
