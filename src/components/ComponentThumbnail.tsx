
import React from 'react';

interface ComponentThumbnailProps {
  type: string;
}

const ComponentThumbnail: React.FC<ComponentThumbnailProps> = ({ type }) => {
  const isMC = type.includes('ARDUINO') || type.includes('ESP') || type.includes('RASPBERRY') || type.includes('MICROBIT') || type.includes('NODE');
  
  return (
    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 shadow-inner shrink-0">
      <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-sm">
        <defs>
          <linearGradient id="thumb-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        
        {type.startsWith('LED') && (
          <g transform="translate(10, 5) scale(1.2)">
            <line x1="6" y1="15" x2="6" y2="22" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="10" y1="15" x2="10" y2="22" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="8" cy="10" r="6" fill={type.includes('RED') ? '#ef4444' : type.includes('BLUE') ? '#3b82f6' : '#22c55e'} />
            <circle cx="6" cy="8" r="2" fill="white" opacity="0.3" />
          </g>
        )}

        {type === 'BUTTON' && (
          <g transform="translate(10, 10)">
            <rect x="0" y="0" width="20" height="20" rx="2" fill="#1e293b" />
            <circle cx="10" cy="10" r="6" fill="#334155" stroke="#000" strokeWidth="0.5" />
            <circle cx="10" cy="10" r="4" fill="#ef4444" />
          </g>
        )}

        {isMC && (
          <g transform="translate(5, 5)">
            <rect x="0" y="0" width="30" height="30" rx="3" fill={type.includes('RASPBERRY') ? '#166534' : '#0066cc'} />
            <rect x="10" y="10" width="10" height="10" rx="1" fill="#1e293b" />
            <rect x="2" y="2" width="26" height="4" fill="#334155" />
            <rect x="2" y="24" width="26" height="4" fill="#334155" />
          </g>
        )}

        {type === 'LCD' && (
          <g transform="translate(5, 10)">
            <rect x="0" y="0" width="30" height="20" rx="2" fill="#1e3a8a" />
            <rect x="2" y="2" width="26" height="12" rx="1" fill="#047857" />
          </g>
        )}

        {/* Generic Module Fallback */}
        {!type.startsWith('LED') && type !== 'BUTTON' && !isMC && type !== 'LCD' && (
          <g transform="translate(10, 10)">
            <rect x="0" y="0" width="20" height="20" rx="2" fill="#334155" />
            <rect x="4" y="4" width="12" height="4" fill="#94a3b8" />
            <circle cx="10" cy="14" r="2" fill="#fbbf24" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default ComponentThumbnail;
