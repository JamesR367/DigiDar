import { createContext } from "react";
import { DateTime } from "luxon";

export const dateContext = createContext<DateTime | null>(null);
export const eventsContext = createContext<Event | null>(null);

export interface Event {
    end_datetime: string,
    id: number,
    user_id: number,
    title: string,
    start_datetime: string,
    all_day: boolean
  } 