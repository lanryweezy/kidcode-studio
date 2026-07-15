import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0-3
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 3,
  size = 'md',
  animated = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} transition-all ${
            animated ? 'animate-bounce' : ''
          }`}
          style={animated ? { animationDelay: `${i * 200}ms` } : {}}
        >
          <Star
            size="100%"
            className={`${
              i < rating
                ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                : 'text-slate-300'
            } transition-colors`}
          />
        </div>
      ))}
    </div>
  );
};
