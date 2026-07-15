import React from 'react';

export const CircuitBoardDefs: React.FC = () => (
    <defs>
        <pattern id="pcb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="rgba(0,0,0,0.1)" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </pattern>
        <filter id="comp-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="0.5" dy="1" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="selected-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#fbbf24" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="led-glow-red" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="led-glow-green" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="led-glow-blue" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#3b82f6" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="led-glow-yellow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#eab308" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="led-glow-white" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feFlood floodColor="#f8fafc" floodOpacity="0.7" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" /><stop offset="50%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="metal-shiny" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" /><stop offset="30%" stopColor="#f8fafc" /><stop offset="70%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="plastic-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" /><stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="plastic-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="metal-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" /><stop offset="50%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="glass-shine" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" /><stop offset="50%" stopColor="white" stopOpacity="0.1" /><stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="bulb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" /><stop offset="40%" stopColor="#fde047" stopOpacity="0.5" /><stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>
        <filter id="ultra-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="pcb-green" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#15803d" /><stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="copper-trace" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" /><stop offset="50%" stopColor="#d97706" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
    </defs>
);

export const ArduinoUnoBoard: React.FC = () => (
    <g transform="translate(300, 200)" filter="url(#comp-shadow)">
        <rect x="-65" y="-30" width="130" height="60" rx="4" fill="#0066cc" stroke="#004499" strokeWidth="1" />
        <path d="M -60 -25 L -30 -25 L -30 -15 L -10 -15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <path d="M -60 -20 L -40 -20 L -40 -10 L 0 -10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <rect x="-70" y="-12" width="18" height="12" rx="1.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.5" />
        <rect x="-69" y="-10" width="14" height="8" rx="1" fill="#1e293b" />
        <circle cx="-55" cy="16" r="5" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
        <circle cx="-55" cy="16" r="3" fill="#0f0f0f" />
        <circle cx="-55" cy="16" r="1" fill="url(#metal-shiny)" />
        <rect x="-8" y="-8" width="30" height="16" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
        <circle cx="-6" cy="-6" r="0.8" fill="#555" />
        <text x="7" y="-1" textAnchor="middle" fontSize="2.5" fill="#666" fontWeight="bold">ATMEGA</text>
        <text x="7" y="3" textAnchor="middle" fontSize="2" fill="#555">328P</text>
        <rect x="22" y="-5" width="5" height="3" rx="0.5" fill="url(#metal-shiny)" stroke="#94a3b8" strokeWidth="0.2" />
        <circle cx="-40" cy="20" r="1.5" fill="#22c55e" opacity="0.8" />
        <text x="-40" y="24" textAnchor="middle" fontSize="1.5" fill="#86efac">PWR</text>
        <rect x="-38" y="-20" width="6" height="4" rx="0.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.3" />
        <g transform="translate(-55, -32)">
            <rect x="0" y="0" width="112" height="8" fill="#1e293b" rx="0.5" />
            {Array.from({ length: 14 }).map((_, i) => (
                <g key={i} transform={`translate(${i * 8}, 0)`}>
                    <rect x="1" y="1" width="6" height="5" fill="#475569" rx="0.5" />
                    <text x="4" y="8.5" textAnchor="middle" fontSize="2.2" fill="white" opacity="0.6">D{i}</text>
                </g>
            ))}
        </g>
        <g transform="translate(-55, 24)">
            <rect x="0" y="0" width="56" height="8" fill="#1e293b" rx="0.5" />
            {Array.from({ length: 8 }).map((_, i) => (
                <g key={i} transform={`translate(${i * 7}, 0)`}>
                    <rect x="1" y="1" width="5" height="5" fill="#475569" rx="0.5" />
                    <text x="3.5" y="-1" textAnchor="middle" fontSize="2" fill="white" opacity="0.6">A{i}</text>
                </g>
            ))}
        </g>
        <g transform="translate(55, -20)">
            <rect x="0" y="0" width="8" height="16" fill="#1e293b" rx="0.5" />
            <rect x="1" y="1" width="5" height="3" fill="#ef4444" rx="0.3" />
            <rect x="1" y="5" width="5" height="3" fill="#1e293b" rx="0.3" />
            <rect x="1" y="9" width="5" height="3" fill="#3b82f6" rx="0.3" />
            <text x="4" y="-2" textAnchor="middle" fontSize="2" fill="#fca5a5">5V</text>
            <text x="4" y="18" textAnchor="middle" fontSize="2" fill="#93c5fd">GND</text>
        </g>
        <text x="0" y="-17" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.35)" fontWeight="black" letterSpacing="0.5">KIDCODE UNO</text>
    </g>
);
