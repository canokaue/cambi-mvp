import { Input } from "@/components/ui/input";

export const DecimalInput = ({
  placeholder = "0.00",
  digits = 2,
  onChange,
  ...props
}: {
  digits?: number;
  onChange?: (value: number | undefined) => void;
} & React.ComponentProps<"input">) => {
  return (
    <Input
      type="number"
      step={`0.${"0".repeat(Math.max(0, digits - 1))}1`}
      min="0"
      placeholder={placeholder}
      onWheel={(e) => e.currentTarget.blur()} // Disable scroll to change value
      onChange={(e) => {
        const value = e.target.value;
        
        if (value === "") {
          onChange?.(undefined);
          return;
        }
        
        const number = parseFloat(value);
        if (!isNaN(number) && number >= 0) {
          // Round to specified digits
          const rounded = Math.round(number * (10 ** digits)) / (10 ** digits);
          onChange?.(rounded);
        }
      }}
      {...props}
    />
  );
};