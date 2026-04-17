import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

const airports = [
  {
    value: "heathrow",
    label: "Heathrow Airport",
    subtitle: "London, United Kingdom",
  },
];

export default function AirportPopover() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>("heathrow"); // preselected

  const current = airports.find((a) => a.value === selected);

  return (
    // <div className="space-y-1.5">
    //   <label className="text-sm font-medium">Select Airport</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-11 rounded-md justify-between font-normal border border-ring bg-transparent backdrop-blur-md hover:bg-white/20 active:bg-white/20 data-[state=open]:bg-white/20 data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50"
          >
            {current ? (
              <div className="flex flex-col text-left leading-tight">
                <span className="text-primary text-sm font-medium">
                  {current.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {current.subtitle}
                </span>
              </div>
            ) : (
              <span className="text-primary/80">Select Airport</span>
            )}

            <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="p-2 w-[300px] rounded-xl shadow-lg"
        >
          <div className="flex flex-col gap-1">
            {airports.map((airport) => (
              <button
                key={airport.value}
                onClick={() => {
                  setSelected(airport.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-muted transition",
                  selected === airport.value && "bg-muted"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {airport.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {airport.subtitle}
                  </span>
                </div>

                {selected === airport.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    // </div>
  );
}