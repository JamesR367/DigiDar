import { DateTime } from "luxon";

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