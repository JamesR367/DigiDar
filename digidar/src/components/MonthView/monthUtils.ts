import { DateTime, Info, Interval } from "luxon";

export const LOCALE = "en-US";

export interface CalendarProps {
  setSelectedDate: (selectedDate: DateTime) => void;
  setView: (view: "month" | "day") => void;
}

export function getWeekdays(): string[] {
  return Info.weekdays("short", { locale: LOCALE });
}

export function getDaysOfMonth(firstDayOfActiveMonth: DateTime): DateTime[] {
  return Interval.fromDateTimes(
    firstDayOfActiveMonth.startOf("week"),
    firstDayOfActiveMonth.endOf("month").endOf("week"),
  )
    .splitBy({ day: 1 })
    .map((day) => day.start)
    .filter((day): day is DateTime => day !== null);
}