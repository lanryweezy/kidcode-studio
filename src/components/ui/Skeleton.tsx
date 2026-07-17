import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, rounded = 'rounded-lg', lines = 1 }) => {
  return (
    <div className={`skeleton-shimmer ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200/50 ${rounded} mb-2`}
          style={{ width: width || '100%', height: height || '16px' }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <Skeleton height="120px" className="mb-3" />
    <Skeleton lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-2">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} height="24px" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);
