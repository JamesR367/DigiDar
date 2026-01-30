import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "../styles/App.css";
import WeatherGlobeWidget from "./widgets/weatherGlobe/WeatherGlobeWidget";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <WeatherGlobeWidget />
    </div>
  );
}

export default App;
