import React from 'react';

const KID_MESSAGES = [
  "Wiggling the pixels...",
  "Teaching robots to dance...",
  "Sprinkling some magic dust...",
  "Waking up the code...",
  "Flipping some bits...",
  "Making things sparkle...",
  "Loading awesomeness...",
  "Almost there, champion!",
];

const FUN_FACTS = [
  "Did you know? Computers were once as big as a room!",
  "Fun fact: The first computer bug was a real bug!",
  "Cool tip: Code is like a recipe for computers!",
];

const ShimmerBlock: React.FC<{ width?: string; height?: string; rounded?: string }> = ({
  width = '100%',
  height = '1rem',
  rounded = '0.75rem',
}) => (
  <div
    className="relative overflow-hidden"
    style={{ width, height, borderRadius: rounded }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-pink-200/60 via-purple-200/60 to-pink-200/60" />
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  </div>
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-pink-200/50 ${className}`}>
    <ShimmerBlock height="12rem" rounded="1rem" />
    <div className="mt-4 space-y-3">
      <ShimmerBlock width="75%" height="1rem" />
      <ShimmerBlock width="50%" height="0.75rem" />
    </div>
  </div>
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <ShimmerBlock
        key={i}
        width={`${100 - (i * 12)}%`}
        height="1rem"
      />
    ))}
  </div>
);

export const AvatarSkeleton: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = ''
}) => (
  <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300" />
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  </div>
);

export const ThumbnailSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-2 ${className}`}>
    <ShimmerBlock height="8rem" rounded="0.75rem" />
    <div className="mt-2">
      <ShimmerBlock width="66%" height="0.75rem" />
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{
  size?: number;
  className?: string;
  text?: string;
}> = ({ size = 40, className = '', text }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 border-4 border-pink-200 rounded-full" />
      <div
        className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin"
        style={{
          borderImage: 'linear-gradient(135deg, #f472b6, #a78bfa, #60a5fa) 1',
          borderStyle: 'solid',
          borderWidth: '4px',
          borderTopColor: 'transparent',
        }}
      />
      <div
        className="absolute inset-2 rounded-full animate-pulse"
        style={{
          background: 'linear-gradient(135deg, #f472b6, #a78bfa)',
          opacity: 0.2,
        }}
      />
    </div>
    {text && (
      <div className="mt-4 text-purple-600 font-black text-sm animate-pulse">
        {text}
      </div>
    )}
  </div>
);

export const PageLoader: React.FC<{ message?: string }> = ({ message }) => {
  const randomMessage = KID_MESSAGES[Math.floor(Math.random() * KID_MESSAGES.length)];
  const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 30%, #f3e8ff 60%, #ede9fe 100%)',
      }}
    >
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6 animate-bounce">✨</div>
        <LoadingSpinner size={72} />
        <div className="mt-6 text-purple-700 font-black text-xl">
          {message || randomMessage}
        </div>
        <div className="mt-3 text-pink-500 font-bold text-sm">
          {randomFact}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {['🎮', '🚀', '🎨', '⭐', '🤖'].map((emoji, i) => (
            <span
              key={i}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ButtonLoader: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
    <span>{text}</span>
  </div>
);

export const ShimmerCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <CardSkeleton />
  </div>
);

export const GridSkeleton: React.FC<{
  columns?: number;
  count?: number;
  className?: string;
}> = ({ columns = 3, count = 6, className = '' }) => (
  <div className={`grid grid-cols-${columns} gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const PulseDot: React.FC<{
  color?: string;
  size?: number;
  className?: string;
}> = ({ color = 'green', size = 8, className = '' }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div
      className={`absolute inset-0 bg-${color}-500 rounded-full animate-ping`}
      style={{ animationDuration: '2s' }}
    />
    <div className={`absolute inset-0 bg-${color}-500 rounded-full`} />
  </div>
);

export const LoadingAnimations = () => (
  <style>{`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-shimmer {
      animation: shimmer 1.5s infinite linear;
    }
  `}</style>
);

export default {
  CardSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  ThumbnailSkeleton,
  LoadingSpinner,
  PageLoader,
  ButtonLoader,
  ShimmerCard,
  GridSkeleton,
  PulseDot,
  LoadingAnimations
};
