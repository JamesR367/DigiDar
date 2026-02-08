import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/weatherGlobe/WeatherGlobeWidget";
import Calendar from "./Calendar";

function App() {
  return (
    <div className="mainContainer">
      <div className="calendar">
        <Calendar />
      </div>
      <div className="weathGlobeWidget">
        <WeatherGlobeWidget />
      </div>
    </div>
  );
}

export default App;
