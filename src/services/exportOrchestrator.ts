
/**
 * Export Orchestrator
 * 
 * Coordinates all export targets and manages the export process.
 * This is the main entry point for all exports.
 */

import { GameProject, blocksToIR, validateIR } from './gameIR';
import { exportToTypeScript } from './exporters/typescriptExporter';
import { exportToReactPixi } from './exporters/reactPixiExporter';
import { exportToElectron } from './exporters/electronExporter';
import { CommandBlock } from '../types';

// ═══════════════════════════════════════════════════════════
// EXPORT TARGETS
// ═══════════════════════════════════════════════════════════

export type ExportTarget = 
  | 'typescript'      // TypeScript + Vite (web)
  | 'react-pixi'      // React + PixiJS (2D games)
  | 'electron'        // Electron (desktop)
  | 'html5'           // Legacy HTML5
  | 'json';           // Data only

export interface ExportTargetInfo {
  id: ExportTarget;
  name: string;
  description: string;
  icon: string;
  category: 'web' | 'desktop' | 'mobile' | 'game' | 'data';
  priority: number;
  features: string[];
}

export const EXPORT_TARGETS: ExportTargetInfo[] = [
  {
    id: 'typescript',
    name: 'TypeScript + Vite',
    description: 'Modern web project with TypeScript, Vite, and full type safety',
    icon: '🔷',
    category: 'web',
    priority: 1,
    features: ['TypeScript', 'Vite', 'ES Modules', 'Hot Reload', 'Full IDE Support'],
  },
  {
    id: 'react-pixi',
    name: 'React + PixiJS',
    description: 'React-based 2D game with PixiJS rendering',
    icon: '⚛️',
    category: 'game',
    priority: 2,
    features: ['React', 'PixiJS', 'WebGL', 'Component-based', 'State Management'],
  },
  {
    id: 'electron',
    name: 'Electron Desktop',
    description: 'Desktop application for Windows, Mac, and Linux',
    icon: '🖥️',
    category: 'desktop',
    priority: 3,
    features: ['Desktop App', 'Native Menus', 'Auto Update', 'Installer'],
  },
  {
    id: 'html5',
    name: 'HTML5 (Legacy)',
    description: 'Single HTML file for instant sharing',
    icon: '🌐',
    category: 'web',
    priority: 4,
    features: ['Single File', 'No Build', 'Instant Share', 'Mobile Friendly'],
  },
  {
    id: 'json',
    name: 'Project Data',
    description: 'Export project as JSON for custom tooling',
    icon: '📦',
    category: 'data',
    priority: 5,
    features: ['Machine Readable', 'Import/Export', 'Version Control'],
  },
];

// ═══════════════════════════════════════════════════════════
// EXPORT RESULT
// ═══════════════════════════════════════════════════════════

