import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import CTASection from "@/components/home/CTASection";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Buying a Home",
  description:
    "Resources, tips, and guidance for home buyers in Tallapoosa, GA and West Georgia. From your first search to the closing table, Journey Realty Group is with you.",
  openGraph: {
    title: "Buying a Home | Journey Realty Group",
    description:
      "Everything you need to know about buying a home in West Georgia.",
  },
};

const buyingSteps = [
  {
    step: "01",
    title: "Get Pre-Approved",
    description:
      "Before you start your search, connect with a lender to understand your budget and strengthen your offer. Our agents can refer you to trusted local lenders.",
  },
  {
    step: "02",
    title: "Define Your Goals",
    description:
      "Think about what matters most — location, size, school districts, commute. The more clearly we understand your needs, the better we can match you with the right home.",
  },
  {
    step: "03",
    title: "Start Your Search",
    description:
      "We will search the MLS and leverage our local network to find homes that fit your criteria, including listings before they hit the market.",
  },
  {
    step: "04",
    title: "Tour Homes",
    description:
      "We schedule tours that work for your timeline and guide you through what to look for, from the big picture down to the details that matter.",
  },
  {
    step: "05",
    title: "Make an Offer",
    description:
      "When you find the right home, we craft a competitive offer and negotiate on your behalf to secure the best possible terms.",
  },
  {
    step: "06",
    title: "Close with Confidence",
    description:
      "We walk you through inspections, appraisals, and every step of the closing process so there are no surprises — just keys in your hand.",
  },
];

const buyerFAQs = [
  {
    q: "How much do I need for a down payment?",
    a: "Down payment requirements vary by loan type. Conventional loans typically require 5–20%, FHA loans can be as low as 3.5%, and VA or USDA loans may require zero down. Your lender will help determine what works best for your situation.",
  },
  {
    q: "Do I need a buyer's agent?",
    a: "Having an experienced buyer's agent on your side is always in your best interest. We represent your interests, negotiate on your behalf, and guide you through the entire process — at no cost to you as the buyer in most transactions.",
  },
  {
    q: "How long does it take to buy a home?",
    a: "From the start of your search to closing, the process typically takes 30–90 days once you are under contract. Your overall timeline depends on how long it takes to find the right home.",
  },
  {
    q: "What is earnest money?",
    a: "Earnest money is a deposit that shows the seller you are serious about purchasing the home. It is typically 1–2% of the purchase price and goes toward your closing costs if the sale goes through.",
  },
  {
    q: "What should I look for during a home inspection?",
    a: "A professional home inspector will evaluate the structure, systems, and condition of the property. Focus on major issues like the roof, foundation, HVAC, plumbing, and electrical. We help you interpret inspection findings and negotiate repairs.",
  },
];

export default function BuyingPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-surface border-b border-border-light py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="font-raleway text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              For Buyers
            </p>
            <h1 className="font-raleway font-bold text-4xl md:text-5xl text-ink leading-tight mb-5">
              Buying a Home in West Georgia
            </h1>
            <p className="font-lora text-lg text-ink-secondary leading-relaxed">
              We make the home buying process clear, manageable, and even
              enjoyable. Here is everything you need to know — and our team is
              here every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="The Process"
            title="How Buying a Home Works"
            subtitle="A clear, step-by-step guide to purchasing your next property with Journey Realty Group."
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {buyingSteps.map((step) => (
              <div
                key={step.step}
                className="relative border border-border-light p-7 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all"
              >
                <p className="font-raleway font-bold text-4xl text-primary/15 mb-4 leading-none">
                  {step.step}
                </p>
                <h3 className="font-raleway font-bold text-lg text-ink mb-3">
                  {step.title}
                </h3>
                <p className="font-lora text-sm text-ink-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button href="/contact">
              Start Your Home Search
            </Button>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-20 md:py-24 bg-surface" id="first-time-buyers">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <SectionHeader
                eyebrow="First-Time Buyers"
                title="What to Expect as a First-Time Buyer"
                align="left"
                className="mb-6"
              />
              <div className="space-y-4 font-lora text-ink-secondary leading-relaxed">
                <p>
                  Buying your first home is one of the most exciting milestones
                  of your life — and one of the most complex transactions you
                  will ever make. That is why having an experienced agent in
                  your corner is so important.
                </p>
                <p>
                  At Journey Realty Group, we specialize in helping first-time
                  buyers understand every step of the process, from getting
                  pre-approved to unpacking your boxes. We explain the jargon,
                  set realistic expectations, and advocate for your best
                  interests at every turn.
                </p>
              </div>
              <div className="mt-8">
                <Button href="/team" variant="outline">
                  Meet Our Buyer&apos;s Agents
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "Understand your budget and get pre-approved before you shop",
                "Work with one dedicated agent who knows your goals",
                "Access MLS listings plus off-market opportunities",
                "Receive expert negotiation on price, terms, and repairs",
                "Navigate inspections, appraisals, and title with confidence",
                "Close on time with no last-minute surprises",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-4 bg-white border border-border-light"
                >
                  <CheckCircle2
                    size={16}
                    className="text-primary mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-lora text-sm text-ink-secondary">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage calculator placeholder */}
      <section className="py-20 md:py-24 bg-white" id="mortgage-calculator">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeader
              eyebrow="Tools"
              title="Mortgage Calculator"
              subtitle="Get a quick estimate of your monthly payment based on home price, down payment, and loan terms."
              className="mb-10"
            />
            <div className="p-10 border-2 border-dashed border-border text-center bg-surface">
              <p className="font-raleway text-sm font-semibold text-ink-muted mb-2">
                Mortgage Calculator Coming Soon
              </p>
              <p className="font-lora text-sm text-ink-muted">
                In the meantime, speak with one of our agents and we can
                connect you with a trusted local lender for personalized
                payment estimates.
              </p>
              <div className="mt-6">
                <Button href="/contact" variant="outline">
                  <ArrowRight size={14} />
                  Contact an Agent
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader
            eyebrow="FAQ"
            title="Common Buyer Questions"
            className="mb-12"
          />
          <div className="space-y-6">
            {buyerFAQs.map((faq) => (
              <div
                key={faq.q}
                className="border border-border-light bg-white p-6"
              >
                <h3 className="font-raleway font-bold text-base text-ink mb-3">
                  {faq.q}
                </h3>
                <p className="font-lora text-sm text-ink-secondary leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
