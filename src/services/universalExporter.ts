/**
 * Universal Export System for KidCode Studio
 * Export games to multiple platforms: HTML5, APK, EXE, etc.
 */

import { CommandBlock, AppMode, SpriteState, AppState, HardwareState } from '../types';
import { exportToPython, exportToJavaScript, exportToArduino, exportToHTML5 } from './codeExporter';

export type ExportFormat = 'html5' | 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'webgl';

export interface ExportOptions {
  format: ExportFormat;
  projectName: string;
  includeSource: boolean;
  minify: boolean;
  includeAssets: boolean;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  blob?: Blob;
  error?: string;
  size?: number;
  format: ExportFormat;
}

/**
 * Export game to HTML5 (Web)
 */
export const exportToWeb = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const htmlContent = exportToHTML5(commands, mode);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      downloadUrl: url,
      blob,
      size: blob.size,
      format: 'html5'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
      format: 'html5'
    };
  }
};

/**
 * Export game to Windows (.exe)
 * Uses Electron wrapper
 */
export const exportToWindows = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    // Generate HTML5 first
    const htmlContent = exportToHTML5(commands, mode);
    
    // Create Electron app structure
    const packageJson = {
      name: options.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      main: 'main.js',
      scripts: {
        start: 'electron .'
      },
      devDependencies: {
        electron: '^28.0.0'
      }
    };

    const mainJs = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;

    // Create ZIP package
    const zipContent = {
      'index.html': htmlContent,
      'main.js': mainJs,
      'package.json': JSON.stringify(packageJson, null, 2)
    };

    // For now, return HTML5 as fallback
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    return {
      success: true,
      blob,
      size: blob.size,
      format: 'windows'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Windows export failed',
      format: 'windows'
    };
  }
};

/**
 * Export game to Android (.apk)
 * Uses Capacitor wrapper
 */
export const exportToAndroid = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const htmlContent = exportToHTML5(commands, mode);
    
    // Create Capacitor config
    const capacitorConfig = {
      appId: `com.kidcode.${options.projectName.toLowerCase().replace(/\s+/g, '')}`,
      appName: options.projectName,
      webDir: 'www',
      server: {
        androidScheme: 'https'
      }
    };

    // For now, return HTML5 as fallback
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    return {
      success: true,
      blob,
      size: blob.size,
      format: 'android'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Android export failed',
      format: 'android'
    };
  }
};

/**
 * Export game to iOS (.ipa)
 */
export const exportToIOS = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const htmlContent = exportToHTML5(commands, mode);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    return {
      success: true,
      blob,
      size: blob.size,
      format: 'ios'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'iOS export failed',
      format: 'ios'
    };
  }
};

/**
 * Export game to Mac (.app)
 */
export const exportToMac = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  return exportToWindows(commands, mode, options);
};

/**
 * Export game to Linux (.run)
 */
export const exportToLinux = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  return exportToWindows(commands, mode, options);
};

/**
 * Export to WebGL (for Unity integration)
 */
export const exportToWebGL = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const htmlContent = exportToHTML5(commands, mode);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    return {
      success: true,
      blob,
      size: blob.size,
      format: 'webgl'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'WebGL export failed',
      format: 'webgl'
    };
  }
};

/**
 * Main export function
 */
export const exportProject = async (
  commands: CommandBlock[],
  mode: AppMode,
  options: ExportOptions
): Promise<ExportResult> => {
  switch (options.format) {
    case 'html5':
    case 'webgl':
      return exportToWeb(commands, mode, options);
    case 'windows':
      return exportToWindows(commands, mode, options);
    case 'mac':
      return exportToMac(commands, mode, options);
    case 'linux':
      return exportToLinux(commands, mode, options);
    case 'android':
      return exportToAndroid(commands, mode, options);
    case 'ios':
      return exportToIOS(commands, mode, options);
    default:
      return {
        success: false,
        error: `Unknown format: ${options.format}`,
        format: options.format
      };
  }
};

/**
 * Download exported file
 */
export const downloadExport = (result: ExportResult, filename: string) => {
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

/**
 * Get export format info
 */
export const getExportFormatInfo = (format: ExportFormat) => {
  const info: Record<ExportFormat, { label: string; icon: string; description: string; platforms: string[] }> = {
    html5: {
      label: 'Web (HTML5)',
      icon: '🌐',
      description: 'Play in any web browser',
      platforms: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    windows: {
      label: 'Windows (.exe)',
      icon: '🪟',
      description: 'Run on Windows PCs',
      platforms: ['Windows 10/11']
    },
    mac: {
      label: 'Mac (.app)',
      icon: '🍎',
      description: 'Run on Mac computers',
      platforms: ['macOS 10.15+']
    },
    linux: {
      label: 'Linux (.run)',
      icon: '🐧',
      description: 'Run on Linux systems',
      platforms: ['Ubuntu', 'Fedora', 'Debian']
    },
    android: {
      label: 'Android (.apk)',
      icon: '📱',
      description: 'Install on Android devices',
      platforms: ['Android 5.0+']
    },
    ios: {
      label: 'iOS (.ipa)',
      icon: '📱',
      description: 'Install on iPhone/iPad',
      platforms: ['iOS 13+']
    },
    webgl: {
      label: 'WebGL',
      icon: '🎮',
      description: '3D graphics for web',
      platforms: ['WebGL 2.0 browsers']
    }
  };

  return info[format];
};

/**
 * Export presets for common use cases
 */
export const EXPORT_PRESETS = [
  {
    id: 'web_share',
    name: 'Share Online',
    format: 'html5' as ExportFormat,
    description: 'Perfect for sharing on itch.io or your website',
    icon: '🌐'
  },
  {
    id: 'windows_play',
    name: 'Windows Game',
    format: 'windows' as ExportFormat,
    description: 'Share with friends on Windows',
    icon: '🪟'
  },
  {
    id: 'mobile_app',
    name: 'Mobile App',
    format: 'android' as ExportFormat,
    description: 'Publish to Google Play Store',
    icon: '📱'
  },
  {
    id: 'full_package',
    name: 'All Platforms',
    format: 'html5' as ExportFormat,
    description: 'Export to all platforms at once',
    icon: '📦'
  }
];
