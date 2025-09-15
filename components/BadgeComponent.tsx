import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeComponentProps {
  children: ReactNode;
  variant?: 'skill' | 'category' | 'success' | 'error' | 'warning' | 'count';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const BadgeComponent = ({
  children,
  variant = 'skill',
  size = 'md',
  className = '',
  onClick,
}: BadgeComponentProps) => {
  const baseStyles =
    'font-medium rounded-full border-0 transition-all duration-200';

  const variants = {
    skill: 'bg-light-mint/20 text-prussian hover:bg-light-mint/30',
    category: 'bg-white/80 text-mint-900 hover:bg-white/90',
    success: 'bg-green-50 border-green-200 text-green-700 border',
    error: 'bg-red-50 border-red-200 text-red-700 border',
    warning: 'bg-amber-50 border-amber-200 text-amber-700 border',
    count:
      'bg-light-mint/15 text-prussian/70 hover:bg-light-mint/20 cursor-pointer',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const isStatus =
    variant === 'success' || variant === 'error' || variant === 'warning';

  return (
    <Badge
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={!isStatus ? onClick : undefined}
    >
      {children}
    </Badge>
  );
};

export default BadgeComponent;
