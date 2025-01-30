'use client';

import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperTextClassName?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  helperText,
  wrapperClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  helperTextClassName,
  id,
  type = 'text',
  className,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={twMerge('space-y-2', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={twMerge(
            'block text-sm font-medium text-gray-700 mb-1',
            error && 'text-red-500',
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={twMerge(
            'block w-full px-4 py-2.5 text-gray-900 bg-white rounded-lg',
            'border border-gray-300',
            'placeholder:text-gray-400',
            'transition-colors duration-200',
            // Focus state
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            // Hover state
            'hover:border-indigo-500/50',
            // Disabled state
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200',
            // Error state
            error && [
              'border-red-500',
              'focus:ring-red-500/20',
              'focus:border-red-500',
              'hover:border-red-500'
            ],
            inputClassName,
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-description` : undefined
          }
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className={twMerge(
            'text-sm text-red-500 mt-1',
            errorClassName
          )}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${inputId}-description`}
          className={twMerge(
            'text-sm text-gray-500 mt-1',
            helperTextClassName
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
