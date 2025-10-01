"use client";

export default function HourlyForecastLoading() {
  return (
    <div className="p-5 mt-6 pb-8 bg-card m-5 rounded-2xl">
      {/* Title + Day Selector */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-28 bg-muted rounded-md animate-pulse"></div>
        <div className="h-6 w-20 bg-muted rounded-md animate-pulse"></div>
      </div>

      {/* Hourly Rows (skeletons) */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl p-3 flex items-center justify-between card-shadow"
            style={{ backgroundColor: "#5C5C82" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded-full animate-pulse"></div>
              <div className="h-4 w-12 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="h-4 w-8 bg-muted rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
