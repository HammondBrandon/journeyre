import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PageHeader from "@/components/ui/PageHeader";
import CTASection from "@/components/home/CTASection";
import { CheckCircle2, MapPin, Phone, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Journey Realty Group — a full-service real estate brokerage based in Tallapoosa, GA, serving buyers and sellers throughout West Georgia.",
  openGraph: {
    title: "About Us | Journey Realty Group",
    description:
      "A full-service real estate brokerage rooted in the West Georgia community. Meet the team and learn our story.",
  },
};

const values = [
  {
    icon: Award,
    title: "Integrity First",
    description:
      "We believe honest, transparent communication is the foundation of every successful real estate relationship.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "We are deeply rooted in the West Georgia community and know this market inside and out.",
  },
  {
    icon: CheckCircle2,
    title: "Client-Centered",
    description:
      "Your goals drive everything we do. We measure success by the satisfaction of the clients we serve.",
  },
  {
    icon: Phone,
    title: "Always Available",
    description:
      "Real estate moves fast. Our team stays accessible and responsive so you never miss an opportunity.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="About Journey Realty Group"
        subtitle="A community-rooted brokerage dedicated to guiding buyers and sellers through every step of the real estate journey."
        image="/images/accessory/conference-table-journey-realty-group.jpg"
        imageAlt="Journey Realty Group conference table"
      />

      {/* Mission */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Visual */}
            <div className="relative">
              <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
                <Image
                  src="/images/accessory/ethan-renae-journey-realty-group-working.jpg"
                  alt="Journey Realty Group office"
                  className="w-full h-full object-cover"
                  width={800}
                  height={600}
                />
              </div>
              <div
                className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 -z-10 hidden lg:block"
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div>
              <SectionHeader
                eyebrow="Who We Are"
                title="Built on Community, Driven by Results"
                align="left"
                className="mb-6"
              />
              <div className="space-y-4 font-lora text-ink-secondary leading-relaxed">
                <p>
                  Journey Realty Group is a full-service real estate brokerage
                  based in Tallapoosa, GA. From the very beginning, our mission
                  has been simple: to provide honest, expert guidance to every
                  client who trusts us with one of the most important decisions
                  of their lives.
                </p>
                <p>
                  We serve buyers and sellers throughout West Georgia — from
                  Tallapoosa and Bremen to Cedartown, Carrollton, and beyond.
                  Our agents bring deep local knowledge and a genuine commitment
                  to your success.
                </p>
                <p>
                  At Journey Realty Group, you are not just a transaction. You
                  are a neighbor, and we treat you like one.
                </p>
              </div>
              <div className="mt-8">
                <Button href="/team">Meet Our Team</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Our Values"
            title="What Sets Us Apart"
            subtitle="We hold ourselves to a high standard in everything we do — for our clients and our community."
            className="mb-14"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-12 h-12 bg-primary-light flex items-center justify-center mx-auto mb-5">
                  <value.icon
                    size={22}
                    className="text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-raleway font-bold text-base text-ink mb-3">
                  {value.title}
                </h3>
                <p className="font-lora text-sm text-ink-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office info */}
      <section className="py-16 md:py-20 bg-white border-t border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="font-raleway font-bold text-2xl text-ink mb-4">
                Visit Our Office
              </h2>
              <div className="space-y-2 font-lora text-ink-secondary">
                <p className="flex items-center gap-2">
                  <MapPin
                    size={15}
                    className="text-primary shrink-0"
                    aria-hidden="true"
                  />
                  102 Head Ave., Tallapoosa, GA 30176
                </p>
                <p className="flex items-center gap-2">
                  <Phone
                    size={15}
                    className="text-primary shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:7708557995"
                    className="hover:text-primary transition-colors"
                  >
                    (770) 855-7995
                  </a>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button href="/contact" variant="primary">
                Contact Us
              </Button>
              <Button href="/team" variant="outline">
                Meet the Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
