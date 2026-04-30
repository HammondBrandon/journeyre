import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import AboutSnippet from "@/components/home/AboutSnippet";
import TeamPreview from "@/components/home/TeamPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: { absolute: "Journey Realty Group | Real Estate in Tallapoosa, GA" },
  description:
    "Journey Realty Group is your trusted real estate partner in Tallapoosa, GA. Browse homes for sale, get a free CMA, or connect with our experienced REALTORS® today.",
  openGraph: {
    title: "Journey Realty Group | Real Estate in Tallapoosa, GA",
    description:
      "Your trusted real estate partner in Tallapoosa, GA and West Georgia. Expert REALTORS® helping buyers and sellers every step of the way.",
    url: "https://www.journeyrealtygroup.net",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedListings />
      <AboutSnippet />
      <TeamPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
