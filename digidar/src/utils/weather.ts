export interface WeatherData {
  temperature: number; // in Fahrenheit
  condition: string; // e.g., "Sunny", "Cloudy", "Rain"
  windSpeed: number; // in mph
  humidity: number; // percentage
  location: string; // city name
}

export interface WeatherError {
  message: string;
}

/**
 * Fetches current weather data from OpenWeatherMap API
 * @param location - City name (e.g., "Indianapolis, Indiana") or coordinates
 * @returns Promise with weather data or error
 */
export async function fetchCurrentWeather(
  location: string,
): Promise<WeatherData | WeatherError> {
  const OWM_KEY = import.meta.env.VITE_OPENWEATHER_KEY as string | undefined;

  if (!OWM_KEY) {
    return {
      message: "OpenWeatherMap API key not configured",
    };
  }

  try {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${encodeURIComponent(OWM_KEY)}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          message: `Location "${location}" not found`,
        };
      }
      return {
        message: `Weather API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      windSpeed: Math.round(data.wind?.speed || 0),
      humidity: data.main.humidity,
      location: `${data.name}, ${data.sys.country}`,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `Failed to fetch weather: ${error.message}`
          : "Failed to fetch weather data",
    };
  }
}

