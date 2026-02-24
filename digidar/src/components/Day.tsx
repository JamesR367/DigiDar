import { DateTime } from "luxon";
import "../styles/day.css";
import Cancel from "../assets/cancel.svg?react";

interface DayViewProps {
  selectedDate: DateTime;
  setView: (view: "month" | "day") => void;
}

function DayView({ selectedDate, setView }: DayViewProps) {
  const amHours = Array.from({ length: 12 }, (_, i) => i);
  const pmHours = Array.from({ length: 12 }, (_, i) => i + 12);

  const handleDayClick = () => {
    setView("month");
  };

  const renderHourBlock = (hour: number) => {
    const time = selectedDate.set({ hour, minute: 0 });
    return (
      <div key={hour} className="hour-slot">
        <span className="time-label">{time.toFormat("h a")}</span>
        <div
          className={`event-area ${hour % 2 === 0 ? "even-hour" : "odd-hour"}`}
        >
          {/*"Events will eventually go here"*/}
        </div>
      </div>
    );
  };

  return (
    <div className="day-view-container">
      <div className="day-header">
        <h3>{`${selectedDate.weekdayLong}, ${selectedDate.monthLong} ${selectedDate.day}, ${selectedDate.year}`}</h3>
        <div>
          <Cancel className="back-button" onClick={() => handleDayClick()} />
        </div>
      </div>
      <div className="day-columns">
        <div className="column">
          <div className="hour-list">{amHours.map(renderHourBlock)}</div>
        </div>
        <div className="column">
          <div className="hour-list">{pmHours.map(renderHourBlock)}</div>
        </div>
      </div>
    </div>
  );
}
export default DayView;