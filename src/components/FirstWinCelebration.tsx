import React from 'react';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

interface FirstWinCelebrationProps {
  projectName: string;
  xpEarned: number;
  onClose: () => void;
}

export const FirstWinCelebration: React.FC<FirstWinCelebrationProps> = ({
  projectName,
  xpEarned,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-1 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 rounded-[22px] p-8 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl"></div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X size={20} className="text-white/60 hover:text-white" />
          </button>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Animated trophy icon */}
            <div className="mb-6 relative inline-block">
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6 shadow-xl animate-bounce">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              🎉 CONGRATULATIONS!
            </h2>
            
            <p className="text-slate-300 text-lg mb-6 font-medium">
              You just built your first project!
            </p>

            {/* XP Reward */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-black text-yellow-400">+{xpEarned} XP</span>
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-slate-400 text-sm">
                Keep building to level up!
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 CONTINUE BUILDING
              </button>
              
              <button
                onClick={() => {
                  // Share functionality (placeholder)
                  if (navigator.share) {
                    navigator.share({
                      title: 'My KidCode Project',
                      text: `I just built "${projectName}" on KidCode Studio!`,
                      url: window.location.href
                    });
                  }
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                📤 Share with Friends
              </button>
            </div>

            {/* Progress hint */}
            <p className="text-slate-500 text-xs mt-4">
              🏆 Complete more projects to unlock badges and level up!
            </p>
          </div>
        </div>
      </div>

      {/* Confetti effect (CSS version) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-in slide-in-from-top duration-1000"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              backgroundColor: ['#fbbf24', '#a855f7', '#3b82f6', '#ef4444', '#22c55e', '#ec4899', '#f97316'][Math.floor(Math.random() * 7)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              animationIterationCount: 'infinite'
            }}
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute text-2xl animate-in slide-in-from-top duration-1000"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
              animationIterationCount: 'infinite'
            }}
          >
            {['⭐', '✨', '🌟', '💫', '🎆'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirstWinCelebration;
