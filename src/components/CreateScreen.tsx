import React, { useState } from 'react';
import { Zap, Gamepad2, Film, BookOpen, Bot, Sparkles, ArrowRight, Rocket, Search, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { GAME_FAMILIES, GAME_TYPES, getGameTypesByFamily, type GameTypeConfig } from '../constants/gameTypes';

interface CreateChoice {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const CHOICES: CreateChoice[] = [
  { id: 'game', label: 'A Game', description: 'Build worlds, characters, and adventures', icon: <Gamepad2 size={32} />, color: 'text-orange-500', gradient: 'from-orange-500 to-red-500' },
  { id: 'animation', label: 'An Animation', description: 'Bring drawings to life', icon: <Film size={32} />, color: 'text-pink-500', gradient: 'from-pink-500 to-purple-500' },
  { id: 'story', label: 'A Story', description: 'Write interactive adventures', icon: <BookOpen size={32} />, color: 'text-blue-500', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'robot', label: 'A Robot', description: 'Program real hardware', icon: <Bot size={32} />, color: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'ai', label: 'An AI', description: 'Create smart helpers', icon: <Sparkles size={32} />, color: 'text-violet-500', gradient: 'from-violet-500 to-purple-500' },
  { id: 'new', label: 'Something New', description: 'Start from scratch', icon: <Zap size={32} />, color: 'text-yellow-500', gradient: 'from-yellow-500 to-orange-500' },
];

interface CreateScreenProps {
  onProjectCreate: (type: string, gameType?: string, description?: string) => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ onProjectCreate }) => {
  const [step, setStep] = useState<'choice' | 'families' | 'types' | 'describe'>('choice');
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleChoiceSelect = (id: string) => {
    setSelectedChoice(id);
    if (id === 'game') {
      setStep('families');
    } else {
      onProjectCreate(id);
    }
  };

  const handleFamilySelect = (familyId: string) => {
    setSelectedFamily(familyId);
    setStep('types');
  };

  const handleGameTypeSelect = (type: GameTypeConfig) => {
    setSelectedGameType(type.id);
    onProjectCreate('game', type.id, type.description);
  };

  const handleDescribe = () => {
    onProjectCreate('game', selectedGameType || 'blank', description);
  };

  const filteredTypes = searchQuery
    ? GAME_TYPES.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedFamily
    ? getGameTypesByFamily(selectedFamily)
    : GAME_TYPES;

  const stepIndex = step === 'choice' ? 0 : step === 'families' ? 1 : step === 'types' ? 2 : 3;
  const stepLabels = ['Choose', 'Genre', 'Game', 'Describe'];

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {stepLabels.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < stepIndex ? 'bg-violet-600 text-white' :
              i === stepIndex ? 'bg-violet-600 text-white ring-4 ring-violet-300 scale-110' :
              'bg-white/10 text-white/40'
            }`}>
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${
              i <= stepIndex ? 'text-white' : 'text-white/40'
            }`}>{label}</span>
          </div>
          {i < stepLabels.length - 1 && (
            <ChevronRight size={14} className={i < stepIndex ? 'text-violet-400' : 'text-white/20'} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (step === 'describe') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4">
        <div className="w-full max-w-2xl animate-fade-in">
          <StepIndicator />
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Rocket size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Describe Your Game</h2>
            <p className="text-slate-400">Be as detailed or simple as you want. AI will build your starter game.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Zelda but in space with dragons and laser swords..."
              className="w-full h-32 bg-white/5 border border-white/20 rounded-2xl p-4 text-white text-lg placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              autoFocus
            />

            <div className="flex flex-wrap gap-2 mt-4 mb-6">
              {['Zelda in space', 'Flappy Bird with dragons', 'Mario meets Minecraft', 'Pokemon but with robots'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setDescription(suggestion)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full text-xs font-medium transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('types')} className="text-white hover:text-white hover:bg-white/10">
                Back
              </Button>
              <Button variant="primary" fullWidth size="lg" onClick={handleDescribe} disabled={!description.trim()} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <Sparkles size={20} /> Create My Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'types') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <StepIndicator />
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">
              {selectedFamily ? GAME_FAMILIES.find(f => f.id === selectedFamily)?.label : '🎮 All Game Types'}
            </h2>
            <p className="text-slate-400">Pick a game to start building. Or describe your own!</p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Family pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => { setSelectedFamily(''); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                !selectedFamily ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            {GAME_FAMILIES.map(family => (
              <button
                key={family.id}
                onClick={() => { setSelectedFamily(family.id); setSearchQuery(''); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedFamily === family.id ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {family.label}
              </button>
            ))}
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {filteredTypes.map(type => (
              <button
                key={type.id}
                onClick={() => handleGameTypeSelect(type)}
                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-2xl transition-all hover:scale-105 text-center"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{type.emoji}</div>
                <div className="text-white font-bold text-sm">{type.name}</div>
                <div className="text-slate-500 text-xs mt-1">{type.description}</div>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {type.features.slice(0, 3).map(f => (
                    <span key={f} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-slate-400">{f}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Describe your own */}
          <div className="text-center mb-8">
            <button
              onClick={() => setStep('describe')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all"
            >
              <Sparkles size={18} className="inline mr-2" /> Describe Your Own Game
            </button>
          </div>

          <div className="text-center">
            <button onClick={() => setStep('families')} className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Back to families
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'families') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4">
        <div className="w-full max-w-5xl animate-fade-in">
          <StepIndicator />
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">🎮 What Kind of Game?</h2>
            <p className="text-slate-400">Pick a genre family, or browse all {GAME_TYPES.length} games.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {GAME_FAMILIES.filter(f => f.id !== 'business').map(family => {
              const count = getGameTypesByFamily(family.id).length;
              return (
                <button
                  key={family.id}
                  onClick={() => handleFamilySelect(family.id)}
                  className={`group p-5 bg-gradient-to-br ${family.color} rounded-2xl transition-all hover:scale-105 hover:shadow-xl text-left text-white`}
                >
                  <div className="text-2xl mb-2">{family.label.split(' ')[0]}</div>
                  <div className="font-bold text-sm">{family.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-white/70 text-xs mt-1">{family.description}</div>
                  <div className="text-white/50 text-xs mt-2">{count} games</div>
                </button>
              );
            })}
          </div>

          {/* Browse all */}
          <div className="text-center">
            <button
              onClick={() => { setSelectedFamily(''); setStep('types'); }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
            >
              🎯 Browse All {GAME_TYPES.length} Games
            </button>
          </div>

          <div className="text-center mt-6">
            <button onClick={() => setStep('choice')} className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Back to choices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4">
      <div className="w-full max-w-3xl animate-fade-in">
        <StepIndicator />
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow animate-float">
            <Zap size={32} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">What do you want to create today?</h1>
          <p className="text-slate-400 text-lg">Pick one. We'll build the rest together.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHOICES.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleChoiceSelect(choice.id)}
              className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-2xl transition-all hover:scale-105 hover:shadow-xl text-left"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${choice.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {choice.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{choice.label}</h3>
              <p className="text-slate-400 text-sm">{choice.description}</p>
              <ArrowRight size={16} className="absolute top-6 right-6 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
