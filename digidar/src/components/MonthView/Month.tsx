import { DateTime } from "luxon";
import { useState, useEffect } from "react";
import "./month.css";
import LeftArrow from "../../assets/leftArrow.svg?react";
import RightArrow from "../../assets/rightArrow.svg?react";
import type { CalendarProps } from "./monthUtils";
import { getDaysOfMonth, getWeekdays, fetchEventsForMonth } from "./monthUtils";
import type { CalendarEvent } from "../../utils/Context";

function Calendar({ setSelectedDate, setView }: CalendarProps) {
  const today = DateTime.local();
  const [firstDayOfActiveMonth, setFirstDayOfActiveMonth] = useState(today.startOf("month"));
  const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>({});

  useEffect(() => {
    fetchEventsForMonth(firstDayOfActiveMonth).then(setEventsByDate);
  }, [firstDayOfActiveMonth]);

  const weekdays = getWeekdays();
  const daysOfMonth = getDaysOfMonth(firstDayOfActiveMonth);

  const goToPreviousMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.minus({ months: 1 }));
  };

  const goToNextMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.plus({ months: 1 }));
  };

  const goToToday = () => {
    setFirstDayOfActiveMonth(today.startOf("month"));
  };

  const handleDayClick = (day: DateTime) => {
    setSelectedDate(day);
    setView("day");
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <p>
          {firstDayOfActiveMonth.monthLong}, {firstDayOfActiveMonth.year}
        </p>
        <div className="calendar-controls">
          <button onClick={goToToday}>Today</button>
          <div className="calendar-header-arrows">
            <LeftArrow onClick={goToPreviousMonth} />
            <RightArrow onClick={goToNextMonth} />
          </div>
        </div>
      </div>
      <div className="daysOfTheWeek">
        {weekdays.map((weekDay, weekDayIndex) => (
          <div key={weekDayIndex}>{weekDay}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysOfMonth.map((day, index) => {
          const dateKey = day.toISODate()!;
          const dayEvents = eventsByDate[dateKey]?.slice(0, 2) ?? [];

          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`calendar-day ${day.month !== firstDayOfActiveMonth.month ? "other-month" : ""} ${day.hasSame(today, "day") ? "today" : ""}`}
              style={{ cursor: "pointer" }}
            >
              <span className="calendar-day-number">{day.day}</span>
              <div className="calendar-day-events">
                {dayEvents.map((event, i) => (
                  <div key={i} className="month-calendar-event" style={{ borderLeftColor: event.color }}>
                    <span className="calendar-event-title">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
