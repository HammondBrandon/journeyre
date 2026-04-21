"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    router.push(`/properties${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Video background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/VfROvUPseOE?si=c1X2WX6tmaXTU9x7&autoplay=1&mute=1&loop=1&controls=0&playsinline=1&playlist=VfROvUPseOE&modestbranding=1&rel=0"
          title="Hero background video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full pointer-events-none"
        />
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <p className="font-raleway text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-5 opacity-90">
          Tallapoosa, GA &amp; West Georgia
        </p>

        <h1 className="font-raleway font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
          Your Journey <span className="text-primary">Starts</span> Here
        </h1>

        <p className="font-lora text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
          Whether you are buying, selling, or simply exploring — our experienced
          team of REALTORS® is here to guide you every step of the way.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-stretch max-w-2xl mx-auto mb-10 shadow-2xl"
          role="search"
          aria-label="Property search"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, zip code, or address..."
            className="flex-1 px-6 py-4 text-ink font-lora text-sm bg-white focus:outline-none placeholder:text-ink-muted min-w-0"
            aria-label="Search properties"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-7 py-4 bg-primary text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-primary-dark transition-colors shrink-0 cursor-pointer"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/buying"
            className="px-6 py-2.5 bg-white/10 border border-white/25 text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            I&apos;m Buying
          </a>
          <a
            href="/selling"
            className="px-6 py-2.5 bg-white/10 border border-white/25 text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            I&apos;m Selling
          </a>
          <a
            href="/selling#cma"
            className="px-6 py-2.5 bg-primary text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-primary-dark transition-colors"
          >
            Get a Home Valuation
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent mx-auto" />
      </div>
    </section>
  );
}
