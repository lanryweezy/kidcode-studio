// Loaded from the product's actual design tokens
export interface ProductDesignSystem {
  colours: {
    primary: string;
    secondary: string;
    accent: {
      emerald: string;
      amber: string;
      rose: string;
      sky: string;
    };
    background: string;
    surface: string;
    text: { primary: string; secondary: string; };
  };
  typography: {
    fontFamily: { display: string; body: string; mono: string; };
    scale: Record<string, { size: number; weight: number; lineHeight: number; }>;
  };
  spacing: { base: number; scale: number[] };
  borderRadius: Record<string, number>;
  shadows: Record<string, string>;
  motion: {
    duration: { fast: number; normal: number; slow: number; };
    easing: Record<string, string>;
  };
}

export const kidCodeDesignSystem: ProductDesignSystem = {
  colours: {
    primary: '#7c3aed',
    secondary: '#6366f1',
    accent: {
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      sky: '#0ea5e9',
    },
    background: '#0f172a',
    surface: '#1e293b',
    text: { primary: '#f8fafc', secondary: '#94a3b8' }
  },
  typography: {
    fontFamily: { display: 'Fredoka, sans-serif', body: 'Fredoka, sans-serif', mono: 'Share Tech Mono, monospace' },
    scale: {
      'sm': { size: 14, weight: 400, lineHeight: 1.5 },
      'base': { size: 16, weight: 400, lineHeight: 1.5 },
      'lg': { size: 24, weight: 600, lineHeight: 1.2 },
      'xl': { size: 48, weight: 700, lineHeight: 1.1 },
    }
  },
  spacing: { base: 8, scale: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128] },
  borderRadius: { sm: 4, lg: 8, xl: 12, '4xl': 32, '5xl': 40 },
  shadows: {
    'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
    'glow-sm': '0 0 10px rgba(124, 58, 237, 0.2)',
  },
  motion: {
    duration: { fast: 300, normal: 600, slow: 1200 },
    easing: {}
  }
};

export const DS = (system: ProductDesignSystem) => ({
  colour: (token: keyof typeof system.colours | string) => {
    if (token in system.colours) {
      return (system.colours as any)[token];
    }
    return system.colours.primary;
  },
  type: (scale: string) => system.typography.scale[scale] || system.typography.scale.base,
  space: (multiplier: number) => system.spacing.base * multiplier,
  duration: (speed: 'fast' | 'normal' | 'slow') => system.motion.duration[speed],
});

export const kidCodeDS = DS(kidCodeDesignSystem);
