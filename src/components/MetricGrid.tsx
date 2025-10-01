"use client";
import { useWeather } from "@/context/WeatherContext";
import MetricGridLoading from "./loading/MetricGridLoading";

type MetricProps = {
  label: string;
  value: string | number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl bg-[#262540] p-4 card-shadow border border-[#3C3B5E]">
      <div className="text-sm text-[#D4D3D9]">{label}</div>
      <div className="text-2xl font-semibold mt-2 text-white">{value}</div>
    </div>
  );
}

export default function MetricGrid() {
  const { formatTemp, formatWind, formatPrecip, weatherData, isLoading } =
    useWeather();

  // ✅ Always show loading if processing OR no data
  if (isLoading || !weatherData?.current_weather) {
    return <MetricGridLoading />;
  }

  const current = weatherData.current_weather;

  // Find the index in hourly arrays that matches current time
  const currentIndex = weatherData.hourly?.time?.indexOf(current.time) ?? -1;

  // Extract values safely
  const feelsLike =
    currentIndex >= 0
      ? weatherData.hourly.apparent_temperature[currentIndex]
      : current.temperature;

  const humidity =
    currentIndex >= 0
      ? weatherData.hourly.relativehumidity_2m[currentIndex]
      : 0;

  const precipitation =
    currentIndex >= 0 ? weatherData.hourly.precipitation[currentIndex] : 0;

  const wind = current.windspeed ?? 0;

  return (
    <div className="px-5 lg:w-full mt-4 lg:mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <Metric label="Feels Like" value={formatTemp(feelsLike)} />
      <Metric label="Humidity" value={`${humidity}%`} />
      <Metric label="Wind" value={formatWind(wind)} />
      <Metric label="Precipitation" value={formatPrecip(precipitation)} />
    </div>
  );
}
