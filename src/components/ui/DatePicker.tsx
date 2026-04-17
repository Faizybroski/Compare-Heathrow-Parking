"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  homepage?: boolean; // if true, use white text for better contrast on hero background
};

const generateTimeSlots = () => {
  const slots: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const h = hour.toString().padStart(2, "0");
    slots.push(`${h}:00`);
  }

  return slots;
};

export function DateTimePicker({ value, onChange, homepage = false }: Props) {
  const parsed = value ? new Date(value) : undefined;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(parsed);
  const [time, setTime] = useState(
    parsed ? `${parsed.getHours().toString().padStart(2, "0")}:00` : "",
  );

  const update = (d?: Date, t?: string) => {
    if (!d && !date) return;

    const finalDate = new Date(d || date!);

    const [h] = (t || time || "00:00").split(":");

    finalDate.setHours(Number(h));
    finalDate.setMinutes(0);
    finalDate.setSeconds(0);
    finalDate.setMilliseconds(0);

    onChange(finalDate.toISOString());
  };

  const timeSlots = generateTimeSlots();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* SINGLE TRIGGER */}
      <PopoverTrigger asChild className="active:bg-primary">
        <Button
          variant="outline"
          className="w-full h-11 rounded-md justify-start text-left font-normal border border-ring bg-transparent backdrop-blur-md hover:bg-white/20 active:bg-white/20 data-[state=open]:bg-white/20 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50 data-[state=open]:bg-white/20 data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/50"
                  >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />

          {date ? (
            <>
              <span className={` ${homepage ? "text-white" : "text-primary"}`}>{format(date, "PPP")}</span>
              <span className={`mx-2   ${homepage ? "text-white" : "text-primary"}`}>•</span>
              {/* <Clock className={`mr-1 h-4 w-4 text-white`} /> */}
              <span className={` ${homepage ? "text-white" : "text-primary"}`}>{time || "00:00"}</span>
            </>
          ) : (
            <span className={`${homepage ? "text-white/50" : "text-ring"}`}>Pick date & time</span>
          )}
        </Button>
      </PopoverTrigger>

      {/* COMBINED PANEL */}
      <PopoverContent align="start" className="p-0 rounded-xl shadow-lg w-auto">
        <div className="flex">
          {/* Calendar */}
          <div className="border-r p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d);
                update(d, undefined);
              }}
              disabled={{ before: new Date() }}
              initialFocus
            />
          </div>

          {/* Time list */}
          <div className="p-3  max-h-72 overflow-y-auto no-scrollbar">
            <p className="text-sm text-primary font-medium mb-2">
              Select time
            </p>

            <div className="flex flex-col gap-1">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setTime(slot);
                    update(undefined, slot);
                    setOpen(false);
                  }}
                  className={`text-sm px-3 py-2 rounded-md text-left hover:bg-muted ${
                    time === slot
                      ? "bg-primary text-white hover:bg-primary font-medium"
                      : ""
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
