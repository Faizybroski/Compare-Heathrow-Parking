// "use client";

// import { format } from "date-fns";
// import { CalendarIcon, Clock } from "lucide-react";
// import { useState } from "react";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// type Props = {
//   value?: string;
//   onChange: (value: string) => void;
//   homepage?: boolean; // if true, use white text for better contrast on hero background
// };

// const generateTimeSlots = () => {
//   const slots: string[] = [];

//   for (let hour = 0; hour < 24; hour++) {
//     const h = hour.toString().padStart(2, "0");
//     slots.push(`${h}:00`);
//   }

//   return slots;
// };

// export function DateTimePicker({ value, onChange, homepage = false }: Props) {
//   const parsed = value ? new Date(value) : undefined;

//   const [open, setOpen] = useState(false);
//   const [date, setDate] = useState<Date | undefined>(parsed);
//   const [time, setTime] = useState(
//     parsed ? `${parsed.getHours().toString().padStart(2, "0")}:00` : "",
//   );

//   const update = (d?: Date, t?: string) => {
//     if (!d && !date) return;

//     const finalDate = new Date(d || date!);

//     const [h] = (t || time || "00:00").split(":");

//     finalDate.setHours(Number(h));
//     finalDate.setMinutes(0);
//     finalDate.setSeconds(0);
//     finalDate.setMilliseconds(0);

//     onChange(finalDate.toISOString());
//   };

//   const timeSlots = generateTimeSlots();

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       {/* SINGLE TRIGGER */}
//       <PopoverTrigger asChild className="active:bg-primary">
//         <Button
//           variant="outline"
//           className={`w-full h-11 rounded-md justify-start text-left font-normal border border-ring bg-transparent backdrop-blur-md hover:bg-white/20 active:bg-white/20  focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50 data-[state=open]:bg-white/20 data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/50 ${homepage ? "bg-white hover:bg-white active:bg-white data-[state=open]:bg-white" : ""}`}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4 text-primary" />

//           {date ? (
//             <>
//               <span className={` text-primary`}>{format(date, "PPP")}</span>
//               <span className={`mx-2   text-primary`}>•</span>
//               {/* <Clock className={`mr-1 h-4 w-4 text-white`} /> */}
//               <span className={`text-primary`}>{time || "00:00"}</span>
//             </>
//           ) : (
//             <span className={`${homepage ? "text-primary/50" : "text-ring"}`}>
//               Pick date & time
//             </span>
//           )}
//         </Button>
//       </PopoverTrigger>

//       {/* COMBINED PANEL */}
//       <PopoverContent align="start" className="p-0 rounded-xl shadow-lg w-auto">
//         <div className="flex">
//           {/* Calendar */}
//           <div className="border-r p-2">
//             <Calendar
//               mode="single"
//               selected={date}
//               onSelect={(d) => {
//                 setDate(d);
//                 update(d, undefined);
//               }}
//               disabled={{ before: new Date() }}
//               initialFocus
//             />
//           </div>

//           {/* Time list */}
//           <div className="p-3  max-h-72 overflow-y-auto no-scrollbar">
//             <p className="text-sm text-primary font-medium mb-2">Select time</p>

//             <div className="flex flex-col gap-1">
//               {timeSlots.map((slot) => (
//                 <button
//                   key={slot}
//                   onClick={() => {
//                     setTime(slot);
//                     update(undefined, slot);
//                     setOpen(false);
//                   }}
//                   className={`text-sm px-3 py-2 rounded-md text-left hover:bg-muted ${
//                     time === slot
//                       ? "bg-primary text-white hover:bg-primary font-medium"
//                       : ""
//                   }`}
//                 >
//                   {slot}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }

"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  homepage?: boolean;
};

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

function TimeColumn({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx !== -1 && containerRef.current) {
      const item = containerRef.current.children[idx] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [selected, items]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-y-auto h-56 w-14 scrollbar-thin"
    >
      {items.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onSelect(v)}
          className={`text-sm py-1.5 rounded-md text-center shrink-0 hover:bg-muted ${
            selected === v
              ? "bg-primary text-white hover:bg-primary font-medium"
              : ""
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function DateTimePicker({ value, onChange, homepage = false }: Props) {
  const parsed = value ? new Date(value) : undefined;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(parsed);
  const [hour, setHour] = useState(
    parsed ? parsed.getHours().toString().padStart(2, "0") : "00",
  );
  const [minute, setMinute] = useState(
    parsed ? parsed.getMinutes().toString().padStart(2, "0") : "00",
  );

  const commit = (d: Date | undefined, h: string, m: string) => {
    if (!d) return;
    const finalDate = new Date(d);
    finalDate.setHours(Number(h));
    finalDate.setMinutes(Number(m));
    finalDate.setSeconds(0);
    finalDate.setMilliseconds(0);
    onChange(finalDate.toISOString());
  };

  const handleHourSelect = (h: string) => {
    setHour(h);
    commit(date, h, minute);
  };

  const handleMinuteSelect = (m: string) => {
    setMinute(m);
    commit(date, hour, m);
    if (date) setOpen(false);
  };

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    commit(d, hour, minute);
  };

  const displayTime = `${hour}:${minute}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="active:bg-primary">
        <Button
          variant="outline"
          className={`w-full h-11 rounded-md justify-start text-left font-normal border border-ring bg-transparent backdrop-blur-md hover:bg-white/20 active:bg-white/20  focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50 data-[state=open]:bg-white/20 data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/50 ${homepage ? "bg-white hover:bg-white active:bg-white data-[state=open]:bg-white" : ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />

          {date ? (
            <>
              <span className={` text-primary`}>{format(date, "PPP")}</span>
              <span className={`mx-2   text-primary`}>•</span>
              {/* <Clock className={`mr-1 h-4 w-4 text-white`} /> */}
              <span className={`text-primary`}>{displayTime}</span>
            </>
          ) : (
            <span className={`${homepage ? "text-primary/50" : "text-ring"}`}>
              Pick date & time
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-0 rounded-xl shadow-lg w-auto">
        <div className="flex">
          {/* Calendar */}
          <div className="border-r p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={{ before: new Date() }}
              initialFocus
            />
          </div>

          {/* Time picker: hours + minutes columns */}
          <div className="p-3 flex flex-col gap-2">
            <p className="text-sm text-primary-light font-medium">
              Select time
            </p>
            <div className="flex gap-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">HH</span>
                <TimeColumn
                  items={HOURS}
                  selected={hour}
                  onSelect={handleHourSelect}
                />
              </div>
              <div className="flex items-center justify-center pt-5 text-primary font-semibold">
                :
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">MM</span>
                <TimeColumn
                  items={MINUTES}
                  selected={minute}
                  onSelect={handleMinuteSelect}
                />
              </div>
            </div>
            <p className="text-center text-sm font-medium text-primary">
              {displayTime}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
