"use client";
import { useState } from "react";
import { useWeather } from "@/context/WeatherContext";
import HourlyForecastLoading from "./loading/HourlyForecastLoading";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type HourRowProps = {
  time: string;
  tempC: number;
  icon: string;
};

type HourData = {
  time: string;
  temp: number;
  icon: string;
  date: Date;
};

function mapWeatherCodeToIcon(code: number | null): string {
  if (code === null) return "/assets/icon-sunny.webp";
  if (code === 0) return "/assets/icon-sunny.webp"; // clear
  if (code === 1 || code === 2) return "/assets/icon-partly-cloudy.webp";
  if (code === 3) return "/assets/icon-partly-cloudy.webp";
  if (code >= 45 && code <= 48) return "/assets/icon-fog.webp";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "/assets/icon-rain.webp";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return "/assets/icon-snow.webp";
  if (code >= 95) return "/assets/icon-storm.webp";
  return "/assets/icon-sunny.webp";
}

function HourRow({ time, tempC, icon }: HourRowProps) {
  const { formatTemp } = useWeather();

  return (
    <div className="rounded-xl p-3 flex items-center justify-between border border-[#3C3B5E] bg-[#302F4A]">
      <div className="flex items-center gap-3">
        <img src={icon} alt={time} className="w-6 h-6" />
        <div className="text-sm text-foreground">{time}</div>
      </div>
      <div className="text-sm text-foreground">{formatTemp(tempC)}</div>
    </div>
  );
}

export default function HourlyForecast() {
  const { weatherData, isLoading } = useWeather();

  if (isLoading || !weatherData?.hourly) {
    return <HourlyForecastLoading />;
  }

  const { time, temperature_2m, weathercode } = weatherData.hourly;

  const hours: HourData[] = time.map((t: string, idx: number): HourData => {
    const date = new Date(t);
    const hourLabel = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      hour12: true,
    });
    return {
      time: hourLabel,
      temp: temperature_2m[idx],
      icon: mapWeatherCodeToIcon(weathercode?.[idx] ?? null),
      date,
    };
  });

  const days: string[] = Array.from(
    new Set(
      hours.map((h: HourData) =>
        h.date.toLocaleDateString(undefined, { weekday: "long" })
      )
    )
  );

  const today: string = new Date().toLocaleDateString(undefined, {
    weekday: "long",
  });
  const [selectedDay, setSelectedDay] = useState<string>(today);

  const filtered: HourData[] = hours.filter(
    (h: HourData) =>
      h.date.toLocaleDateString(undefined, { weekday: "long" }) === selectedDay
  );

  let displayHours: HourData[] = filtered;
  if (selectedDay === today) {
    const currentHour = new Date().getHours();
    const idx = filtered.findIndex(
      (h: HourData) => h.date.getHours() === currentHour
    );
    if (idx >= 0) {
      displayHours = [...filtered.slice(idx), ...filtered.slice(0, idx)];
    }
  }

  return (
    <div className="p-5 mt-6 pb-8 bg-[#262540] m-5 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base text-white font-semibold">Hourly forecast</h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="text-sm px-3 py-1 rounded bg-[#3C3B5E] flex items-center gap-1"
              style={{ backgroundColor: "#3F3F63", color: "#ffffff" }}
            >
              {selectedDay} ▾
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-[#262540] p-2 rounded-lg shadow-md lg:mr-24 mr-20 text-white border border-[#3C3B5E]">
            {days.map((day: string) => (
              <DropdownMenuItem
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`cursor-pointer rounded-md px-2 py-1 transition-colors
                  data-[highlighted]:bg-[#3C3B5E] data-[highlighted]:text-white
                  data-[state=open]:bg-[#302F4A] data-[state=open]:text-white
                  ${
                    selectedDay === day
                      ? "bg-[#302F4A] text-white font-medium"
                      : "text-[#ACACB7]"
                  }`}
              >
                <span>{day}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scrollable hourly list with snap */}
      <div
        className=" mt-5 space-y-3 overflow-y-auto pr-2 custom-scrollbar snap-y snap-mandatory"
        style={{ maxHeight: "500px" }} // ~8 rows visible
      >
        {displayHours.map((h: HourData, idx: number) => (
          <HourRow key={idx} time={h.time} tempC={h.temp} icon={h.icon} />
        ))}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #6b7280; /* gray-500 */
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
