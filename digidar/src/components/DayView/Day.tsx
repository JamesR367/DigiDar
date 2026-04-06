import { useState, useContext, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import "./day.css";
import Cancel from "../../assets/cancel.svg?react";
import EventModal from "../EventModal/EventModal";
import { dateContext } from "../../utils/Context";
import type { CalendarEvent } from "../../utils/Context";

type DayViewProps = {
  setView: Dispatch<SetStateAction<"month" | "day">>;
  setSelectedEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
};

interface PositionedEvent {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
}

function layoutEvents(events: CalendarEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.start_datetime).getTime() -
      new Date(b.start_datetime).getTime(),
  );

  const positioned: PositionedEvent[] = sorted.map((e) => ({
    event: e,
    column: 0,
    totalColumns: 1,
  }));

  const visited = new Set<number>();

  for (let i = 0; i < positioned.length; i++) {
    if (visited.has(i)) continue;

    const cluster: number[] = [i];
    visited.add(i);

    for (let j = i + 1; j < positioned.length; j++) {
      const aEnd = new Date(positioned[i].event.end_datetime).getTime();
      const bStart = new Date(positioned[j].event.start_datetime).getTime();
      if (bStart < aEnd) {
        cluster.push(j);
        visited.add(j);
      }
    }

    const colEndTimes: number[] = [];

    for (const idx of cluster) {
      const startTime = new Date(
        positioned[idx].event.start_datetime,
      ).getTime();
      let col = colEndTimes.findIndex((endTime) => endTime <= startTime);

      if (col === -1) {
        col = colEndTimes.length;
        colEndTimes.push(0);
      }

      colEndTimes[col] = new Date(positioned[idx].event.end_datetime).getTime();
      positioned[idx].column = col;
    }

    for (const idx of cluster) {
      positioned[idx].totalColumns = colEndTimes.length;
    }
  }

  return positioned;
}

function DayView({ setView, setSelectedEvents }: DayViewProps) {
  const selectedDate = useContext(dateContext)!;
  const amHours = Array.from({ length: 12 }, (_, i) => i);
  const pmHours = Array.from({ length: 12 }, (_, i) => i + 12);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventList, setEventList] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:8001/events/");
        if (!response.ok)
          throw new Error(`HTTP error: Status ${response.status}`);

        const allEvents: CalendarEvent[] = await response.json();
        const todaysEvents = allEvents.filter(
          (event) =>
            event.start_datetime.toString().split("T")[0] ===
            selectedDate.toISODate(),
        );
        setEventList(todaysEvents);
        setSelectedEvents(todaysEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();
  });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const renderHalfDay = (hours: number[]) => {
    const firstHour = hours[0];
    const lastHour = hours[hours.length - 1] + 1;
    const totalMinutes = (lastHour - firstHour) * 60;

    const visibleEvents = eventList.filter((event) => {
      const startHour = new Date(event.start_datetime).getHours();
      const endHour = new Date(event.end_datetime).getHours();
      const endMinute = new Date(event.end_datetime).getMinutes();
      return (
        startHour < lastHour &&
        (endHour > firstHour || (endHour === firstHour && endMinute > 0))
      );
    });

    const positioned = layoutEvents(visibleEvents);

    const LEFT_OFFSET_PCT = 0.75;
    const TOTAL_WIDTH_PCT = 98;
    const TIME_LABEL_WIDTH_PCT = 11;
    const INSET_PCT = 0.4;
    const usableWidth = TOTAL_WIDTH_PCT - TIME_LABEL_WIDTH_PCT;

    return (
      <div className="half-day-wrapper">
        <div className="hour-list">
          {hours.map((hour) => {
            const label = selectedDate.set({ hour, minute: 0 });
            return (
              <div key={hour} className="hour-slot">
                <span className="time-label">{label.toFormat("h a")}</span>
                <div
                  className={`event-area ${hour % 2 === 0 ? "even-hour" : "odd-hour"}`}
                />
              </div>
            );
          })}
        </div>

        <div className="event-layer">
          {positioned.map(({ event, column, totalColumns }) => {
            const start = new Date(event.start_datetime);
            const end = new Date(event.end_datetime);

            const startMinutes =
              (start.getHours() - firstHour) * 60 + start.getMinutes();
            const endMinutes =
              (end.getHours() - firstHour) * 60 + end.getMinutes();
            const clampedStart = Math.max(0, startMinutes);
            const clampedEnd = Math.min(totalMinutes, endMinutes);

            const topPct = (clampedStart / totalMinutes) * 100;
            const heightPct =
              ((clampedEnd - clampedStart) / totalMinutes) * 100;

            const colWidth = usableWidth / totalColumns;
            const leftPct =
              LEFT_OFFSET_PCT + TIME_LABEL_WIDTH_PCT + column * colWidth;

            return (
              <div
                key={event.id}
                className="calendar-event"
                style={{
                  top: `calc(${topPct}% + 1px)`,
                  height: `calc(${heightPct}% - 2px)`,
                  left: `${leftPct + INSET_PCT}%`,
                  width: `${colWidth - INSET_PCT * 2 - 0.3}%`,
                  borderLeftColor: event.color,
                }}
              >
                <span className="calendar-event-title">{event.title}</span>
                <span className="calendar-event-time">
                  {event.all_day
                    ? "All day"
                    : `${formatTime(start)} – ${formatTime(end)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {modalOpen && <EventModal setOpenModal={setModalOpen} />}
      <div className="day-view-container">
        <div className="day-header">
          <h3>{`${selectedDate.weekdayLong}, ${selectedDate.monthLong} ${selectedDate.day}, ${selectedDate.year}`}</h3>
          <div className="day-header-right-side">
            <button className="event-button" onClick={() => setModalOpen(true)}>
              Add Event
            </button>
            <Cancel className="back-button" onClick={() => setView("month")} />
          </div>
        </div>
        <div className="day-columns">
          <div className="column">{renderHalfDay(amHours)}</div>
          <div className="column">{renderHalfDay(pmHours)}</div>
        </div>
      </div>
    </div>
  );
}

export default DayView;
