
import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Square, Music, Volume2, Trash2 } from 'lucide-react';
import { playTone } from '../services/soundService';

const NOTES = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
const COLS = 16;

const MusicStudio: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(NOTES.length).fill(null).map(() => Array(COLS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCol, setCurrentCol] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const [instrument, setInstrument] = useState<'synth' | 'piano' | 'chiptune'>('synth');

  useEffect(() => {
    if (!isPlaying) return;
    
    let col = 0;
    const interval = setInterval(() => {
        setCurrentCol(col);
        
        // Play notes in this column
        grid.forEach((row, rowIdx) => {
            if (row[col]) {
                // Simple frequency map
                const freqs: Record<string, number> = { 
                    'C5': 523.25, 'B4': 493.88, 'A4': 440.00, 'G4': 392.00, 
                    'F4': 349.23, 'E4': 329.63, 'D4': 293.66, 'C4': 261.63 
                };
                playTone(0.2, freqs[NOTES[rowIdx]], instrument);
            }
        });

        col = (col + 1) % COLS;
    }, (60 / tempo) * 1000 / 2); // Eighth notes

    return () => clearInterval(interval);
  }, [isPlaying, grid, tempo, instrument]);

  const toggleCell = (row: number, col: number) => {
      const newGrid = [...grid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = !newGrid[row][col];
      setGrid(newGrid);
      if (newGrid[row][col]) {
          // Preview note
          const freqs: Record<string, number> = { 
            'C5': 523.25, 'B4': 493.88, 'A4': 440.00, 'G4': 392.00, 
            'F4': 349.23, 'E4': 329.63, 'D4': 293.66, 'C4': 261.63 
          };
          playTone(0.2, freqs[NOTES[row]], instrument);
      }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border-4 border-pink-500 overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="p-6 bg-pink-500 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
                <Music size={32} fill="currentColor" />
                <h2 className="text-3xl font-black tracking-tight">MUSIC STUDIO</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-800 flex items-center gap-6 border-b border-slate-700">
            <button 
                onClick={() => { setIsPlaying(!isPlaying); setCurrentCol(-1); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
                {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                {isPlaying ? 'STOP' : 'PLAY LOOP'}
            </button>

            <div className="flex items-center gap-2 bg-slate-700 p-2 rounded-xl">
                <Volume2 size={20} className="text-pink-400" />
                <select 
                    value={instrument} 
                    onChange={(e) => setInstrument(e.target.value as any)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer"
                >
                    <option value="synth">Synth Wave</option>
                    <option value="piano">Grand Piano</option>
                    <option value="chiptune">8-Bit Chip</option>
                </select>
            </div>

            <div className="flex-1" />
            
            <button onClick={() => setGrid(Array(NOTES.length).fill(null).map(() => Array(COLS).fill(false)))} className="text-slate-400 hover:text-red-400 flex items-center gap-2 font-bold text-xs uppercase">
                <Trash2 size={16} /> Clear
            </button>
        </div>

        {/* Piano Roll */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900 relative">
            <div className="flex">
                {/* Keys */}
                <div className="w-16 shrink-0 flex flex-col pt-8">
                    {NOTES.map((note, i) => (
                        <div key={note} className={`h-12 flex items-center justify-center text-xs font-bold text-slate-500 border-b border-slate-800 ${note.includes('#') ? 'bg-slate-800' : 'bg-slate-900'}`}>
                            {note}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-x-auto">
                    <div className="flex h-8 mb-2">
                        {Array.from({length: COLS}).map((_, i) => (
                            <div key={i} className={`flex-1 flex justify-center items-end pb-1 text-[10px] font-mono text-slate-500 border-l border-slate-800 ${i === currentCol ? 'text-pink-400 font-bold' : ''}`}>
                                {i+1}
                            </div>
                        ))}
                    </div>
                    
                    <div className="relative">
                        {/* Playhead */}
                        {currentCol >= 0 && (
                            <div className="absolute top-0 bottom-0 w-[6.25%] bg-white/10 pointer-events-none z-10 border-l border-pink-500/50" style={{ left: `${(currentCol / COLS) * 100}%` }} />
                        )}

                        {grid.map((row, r) => (
                            <div key={r} className="flex h-12 border-b border-slate-800">
                                {row.map((active, c) => (
                                    <div 
                                        key={c}
                                        onMouseDown={() => toggleCell(r, c)}
                                        onMouseEnter={(e) => { if (e.buttons === 1) toggleCell(r, c); }}
                                        className={`flex-1 border-l border-slate-800 cursor-pointer transition-colors relative group ${active ? 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] z-10' : 'hover:bg-white/5'}`}
                                    >
                                        {active && <div className="absolute inset-1 border-t border-l border-white/30 rounded-sm pointer-events-none" />}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MusicStudio;
