import { CommandBlock, AppMode } from '../types';
import { exportToHTML5, exportToJavaScript, exportToPython } from './codeExporter';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export type DeploymentTarget = 'html5' | 'react' | 'react-native' | 'zip';

export interface DeploymentConfig {
  projectName: string;
  target: DeploymentTarget;
  author: string;
  version: string;
  description: string;
  includeSource: boolean;
  minify: boolean;
  includeAssets: boolean;
  customStyles?: string;
  customScripts?: string;
  metadata?: Record<string, string>;
}

export interface AssetEntry {
  name: string;
  type: 'sprite' | 'sound' | 'level' | 'config' | 'other';
  path: string;
  data?: string | Blob;
}

export interface DeploymentResult {
  success: boolean;
  blob?: Blob;
  downloadUrl?: string;
  error?: string;
  size?: number;
  files: string[];
}

const generateManifest = (config: DeploymentConfig): string => {
  return JSON.stringify({
    name: config.projectName,
    version: config.version,
    author: config.author,
    description: config.description,
    engine: 'KidCode Studio',
    generatedAt: new Date().toISOString(),
    metadata: config.metadata || {}
  }, null, 2);
};

const generateReactComponent = (
  commands: CommandBlock[],
  config: DeploymentConfig
): string => {
  const jsCode = exportToJavaScript(commands, AppMode.GAME);

  return `import React, { useEffect, useRef, useState } from 'react';

interface ${config.projectName.replace(/\s+/g, '')}Props {
  width?: number;
  height?: number;
  onScoreChange?: (score: number) => void;
  onGameOver?: () => void;
  onWin?: () => void;
}

export const ${config.projectName.replace(/\s+/g, '')}Game: React.FC<${config.projectName.replace(/\s+/g, '')}Props> = ({
  width = 400,
  height = 400,
  onScoreChange,
  onGameOver,
  onWin
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const state = { x: 200, y: 200, score: 0 };
    const player = {
      x: state.x,
      y: state.y,
      moveX: (v: number) => { state.x += v; player.x = state.x; },
      moveY: (v: number) => { state.y += v; player.y = state.y; },
      jump: () => { state.y -= 10; player.y = state.y; }
    };
    const game = {
      score: 0,
      set score(v: number) { state.score = v; setScore(v); onScoreChange?.(v); },
      get score() { return state.score; },
      scene: 'default',
      setScene: (s: string) => { game.scene = s; },
      gameOver: () => { setGameState('gameover'); onGameOver?.(); },
      win: () => { setGameState('won'); onWin?.(); }
    };

    const render = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      ctx.font = '20px monospace';
      ctx.fillText(\`Score: \${game.score}\`, 10, 30);
      ctx.fillText('●', state.x, state.y);
    };

    render();
  }, [width, height, onScoreChange, onGameOver, onWin]);

  const handleStart = () => {
    setGameState('playing');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ border: '2px solid #333', borderRadius: '8px' }} />
      {gameState === 'idle' && (
        <button onClick={handleStart} style={{ marginTop: '1rem', padding: '0.5rem 2rem', fontSize: '1rem' }}>
          ▶ Play {config.projectName}
        </button>
      )}
    </div>
  );
};

export default ${config.projectName.replace(/\s+/g, '')}Game;
`;
};

const generateReactNativeProject = (
  commands: CommandBlock[],
  config: DeploymentConfig
): string => {
  const jsCode = exportToJavaScript(commands, AppMode.GAME);

  return `import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAME_SIZE = Math.min(SCREEN_WIDTH - 32, 400);

export const ${config.projectName.replace(/\s+/g, '')}Screen = () => {
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{config.projectName}</Text>
      <View style={[styles.gameArea, { width: GAME_SIZE, height: GAME_SIZE }]}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.placeholder}>Game Canvas</Text>
      </View>
      {!running && (
        <TouchableOpacity style={styles.playButton} onPress={() => setRunning(true)}>
          <Text style={styles.playButtonText}>▶ Play</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', paddingTop: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  gameArea: { backgroundColor: '#000', borderRadius: 12, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  score: { color: '#fff', fontSize: 18, position: 'absolute', top: 10, left: 10 },
  placeholder: { color: '#666', fontSize: 14 },
  playButton: { marginTop: 20, backgroundColor: '#6366f1', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  playButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ${config.projectName.replace(/\s+/g, '')}Screen;
`;
};

export const deployGame = async (
  commands: CommandBlock[],
  config: DeploymentConfig,
  assets: AssetEntry[] = []
): Promise<DeploymentResult> => {
  const files: string[] = [];

  try {
    switch (config.target) {
      case 'html5': {
        const html = exportToHTML5(commands, AppMode.GAME);
        const blob = new Blob([html], { type: 'text/html' });
        files.push('index.html');
        return {
          success: true,
          blob,
          size: blob.size,
          files
        };
      }

      case 'react': {
        const component = generateReactComponent(commands, config);
        const manifest = generateManifest(config);
        const blob = new Blob([component], { type: 'text/plain' });
        files.push(`${config.projectName.replace(/\s+/g, '')}Game.tsx`, 'manifest.json');
        return {
          success: true,
          blob,
          size: blob.size,
          files
        };
      }

      case 'react-native': {
        const screen = generateReactNativeProject(commands, config);
        const manifest = generateManifest(config);
        const blob = new Blob([screen], { type: 'text/plain' });
        files.push(`${config.projectName.replace(/\s+/g, '')}Screen.tsx`, 'manifest.json');
        return {
          success: true,
          blob,
          size: blob.size,
          files
        };
      }

      case 'zip': {
        const zip = new JSZip();
        const html = exportToHTML5(commands, AppMode.GAME);
        zip.file('index.html', html);
        zip.file('manifest.json', generateManifest(config));
        files.push('index.html', 'manifest.json');

        if (config.includeAssets) {
          const assetFolder = zip.folder('assets');
          if (assetFolder) {
            for (const asset of assets) {
              if (asset.data) {
                assetFolder.file(asset.path, asset.data);
                files.push(`assets/${asset.path}`);
              }
            }
          }
        }

        if (config.includeSource) {
          const jsCode = exportToJavaScript(commands, AppMode.GAME);
          const pyCode = exportToPython(commands, AppMode.GAME);
          zip.file('source/game.js', jsCode);
          zip.file('source/game.py', pyCode);
          files.push('source/game.js', 'source/game.py');
        }

        if (config.customStyles) {
          zip.file('styles/custom.css', config.customStyles);
          files.push('styles/custom.css');
        }

        if (config.customScripts) {
          zip.file('scripts/custom.js', config.customScripts);
          files.push('scripts/custom.js');
        }

        const content = await zip.generateAsync({ type: 'blob' });
        return {
          success: true,
          blob: content,
          size: content.size,
          files
        };
      }

      default:
        return {
          success: false,
          error: `Unsupported deployment target: ${config.target}`,
          files: []
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
      files
    };
  }
};

export const packageAssets = async (assets: AssetEntry[]): Promise<Blob> => {
  const zip = new JSZip();
  for (const asset of assets) {
    if (asset.data) {
      zip.file(asset.path, asset.data);
    }
  }
  return zip.generateAsync({ type: 'blob' });
};

export const generateDeploymentConfig = (
  projectName: string,
  target: DeploymentTarget = 'html5'
): DeploymentConfig => ({
  projectName,
  target,
  author: 'KidCode Creator',
  version: '1.0.0',
  description: `A game created with KidCode Studio`,
  includeSource: false,
  minify: false,
  includeAssets: true
});

export const downloadDeployment = (result: DeploymentResult, filename: string) => {
  if (!result.blob) return;
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
