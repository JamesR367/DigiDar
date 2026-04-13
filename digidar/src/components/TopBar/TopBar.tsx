import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import "./TopBar.css";
import CalendarSettings from "../Settings/Settings.tsx";
import Cog from "../../assets/cog.svg?react";
import type { CalendarEvent } from "../../utils/Context";
import type {
  WeatherData,
  WeatherError,
  TopBarProps,
  EventsError,
} from "./topBarUtils.ts";
import {
  fetchWeatherData,
  formatTime,
  formatDate,
  fetchAllEvents,
  getNextUpcomingEvents,
  formatUpcomingEventWhen,
} from "./topBarUtils.ts";

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
  const [events, setEvents] = useState<CalendarEvent[] | EventsError | null>(
    null,
  );
  const [eventsLoading, setEventsLoading] = useState(true);

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

  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      const result = await fetchAllEvents();
      setEvents(result);
      setEventsLoading(false);
    };

    loadEvents();
    const eventsInterval = setInterval(loadEvents, 300_000);
    return () => clearInterval(eventsInterval);
  }, []);

  const upcoming =
    events && Array.isArray(events)
      ? getNextUpcomingEvents(events, DateTime.local(), 3)
      : [];

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
        <div className="events-widget">
          {eventsLoading ? (
            <div className="events-loading">Loading events...</div>
          ) : events && !Array.isArray(events) ? (
            <div className="events-error">{events.message}</div>
          ) : upcoming.length === 0 ? (
            <div className="events-empty">No upcoming events</div>
          ) : (
            <div className="events-list" aria-label="Upcoming events">
              {upcoming.map((event) => (
                <div key={event.id} className="events-item">
                  <div
                    className="events-color"
                    style={{ backgroundColor: event.color }}
                    aria-hidden="true"
                  />
                  <div className="events-text">
                    <div className="events-title" title={event.title}>
                      {event.title}
                    </div>
                    <div className="events-when">
                      {event.all_day
                        ? "All day"
                        : formatUpcomingEventWhen(event.start_datetime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Cog className="settings-button" onClick={() => setModalOpen(true)} />
      </div>
    </div>
  );
}
