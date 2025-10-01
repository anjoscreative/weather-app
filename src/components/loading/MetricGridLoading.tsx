"use client";

function MetricLoading() {
  return (
    <div className="rounded-xl bg-card p-4 card-shadow">
      <div className="h-4 w-20 bg-muted rounded-md animate-pulse"></div>
      <div className="h-6 w-14 bg-muted mt-3 rounded-md animate-pulse"></div>
    </div>
  );
}

export default function MetricGridLoading() {
  return (
    <div className="px-5 lg:w-full mt-4 lg:mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <MetricLoading />
      <MetricLoading />
      <MetricLoading />
      <MetricLoading />
    </div>
  );
}
