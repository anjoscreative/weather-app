"use client";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useWeather } from "@/context/WeatherContext";
import Image from "next/image";

type SearchBarProps = {
  setNoResults: (value: boolean) => void;
};

type Location = {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export default function SearchBar({ setNoResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Location[]>([]);

  // from WeatherContext
  const { setLocation, fetchWeather } = useWeather();

  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    setShowDropdown(true);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=5`
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setNoResults(false);
      } else {
        setResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setResults([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (loc: Location) => {
    setQuery(`${loc.name}, ${loc.country}`);
    setShowDropdown(false);

    // update context
    setLocation({
      name: loc.name,
      country: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });

    // fetch weather for this location
    fetchWeather(loc.latitude, loc.longitude);
  };

  return (
    <>
      <h1 className="text-4xl font-extrabold text-center leading-tight mb-6 text-foreground">
        How’s the <br className="lg:hidden md:hidden" /> sky <br className="hidden" /> looking <br className="md:hidden" /> today?
      </h1>

      <div className="px-5 md:px-12 md:flex md:flex-row md:items-center md:justify-center md:gap-3 md:ml-2.5">
        <div className="space-y-3 md:space-y-0 md:flex md:w-full md:max-w-3xl mx-auto">
          {/* Search Input + Dropdown */}
          <div className="relative md:w-[75%]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onClick={() => setShowDropdown(true)}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Search for a place..."
              className="w-full md:mt-0 pl-11 pr-4 py-3 rounded-lg bg-[#262540] placeholder:text-[#D4D3D9]
                         focus:outline-none focus:ring-2 focus:ring-[#D4D3D9] focus:border-[#D4D3D9] hover:bg-[#302F4A] focus:bg-[#262540]"
            />

            {showDropdown && (
              <ul className="absolute left-0 mt-2 w-full rounded-lg bg-[#262540] shadow-md z-10 p-2">
                {loading ? (
                  <li className="px-4 py-2 flex items-center gap-2 text-muted-foreground">
                    <Image
                      src="/assets/icon-loading.svg"
                      alt="Loading..."
                      width={20}
                      height={20}
                      className="animate-spin"
                    />
                    <span>Searching...</span>
                  </li>
                ) : results.length > 0 ? (
                  results.map((loc) => (
                    <li
                      key={loc.id}
                      onMouseDown={() => handleSelect(loc)}
                      className="px-4 py-2 cursor-pointer hover:bg-[#302F4A] hover:text-white rounded-md transition"
                    >
                      {loc.name}, {loc.country}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-muted-foreground">
                    No results found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-[15%] py-3 rounded-lg font-medium bg-[#4658D9] text-accent-foreground shadow-md md:ml-3
                       focus:outline-none focus:bg-[#4658D9] focus:ring-2 focus:ring-[#4658D9] focus:ring-offset-2 focus:ring-offset-background hover:bg-[#2B1B9C] disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </>
  );
}
