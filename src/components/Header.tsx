"use client";
import { useState } from "react";
import { FiSettings } from "react-icons/fi";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWeather } from "@/context/WeatherContext";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { unit, toggleUnit } = useWeather();

  // shared dropdown item style
  const itemClass =
    "cursor-pointer flex justify-between items-center rounded-md text-[#ACACB7] " +
    "data-[highlighted]:bg-[#302F4A] data-[highlighted]:text-white " +
    "data-[state=open]:bg-[#302F4A] data-[state=open]:text-white";

  // helper to render item with optional checkmark
  const renderItem = (label: string, active: boolean) => (
    <DropdownMenuItem
      className={`${itemClass} ${
        active ? "bg-[#302F4A] text-white font-medium" : ""
      }`}
    >
      <span>{label}</span>
      {active && <Check className="text-white w-4 h-4" />}
    </DropdownMenuItem>
  );

  return (
    <header className="px-5 lg:px-12 pt-6 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src="/assets/logo.svg"
          className="w-36 lg:w-auto"
          alt="Logo"
          width={170}
          height={170}
        />
      </div>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-3 py-2 rounded-lg bg-[#262540] flex items-center gap-2 text-sm hover:bg-[#302F4A] ${
              open ? "border border-[#FFFFFF] bg-[#302F4A]" : ""
            }`}
          >
            <FiSettings />
            <span>Units</span>
            <Image
              src="/assets/icon-dropdown.svg"
              alt="Dropdown"
              width={10}
              height={10}
              className={`transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 bg-[#262540] p-1 rounded-lg shadow-md lg:mr-28 mr-14 text-[#FFFFFF] border border-[#3C3B5E]">
          {/* Switcher */}
          <DropdownMenuItem
            onClick={toggleUnit}
            className={`${itemClass} font-medium`}
          >
            {unit === "metric" ? "Switch to Imperial" : "Switch to Metric"}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[#3C3B5E] w-48 mx-auto" />

          {/* Temperature */}
          <DropdownMenuLabel className="text-[#ACACB7]">
            Temperature
          </DropdownMenuLabel>
          {renderItem("Celsius (°C)", unit === "metric")}
          {renderItem("Fahrenheit (°F)", unit === "imperial")}

          <DropdownMenuSeparator className="bg-[#3C3B5E] w-48 mx-auto" />

          {/* Wind Speed */}
          <DropdownMenuLabel className="text-[#ACACB7]">
            Wind Speed
          </DropdownMenuLabel>
          {renderItem("km/h", unit === "metric")}
          {renderItem("mph", unit === "imperial")}

          <DropdownMenuSeparator className="bg-[#3C3B5E] w-48 mx-auto" />

          {/* Precipitation */}
          <DropdownMenuLabel className="text-[#ACACB7]">
            Precipitation
          </DropdownMenuLabel>
          {renderItem("Millimeters (mm)", unit === "metric")}
          {renderItem("Inches (in)", unit === "imperial")}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
