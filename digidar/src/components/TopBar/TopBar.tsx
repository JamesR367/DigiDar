import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import "./TopBar.css";
import CalendarSettings from "../Settings/Settings.tsx";
import Cog from "../../assets/cog.svg?react";
import type { WeatherData, WeatherError, TopBarProps } from "./topBarUtils.ts";
import { fetchWeatherData, formatTime, formatDate } from "./topBarUtils.ts";

export default function TopBar({
  timeFormat = "12h",
  location = "Indianapolis, Indiana",
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(DateTime.local());
  const [weather, setWeather] = useState<WeatherData | WeatherError | null>(
    null,
  );
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => setCurrentTime(DateTime.local());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true);
        const result = await fetchWeatherData(location);
        setWeather(result);
      } catch (error) {
        setWeather({
          message:
            error instanceof Error ? error.message : "Failed to fetch weather",
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
    const weatherInterval = setInterval(loadWeather, 900_000);
    return () => clearInterval(weatherInterval);
  }, [location]);

  return (
    <div className="top-bar">
      {modalOpen && <CalendarSettings setOpenModal={setModalOpen} />}
      <div className="top-bar-left">
        <div className="time-display">
          {formatTime(currentTime, timeFormat)}
        </div>
        <div className="date-display">{formatDate(currentTime)}</div>
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
            {weather && "message" in weather
              ? weather.message
              : "Weather unavailable"}
          </div>
        )}
      </div>
      <div className="top-bar-right">
        <div className="events-placeholder">
          <span>No upcoming events</span>
        </div>
        <Cog className="settings-button" onClick={() => setModalOpen(true)} />
      </div>
    </div>
  );
}
