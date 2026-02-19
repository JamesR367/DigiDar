import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import "../styles/TopBar.css";

// Define types locally to avoid import issues
interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  location: string;
}

interface WeatherError {
  message: string;
}

// Inline weather fetch function to avoid module loading issues
async function fetchWeatherData(location: string): Promise<WeatherData | WeatherError> {
  try {
    const OWM_KEY = (import.meta.env?.VITE_OPENWEATHER_KEY as string | undefined) || undefined;
    
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
      return { message: `Weather API error: ${response.status} ${response.statusText}` };
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
      message: error instanceof Error ? `Failed to fetch weather: ${error.message}` : "Failed to fetch weather data",
    };
  }
}

interface TopBarProps {
  timeFormat?: "12h" | "24h";
  location?: string;
}

export default function TopBar({
  timeFormat = "12h",
  location = "Indianapolis, Indiana",
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(DateTime.local());
  const [weather, setWeather] = useState<WeatherData | WeatherError | null>(
    null,
  );
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(DateTime.local());
    };

    updateTime(); // Set initial time immediately
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch weather data on mount and every 15 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        const result = await fetchWeatherData(location);
        setWeather(result);
      } catch (error) {
        setWeather({
          message: error instanceof Error ? error.message : "Failed to fetch weather",
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather(); // Fetch immediately on mount

    // Refresh weather every 15 minutes (900,000 ms)
    const weatherInterval = setInterval(fetchWeather, 900_000);

    return () => clearInterval(weatherInterval);
  }, [location]);

  // Format time based on timeFormat prop
  const formattedTime =
    timeFormat === "12h"
      ? currentTime.toFormat("hh:mm a")
      : currentTime.toFormat("HH:mm");

  // Format date
  const formattedDate = currentTime.toFormat("cccc, LLLL d");

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="time-display">{formattedTime}</div>
        <div className="date-display">{formattedDate}</div>
      </div>
      <div className="top-bar-center">
        {weatherLoading ? (
          <div className="weather-loading">Loading weather...</div>
        ) : weather && "temperature" in weather ? (
          <div className="weather-info">
            <div className="weather-main">
              <span className="weather-temp">{weather.temperature}°F</span>
              <span className="weather-condition">{weather.condition}</span>
            </div>
            <div className="weather-details">
              <span>{weather.windSpeed} mph</span>
              <span>{weather.humidity}%</span>
            </div>
          </div>
        ) : (
          <div className="weather-error">
            {weather && "message" in weather ? weather.message : "Weather unavailable"}
          </div>
        )}
      </div>
      <div className="top-bar-right">
        <div className="events-placeholder">
          <span>No upcoming events</span>
        </div>
      </div>
    </div>
  );
}
