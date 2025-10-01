"use client";
import { useWeather } from "@/context/WeatherContext";
import DailyForecastLoading from "./loading/DailyForecastLoading";
import Image from "next/image";

type DayCardProps = {
  day: string;
  hiC: number;
  loC: number;
  icon: string;
};

type DayData = {
  day: string;
  hi: number;
  lo: number;
  icon: string;
  date: Date;
};

function mapWeatherCodeToIcon(code?: number | null): string {
  const safeCode = code ?? -1; // if null/undefined, fall back to -1

  if (safeCode === 0) return "/assets/icon-sunny.webp"; // clear
  if (safeCode === 1 || safeCode === 2) return "/assets/icon-partly-cloudy.webp";
  if (safeCode === 3) return "/assets/icon-partly-cloudy.webp"; // overcast
  if (safeCode >= 45 && safeCode <= 48) return "/assets/icon-fog.webp";
  if ((safeCode >= 51 && safeCode <= 67) || (safeCode >= 80 && safeCode <= 82))
    return "/assets/icon-rain.webp";
  if ((safeCode >= 71 && safeCode <= 77) || (safeCode >= 85 && safeCode <= 86))
    return "/assets/icon-snow.webp";
  if (safeCode >= 95) return "/assets/icon-storm.webp";
  return "/assets/icon-sunny.webp"; // default
}

function DayCard({ day, hiC, loC, icon }: DayCardProps) {
  const { formatTemp } = useWeather();

  return (
    <div className="min-w-[5rem] rounded-xl  bg-[#262540] p-3 text-center card-shadow space-y-8 border border-[#3C3B5E]">
      <div className="text-sm font-medium text-foreground">{day}</div>
      <div>
        <Image src={icon} alt={day} width={8} height={8} className="w-8 h-8 mx-auto my-1 -mt-1" />
      </div>
      <div className="flex flex-row space-x-5 mt-3 justify-center">
        <div className="text-xs text-white">{formatTemp(hiC)}</div>
        <div className="text-xs text-[#D4D3D9]">{formatTemp(loC)}</div>
      </div>
    </div>
  );
}

export default function DailyForecast() {
  const { weatherData, isLoading } = useWeather();

  // Always show loading while processing or if daily block missing
  if (isLoading || !weatherData?.daily) {
    return <DailyForecastLoading />;
  }

  // Safe-typed daily extraction
  const daily = weatherData.daily as {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weathercode?: number[];
  };

  const time: string[] = daily.time ?? [];
  const temperature_2m_max: number[] = daily.temperature_2m_max ?? [];
  const temperature_2m_min: number[] = daily.temperature_2m_min ?? [];
  const weathercode: number[] = daily.weathercode ?? [];

  // If no days, show loader (no-null policy)
  if (time.length === 0) return <DailyForecastLoading />;

  // Build typed DayData array safely
  const days: DayData[] = time.map((t: string, idx: number): DayData => {
    const date = new Date(t);
    const day = date.toLocaleDateString(undefined, { weekday: "short" });

    const hi =
      Array.isArray(temperature_2m_max) && temperature_2m_max[idx] !== undefined
        ? temperature_2m_max[idx]
        : weatherData.current_weather?.temperature ?? 0;

    const lo =
      Array.isArray(temperature_2m_min) && temperature_2m_min[idx] !== undefined
        ? temperature_2m_min[idx]
        : weatherData.current_weather?.temperature ?? 0;

    const wc =
      Array.isArray(weathercode) && weathercode[idx] !== undefined
        ? weathercode[idx]
        : weatherData.current_weather?.weathercode ?? undefined;

    const icon = mapWeatherCodeToIcon(wc);

    return {
      day,
      hi,
      lo,
      icon,
      date,
    };
  });

  // Find today's index; fallback to 0 if not found
  const todayIndex: number = days.findIndex(
    (d: DayData) => d.date.toDateString() === new Date().toDateString()
  );
  const start = todayIndex >= 0 ? todayIndex : 0;

  // Rotate array so today (or start) comes first
  const rotated: DayData[] =
    start > 0 ? [...days.slice(start), ...days.slice(0, start)] : days;

  return (
    <div className="px-5 mt-6 lg:mt-11">
      <h3 className="text-base font-semibold mb-3 text-foreground">
        Daily forecast
      </h3>
      <div className="grid grid-cols-3 gap-3 pb-2 md:grid-cols-7">
        {rotated.map((d: DayData, idx: number) => (
          <DayCard key={idx} day={d.day} hiC={d.hi} loC={d.lo} icon={d.icon} />
        ))}
      </div>
    </div>
  );
}
