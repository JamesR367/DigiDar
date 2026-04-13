import { DateTime, Info, Interval } from "luxon";
import type { CalendarEvent } from "../../utils/Context";

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

export async function fetchEventsForMonth(
  firstDayOfActiveMonth: DateTime,
): Promise<Record<string, CalendarEvent[]>> {
  const response = await fetch("http://localhost:8001/events/");
  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
  const allEvents: CalendarEvent[] = await response.json();

  const monthStart = firstDayOfActiveMonth.startOf("month");
  const monthEnd = firstDayOfActiveMonth.endOf("month");

  const eventsByDate: Record<string, CalendarEvent[]> = {};

  for (const event of allEvents) {
    const dateKey = event.start_datetime.toString().split("T")[0];
    const eventDate = DateTime.fromISO(dateKey);
    if (eventDate >= monthStart && eventDate <= monthEnd) {
      if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
      eventsByDate[dateKey].push(event);
    }
  }

  return eventsByDate;
}