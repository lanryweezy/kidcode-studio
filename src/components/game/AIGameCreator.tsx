import React, { useState, useCallback, useMemo } from 'react';
import {
  createGame,
  parseDescription,
  suggestTemplate,
  generateAIAsset,
  balanceDifficulty,
  exportGameAsCode,
  type SkillLevel,
  type GameGenre,
  type GeneratedGame,
  type AIAssetRequest,
} from '../../services/aiGameCreator';

interface AIGameCreatorProps {
  onGameGenerated?: (game: GeneratedGame) => void;
  onLoadToEditor?: (game: GeneratedGame) => void;
}

const GENRE_OPTIONS: { value: GameGenre; label: string; icon: string }[] = [
  { value: 'platformer', label: 'Platformer', icon: '🏃' },
  { value: 'shooter', label: 'Shooter', icon: '🔫' },
  { value: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { value: 'rpg', label: 'RPG', icon: '⚔️' },
  { value: 'racing', label: 'Racing', icon: '🏎️' },
  { value: 'rhythm', label: 'Rhythm', icon: '🎵' },
  { value: 'strategy', label: 'Strategy', icon: '🏰' },
];

const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner (Easy)' },
  { value: 'intermediate', label: 'Intermediate (Normal)' },
  { value: 'advanced', label: 'Advanced (Hard)' },
];

export default function AIGameCreator({ onGameGenerated, onLoadToEditor }: AIGameCreatorProps) {
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [selectedGenre, setSelectedGenre] = useState<GameGenre | null>(null);
  const [generatedGame, setGeneratedGame] = useState<GeneratedGame | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [playerPerformance, setPlayerPerformance] = useState({ winRate: 0.5, avgTime: 300 });

  const detectedGenre = useMemo(() => {
    if (!description) return null;
    return suggestTemplate(description);
  }, [description]);

  const detectedKeywords = useMemo(() => {
    if (!description) return [];
    return parseDescription(description).keywords;
  }, [description]);

  const handleGenerate = useCallback(() => {
    if (!description.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const game = createGame(description, skillLevel, selectedGenre || undefined);
      setGeneratedGame(game);
      setIsGenerating(false);
      setShowPreview(true);
      onGameGenerated?.(game);
    }, 500);
  }, [description, skillLevel, selectedGenre, onGameGenerated]);

  const handleLoadToEditor = useCallback(() => {
    if (generatedGame) {
      onLoadToEditor?.(generatedGame);
    }
  }, [generatedGame, onLoadToEditor]);

  const handleBalance = useCallback(() => {
    if (generatedGame) {
      const balanced = balanceDifficulty(generatedGame, playerPerformance);
      setGeneratedGame({ ...generatedGame, settings: balanced });
    }
  }, [generatedGame, playerPerformance]);

  const handleExportCode = useCallback(() => {
    if (generatedGame) {
      const code = exportGameAsCode(generatedGame);
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedGame.title.replace(/\s+/g, '_').toLowerCase()}.js`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [generatedGame]);

  const handleGenerateAsset = useCallback((type: AIAssetRequest['type'], description: string) => {
    return generateAIAsset({ type, description });
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl p-6 text-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">AI Game Creator</h2>
      <p className="text-gray-400 mb-6">Describe your game idea and let AI generate it for you!</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Game Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A platformer where a character jumps over obstacles, collects coins, and fights enemies..."
            className="w-full h-24 bg-gray-800 rounded-lg p-3 text-white border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
          />
          {detectedKeywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {detectedKeywords.map((kw) => (
                <span key={kw} className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <div className="grid grid-cols-4 gap-2">
              {GENRE_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGenre(g.value === selectedGenre ? null : g.value)}
                  className={`p-2 rounded-lg text-center text-sm transition-colors ${
                    selectedGenre === g.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-lg">{g.icon}</div>
                  <div>{g.label}</div>
                </button>
              ))}
            </div>
            {detectedGenre && !selectedGenre && (
              <p className="mt-1 text-xs text-gray-500">Suggested: {detectedGenre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skill Level</label>
            <div className="space-y-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSkillLevel(s.value)}
                  className={`w-full p-2 rounded-lg text-left text-sm transition-colors ${
                    skillLevel === s.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!description.trim() || isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? 'Generating Game...' : 'Generate Game with AI'}
        </button>
      </div>

      {showPreview && generatedGame && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold text-green-400">Generated: {generatedGame.title}</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-sm">Genre</div>
              <div className="font-bold">{generatedGame.genre}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-sm">Difficulty</div>
              <div className="font-bold">{generatedGame.metadata.difficulty}/3</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-sm">Blocks</div>
              <div className="font-bold">{generatedGame.blocks.length}</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold mb-2">Game Blocks</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {generatedGame.blocks.map((block) => (
                <div key={block.id} className="bg-gray-900 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{block.name}</span>
                    <span className="text-xs text-gray-500">{block.category}</span>
                  </div>
                  <pre className="text-xs text-gray-400 mt-1 overflow-x-auto">{block.code}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold mb-2">Settings</h4>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>Gravity: {generatedGame.settings.gravity}</div>
              <div>Speed: {generatedGame.settings.playerSpeed}</div>
              <div>Jump: {generatedGame.settings.jumpForce}</div>
              <div>Lives: {generatedGame.settings.lives || '∞'}</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold mb-2">Asset Generator</h4>
            <div className="flex gap-2">
              {(['sprite', 'sound', 'music'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleGenerateAsset(type, generatedGame.genre)}
                  className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
                >
                  Generate {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold mb-2">Difficulty Balancing</h4>
            <div className="flex gap-4 items-center">
              <label className="text-sm">Win Rate:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playerPerformance.winRate}
                onChange={(e) => setPlayerPerformance({ ...playerPerformance, winRate: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm w-12">{Math.round(playerPerformance.winRate * 100)}%</span>
            </div>
            <button
              onClick={handleBalance}
              className="mt-2 px-4 py-2 bg-yellow-600 rounded text-sm hover:bg-yellow-500"
            >
              Auto-Balance
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLoadToEditor}
              className="flex-1 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500 transition-colors"
            >
              Load to Editor
            </button>
            <button
              onClick={handleExportCode}
              className="flex-1 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition-colors"
            >
              Export Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
