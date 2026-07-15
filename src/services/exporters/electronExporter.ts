
/**
 * Electron Desktop Exporter
 * 
 * Generates a complete Electron project for desktop publishing
 */

import { GameProject } from '../gameIR';

export function exportToElectron(project: GameProject): { files: { path: string; content: string }[]; commands: string[] } {
  const files: { path: string; content: string }[] = [];

  // package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: project.meta.name.toLowerCase().replace(/\s+/g, '-'),
      version: project.meta.version,
      description: project.meta.description,
      main: 'electron/main.js',
      scripts: {
        dev: 'concurrently "vite" "wait-on http://localhost:3000 && electron electron/main.js"',
        build: 'vite build && electron-builder',
        start: 'electron electron/main.js',
      },
      dependencies: {
        'electron-is-dev': '^2.0.0',
      },
      devDependencies: {
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.3.0',
        concurrently: '^8.2.0',
        electron: '^28.0.0',
        'electron-builder': '^24.0.0',
        react: '^18.3.0',
        'react-dom': '^18.3.0',
        typescript: '^5.4.0',
        vite: '^5.4.0',
        'wait-on': '^7.2.0',
      },
      build: {
        appId: `com.kidcode.${project.meta.name.toLowerCase().replace(/\s+/g, '-')}`,
        productName: project.meta.name,
        files: ['dist/**/*', 'electron/**/*'],
        mac: { category: 'public.app-category.games', target: 'dmg' },
        win: { target: 'nsis' },
        linux: { target: 'AppImage' },
      },
    }, null, 2),
  });

  // electron/main.js
  files.push({
    path: 'electron/main.js',
    content: `const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: ${project.config.canvas.width + 100},
    height: ${project.config.canvas.height + 100},
    title: '${project.meta.name}',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '${project.config.canvas.bg}',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});`,
  });

  // vite.config.ts
  files.push({
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 3000 },
  build: { outDir: 'dist', emptyOutDir: true },
});`,
  });

  // All React files (same as React exporter)
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

  files.push({
    path: 'src/main.tsx',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  });

  files.push({
    path: 'src/styles.css',
    content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  background: ${project.config.canvas.bg}; 
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}
#root { 
  width: 100vw; 
  height: 100vh; 
  display: flex; 
  justify-content: center; 
  align-items: center;
}`,
  });

  files.push({
    path: 'src/App.tsx',
    content: `import React, { useEffect, useRef, useState } from 'react';
import { CONFIG } from './config';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const gameStateRef = useRef({ x: 80, y: ${project.config.canvas.height - 100}, vx: 0, vy: 0, onGround: false, facing: 1 });
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const loop = () => {
      const gs = gameStateRef.current;
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) { gs.vx = -CONFIG.moveSpeed; gs.facing = -1; }
      else if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) { gs.vx = CONFIG.moveSpeed; gs.facing = 1; }
      else { gs.vx *= 0.8; }
      if ((keysRef.current.has('ArrowUp') || keysRef.current.has('Space')) && gs.onGround) { gs.vy = -CONFIG.jumpForce; gs.onGround = false; }
      gs.vy += CONFIG.gravity; gs.x += gs.vx; gs.y += gs.vy;
      if (gs.y + 40 > CONFIG.height - 40) { gs.y = CONFIG.height - 80; gs.vy = 0; gs.onGround = true; }
      gs.x = Math.max(0, Math.min(CONFIG.width - 40, gs.x));

      ctx.fillStyle = CONFIG.backgroundColor; ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(0, CONFIG.height - 40, CONFIG.width, 40);
      ctx.save(); ctx.translate(gs.x + 20, gs.y + 20); ctx.scale(gs.facing, 1);
      ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🧙', 0, 0); ctx.restore();

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} width={${project.config.canvas.width}} height={${project.config.canvas.height}} style={{ borderRadius: 8 }} />
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 8 }}>
        <div>❤️ {health}/100</div>
        <div>⭐ Score: {score}</div>
      </div>
    </div>
  );
}`,
  });

  files.push({
    path: 'src/config.ts',
    content: `export const CONFIG = { width: ${project.config.canvas.width}, height: ${project.config.canvas.height}, gravity: ${project.config.physics.gravity}, jumpForce: 13, moveSpeed: 4, backgroundColor: '${project.config.canvas.bg}' };`,
  });

  files.push({
    path: 'README.md',
    content: `# ${project.meta.name}\n\nDesktop version built with Electron.\n\n## Development\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Build\n\n\`\`\`bash\nnpm run build\n\`\`\`\n\nThis will create installers in the \`dist\` folder.`,
  });

  return {
    files,
    commands: ['npm install', 'npm run dev'],
  };
}
