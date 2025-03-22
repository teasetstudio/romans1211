import React from "react";

interface DatePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {error && (
          <div className="mb-1 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
            {...props}
          />
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

DatePickerInput.displayName = "DatePickerInput";

export default DatePickerInput;
