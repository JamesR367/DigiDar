import { useState } from "react";
import { DateTime } from "luxon";
import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/WeatherGlobeWidget";
import Calendar from "./Calendar";
import NewsSummary from "./widgets/NewsSummary";
import DayView from "./Day";

function App() {
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(DateTime.local());

  if (view == "day") {
    return <DayView selectedDate={selectedDate} setView={setView} />;
  } else {
    return (
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
    );
  }
}

export default App;
