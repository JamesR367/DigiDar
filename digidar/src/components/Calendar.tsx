import { DateTime, Info, Interval } from "luxon";
import { useState } from "react";
import "../styles/calendar.css";
import LeftArrow from "../assets/leftArrow.svg?react";
import RightArrow from "../assets/rightArrow.svg?react";
import DayView from "./Day";

const Calendar = () => {
  const today = DateTime.local();
  const [firstDayOfActiveMonth, setFirstDayOfActiveMonth] = useState(
    today.startOf("month"),
  );
  
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(today);

  const weekdays = Info.weekdays("short", { locale: "en-US" });
  const daysOfMonth = Interval.fromDateTimes(
    firstDayOfActiveMonth.startOf("week"),
    firstDayOfActiveMonth.endOf("month").endOf("week"),
  )
    .splitBy({ day: 1 })
    .map((day) => day.start)
    .filter((day): day is DateTime => day !== null);

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

  if (view == "day"){
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="back-button" onClick={() => setView("month")}>
            ← Back to Month
          </button>
          <p>{selectedDate.toFormat("cccc, LLLL dd")}</p>
        </div>
        <DayView selectedDate={selectedDate} />
      </div>
    );
  }

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

            onClick={() => handleDayClick(day)}

            className={`calendar-day ${day.month !== firstDayOfActiveMonth.month ? "other-month" : ""} ${day.hasSame(today, "day") ? "today" : ""} ${day.hasSame(selectedDate, "day") ? "selected" : ""}`} style={{cursor: "pointer"}}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Calendar;
