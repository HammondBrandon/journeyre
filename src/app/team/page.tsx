import type { Metadata } from "next";
import Link from "next/link";
import { agents } from "@/lib/agents";
import SectionHeader from "@/components/ui/SectionHeader";
import CTASection from "@/components/home/CTASection";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Meet the Team",
  description:
    "Meet the experienced REALTORS® at Journey Realty Group. Our team of dedicated agents serves buyers and sellers throughout Tallapoosa, GA and West Georgia.",
  openGraph: {
    title: "Meet the Team | Journey Realty Group",
    description:
      "Our experienced team of REALTORS® is ready to guide you through every step of your real estate journey.",
  },
};

function AgentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary/20">
      <span className="font-raleway font-bold text-4xl text-primary/60">
        {initials}
      </span>
    </div>
  );
}

export default function TeamPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-surface border-b border-border-light py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Our People"
            title="Meet the Team"
            subtitle="Dedicated REALTORS® with deep roots in the West Georgia community."
            align="left"
            className="max-w-xl"
          />
        </div>
      </section>

      {/* Agent grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="group border border-border-light hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200"
              >
                {/* Photo */}
                <Link href={`/team/${agent.slug}`} aria-label={`View ${agent.name}'s profile`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    {agent.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={agent.photo}
                        alt={agent.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <AgentAvatar name={agent.name} />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-6">
                  <h2 className="font-raleway font-bold text-xl text-ink mb-0.5">
                    <Link
                      href={`/team/${agent.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {agent.name}
                    </Link>
                  </h2>
                  <p className="font-raleway text-xs uppercase tracking-widest text-primary mb-3">
                    {agent.title}
                  </p>
                  <p className="font-lora text-sm text-ink-muted leading-relaxed mb-5">
                    {agent.shortBio}
                  </p>

                  {agent.serviceAreas.length > 0 && (
                    <p className="flex items-start gap-1.5 font-lora text-xs text-ink-muted mb-4">
                      <MapPin size={12} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      {agent.serviceAreas.slice(0, 3).join(", ")}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-border-light">
                    <a
                      href={`tel:${agent.phone.replace(/\D/g, "")}`}
                      className="flex items-center gap-1.5 font-raleway text-xs text-ink-muted hover:text-primary transition-colors"
                      aria-label={`Call ${agent.name}`}
                    >
                      <Phone size={12} />
                      {agent.phone}
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-1.5 font-raleway text-xs text-ink-muted hover:text-primary transition-colors"
                      aria-label={`Email ${agent.name}`}
                    >
                      <Mail size={12} />
                      Email
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
