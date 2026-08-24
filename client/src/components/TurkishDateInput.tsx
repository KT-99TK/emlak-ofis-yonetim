import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatTurkishDate, parseTurkishDateInput } from "@/lib/turkishDate";

type TurkishDateInputProps = {
  value: string;
  onValueChange: (isoDate: string) => void;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
};

export default function TurkishDateInput({ value, onValueChange, className, disabled, ...props }: TurkishDateInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatTurkishDate(value, ""));

  useEffect(() => {
    setDisplayValue(formatTurkishDate(value, ""));
  }, [value]);

  const commit = () => {
    const isoDate = parseTurkishDateInput(displayValue);
    if (isoDate === null) {
      setDisplayValue(formatTurkishDate(value, ""));
      return;
    }
    onValueChange(isoDate);
    setDisplayValue(formatTurkishDate(isoDate, ""));
  };

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pr-10", className)}
        value={displayValue}
        disabled={disabled}
        inputMode="numeric"
        placeholder="GG.AA.YYYY"
        onChange={(event) => setDisplayValue(event.target.value)}
        onBlur={commit}
      />
      <CalendarDays aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d837a]" />
    </div>
  );
}
