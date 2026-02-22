import React, { useState } from 'react';
import { 
  Music, Mic2, Volume2, Download, Play, Square, Sparkles, X,
  Loader2, CheckCircle, Headphones, Guitar, Drum, Piano
} from 'lucide-react';
import { 
  generateMusic, 
  generateGameMusic, 
  generateLoopingMusic,
  downloadMusic, 
  playMusicPreview, 
  stopMusicPreview,
  GeneratedMusic,
  MUSIC_PRESETS,
  getMusicStyles,
  getMusicScenarios
} from '../services/metaMusicService';
import { playSoundEffect } from '../services/soundService';

interface MusicGeneratorProps {
  onMusicGenerated: (music: GeneratedMusic) => void;
  onClose: () => void;
}

const MusicGenerator: React.FC<MusicGeneratorProps> = ({ onMusicGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('orchestral');
  const [selectedScenario, setSelectedScenario] = useState('gameplay');
  const [duration, setDuration] = useState<30 | 60 | 120>(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ status: string; progress: number; message: string } | null>(null);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  const styles = getMusicStyles();
  const scenarios = getMusicScenarios();

  const handleGenerate = async () => {
    if (!prompt && activeTab === 'custom') {
      alert('Please enter a description for your music!');
      return;
    }

    setIsGenerating(true);
    setProgress({ status: 'queued', progress: 0, message: 'Starting generation...' });
    playSoundEffect('ui');

    try {
      let music: GeneratedMusic;

      if (activeTab === 'preset') {
        music = await generateGameMusic(
          selectedScenario as any,
          selectedStyle as any,
          (prog) => {
            setProgress({ 
              status: prog.status, 
              progress: prog.progress, 
              message: prog.message || '' 
            });
          }
        );
      } else {
        music = await generateMusic(
          { prompt, duration },
          (prog) => {
            setProgress({ 
              status: prog.status, 
              progress: prog.progress, 
              message: prog.message || '' 
            });
          }
        );
      }

      setGeneratedMusic(music);
      onMusicGenerated(music);
      playSoundEffect('powerup');
    } catch (error) {
      console.error('Music generation failed:', error);
      setProgress({ 
        status: 'error', 
        progress: 0, 
        message: 'Generation failed. Please try again.' 
      });
      playSoundEffect('hurt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresetSelect = (preset: any) => {
    setPrompt(preset.prompt);
    setDuration(preset.duration as 30 | 60 | 120);
    setActiveTab('custom');
    playSoundEffect('click');
  };

  const handlePlayPreview = () => {
    if (!generatedMusic) return;

    if (isPlaying) {
      if (previewAudio) {
        stopMusicPreview(previewAudio);
        setPreviewAudio(null);
      }
      setIsPlaying(false);
    } else {
      const audio = playMusicPreview(generatedMusic);
      setPreviewAudio(audio);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleImport = () => {
    if (generatedMusic) {
      onMusicGenerated(generatedMusic);
      onClose();
      playSoundEffect('coin');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Music size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black">AI Music Generator</h2>
                <p className="text-white/80 text-sm">Create royalty-free game music with AI!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-96 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Tab Switcher */}
              <div className="flex gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('preset')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'preset'
                      ? 'bg-white dark:bg-slate-700 text-purple-600'
                      : 'text-slate-500'
                  }`}
                >
                  🎵 Presets
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'custom'
                      ? 'bg-white dark:bg-slate-700 text-purple-600'
                      : 'text-slate-500'
                  }`}
                >
                  ✏️ Custom
                </button>
              </div>

              {activeTab === 'preset' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    🎼 Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className="p-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-400 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">{preset.icon}</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{preset.name}</div>
                        <div className="text-[10px] text-slate-500">{preset.duration}s</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      <Mic2 size={16} className="inline mr-2" />
                      Describe Your Music
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Epic orchestral battle music with heroic brass and pounding drums..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      <Headphones size={16} className="inline mr-2" />
                      Music Style
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {styles.map((style) => (
                        <option key={style} value={style.toLowerCase()}>{style}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      <Volume2 size={16} className="inline mr-2" />
                      Duration
                    </label>
                    <div className="flex gap-2">
                      {[30, 60, 120].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d as any)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                            duration === d
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (activeTab === 'custom' && !prompt)}
                className={`w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 ${
                  isGenerating || (activeTab === 'custom' && !prompt)
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:shadow-xl'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Music
                  </>
                )}
              </button>

              {/* Info */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-purple-700 dark:text-purple-300">
                  <strong>💡 Tip:</strong> Be specific! Include style, mood, and instruments for best results.
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-y-auto">
            {!generatedMusic && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="text-8xl mb-4">🎵</div>
                <h3 className="text-xl font-bold mb-2">Your generated music will appear here</h3>
                <p className="text-sm text-center max-w-md">
                  Select a preset or describe your music, then click Generate to create royalty-free tracks!
                </p>
              </div>
            )}

            {isGenerating && progress && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-64 mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
                    <div 
                      className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black">{progress.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {progress.message}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generatedMusic && (
              <div className="h-full flex flex-col">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex-1">
                  {/* Music Visualizer Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute bottom-0 w-4 bg-white/20 rounded-t-full"
                          style={{
                            left: `${i * 5}%`,
                            height: `${Math.random() * 100}%`,
                            animation: isPlaying ? `bounce 0.5s ease-in-out infinite ${i * 0.05}s` : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-center relative z-10">
                      <div className="text-8xl mb-4">🎵</div>
                      <div className="text-white font-black text-xl">{generatedMusic.prompt}</div>
                      <div className="text-white/70 text-sm mt-2">{(generatedMusic.duration / 1000).toFixed(1)}s • {generatedMusic.model}</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="p-6 space-y-4">
                    <div className="flex gap-3">
                      <button
                        onClick={handlePlayPreview}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          isPlaying
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square size={20} fill="currentColor" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play size={20} fill="currentColor" />
                            Play Preview
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => downloadMusic(generatedMusic)}
                        className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                      >
                        <Download size={20} />
                        Download
                      </button>
                    </div>

                    <button
                      onClick={handleImport}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Import to Game
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicGenerator;
