import React, { useState } from 'react';
import { Download, FileCode, Image, Package, Globe, Monitor, Smartphone, Cpu, Check, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { 
  exportGame, 
  downloadExport, 
  EXPORT_TARGETS, 
  ExportTarget, 
  ExportTargetInfo,
  ExportResult 
} from '../../services/exportOrchestrator';
import { Tile, GameEntity } from '../../types';

interface GameExportProps {
  projectName: string;
  tiles: Tile[];
  enemies: GameEntity[];
  scenes: Record<string, unknown>[];
  onExport: (format: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  web: <Globe size={16} />,
  desktop: <Monitor size={16} />,
  mobile: <Smartphone size={16} />,
  game: <GamepadIcon />,
  data: <FileCode size={16} />,
};

function GamepadIcon() {
  return <span style={{ fontSize: 16 }}>🎮</span>;
}

export const GameExport: React.FC<GameExportProps> = ({
  projectName,
  tiles,
  enemies,
  scenes,
  onExport,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<ExportTarget | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleExport = async (target: ExportTarget) => {
    setExporting(true);
    setSelectedTarget(target);

    try {
      // Generate game data
      const gameData = {
        tiles,
        enemies,
        player: { emoji: '🧙', x: 80, y: 400 },
        settings: { name: projectName, width: 800, height: 600 },
      };

      // Export using orchestrator
      const result = exportGame([], gameData, target);
      setExportResult(result);

      if (result.success) {
        downloadExport(result);
        onExport(target);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const categories = [...new Set(EXPORT_TARGETS.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Export Project
        </h3>
        <p className="text-sm text-slate-500">
          Choose a target platform to export your game
        </p>
      </div>

      {/* Export Targets by Category */}
      {categories.map(category => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {CATEGORY_ICONS[category]}
            {category}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {EXPORT_TARGETS.filter(t => t.category === category).map(target => (
              <button
                key={target.id}
                onClick={() => handleExport(target.id)}
                disabled={exporting}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group ${
                  selectedTarget === target.id
                    ? 'border-violet-400 bg-violet-50'
                    : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                } ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-3xl">{target.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800">{target.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{target.description}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {target.features.slice(0, 3).map(feature => (
                      <span key={feature} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exporting && selectedTarget === target.id ? (
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Export Result */}
      {exportResult && (
        <div className={`p-4 rounded-xl border ${
          exportResult.success 
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {exportResult.success ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <span className="text-red-500">❌</span>
            )}
            <span className={`font-bold text-sm ${
              exportResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {exportResult.success ? 'Export Successful!' : 'Export Failed'}
            </span>
          </div>
          
          {exportResult.success && (
            <div className="text-xs text-slate-600">
              <p>Generated {exportResult.files.length} files</p>
              <p className="mt-1 font-mono text-[10px]">
                {exportResult.commands.join(' && ')}
              </p>
            </div>
          )}
          
          {exportResult.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-600">
              {exportResult.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Export Button */}
      <div className="flex gap-3">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => handleExport('typescript')}
          disabled={exporting}
        >
          <Download size={16} className="inline mr-2" />
          Quick Export (TypeScript)
        </Button>
      </div>
    </div>
  );
};

export default GameExport;
