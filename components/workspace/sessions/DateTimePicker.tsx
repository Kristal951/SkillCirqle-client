import Tooltip from "@/components/ui/Tooltip";
import { useEffect, useRef, useState } from "react";
import Info from "@material-symbols/svg-400/outlined/info.svg"

const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function generateTimeSlots() {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      const period = h < 12 ? "AM" : "PM";
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      slots.push({
        value: `${hour}:${min}`,
        label: `${displayHour}:${min} ${period}`,
        minutesFromMidnight: h * 60 + m,
      });
    }
  }
  return slots;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

const TIME_SLOTS = generateTimeSlots();
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  bookedDates?: string[];
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  bookedDates = [],
}: DateTimePickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeRef = useRef<HTMLDivElement>(null);

  const todayStr = today.toISOString().slice(0, 10);
  const days = getCalendarDays(viewYear, viewMonth);
  const selectedTimeLabel =
    TIME_SLOTS.find((s) => s.value === selectedTime)?.label ?? selectedTime;

  const bookedSet = new Set(bookedDates);

  const isToday = selectedDate === todayStr;
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  const availableTimeSlots = isToday
    ? TIME_SLOTS.filter((s) => s.minutesFromMidnight > nowMinutes)
    : TIME_SLOTS;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  useEffect(() => {
    if (isToday) {
      const stillValid = availableTimeSlots.some((s) => s.value === selectedTime);
      if (!stillValid && availableTimeSlots.length > 0) {
        onTimeChange(availableTimeSlots[0].value);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) {
        setShowTimeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-text-primary/5">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-lg p-1 text-text-secondary hover:bg-text-primary/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text-primary">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-lg p-1 text-text-secondary hover:bg-text-primary/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 px-3 pt-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-text-secondary/50 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-3">
          {days.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = dateStr === selectedDate;
            const isTodayCell = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const isBooked = bookedSet.has(dateStr);

            return isBooked ? (
              <Tooltip key={day} content="You already have a session this day">
                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => onDateChange(dateStr)}
                  className={`
                    relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
                    ${isPast ? "text-text-secondary/20 cursor-not-allowed" : ""}
                    ${isSelected ? "bg-primary text-white font-semibold shadow-sm" : ""}
                    ${isTodayCell && !isSelected ? "border border-primary text-primary font-semibold" : ""}
                    ${!isSelected && !isTodayCell && !isPast ? "text-text-primary hover:bg-text-primary/5" : ""}
                  `}
                >
                  {day}
                  <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`} />
                </button>
              </Tooltip>
            ) : (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => onDateChange(dateStr)}
                className={`
                  mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
                  ${isPast ? "text-text-secondary/20 cursor-not-allowed" : ""}
                  ${isSelected ? "bg-primary text-white font-semibold shadow-sm" : ""}
                  ${isTodayCell && !isSelected ? "border border-primary text-primary font-semibold" : ""}
                  ${!isSelected && !isTodayCell && !isPast ? "text-text-primary hover:bg-text-primary/5" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {bookedDates.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 pb-3">
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span className="text-[11px] text-text-secondary/50">Day has a scheduled session</span>
          </div>
        )}
      </div>

      <div ref={timeRef} className="relative px-4">
        <label className="mb-1.5 block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
          Select Time
        </label>
        <button
          type="button"
          onClick={() => setShowTimeDropdown((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl bg-surface/80 px-3.5 py-2.5 text-sm text-text-primary transition-all hover:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{selectedTimeLabel}</span>
          </div>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${showTimeDropdown ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showTimeDropdown && (
          <div className="absolute z-10 mt-1 w-88 rounded-xl border border-text-primary/10 bg-surface shadow-lg overflow-hidden">
            <div className="max-h-44 overflow-y-auto py-1">
              {availableTimeSlots.length === 0 ? (
                <div className="px-4 py-3 text-xs text-text-secondary/50 text-center">
                  No times left today — pick another date
                </div>
              ) : (
                availableTimeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => { onTimeChange(slot.value); setShowTimeDropdown(false); }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-text-primary/5 ${
                      selectedTime === slot.value ? "font-semibold bg-primary/50" : "text-text-primary"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 py-4">
          <p className="text-[11px] font-body text-text-secondary flex items-center gap-2">
            <Info className="text-[14px]"/>
            Time is displayed in your local timezone ({USER_TZ.replace(/_/g, " ")})
          </p>
        </div>
      </div>
    </div>
  );
}

export { USER_TZ };
export function toUTCIso(dateStr: string, timeStr: string): string {
  const localDateTimeStr = `${dateStr}T${timeStr}:00`;
  const date = new Date(
    new Date(localDateTimeStr).toLocaleString("en-US", { timeZone: USER_TZ })
  );
  const localDate = new Date(localDateTimeStr);
  const diff = localDate.getTime() - date.getTime();
  return new Date(localDate.getTime() + diff).toISOString();
}