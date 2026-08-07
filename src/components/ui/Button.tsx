import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-clinic-gold focus:ring-offset-1 focus:ring-offset-clinic-bg disabled:opacity-50 disabled:pointer-events-none tracking-wide';
    
    const variants = {
      primary: 'bg-clinic-gold text-white shadow-sm hover:bg-clinic-goldDark hover:shadow-md',
      secondary: 'bg-transparent text-clinic-textPrimary border border-clinic-border hover:border-clinic-gold hover:text-clinic-gold',
      ghost: 'bg-transparent text-clinic-textSecondary hover:text-clinic-textPrimary',
      danger: 'bg-clinic-danger text-white hover:bg-red-700',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs uppercase',
      md: 'h-12 px-6 text-sm uppercase',
      lg: 'h-14 px-8 text-sm uppercase',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
