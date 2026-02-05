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
  const weekdaysStartingSunday = [weekdays[6], ...weekdays.slice(0, 6)];
  const daysOfMonth = Interval.fromDateTimes(
    firstDayOfActiveMonth.startOf("week"),
    firstDayOfActiveMonth.endOf("month").endOf("week"),
  )
    .splitBy({ day: 1 })
    .map((day) => day.start);
  console.log(daysOfMonth);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <p>
          {firstDayOfActiveMonth.monthLong}, {firstDayOfActiveMonth.year}
        </p>
        <p>Current Month</p>
        <div className="calendar-header-arrows">
          <LeftArrow color="white" />
          <RightArrow color="white" />
        </div>
      </div>
      <div className="daysOfTheWeek">
        {weekdaysStartingSunday.map((weekDay, weekDayIndex) => (
          <div key={weekDayIndex}>{weekDay}</div>
        ))}
      </div>
    </div>
  );
};
export default Calendar;
