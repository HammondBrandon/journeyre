import Link from "next/link";
import { agents } from "@/lib/agents";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Phone, Mail } from "lucide-react";

function AgentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary/20"
      aria-hidden="true"
    >
      <span className="font-raleway font-bold text-3xl text-primary/60">
        {initials}
      </span>
    </div>
  );
}

export default function TeamPreview() {
  // Show first 3 agents on homepage
  const featured = agents.slice(0, 3);

  return (
    <section
      className="py-20 md:py-28 bg-white"
      aria-labelledby="team-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Our Team"
          title="Meet Our REALTORS®"
          subtitle="Experienced, dedicated professionals ready to help you buy or sell with confidence."
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((agent) => (
            <article
              key={agent.id}
              className="group text-center"
            >
              <Link href={`/team/${agent.slug}`} aria-label={`View ${agent.name}'s profile`}>
                <div className="w-40 h-40 mx-auto mb-5 overflow-hidden rounded-full border-4 border-border-light group-hover:border-primary/40 transition-colors">
                  {agent.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AgentAvatar name={agent.name} />
                  )}
                </div>
              </Link>

              <h3 className="font-raleway font-bold text-lg text-ink mb-1">
                <Link
                  href={`/team/${agent.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {agent.name}
                </Link>
              </h3>
              <p className="font-raleway text-xs uppercase tracking-widest text-primary mb-3">
                {agent.title}
              </p>
              <p className="font-lora text-sm text-ink-muted leading-relaxed mb-4 max-w-xs mx-auto">
                {agent.shortBio}
              </p>

              <div className="flex items-center justify-center gap-4">
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
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button href="/team" variant="outline">
            View Full Team
          </Button>
        </div>
      </div>
    </section>
  );
}
