import { DateTime, Info, Interval } from "luxon";
import { useState } from "react";
import "../styles/calendar.css";
import LeftArrow from "../assets/leftArrow.svg?react";
import RightArrow from "../assets/rightArrow.svg?react";

const Calendar = () => {
  const today = DateTime.local();
  const [firstDayOfActiveMonth, setFirstDayOfActiveMonth] = useState(
    today.startOf("month"),
  );
  const weekdays = Info.weekdays("short", { locale: "en-US" });
  const daysOfMonth = Interval.fromDateTimes(
    firstDayOfActiveMonth.startOf("week"),
    firstDayOfActiveMonth.endOf("month").endOf("week"),
  )
    .splitBy({ day: 1 })
    .map((day) => day.start)
    .filter((day): day is DateTime => day !== null);
  console.log(daysOfMonth);

  const goToPreviousMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.minus({ months: 1 }));
  };

  const goToNextMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.plus({ months: 1 }));
  };

  const goToToday = () => {
    setFirstDayOfActiveMonth(today.startOf("month"));
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
            <LeftArrow
              color="white"
              onClick={goToPreviousMonth}
              style={{ cursor: "pointer" }}
            />
            <RightArrow
              color="white"
              onClick={goToNextMonth}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </div>
      <div className="daysOfTheWeek">
        {weekdays.map((weekDay, weekDayIndex) => (
          <div key={weekDayIndex}>{weekDay}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysOfMonth.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day.month !== firstDayOfActiveMonth.month ? "other-month" : ""} ${day.hasSame(today, "day") ? "today" : ""}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Calendar;
