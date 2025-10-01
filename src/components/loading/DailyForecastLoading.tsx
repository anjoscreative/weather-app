import React from "react";

const DailyForecastLoading = () => {
  return (
    <div className="px-5 mt-6 lg:mt-11 animate-pulse">
      <h3 className="text-base font-semibold mb-3 text-foreground">
        Daily forecast
      </h3>

      <div className="grid grid-cols-3 gap-3 pb-2 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div
            key={idx}
            className="min-w-[5rem] rounded-xl bg-card p-3 text-center card-shadow space-y-8"
          >
            {/* Day label */}
            <div className="h-4 w-10 mx-auto rounded bg-muted"></div>

            {/* Icon */}
            <div className="w-8 h-8 mx-auto my-1 -mt-1 rounded-full bg-muted"></div>

            {/* Hi / Lo temps */}
            <div className="flex flex-row space-x-5 lg:space-x-5 md:space-x-0.5 mt-3 justify-center">
              <div className="h-3 w-6 rounded bg-muted"></div>
              <div className="h-3 w-6 rounded bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecastLoading;
