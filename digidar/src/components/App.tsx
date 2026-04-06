import { useState } from "react";
import { DateTime } from "luxon";
import "../styles/App.css";
import WeatherGlobeWidget from "./WeatherGlobe/WeatherGlobeWidget";
import Calendar from "./MonthView/Month";
import NewsSummary from "./NewsSummary/NewsSummary";
import DayView from "./DayView/Day";
import { dateContext, eventsContext } from "../utils/Context";
import type { CalendarEvent } from "../utils/Context";
import TopBar from "./TopBar/TopBar";
import DailyEvents from "./DailyEvents/DailyEvents";

function App() {
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(DateTime.local());
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  if (view === "day") {
    return (
      // This allows the selectedDate state to go through different components without having to prop drill
      <dateContext.Provider value={selectedDate}>
        <div className="app-container">
          <TopBar />
          <div className="mainContainer">
            <div className="large-container">
              <DayView
                setView={setView}
                setSelectedEvents={setSelectedEvents}
              />
              <eventsContext.Provider value={selectedEvents}>
                <DailyEvents />
              </eventsContext.Provider>
            </div>
          </div>
        </div>
      </dateContext.Provider>
    );
  } else {
    return (
      <div className="app-container">
        <TopBar />
        <div className="mainContainer">
          <div className="large-container">
            <Calendar setSelectedDate={setSelectedDate} setView={setView} />
          </div>
          <div className="widgets">
            <WeatherGlobeWidget />
            <NewsSummary />
          </div>
          <div></div>
        </div>
      </div>
    );
  }
}

export default App;
