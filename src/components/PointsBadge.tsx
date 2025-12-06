import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PointsBadge({ points, size = 'md', showIcon = true, className }: PointsBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1 gap-1',
    md: 'text-base px-3 py-1.5 gap-1.5',
    lg: 'text-lg px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center bg-points-gold-bg text-points-gold rounded-full font-semibold',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Award className={iconSizes[size]} />}
      <span>{points.toLocaleString()}</span>
    </div>
  );
}
