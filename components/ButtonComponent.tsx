import { Button } from '@/components/ui/button';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonComponentProps {
  children: ReactNode;
  onClick?: () => void;
  variant?:
    | 'primary'
    | 'secondary'
    | 'action'
    | 'accent'
    | 'danger'
    | 'solidanger'
    | 'plain';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// HTMLButtonElement, das HTML-ELement was weitergegeben wird
// ButtonComponentProps, props die wir akzeptieren
const ButtonComponent = forwardRef<HTMLButtonElement, ButtonComponentProps>(
  (
    {
      children,
      onClick,
      variant = 'primary',
      size = 'md',
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-semibold border cursor-pointer';

    const variants = {
      primary:
        'bg-light-mint/20 hover:bg-light-mint/30 text-prussian border-light-mint/30 hover:border-light-mint/50 rounded-2xl',
      secondary:
        'bg-white/60 hover:bg-white/80 text-prussian border-light-mint/30 hover:border-light-mint/50 rounded-2xl',
      action:
        'bg-white/80 hover:bg-light-mint/10 text-prussian border-light-mint/30 rounded-full',
      plain: 'bg-white/80 text-prussian border-light-mint/30 rounded-2xl',
      accent:
        'bg-flax hover:bg-flax/80 text-prussian border-flax/80 hover:border-flax rounded-2xl',
      danger:
        'bg-white/80 hover:bg-red-50/80 text-red-700 border-red-200 hover:border-red-300 rounded-2xl',
      solidanger:
        'bg-red-700 hover:bg-red-700 text-white border-red-700 rounded-2xl',
    };

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const actionSizes = {
      sm: 'p-2.5',
      md: 'p-3',
      lg: 'p-3.5',
    };

    // je nach button wird das padding optimiert
    const getSize = () => {
      return variant === 'action' ? actionSizes[size] : sizes[size];
    };

    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          getSize(),
          className,
          variant === 'plain'
            ? ''
            : 'transition-all duration-200 hover:scale-105'
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ButtonComponent.displayName = 'ButtonComponent';

export default ButtonComponent;
