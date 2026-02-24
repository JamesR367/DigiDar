import { useState } from "react";
import { DateTime } from "luxon";
import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/weatherGlobe/WeatherGlobeWidget";
import Calendar from "./Calendar";
import NewsSummary from "./widgets/NewsSummary";
import DayView from "./Day";
import TopBar from "./TopBar";
import DailyEvents from "./widgets/DailyEvents";

function App() {
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(DateTime.local());

  if (view == "day") {
    return (
      <div className="app-container">
        <TopBar />
        <div className="mainContainer">
          <DayView selectedDate={selectedDate} setView={setView} />
          <DailyEvents />
        </div>
      </div>
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
