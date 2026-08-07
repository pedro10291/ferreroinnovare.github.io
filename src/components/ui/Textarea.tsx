import React from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-clinic-textSecondary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-md border border-clinic-border bg-clinic-card px-4 py-3 text-sm text-clinic-textPrimary transition-all duration-300 placeholder:text-clinic-textSecondary/50 focus-visible:outline-none focus-visible:border-clinic-gold focus-visible:shadow-[0_4px_14px_rgba(201,139,132,0.1)] disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-clinic-danger focus-visible:border-clinic-danger'
              : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-clinic-danger">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
