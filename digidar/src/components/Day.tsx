import { useState, useContext, useEffect } from "react";
import "../styles/day.css";
import Cancel from "../assets/cancel.svg?react";
import EventModal from "./widgets/EventModal";
import { dateContext } from "../utils/Context";
import type { Event } from "../utils/Context";

interface DayViewProps {
  setView: (view: "month" | "day") => void;
  setSelectedEvents: Event;
}

function DayView({ setView, setSelectedEvents }: DayViewProps) {
  const selectedDate = useContext(dateContext)!;
  const amHours = Array.from({ length: 12 }, (_, i) => i);
  const pmHours = Array.from({ length: 12 }, (_, i) => i + 12);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventList, setEventList] = useState(Event);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8001/events/");
          if (!response.ok) {
            throw new Error(`HTTP error: Status ${response.status}`);
          }
          const result = await response.json();
          
          setEventList(result.filter(item => item.start_datetime.toString().split("T")[0] == selectedDate.toISODate()));
          setSelectedEvents(result.filter(item => item.start_datetime.toString().split("T")[0] == selectedDate.toISODate()));
        } catch (err) {
          console.error("Failed to fetch users:", err);
        }
      };
      fetchData();
    })    
    console.log(eventList)

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
    <div>
      {modalOpen && <EventModal setOpenModal={setModalOpen} />}
      <div className="day-view-container">
        <div className="day-header">
          <h3>{`${selectedDate.weekdayLong}, ${selectedDate.monthLong} ${selectedDate.day}, ${selectedDate.year}`}</h3>
          <div className="day-header-right-side">
            <button
              className="event-button"
              onClick={() => {
                setModalOpen(true);
              }}
            >
              Add Event
            </button>
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
    </div>
  );
}
export default DayView;
