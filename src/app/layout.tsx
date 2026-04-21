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
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey Realty Group | Real Estate in Tallapoosa, GA",
    description:
      "Your trusted real estate partner in Tallapoosa, GA and West Georgia.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
