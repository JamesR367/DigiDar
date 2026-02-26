import { useState } from "react";
import { DateTime } from "luxon";
import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/WeatherGlobeWidget";
import Calendar from "./Month";
import NewsSummary from "./widgets/NewsSummary";
import DayView from "./Day";
import { dateContext } from "../utils/Context";
import TopBar from "./TopBar";
import DailyEvents from "./widgets/DailyEvents";

function App() {
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(DateTime.local());

  if (view === "day") {
    return (
<<<<<<< HEAD
      <div className="app-container">
        <TopBar />
        <div className="mainContainer">
          <DayView selectedDate={selectedDate} setView={setView} />
          <DailyEvents />
=======
      // This allows the selectedDate state to go through different components without having to prop drill
      <dateContext.Provider value={selectedDate}>
        <div className="app-container">
          <TopBar />
          <div className="mainContainer">
            <div className="large-container">
              <DayView setView={setView} />
            </div>
          </div>
>>>>>>> origin/main
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
