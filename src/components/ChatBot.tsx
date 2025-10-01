"use client";

import { useEffect, useRef, useState } from "react";
import { useWeather } from "@/context/WeatherContext"; // optional: used as fallback "my location"
import { FaRobot } from "react-icons/fa";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
};

let nextId = 1;

export default function ChatBot() {
  const { location: appLocation } = useWeather(); // optional fallback if user says "here" / "my location"
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId++,
      sender: "bot",
      text: "Hi — I'm WeatherBot. Ask me about the weather (e.g. “Will it rain tomorrow in Lagos?”).",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [loadingReply, setLoadingReply] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // auto-scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  // UTIL: add message
  const pushMessage = (sender: Message["sender"], text: string) => {
    setMessages((m) => [
      ...m,
      { id: nextId++, sender, text, time: new Date().toLocaleTimeString() },
    ]);
  };

  // Handle user send
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    pushMessage("user", trimmed);
    setInput("");
    await generateBotReply(trimmed);
  };

  // Basic intent parsing and weather fetch
  async function generateBotReply(userText: string) {
    setLoadingReply(true);

    // show a short typing indicator
    pushMessage("bot", "Thinking...");

    try {
      // quick intent detection:
      const text = userText.toLowerCase();

      // try to extract location with "in <place>" pattern
      const inMatch = text.match(/\bin\s+([a-z\u00C0-\u024F0-9 ,.'-]+)$/i);
      let placeQuery: string | null = inMatch ? inMatch[1].trim() : null;

      // handle phrasing like "in Lagos tomorrow" -> remove trailing intent words
      if (placeQuery) {
        placeQuery = placeQuery.replace(/\b(tomorrow|today|now|tonight)\b/i, "").trim();
      }

      // if user says "here" / "my location" -> use appLocation from context if available
      if (!placeQuery && /\b(here|my location|my area|near me)\b/i.test(text)) {
        if (appLocation?.latitude && appLocation?.longitude) {
          const { latitude, longitude, name, country } = appLocation;
          const pretty = name + (country ? `, ${country}` : "");
          const answer = await fetchWeatherAndAnswer({ latitude, longitude, placeName: pretty }, text);
          replaceLastBotMessage(answer);
          setLoadingReply(false);
          return;
        } else {
          replaceLastBotMessage("I don't know your saved location yet — please tell me a place (e.g. 'in Lagos').");
          setLoadingReply(false);
          return;
        }
      }

      // If no place was parsed, ask for clarification
      if (!placeQuery) {
        // But if user asked about current weather without specifying place, try using appLocation
        if (appLocation?.latitude && appLocation?.longitude) {
          const { latitude, longitude, name, country } = appLocation;
          const pretty = name + (country ? `, ${country}` : "");
          const answer = await fetchWeatherAndAnswer({ latitude, longitude, placeName: pretty }, text);
          replaceLastBotMessage(answer);
          setLoadingReply(false);
          return;
        }

        replaceLastBotMessage(
          "Where should I check the weather? Try: 'Will it rain tomorrow in Lagos?'"
        );
        setLoadingReply(false);
        return;
      }

      // Geocode the placeQuery using Open-Meteo geocoding (free)
      const geo = await geocodePlace(placeQuery);
      if (!geo) {
        replaceLastBotMessage(`I couldn't find "${placeQuery}". Try a different place name.`);
        setLoadingReply(false);
        return;
      }

      const prettyName = `${geo.name}${geo.country ? ", " + geo.country : ""}`;
      const answer = await fetchWeatherAndAnswer({ latitude: geo.latitude, longitude: geo.longitude, placeName: prettyName }, text);
      replaceLastBotMessage(answer);
    } catch (err) {
      console.error(err);
      replaceLastBotMessage("Sorry, something went wrong while I was fetching the weather.");
    } finally {
      setLoadingReply(false);
    }
  }

  // Replace the last bot "Thinking..." message with the real reply
  const replaceLastBotMessage = (reply: string) => {
    setMessages((prev) => {
      const copy = [...prev];
      const lastBotIdx = copy.map((m) => m.sender).lastIndexOf("bot");
      if (lastBotIdx >= 0) {
        copy[lastBotIdx] = {
          ...copy[lastBotIdx],
          text: reply,
          time: new Date().toLocaleTimeString(),
        };
      } else {
        copy.push({
          id: nextId++,
          sender: "bot",
          text: reply,
          time: new Date().toLocaleTimeString(),
        });
      }
      return copy;
    });
  };

  // Geocode helper (Open-Meteo free)
  async function geocodePlace(name: string) {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`
      );
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const r = data.results[0];
        return { latitude: r.latitude, longitude: r.longitude, name: r.name, country: r.country };
      }
      return null;
    } catch (e) {
      console.error("geocode error", e);
      return null;
    }
  }

  // Query Open-Meteo and craft a friendly answer based on intent (rain/temperature/current)
  async function fetchWeatherAndAnswer(
    coords: { latitude: number; longitude: number; placeName: string },
    originalText: string
  ) {
    const { latitude, longitude, placeName } = coords;

    // We will request current weather + daily precipitation + daily temps
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude
      }&current_weather=true&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data) return "Sorry, no data returned from the weather service.";

    // Parse current weather
    const current = data.current_weather;
    const daily = data.daily;

    // Determine intent: rain? tomorrow? temperature? current?
    const text = originalText.toLowerCase();
    const asksRain = /\brain\b/i.test(text);
    const asksTomorrow = /\btomorrow\b/i.test(text);
    // const asksToday = /\btoday\b/i.test(text);
    const asksTemp = /\b(temp|temperature|hot|cold)\b/i.test(text) || /\bhow (hot|cold)\b/i.test(text);
    const asksNow = /\b(now|currently|right now|today)\b/i.test(text) && !asksTomorrow;

    // Build simple responses
    if (asksRain && asksTomorrow) {
      // find tomorrow index in daily.time
      const times: string[] = daily.time || [];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyyMmDd = tomorrow.toISOString().split("T")[0];
      const idx = times.indexOf(yyyyMmDd);
      if (idx >= 0) {
        const precip = daily.precipitation_sum?.[idx] ?? 0;
        if (precip > 0) {
          return `Yes — ${placeName} is expected to have precipitation tomorrow (~${precip} mm). Bring an umbrella 🌧️.`;
        } else {
          return `No — forecast for ${placeName} shows little to no precipitation tomorrow.`;
        }
      } else {
        return `I couldn't find tomorrow's precipitation data for ${placeName}.`;
      }
    }

    if (asksRain && asksNow) {
      // current weather doesn't give precipitation directly, but weathercode can indicate rain
      const code = current?.weathercode ?? null;
      const rainy = isWeatherCodeRain(code);
      return rainy
        ? `It looks like it's raining or rain conditions right now in ${placeName}.`
        : `No rain right now in ${placeName} (weather code ${code}).`;
    }

    if (asksTemp && asksTomorrow) {
      const times: string[] = daily.time || [];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyyMmDd = tomorrow.toISOString().split("T")[0];
      const idx = times.indexOf(yyyyMmDd);
      if (idx >= 0) {
        const tmax = daily.temperature_2m_max?.[idx];
        const tmin = daily.temperature_2m_min?.[idx];
        return `Tomorrow in ${placeName} the temperature is expected between ${Math.round(tmin)}° and ${Math.round(tmax)}°.`;
      }
    }

    // default: give short current summary
    if (current) {
      const code = current.weathercode ?? null;
      const summary = summarizeWeather(code);
      return `Right now in ${placeName}: ${summary} — ${Math.round(current.temperature)}° (${current.windspeed} km/h wind).`;
    }

    return `Sorry, I couldn't build a proper response for ${placeName}.`;
  }

  function isWeatherCodeRain(code: number | null) {
    if (code === null) return false;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code === 95) return true;
    return false;
  }

  function summarizeWeather(code: number | null) {
    if (code === null) return "clear skies";
    if (code === 0) return "clear skies";
    if (code === 1 || code === 2) return "partly cloudy";
    if (code === 3) return "overcast";
    if (code >= 45 && code <= 48) return "foggy";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snowy";
    if (code >= 95) return "stormy";
    return "clear skies";
  }

  // small helpers to handle Enter key
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <div className="fixed bottom-6 lg:right-16 md:right-14 right-6 z-50">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4658D9] text-white shadow-lg"
          >
            <FaRobot />
            <span className="hidden sm:inline">Ask WeatherBot</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-[#1F2333] rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-[#2A2F45] flex items-center justify-between">
              <div className="flex items-center gap-2">
               <FaRobot />
                <strong className="text-white">WeatherBot</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm px-2 py-1 rounded bg-[#3C3B5E] text-white"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="max-h-72 overflow-y-auto p-3 space-y-3 bg-[#12121A] custom-scrollbar"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-md ${
                      m.sender === "user" ? "bg-[#4658D9] text-white" : "bg-[#2B2F42] text-white/90"
                    }`}
                  >
                    <div className="text-sm">{m.text}</div>
                    <div className="text-xs text-white/40 mt-1 text-right">{m.time}</div>
                  </div>
                </div>
              ))}
              {loadingReply && (
                <div className="text-sm text-white/60">typing…</div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-[#12121A] border-t border-t-[#2A2F45]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about the weather (e.g. 'Will it rain tomorrow in Lagos?')"
                  className="flex-1 px-3 py-2 rounded bg-[#1A1C26] text-white placeholder:text-white/40 outline-none"
                />
                <button
                  onClick={handleSend}
                  className="px-3 py-2 rounded bg-[#4658D9] text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
