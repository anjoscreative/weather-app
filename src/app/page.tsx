"use client";
import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import PrimaryCard from "@/components/PrimaryCard";
import MetricGrid from "@/components/MetricGrid";
import DailyForecast from "@/components/DailyForecast";
import HourlyForecast from "@/components/HourlyForecast";
import Image from "next/image";

// Loading placeholders
import PrimaryCardLoading from "../components/loading/PrimaryCardLoading";
import MetricGridLoading from "../components/loading/MetricGridLoading";
import DailyForecastLoading from "../components/loading/DailyForecastLoading";
import HourlyForecastLoading from "../components/loading/HourlyForecastLoading";
import { FiRefreshCw } from "react-icons/fi";
import { useWeather } from "@/context/WeatherContext";
import ChatBot from "@/components/ChatBot";

export default function Page() {
  const [noResults, setNoResults] = useState(false);

  // Consume centralized states from WeatherContext
  const { isLoading, error } = useWeather();

  const noConnection = Boolean(error); // treat any context error as "no connection"

  return (
    <main className="min-h-screen bg-[#02012C] px-5 lg:px-12 lg:max-w-7xl mx-auto overflow-x-hidden">
      {/* Header ALWAYS shows */}
      <Header />
      <div className="mb-12" />

      {noConnection ? (
        // Error UI
        <div className="flex flex-col items-center justify-center text-center mt-28">
          <Image
            src="/assets/icon-error.svg"
            alt="No connection"
            width={160}
            height={160}
            className="mb-6"
          />
          <h2 className="text-4xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mt-2 text-muted-foreground">
            We couldn&apos;t connect to the server (API error). Please try again
            in a few moments.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 rounded-lg bg-card flex items-center gap-2 text-sm hover:bg-gray-700 mt-7"
          >
            <Image
              src="/assets/icon-retry.svg"
              alt="retry"
              height={4}
              width={4}
            />
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Search Section */}
          <SearchBar setNoResults={setNoResults} />

          {noResults ? (
            <div className="flex flex-col items-center justify-center text-center mt-12">
              <h2 className="text-2xl font-semibold text-foreground">
                No matching locations found!
              </h2>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:items-stretch lg:-space-x-3.5 mx-auto">
              {/* Left Column */}
              <div className="flex flex-col h-full">
                {isLoading ? <PrimaryCardLoading /> : <PrimaryCard />}
                {isLoading ? <MetricGridLoading /> : <MetricGrid />}
                {isLoading ? <DailyForecastLoading /> : <DailyForecast />}
              </div>

              {/* Right Column */}
              <div className="flex flex-col h-full">
                {isLoading ? <HourlyForecastLoading /> : <HourlyForecast />}
              </div>
            </div>
          )}
        </>
      )}
      <ChatBot />
    </main>
  );
}
