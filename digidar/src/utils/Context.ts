import { createContext } from "react";
import { DateTime } from "luxon";

export const dateContext = createContext<DateTime | null>(null);
export const eventsContext = createContext<CalendarEvent[] | null>(null);

export interface CalendarEvent {
    end_datetime: string,
    id: number,
    user_id: number,
    title: string,
    start_datetime: string,
    all_day: boolean
  } 