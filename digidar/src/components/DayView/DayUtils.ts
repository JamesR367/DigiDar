import type { Dispatch, SetStateAction } from "react";
import type { CalendarEvent } from "../../utils/Context";

export type DayViewProps = {
  setView: Dispatch<SetStateAction<"month" | "day">>;
  setSelectedEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
};

export interface PositionedEvent {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
}

export const EVENT_LAYOUT = {
  LEFT_OFFSET_PCT: 0.75,
  TOTAL_WIDTH_PCT: 98,
  TIME_LABEL_WIDTH_PCT: 11,
  INSET_PCT: 0.4,
} as const;

export function layoutEvents(events: CalendarEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.start_datetime).getTime() -
      new Date(b.start_datetime).getTime(),
  );

  const positioned: PositionedEvent[] = sorted.map((e) => ({
    event: e,
    column: 0,
    totalColumns: 1,
  }));

  const visited = new Set<number>();

  for (let i = 0; i < positioned.length; i++) {
    if (visited.has(i)) continue;

    const cluster: number[] = [i];
    visited.add(i);

    for (let j = i + 1; j < positioned.length; j++) {
      const aEnd = new Date(positioned[i].event.end_datetime).getTime();
      const bStart = new Date(positioned[j].event.start_datetime).getTime();
      if (bStart < aEnd) {
        cluster.push(j);
        visited.add(j);
      }
    }

    const colEndTimes: number[] = [];

    for (const idx of cluster) {
      const startTime = new Date(positioned[idx].event.start_datetime).getTime();
      let col = colEndTimes.findIndex((endTime) => endTime <= startTime);

      if (col === -1) {
        col = colEndTimes.length;
        colEndTimes.push(0);
      }

      colEndTimes[col] = new Date(positioned[idx].event.end_datetime).getTime();
      positioned[idx].column = col;
    }

    for (const idx of cluster) {
      positioned[idx].totalColumns = colEndTimes.length;
    }
  }

  return positioned;
}

export async function fetchDayEvents(
  isoDate: string,
): Promise<CalendarEvent[]> {
  const response = await fetch("http://localhost:8001/events/");
  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
  const allEvents: CalendarEvent[] = await response.json();
  return allEvents.filter(
    (event) => event.start_datetime.toString().split("T")[0] === isoDate,
  );
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}