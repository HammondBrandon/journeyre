import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import CTASection from "@/components/home/CTASection";
import CMAForm from "@/components/forms/CMAForm";
import { CheckCircle2, TrendingUp, Eye, FileText, DollarSign, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Selling Your Home",
  description:
    "Thinking about selling your home in West Georgia? Journey Realty Group offers expert guidance, competitive market analysis, and dedicated representation to get you the best result.",
  openGraph: {
    title: "Selling Your Home | Journey Realty Group",
    description:
      "Expert guidance for home sellers in Tallapoosa, GA and West Georgia. Request your free CMA today.",
  },
};

const sellingSteps = [
  {
    icon: TrendingUp,
    title: "Pricing Strategy",
    description:
      "We analyze comparable sales, current market conditions, and your home's unique features to recommend a price that attracts buyers and maximizes your return.",
  },
  {
    icon: Eye,
    title: "Preparation & Staging",
    description:
      "First impressions matter. We advise on cost-effective improvements and staging strategies that help your home show beautifully and sell faster.",
  },
  {
    icon: FileText,
    title: "Marketing Your Home",
    description:
      "Professional photography, MLS listing, targeted online marketing, and our local network ensure your home gets maximum exposure to qualified buyers.",
  },
  {
    icon: DollarSign,
    title: "Reviewing Offers",
    description:
      "We walk you through every offer — not just the price, but contingencies, timelines, and financing — so you can make the most informed decision.",
  },
  {
    icon: CheckCircle2,
    title: "Negotiation",
    description:
      "Our agents advocate fiercely for your interests, whether negotiating price, repairs, or closing costs, to get you the best possible deal.",
  },
  {
    icon: Key,
    title: "Closing",
    description:
      "We coordinate with title companies, buyers' agents, and lenders to ensure a smooth, on-time closing — so you can move forward with confidence.",
  },
];

export default function SellingPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-surface border-b border-border-light py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="font-raleway text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              For Sellers
            </p>
            <h1 className="font-raleway font-bold text-4xl md:text-5xl text-ink leading-tight mb-5">
              Selling Your Home in West Georgia
            </h1>
            <p className="font-lora text-lg text-ink-secondary leading-relaxed">
              Getting the best price for your home takes expertise, strategy, and
              local market knowledge. Our team delivers all three.
            </p>
          </div>
        </div>
      </section>

      {/* Why sell with us */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <SectionHeader
                eyebrow="Why Choose Us"
                title="Your Advantage in the Market"
                align="left"
                className="mb-6"
              />
              <div className="space-y-4 font-lora text-ink-secondary leading-relaxed mb-8">
                <p>
                  Selling a home is one of the biggest financial decisions of
                  your life. The agent you choose matters enormously — not just
                  for the price you achieve, but for how smooth and stress-free
                  the process is.
                </p>
                <p>
                  At Journey Realty Group, we bring local market expertise,
                  dedicated marketing, and tenacious negotiation to every
                  listing. We do not just put a sign in the yard — we work
                  strategically to attract the right buyers and protect your
                  bottom line.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Accurate, data-driven pricing strategy",
                  "Professional photography and compelling listing presentation",
                  "Broad MLS and online marketing exposure",
                  "Expert negotiation on price, terms, and repairs",
                  "Transparent communication from listing to closing",
                  "Full-service support through every step",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="font-lora text-sm text-ink-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="#cma" variant="outline">
                  Request a Free CMA
                </Button>
              </div>
            </div>

            {/* Visual placeholder */}
            <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-light to-primary/10">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={28} className="text-primary" aria-hidden="true" />
                  </div>
                  <p className="font-raleway text-xs uppercase tracking-widest text-primary/70">
                    Photo coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selling steps */}
      <section className="py-20 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Our Process"
            title="How We Sell Your Home"
            subtitle="A proven strategy designed to attract qualified buyers and maximize your result."
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellingSteps.map((step, i) => (
              <div
                key={step.title}
                className="bg-white border border-border-light p-7 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary-light flex items-center justify-center shrink-0">
                    <step.icon size={18} className="text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-raleway font-bold text-xs uppercase tracking-widest text-ink-muted">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-raleway font-bold text-lg text-ink mb-3">
                  {step.title}
                </h3>
                <p className="font-lora text-sm text-ink-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMA Form */}
      <section className="py-20 md:py-28 bg-white" id="cma">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <SectionHeader
              eyebrow="Free Service"
              title="Request a Comparative Market Analysis"
              subtitle="Find out what your home is worth in today's market. Fill out the form below and one of our agents will prepare a detailed analysis of your property's value."
            />
          </div>
          <div className="bg-surface border border-border-light p-8 md:p-12">
            <CMAForm />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
