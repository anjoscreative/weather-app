"use client";
import Image from "next/image";

export default function PrimaryCardLoading() {
  return (
    <div className="px-5 mt-6 lg:w-full">
      <div
        className="rounded-2xl overflow-hidden card-shadow flex items-center justify-center 
                   bg-cover bg-center"
        style={{
          minHeight: "250px", // keeps card height consistent
          background: "linear-gradient(180deg, var(--primary) 0%, #4558D9 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Custom loader image */}
          <Image
            src="/assets/Icon-loading.svg" // 👈 replace with your loader image path
            alt="Loading..."
            width={40}
            height={40}
            className="animate-spin"
          />
          <span className="text-white font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}
