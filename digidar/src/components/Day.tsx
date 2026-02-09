import { DateTime, Info, Interval } from "luxon";
import { useState } from "react";
import "../styles/day.css";
import LeftArrow from "../assets/leftArrow.svg?react";
import RightArrow from "../assets/rightArrow.svg?react";

interface DayViewProps {
  selectedDate: DateTime;
}

const DayView = ({ selectedDate }: DayViewProps) => {
  const amHours = Array.from({ length: 12 }, (_, i) => i);
  const pmHours = Array.from({ length: 12 }, (_, i) => i + 12);

  const renderHourBlock = (hour: number) => {
    const time = selectedDate.set({ hour, minute: 0 });
    return (
      <div key={hour} className="hour-slot">
        <span className="time-label">{time.toFormat("h a")}</span>
        <div className="event-area">
          {/* Events will eventually go here */}
        </div>
      </div>
    );
  };

  return (
    <div className="day-view-container">
      <div className="day-columns">
        <div className="column am-column">
            <div className="hour-list">
                {amHours.map(renderHourBlock)}
            </div>
        </div>
        <div className="column pm-column">
            <div className="hour-list">
                {pmHours.map(renderHourBlock)}
            </div>
        </div>
      </div>
    </div>
  );
};
export default DayView;