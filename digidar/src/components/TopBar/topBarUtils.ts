import { DateTime } from "luxon";
import type { CalendarEvent } from "../../utils/Context";

export interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  location: string;
}

export interface WeatherError {
  message: string;
}

export interface TopBarProps {
  timeFormat?: "12h" | "24h";
  location?: string;
}

export function formatTime(time: DateTime, timeFormat: "12h" | "24h"): string {
  return timeFormat === "12h"
    ? time.toFormat("hh:mm a")
    : time.toFormat("HH:mm");
}

export function formatDate(time: DateTime): string {
  return time.toFormat("cccc, LLLL d");
}

export interface EventsError {
  message: string;
}

export async function fetchWeatherData(
  location: string,
): Promise<WeatherData | WeatherError> {
  try {
    const OWM_KEY =
      (import.meta.env?.VITE_OPENWEATHER_KEY as string | undefined) ||
      undefined;

    if (!OWM_KEY) {
      return { message: "OpenWeatherMap API key not configured" };
    }

    const encodedLocation = encodeURIComponent(location);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${OWM_KEY}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { message: `Location "${location}" not found` };
      }
      return {
        message: `Weather API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      windSpeed: Math.round(data.wind?.speed || 0),
      humidity: data.main.humidity,
      location: `${data.name}, ${data.sys.country}`,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `Failed to fetch weather: ${error.message}`
          : "Failed to fetch weather data",
    };
  }
}

export async function fetchAllEvents(): Promise<CalendarEvent[] | EventsError> {
  try {
    const response = await fetch("http://localhost:8001/events/");
    if (!response.ok) {
      return {
        message: `Events API error: ${response.status} ${response.statusText}`,
      };
    }
    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      return { message: "Events API returned invalid data" };
    }
    return data as CalendarEvent[];
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `Failed to fetch events: ${error.message}`
          : "Failed to fetch events",
    };
  }
}

export function getNextUpcomingEvents(
  events: CalendarEvent[],
  now: DateTime,
  limit = 3,
): CalendarEvent[] {
  const normalized = events
    .map((e) => {
      const start = DateTime.fromISO(e.start_datetime);
      return { event: e, start };
    })
    .filter(({ start }) => start.isValid && start >= now)
    .sort((a, b) => a.start.toMillis() - b.start.toMillis());

  return normalized.slice(0, limit).map(({ event }) => event);
}

export function formatUpcomingEventWhen(startIso: string): string {
  const dt = DateTime.fromISO(startIso);
  if (!dt.isValid) return "";

  const now = DateTime.local();
  if (dt.hasSame(now, "day")) return dt.toFormat("h:mm a");
  return dt.toFormat("LLL d, h:mm a");
}