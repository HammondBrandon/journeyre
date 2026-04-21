import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { CheckCircle2 } from "lucide-react";
import teamphoto from "../../../public/images/accessory/journey-realty-group-team-working.jpg";
import Image from "next/image";

const highlights = [
  "Local experts serving West Georgia since day one",
  "Dedicated REALTORS® committed to your goals",
  "Full-service representation for buyers and sellers",
  "Community-rooted, client-focused approach",
];

export default function AboutSnippet() {
  return (
    <section
      className="py-20 md:py-28 bg-white"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual side */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
              {/* Placeholder until office/team photo is provided */}
              <Image
                src={teamphoto}
                alt="Journey Realty Group Team Working At Conference Table"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent block */}
            <div
              className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 -z-10 hidden lg:block"
              aria-hidden="true"
            />
            <div
              className="absolute -top-4 -left-4 w-20 h-20 border-2 border-primary/20 -z-10 hidden lg:block"
              aria-hidden="true"
            />
          </div>

          {/* Content side */}
          <div className="order-1 lg:order-2">
            <SectionHeader
              eyebrow="Who We Are"
              title="Your Trusted Partners in West Georgia Real Estate"
              align="left"
              className="mb-6"
            />
            <p className="font-lora text-ink-secondary leading-relaxed mb-6">
              Journey Realty Group is a full-service real estate brokerage based
              in Tallapoosa, GA. We are deeply rooted in the West Georgia
              community and bring local expertise, honest guidance, and genuine
              care to every client relationship.
            </p>
            <p className="font-lora text-ink-secondary leading-relaxed mb-8">
              Whether you are buying your first home, selling a property you
              have loved for years, or searching for the right investment, our
              experienced team is with you from the first conversation to the
              closing table.
            </p>

            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-primary mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-lora text-sm text-ink-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Button href="/about" variant="primary">
              Learn About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
