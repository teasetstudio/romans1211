import { forwardRef } from "react";
import { Text } from "@/components/typo/Text";
import { format } from "date-fns";

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  isClearable?: boolean;
}

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
  (
    {
      selected,
      onChange,
      label,
      minDate,
      maxDate,
      isClearable = false,
      ...props
    },
    ref
  ) => {
    // Format date for datetime-local input
    const formatDateForInput = (date: Date | null): string => {
      if (!date) return "";
      return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        onChange(null);
        return;
      }
      
      try {
        const newDate = new Date(e.target.value);
        onChange(newDate);
      } catch (error) {
        console.error("Invalid date format", error);
      }
    };

    // Handle clear button click
    const handleClear = () => {
      onChange(null);
    };

    return (
      <div ref={ref} className="w-full">
        {label && <Text className="mb-1">{label}</Text>}
        <div className="relative">
          <input
            type="datetime-local"
            value={formatDateForInput(selected)}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
            min={minDate ? formatDateForInput(minDate) : undefined}
            max={maxDate ? formatDateForInput(maxDate) : undefined}
            {...props}
          />
          {isClearable && selected && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker"; 