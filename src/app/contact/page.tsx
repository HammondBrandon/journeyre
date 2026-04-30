import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import ContactForm from "@/components/forms/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { agents } from "@/lib/agents";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Journey Realty Group in Tallapoosa, GA. We are ready to answer your questions and help you buy or sell your next home.",
  openGraph: {
    title: "Contact Us | Journey Realty Group",
    description:
      "Reach out to Journey Realty Group. We serve buyers and sellers throughout Tallapoosa, GA and West Georgia.",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-surface border-b border-border-light py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="font-raleway text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Reach Out
            </p>
            <h1 className="font-raleway font-bold text-4xl md:text-5xl text-ink leading-tight mb-5">
              Let&apos;s Talk
            </h1>
            <p className="font-lora text-lg text-ink-secondary leading-relaxed">
              Whether you have a quick question or are ready to start your real
              estate journey, we are here and happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact layout */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Office info */}
              <div>
                <h2 className="font-raleway font-bold text-lg text-ink mb-5">
                  Our Office
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={16}
                      className="text-primary mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-lora text-sm text-ink-secondary">
                        102 Head Ave.
                      </p>
                      <p className="font-lora text-sm text-ink-secondary">
                        Tallapoosa, GA 30176
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:7708557995"
                    className="flex items-center gap-3 font-lora text-sm text-ink-secondary hover:text-primary transition-colors"
                  >
                    <Phone
                      size={16}
                      className="text-primary shrink-0"
                      aria-hidden="true"
                    />
                    (770) 855-7995
                  </a>
                  <a
                    href="mailto:info@journeyrealtygroup.net"
                    className="flex items-center gap-3 font-lora text-sm text-ink-secondary hover:text-primary transition-colors"
                  >
                    <Mail
                      size={16}
                      className="text-primary shrink-0"
                      aria-hidden="true"
                    />
                    info@journeyrealtygroup.net
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="border-t border-border-light pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock
                    size={15}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  <h2 className="font-raleway font-bold text-base text-ink">
                    Office Hours
                  </h2>
                </div>
                <div className="space-y-2">
                  {[
                    { day: "Monday – Friday", hours: "9:00 AM – 5:00 PM" },
                    { day: "Saturday", hours: "By Appointment" },
                    { day: "Sunday", hours: "By Appointment" },
                  ].map(({ day, hours }) => (
                    <div
                      key={day}
                      className="flex justify-between font-lora text-sm"
                    >
                      <span className="text-ink-secondary">{day}</span>
                      <span className="text-ink-muted">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent quick contact */}
              <div className="border-t border-border-light pt-6">
                <h2 className="font-raleway font-bold text-base text-ink mb-4">
                  Contact an Agent Directly
                </h2>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/team/${agent.slug}`}
                      className="flex items-center justify-between p-3 border border-border-light hover:border-primary/30 hover:bg-primary-50 transition-all group"
                    >
                      <div>
                        <p className="font-raleway font-semibold text-sm text-ink group-hover:text-primary transition-colors">
                          {agent.name}
                        </p>
                        <p className="font-raleway text-xs text-ink-muted">
                          {agent.title}
                        </p>
                      </div>
                      <Phone
                        size={13}
                        className="text-ink-muted group-hover:text-primary transition-colors"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <SectionHeader
                eyebrow="Send a Message"
                title="How Can We Help You?"
                align="left"
                className="mb-8"
              />
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="border-t border-border-light">
        <iframe
          src="https://maps.google.com/maps?q=102+Head+Ave,+Tallapoosa,+GA+30176&output=embed"
          width="100%"
          height="400"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Journey Realty Group office location — 102 Head Ave, Tallapoosa, GA 30176"
        />
        <div className="bg-surface py-3 px-6 flex justify-center">
          <a
            href="https://maps.google.com/?q=102+Head+Ave+Tallapoosa+GA+30176"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-raleway text-xs text-primary hover:underline"
          >
            <MapPin size={12} aria-hidden="true" />
            102 Head Ave, Tallapoosa, GA 30176 — Open in Google Maps →
          </a>
        </div>
      </section>
    </>
  );
}
