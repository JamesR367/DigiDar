import { useState } from "react";
import { DateTime } from "luxon";
import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/WeatherGlobeWidget";
import Calendar from "./Calendar";
import NewsSummary from "./widgets/NewsSummary";
import DayView from "./Day";
import { dateContext } from "./Context";

function App() {
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(DateTime.local());

  if (view == "day") {
    return (
      //This allows the selectedDate state to go through different components without having to prop drill
      <dateContext.Provider value={selectedDate}>
        <div className="main-container">
          <div className="large-component">
            <DayView setView={setView} />
          </div>
        </div>
      </dateContext.Provider>
    );
  } else {
    return (
      <div className="main-container">
        <div className="large-component">
          <Calendar setSelectedDate={setSelectedDate} setView={setView} />
        </div>
        <div className="widgets">
          <WeatherGlobeWidget />
          <NewsSummary />
        </div>
        <div></div>
      </div>
    );
  }
}

export default App;
