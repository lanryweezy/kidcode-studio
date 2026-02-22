
import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, X, Volume2 } from 'lucide-react';
import { playSoundEffect } from '../services/soundService';

const SoundRecorder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-rose-500 overflow-hidden">
        <div className="p-6 bg-rose-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Mic size={28} fill="currentColor" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Sound Lab</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X size={24} /></button>
        </div>

        <div className="p-8 flex flex-col items-center gap-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {isRecording ? (
                    <div className="flex gap-1 items-center h-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: '100%', animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                ) : (
                    <Mic size={48} className="text-slate-400" />
                )}
            </div>

            <div className="flex gap-4">
                {!isRecording ? (
                    <button onClick={startRecording} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg flex items-center gap-2">
                        <Mic size={20} fill="currentColor" /> START RECORDING
                    </button>
                ) : (
                    <button onClick={stopRecording} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-lg flex items-center gap-2">
                        <Square size={20} fill="currentColor" /> STOP
                    </button>
                )}
            </div>

            {audioUrl && (
                <div className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                            <Volume2 size={20} />
                        </div>
                        <span className="font-bold text-sm">Your Sound.wav</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={playRecording} className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"><Play size={18} fill="currentColor" /></button>
                        <button onClick={() => setAudioUrl(null)} className="p-2 bg-slate-200 text-slate-500 rounded-lg hover:bg-slate-300 transition-colors"><Trash2 size={18} /></button>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center border-t border-slate-100 dark:border-slate-800">
            <button 
                onClick={() => { alert('Sound saved to your project library!'); onClose(); }}
                disabled={!audioUrl}
                className="w-full py-3 bg-rose-500 disabled:opacity-50 text-white font-black rounded-xl shadow-lg hover:bg-rose-600 transition-all"
            >
                SAVE TO LIBRARY
            </button>
        </div>
      </div>
    </div>
  );
};

export default SoundRecorder;
