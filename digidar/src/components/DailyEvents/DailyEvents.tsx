import { useContext } from "react";
import "../../styles/DailyEvents.css";
import { eventsContext } from "../../utils/Context";

function DailyEvents() {
  const selectedEvents = useContext(eventsContext) ?? [];

  if (selectedEvents.length === 0) {
    return <div className="main-container">No events selected.</div>;
  }

  return (
    <div className="main-container">
      {selectedEvents.map((event) => (
        <div key={event.id} className="daily-event-container">
          <div
            className="user-color"
            style={{
              backgroundColor: event.color,
              borderLeft: `1px solid ${event.color}`,
            }}
          ></div>
          <div className="divider"></div>
          <p>{event.title}</p>
        </div>
      ))}
    </div>
  );
}

export default DailyEvents;