export interface ExportResult {
  success: boolean;
  target: ExportTarget;
  files: { path: string; content: string }[];
  entryPoint: string;
  commands: string[];
  errors: string[];
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function exportGame(
  blocks: CommandBlock[],
  settings: Record<string, unknown>,
  target: ExportTarget
): ExportResult {
  // 1. Generate IR
  const project = blocksToIR(blocks, settings);

  // 2. Validate IR
  const validation = validateIR(project);
  if (!validation.valid) {
    return {
      success: false,
      target,
      files: [],
      entryPoint: '',
      commands: [],
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  // 3. Export to target
  try {
    switch (target) {
      case 'typescript':
        return exportToTypeScriptTarget(project, validation.warnings);
      case 'react-pixi':
        return exportToReactPixiTarget(project, validation.warnings);
      case 'electron':
        return exportToElectronTarget(project, validation.warnings);
      case 'html5':
        return exportToHTML5Target(project, validation.warnings);
      case 'json':
        return exportToJSONTarget(project, validation.warnings);
      default:
        return {
          success: false,
          target,
          files: [],
          entryPoint: '',
          commands: [],
          errors: [`Unknown export target: ${target}`],
          warnings: [],
        };
    }
  } catch (error) {
    return {
      success: false,
      target,
      files: [],
      entryPoint: '',
      commands: [],
      errors: [`Export failed: ${error}`],
      warnings: validation.warnings,
    };
  }
}

function exportToTypeScriptTarget(project: GameProject, warnings: string[]): ExportResult {
  const result = exportToTypeScript(project);
  return {
    success: true,
    target: 'typescript',
    files: result.files,
    entryPoint: 'src/main.ts',
    commands: result.commands,
    errors: [],
    warnings,
  };
}

function exportToReactPixiTarget(project: GameProject, warnings: string[]): ExportResult {
  const result = exportToReactPixi(project);
  return {
    success: true,
    target: 'react-pixi',
    files: result.files,
    entryPoint: 'src/main.tsx',
    commands: result.commands,
    errors: [],
    warnings,
  };
}

function exportToElectronTarget(project: GameProject, warnings: string[]): ExportResult {
  const result = exportToElectron(project);
  return {
    success: true,
    target: 'electron',
    files: result.files,
    entryPoint: 'electron/main.js',
    commands: result.commands,
    errors: [],
    warnings,
  };
}

function exportToHTML5Target(project: GameProject, warnings: string[]): ExportResult {
  // Generate standalone HTML5
  const html = generateHTML5Game(project);
  return {
    success: true,
    target: 'html5',
    files: [{ path: 'game.html', content: html }],
    entryPoint: 'game.html',
    commands: [],
    errors: [],
    warnings,
  };
}

function exportToJSONTarget(project: GameProject, warnings: string[]): ExportResult {
  const json = JSON.stringify(project, null, 2);
  return {
    success: true,
    target: 'json',
    files: [{ path: 'project.json', content: json }],
    entryPoint: 'project.json',
    commands: [],
    errors: [],
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════
// HTML5 GENERATOR (Legacy)
// ═══════════════════════════════════════════════════════════

function generateHTML5Game(project: GameProject): string {
  const playerEmoji = project.entities.find(e => e.type === 'player')?.emoji || '🧙';
  const enemies = project.entities.filter(e => e.type === 'enemy');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>${project.meta.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${project.config.canvas.bg};display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;touch-action:none}
canvas{max-width:100vw;max-height:100vh;border-radius:8px}
</style>
</head>
<body>
<canvas id="g" width="${project.config.canvas.width}" height="${project.config.canvas.height}"></canvas>
<script>
const c=document.getElementById('g'),x=c.getContext('2d');
const W=${project.config.canvas.width},H=${project.config.canvas.height},T=40;
const G=${project.config.physics.gravity},J=13,S=4;
const p={x:80,y:H-80,vx:0,vy:0,hp:100,mhp:100,sc:0,og:false,f:1};
const k=new Set();
const enemies=${JSON.stringify(enemies.map(e => ({x: e.x||400, y: e.y||300, emoji: e.emoji||'👾', hp: e.hp||20, vx: e.speed||1, ix: e.x||400})))};


document.addEventListener('keydown',e=>{k.add(e.code);['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&e.preventDefault()});
document.addEventListener('keyup',e=>k.delete(e.code));

let touchStartX=0;
c.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];touchStartX=t.clientX;if(t.clientY<H/2)k.add('Space')});
c.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0];const dx=t.clientX-touchStartX;if(Math.abs(dx)>20){k[dx>0?'ArrowRight':'ArrowLeft']=true;k[dx>0?'ArrowLeft':'ArrowRight']=false}});
c.addEventListener('touchend',()=>{k.delete('Space');k.delete('ArrowLeft');k.delete('ArrowRight')});

function loop(){
  // Input
  if(k.has('ArrowLeft')||k.has('KeyA')){p.vx=-S;p.f=-1}
  else if(k.has('ArrowRight')||k.has('KeyD')){p.vx=S;p.f=1}
  else{p.vx*=0.8}
  if((k.has('ArrowUp')||k.has('KeyW')||k.has('Space'))&&p.og){p.vy=-J;p.og=false}
  
  // Physics
  p.vy+=G;p.x+=p.vx;p.y+=p.vy;
  if(p.y+40>H-40){p.y=H-80;p.vy=0;p.og=true}
  p.x=Math.max(0,Math.min(W-40,p.x));
  
  // Enemies
  enemies.forEach(e=>{
    e.x+=e.vx;
    if(Math.abs(e.x-e.ix)>100)e.vx=-e.vx;
    if(Math.abs(p.x-e.x)<35&&Math.abs(p.y-e.y)<35){p.hp=Math.max(0,p.hp-1);p.vy=-5}
  });

  // Render
  x.fillStyle='${project.config.canvas.bg}';x.fillRect(0,0,W,H);
  x.fillStyle='#22c55e';x.fillRect(0,H-40,W,40);
  
  x.save();x.translate(p.x+20,p.y+20);x.scale(p.f,1);
  x.font='40px Arial';x.textAlign='center';x.textBaseline='middle';
  x.fillText('${playerEmoji}',0,0);x.restore();
  
  enemies.forEach(e=>{x.font='30px Arial';x.textAlign='center';x.fillText(e.emoji,e.x,e.y)});
  
  // UI
  x.fillStyle='rgba(0,0,0,0.5)';x.fillRect(10,10,120,50);
  x.fillStyle='#ef4444';x.fillRect(15,15,p.hp/p.mhp*110,8);
  x.fillStyle='white';x.font='bold 12px system-ui';x.textAlign='left';
  x.fillText('HP: '+p.hp+'/'+p.mhp,15,35);x.fillText('Score: '+p.sc,15,50);
  
  if(p.hp<=0){x.fillStyle='rgba(0,0,0,0.7)';x.fillRect(0,0,W,H);x.fillStyle='#ef4444';x.font='bold 48px system-ui';x.textAlign='center';x.fillText('GAME OVER',W/2,H/2);x.fillStyle='white';x.font='24px system-ui';x.fillText('Score: '+p.sc,W/2,H/2+40)}
  
  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// DOWNLOAD HELPER
// ═══════════════════════════════════════════════════════════

export function downloadExport(result: ExportResult): void {
  if (!result.success || result.files.length === 0) return;

  if (result.files.length === 1) {
    // Single file - download directly
    const file = result.files[0];
    const blob = new Blob([file.content], { type: getContentType(file.path) });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'game';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // Multiple files - download as ZIP
    downloadAsZip(result.files, result.target);
  }
}

async function downloadAsZip(files: { path: string; content: string }[], target: string): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kidcode-${target}-export.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

function getContentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.tsx')) return 'text/javascript';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.md')) return 'text/markdown';
  return 'text/plain';
}
