"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, PlaneLanding } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type TerminalSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];
};

export function TerminalSelect({
  value,
  onChange,
  placeholder = "NA",
  options = ["T2", "T3", "T4", "T5"],
}: TerminalSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        {/* Icon */}
        <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none z-10" />

        {/* Trigger */}
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="pl-9 w-full h-11 rounded-md justify-between text-primary text-left font-normal border border-ring bg-transparent backdrop-blur-md hover:bg-white/20 active:bg-white/20 data-[state=open]:bg-white/20 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50 data-[state=open]:bg-white/20 data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/50"
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>

      {/* Content */}
      <PopoverContent className="w-full p-1">
        <div className="flex flex-col gap-1">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`text-sm px-3 py-2 rounded-md text-left hover:bg-primary/10 ${
                value === opt
                  ? "bg-primary text-white hover:bg-primary font-medium"
                  : ""
              }`}
            >
              {/* <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === opt ? "opacity-100" : "opacity-0"
                )}
              /> */}
              {opt}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleSelect("")}
            className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md"
          >
            Clear selection
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
