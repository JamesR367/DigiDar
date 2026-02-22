import { useState } from "react";
import { DateTime } from "luxon";
import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/WeatherGlobeWidget";
import Calendar from "./Month";
import NewsSummary from "./widgets/NewsSummary";
import DayView from "./Day";
import { dateContext } from "./Context";
import TopBar from "./TopBar";

function App() {
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(DateTime.local());

  if (view === "day") {
    return (
      // This allows the selectedDate state to go through different components without having to prop drill
      <dateContext.Provider value={selectedDate}>
        <div className="app-container">
          <TopBar />
          <div className="mainContainer">
            <DayView setView={setView} />
          </div>
        </div>
      </dateContext.Provider>
    );
  } else {
    return (
      <div className="app-container">
        <TopBar />
        <div className="mainContainer">
          <div className="calendar">
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
