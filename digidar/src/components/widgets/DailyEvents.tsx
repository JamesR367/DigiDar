import { useContext } from "react";
import "../../styles/DailyEvents.css";
import { eventsContext } from "../../utils/Context";

function DailyEvents() {
    const selectedEvents = useContext(eventsContext)!;
    return (
        <div className="main-container">
            <div className="daily-event-container">
                <div className="user-color">
                </div>
                <div className="divider">
                </div>
                <p>{selectedEvents.title}</p>
            </div>
        </div>
    )
}


export default DailyEvents;