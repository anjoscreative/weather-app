"use client";
import { useWeather } from "@/context/WeatherContext";
import PrimaryCardLoading from "./loading/PrimaryCardLoading";

function mapWeatherCodeToIcon(code: number) {
  if (code === 0) return "/assets/icon-sunny.webp"; // clear
  if (code === 1 || code === 2) return "/assets/icon-partly-cloudy.webp";
  if (code === 3) return "/assets/icon-partly-cloudy.webp"; // overcast
  if (code >= 45 && code <= 48) return "/assets/icon-fog.webp";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "/assets/icon-rain.webp";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return "assets/icon-snow.webp";
  if (code >= 95) return "/assets/icon-storm.webp";
  return "/assets/icon-sunny.webp";
}

export default function PrimaryCard() {
  const { location, weatherData, formatTemp, isLoading } = useWeather();

  if (isLoading || !weatherData || !location) {
    return <PrimaryCardLoading />;
  }

  const current = weatherData.current_weather;
  const city = `${location.name}${
    location.country ? `, ${location.country}` : ""
  }`;

  const date = new Date(current.time).toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const temp = formatTemp(current.temperature);
  const iconSrc = mapWeatherCodeToIcon(current.weathercode ?? 0);

  return (
    <div className="px-5 mt-6 w-full">
      <div
        className="rounded-2xl overflow-hidden card-shadow 
                   flex items-center justify-center 
                   bg-cover bg-center 
                   bg-[url('/assets/Mobile-hero.svg')] md:bg-[url('/assets/Desktop-hero.svg')]"
        style={{ minHeight: "250px", maxHeight: "250px" }}
      >
        <div className="flex flex-col items-center justify-between w-full h-full px-5 py-8 md:flex-row md:px-10 md:py-12">
          {/* Left: City + Date */}
          <div className="text-center md:text-left max-w-[60%] truncate">
            <div className="font-semibold text-lg text-primary-foreground truncate">
              {city}
            </div>
            <div className="text-sm text-white mt-1">{date}</div>
          </div>

          {/* Right: Icon + Temp */}
          <div className="flex items-center gap-7">
            <img src={iconSrc} alt="Weather Icon" className="w-12 h-12" />
            <div className="text-4xl font-extrabold text-primary-foreground">
              {temp}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
