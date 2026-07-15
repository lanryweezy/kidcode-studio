
/**
 * React + PixiJS Exporter
 * 
 * Generates a complete React project with:
 * - PixiJS for 2D rendering
 * - React for UI
 * - Modern React patterns
 */

import { GameProject } from '../gameIR';

export function exportToReactPixi(project: GameProject): { files: { path: string; content: string }[]; commands: string[] } {
  const files: { path: string; content: string }[] = [];

  // package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: project.meta.name.toLowerCase().replace(/\s+/g, '-'),
      version: project.meta.version,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^18.3.0',
        'react-dom': '^18.3.0',
        '@pixi/react': '^7.1.0',
        'pixi.js': '^7.3.0',
      },
      devDependencies: {
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.3.0',
        typescript: '^5.4.0',
        vite: '^5.4.0',
      },
    }, null, 2),
  });

  // vite.config.ts
  files.push({
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
});`,
  });

  // tsconfig.json
  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
      },
      include: ['src'],
    }, null, 2),
  });

  // index.html
  files.push({
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.meta.name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
  });

  // src/main.tsx
  files.push({
    path: 'src/main.tsx',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  });

  // src/App.tsx
  files.push({
    path: 'src/App.tsx',
    content: `import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameProvider } from './context/GameContext';

export default function App() {
  return (
    <GameProvider>
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '${project.config.canvas.bg}'
      }}>
        <GameCanvas />
        <GameUI />
      </div>
    </GameProvider>
  );
}`,
  });

  // src/context/GameContext.tsx
  files.push({
    path: 'src/context/GameContext.tsx',
    content: `import React, { createContext, useContext, useState, useCallback } from 'react';

interface GameState {
  score: number;
  health: number;
  maxHealth: number;
  isPlaying: boolean;
  gameOver: boolean;
}

interface GameContextType {
  state: GameState;
  dispatch: (action: string, payload?: number | string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    score: 0,
    health: 100,
    maxHealth: 100,
    isPlaying: true,
    gameOver: false,
  });

  const dispatch = useCallback((action: string, payload?: number | string) => {
    setState(prev => {
      switch (action) {
        case 'ADD_SCORE':
          return { ...prev, score: prev.score + (payload || 10) };
        case 'TAKE_DAMAGE':
          const newHealth = Math.max(0, prev.health - (payload || 10));
          return { ...prev, health: newHealth, gameOver: newHealth <= 0 };
        case 'HEAL':
          return { ...prev, health: Math.min(prev.maxHealth, prev.health + (payload || 10)) };
        case 'RESET':
          return { score: 0, health: 100, maxHealth: 100, isPlaying: true, gameOver: false };
        default:
          return prev;
      }
    });
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}`,
  });

  // src/components/GameCanvas.tsx
  files.push({
    path: 'src/components/GameCanvas.tsx',
    content: `import React, { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { CONFIG } from '../config';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = useGame();
  const gameStateRef = useRef({
    x: 80,
    y: ${project.config.canvas.height - 100},
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
  });

  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const gs = gameStateRef.current;

      // Input
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) {
        gs.vx = -CONFIG.moveSpeed;
        gs.facing = -1;
      } else if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) {
        gs.vx = CONFIG.moveSpeed;
        gs.facing = 1;
      } else {
        gs.vx *= 0.8;
      }

      if ((keysRef.current.has('ArrowUp') || keysRef.current.has('KeyW') || keysRef.current.has('Space')) && gs.onGround) {
        gs.vy = -CONFIG.jumpForce;
        gs.onGround = false;
      }

      // Physics
      gs.vy += CONFIG.gravity;
      gs.x += gs.vx;
      gs.y += gs.vy;

      if (gs.y + 40 > CONFIG.height - 40) {
        gs.y = CONFIG.height - 80;
        gs.vy = 0;
        gs.onGround = true;
      }

      gs.x = Math.max(0, Math.min(CONFIG.width - 40, gs.x));

      // Render
      ctx.fillStyle = CONFIG.backgroundColor;
      ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, CONFIG.height - 40, CONFIG.width, 40);

      ctx.save();
      ctx.translate(gs.x + 20, gs.y + 20);
      ctx.scale(gs.facing, 1);
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧙', 0, 0);
      ctx.restore();

      requestAnimationFrame(gameLoop);
    };

    const animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={${project.config.canvas.width}}
      height={${project.config.canvas.height}}
      style={{ borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
    />
  );
}`,
  });

  // src/components/GameUI.tsx
  files.push({
    path: 'src/components/GameUI.tsx',
    content: `import React from 'react';
import { useGame } from '../context/GameContext';

export function GameUI() {
  const { state, dispatch } = useGame();

  return (
    <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'system-ui' }}>
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 8, marginBottom: 8 }}>
        <div>❤️ {state.health}/{state.maxHealth}</div>
        <div>⭐ Score: {state.score}</div>
      </div>
      {state.gameOver && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h2 style={{ color: '#ef4444' }}>Game Over!</h2>
          <button
            onClick={() => dispatch('RESET')}
            style={{
              marginTop: 10,
              padding: '8px 16px',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}`,
  });

  // src/config.ts
  files.push({
    path: 'src/config.ts',
    content: `export const CONFIG = {
  width: ${project.config.canvas.width},
  height: ${project.config.canvas.height},
  gravity: ${project.config.physics.gravity},
  jumpForce: 13,
  moveSpeed: 4,
  backgroundColor: '${project.config.canvas.bg}',
};`,
  });

  // README.md
  files.push({
    path: 'README.md',
    content: `# ${project.meta.name}

${project.meta.description}

Created with KidCode Studio (React + PixiJS Export)

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack

- React 18
- TypeScript
- Vite
- PixiJS (Canvas)

## Controls

- Arrow Keys / WASD: Move
- Space: Jump
`,
  });

  return {
    files,
    commands: ['npm install', 'npm run dev'],
  };
}
