"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type UnitSystem = "metric" | "imperial";

type Location = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
};
// Based on Open-Meteo API
interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

interface HourlyData {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  relativehumidity_2m: number[];
  precipitation: number[];
  windspeed_10m: number[];
  weathercode: number[];
}

interface DailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

interface WeatherData {
  current_weather: CurrentWeather;
  hourly: HourlyData;
  daily: DailyData;
  timezone: string;
}

type CurrentMetrics = {
  feelsLike: number;
  humidity: number;
  windspeed: number;
  precipitation: number;
  temperature: number;
};

type WeatherContextType = {
  unit: UnitSystem;
  toggleUnit: () => void;
  formatTemp: (celsius: number) => string;
  formatWind: (kmh: number) => string;
  formatPrecip: (mm: number) => string;

  location: Location | null;
  setLocation: (loc: Location) => void;

  weatherData: WeatherData | null;
  currentMetrics: CurrentMetrics | null;

  isLoading: boolean;
  error: string | null;

  fetchWeather: (lat: number, lon: number) => Promise<void>;
};

const WeatherContext = createContext<WeatherContextType | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleUnit = () =>
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));

  // formatters
  const formatTemp = (celsius: number) =>
    unit === "metric"
      ? `${Math.round(celsius)}°C`
      : `${Math.round((celsius * 9) / 5 + 32)}°F`;

  const formatWind = (kmh: number) =>
    unit === "metric"
      ? `${Math.round(kmh)} km/h`
      : `${Math.round(kmh / 1.609)} mph`;

  const formatPrecip = (mm: number) =>
    unit === "metric" ? `${mm.toFixed(1)} mm` : `${(mm / 25.4).toFixed(2)} in`;

  // fetch weather data
  const fetchWeather = async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,precipitation,windspeed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );

      if (!res.ok) throw new Error("Failed to fetch weather data");
      const data = await res.json();

      setWeatherData(data);

      // build metrics using nearest hour index
      if (data?.current_weather && data?.hourly) {
        const currentTime = data.current_weather.time;
        const idx = data.hourly.time.findIndex(
          (t: string) => t === currentTime
        );

        const feelsLike =
          data.hourly.apparent_temperature?.[idx] ??
          data.current_weather.temperature;
        const humidity = data.hourly.relativehumidity_2m?.[idx] ?? 0;
        const precipitation = data.hourly.precipitation?.[idx] ?? 0;
        const windspeed = data.current_weather.windspeed ?? 0;
        const temperature = data.current_weather.temperature;

        setCurrentMetrics({
          feelsLike,
          humidity,
          precipitation,
          windspeed,
          temperature,
        });
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setWeatherData(null);
      setCurrentMetrics(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ default Berlin, Germany on mount
  useEffect(() => {
    const defaultLoc: Location = {
      name: "Berlin",
      country: "Germany",
      latitude: 52.52,
      longitude: 13.41,
    };
    setLocation(defaultLoc);
    fetchWeather(defaultLoc.latitude, defaultLoc.longitude);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        unit,
        toggleUnit,
        formatTemp,
        formatWind,
        formatPrecip,
        location,
        setLocation,
        weatherData,
        currentMetrics,
        isLoading,
        error,
        fetchWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used inside WeatherProvider");
  return ctx;
}
