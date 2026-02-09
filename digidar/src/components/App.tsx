import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/weatherGlobe/WeatherGlobeWidget";
import Calendar from "./Calendar";
import NewsSummary from "./widgets/NewsSummary";

function App() {
  return (
    <div className="mainContainer">
      <div className="calendar">
        <Calendar />
      </div>
      <div className="widgets">
        <WeatherGlobeWidget />
        <NewsSummary />
      </div>
      <div></div>
    </div>
  );
}

export default App;
