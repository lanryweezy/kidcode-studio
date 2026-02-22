import React from 'react';

/**
 * Loading Skeleton for cards
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-48 w-full" />
    <div className="mt-4 space-y-3">
      <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-4 w-3/4" />
      <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-3 w-1/2" />
    </div>
  </div>
);

/**
 * Loading Skeleton for text lines
 */
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="bg-slate-200 dark:bg-slate-700 rounded-xl h-4"
        style={{ width: `${100 - (i * 10)}%` }}
      />
    ))}
  </div>
);

/**
 * Loading Skeleton for circular avatars
 */
export const AvatarSkeleton: React.FC<{ size?: number; className?: string }> = ({ 
  size = 48, 
  className = '' 
}) => (
  <div
    className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

/**
 * Loading Skeleton for image thumbnails
 */
export const ThumbnailSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-slate-200 dark:bg-slate-700 rounded-xl aspect-square w-full" />
    <div className="mt-2 bg-slate-200 dark:bg-slate-700 rounded-lg h-3 w-2/3" />
  </div>
);

/**
 * Loading Spinner
 */
export const LoadingSpinner: React.FC<{ 
  size?: number; 
  className?: string;
  text?: string;
}> = ({ size = 40, className = '', text }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
      <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin" />
    </div>
    {text && (
      <div className="mt-4 text-slate-600 dark:text-slate-400 font-bold text-sm">
        {text}
      </div>
    )}
  </div>
);

/**
 * Full Page Loading State
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size={64} />
      {message && (
        <div className="mt-6 text-white font-black text-xl animate-pulse">
          {message}
        </div>
      )}
    </div>
  </div>
);

/**
 * Button Loading State
 */
export const ButtonLoader: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
    <span>{text}</span>
  </div>
);

/**
 * Progress Bar with Animation
 */
export const AnimatedProgressBar: React.FC<{ 
  progress: number; 
  className?: string;
  showLabel?: boolean;
}> = ({ progress, className = '', showLabel = true }) => (
  <div className={`w-full ${className}`}>
    {showLabel && (
      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
        <span>Loading...</span>
        <span>{Math.round(progress)}%</span>
      </div>
    )}
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear'
        }}
      />
    </div>
  </div>
);

/**
 * Shimmer Effect for Loading Cards
 */
export const ShimmerCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    <CardSkeleton />
  </div>
);

/**
 * Grid of Loading Cards
 */
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

/**
 * Pulse Dot for Status Indicators
 */
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
    <div
      className={`absolute inset-0 bg-${color}-500 rounded-full`}
    />
  </div>
);

// Add custom animations to index.css
export const LoadingAnimations = () => (
  <style>{`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite linear;
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
  AnimatedProgressBar,
  ShimmerCard,
  GridSkeleton,
  PulseDot,
  LoadingAnimations
};
