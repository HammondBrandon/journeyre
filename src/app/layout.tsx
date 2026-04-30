import type { Metadata } from "next";
import { Raleway, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.journeyrealtygroup.net"),
  title: {
    default: "Journey Realty Group | Real Estate in Tallapoosa, GA",
    template: "%s | Journey Realty Group",
  },
  description:
    "Journey Realty Group is your trusted real estate partner in Tallapoosa, GA and the surrounding West Georgia area. Buy, sell, or find your next home with our experienced team of REALTORS®.",
  keywords: [
    "real estate",
    "Tallapoosa GA",
    "West Georgia homes",
    "buy a home",
    "sell a home",
    "REALTOR",
    "Journey Realty Group",
    "Haralson County real estate",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Journey Realty Group",
    title: "Journey Realty Group | Real Estate in Tallapoosa, GA",
    description:
      "Your trusted real estate partner in Tallapoosa, GA and West Georgia. Expert REALTORS® helping buyers and sellers every step of the way.",
    images: [
      {
        url: "/journey-realty-group-logo-transparent.webp",
        width: 1200,
        height: 630,
        alt: "Journey Realty Group — Real Estate in Tallapoosa, GA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey Realty Group | Real Estate in Tallapoosa, GA",
    description:
      "Your trusted real estate partner in Tallapoosa, GA and West Georgia.",
    images: ["/journey-realty-group-logo-transparent.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Journey Realty Group",
  url: "https://www.journeyrealtygroup.net",
  logo: "https://www.journeyrealtygroup.net/journey-realty-group-logo-transparent.webp",
  image: "https://www.journeyrealtygroup.net/journey-realty-group-logo-transparent.webp",
  telephone: "(770) 855-7995",
  email: "info@journeyrealtygroup.net",
  address: {
    "@type": "PostalAddress",
    streetAddress: "102 Head Ave.",
    addressLocality: "Tallapoosa",
    addressRegion: "GA",
    postalCode: "30176",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.7379,
    longitude: -85.2866,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  areaServed: [
    "Tallapoosa, GA",
    "Bremen, GA",
    "Cedartown, GA",
    "Carrollton, GA",
    "Haralson County, GA",
    "Carroll County, GA",
    "Polk County, GA",
    "West Georgia",
  ],
  priceRange: "$$",
  sameAs: [
    "https://www.facebook.com/journeyrealtygroup/",
    "https://share.google/d0LYy3VbAlwnhegQb",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "3",
    bestRating: "5",
    worstRating: "1",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Savannah Overton" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "HIGHLY recommend Journey Realty for selling and/or buying a home! Renae is hands down the best of the best! She worked so hard for us, communicated very well and timely (even during vacation), and fought for us to make sure we could get the best deal possible. She sold my parents their home and now ours. She's a true blessing! If buying a home can be made easy, she's the one to do it!",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "John Daniel" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Journey Realty is a win win when it comes to home buying and selling. A Journey takes preparation and planning, but it should not be stressful. You should embrace it and enjoy each part of it. That's exactly what you get with Journey Realty. They will go above and beyond to make sure the home buying/selling process is enjoyable and their satisfaction comes from your happiness. I speak from experience, as Renae has assisted me with the purchase and sell of a couple of homes and the process was flawless. Trust the process, trust the people and embrace the Journey with Journey Realty!",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Belinda Patrick" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Journey Realty is top notch! They truly care about their clients and work tirelessly to help you find the perfect home for you or find the right buyer for yours!! I wouldn't use anyone else!",
    },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Journey Realty Group",
  url: "https://www.journeyrealtygroup.net",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.journeyrealtygroup.net/properties?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink-secondary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
