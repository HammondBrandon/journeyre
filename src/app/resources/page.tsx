import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import PageHeader from "@/components/ui/PageHeader";
import CTASection from "@/components/home/CTASection";
import {
  ExternalLink,
  BookOpen,
  Calculator,
  FileText,
  Scale,
  Home,
  DollarSign,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Helpful real estate resources for buyers and sellers in West Georgia. Educational guides, links, and tools to help you make informed decisions.",
  openGraph: {
    title: "Resources | Journey Realty Group",
    description:
      "Helpful guides and resources for buyers and sellers in West Georgia.",
  },
};

const buyerResources = [
  {
    icon: BookOpen,
    title: "First-Time Buyer Guide",
    description:
      "A comprehensive overview of the home buying process, from pre-approval to closing.",
    href: "/buying",
    internal: true,
  },
  {
    icon: Calculator,
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payment based on home price, down payment, and interest rate.",
    href: "/buying#mortgage-calculator",
    internal: true,
  },
  {
    icon: DollarSign,
    title: "Down Payment Assistance",
    description:
      "Georgia Dream Homeownership Program offers down payment assistance to eligible first-time buyers in Georgia.",
    href: "https://www.georgia.gov/georgia-dream-homeownership-program",
    internal: false,
  },
  {
    icon: Scale,
    title: "Georgia Real Estate Commission",
    description:
      "The official state agency licensing real estate professionals in Georgia.",
    href: "https://grec.state.ga.us",
    internal: false,
  },
];

const sellerResources = [
  {
    icon: Home,
    title: "Selling Resources Guide",
    description:
      "Learn how to prepare your home for sale, understand the pricing process, and navigate offers.",
    href: "/selling",
    internal: true,
  },
  {
    icon: FileText,
    title: "Request a Free CMA",
    description:
      "Find out what your home is worth with a free Comparative Market Analysis from one of our agents.",
    href: "/selling#cma",
    internal: true,
  },
  {
    icon: Calculator,
    title: "Seller Net Proceeds",
    description:
      "Understand the costs involved in selling and estimate your net proceeds after closing costs and agent fees.",
    href: "/contact",
    internal: true,
  },
];

const generalResources = [
  {
    icon: Scale,
    title: "Understanding Real Estate Contracts",
    description:
      "Key terms and clauses you will encounter in a purchase and sale agreement, explained in plain language.",
  },
  {
    icon: Home,
    title: "Home Inspection Basics",
    description:
      "What a home inspection covers, what to expect, and how to use the results in your transaction.",
  },
  {
    icon: FileText,
    title: "Title Insurance Explained",
    description:
      "Why title insurance matters and what it protects you from when buying or selling real estate.",
  },
  {
    icon: DollarSign,
    title: "Understanding Closing Costs",
    description:
      "A breakdown of typical closing costs for buyers and sellers and how to plan for them.",
  },
  {
    icon: Calculator,
    title: "Property Tax in Georgia",
    description:
      "How Georgia property taxes are calculated, when they are due, and what exemptions may apply to you.",
  },
  {
    icon: BookOpen,
    title: "HOA: What You Need to Know",
    description:
      "What homeowners associations are, what they govern, and what to review before buying in an HOA community.",
  },
];

interface ResourceCardProps {
  icon: React.ComponentType<{ size: number; className: string }>;
  title: string;
  description: string;
  href?: string;
  internal?: boolean;
}

function ResourceCard({
  icon: Icon,
  title,
  description,
  href,
  internal,
}: ResourceCardProps) {
  const content = (
    <>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 bg-primary-light flex items-center justify-center shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-raleway font-bold text-base text-ink mb-2">
            {title}
            {href && !internal && (
              <ExternalLink
                size={12}
                className="inline ml-1.5 text-ink-muted"
                aria-label="External link"
              />
            )}
          </h3>
          <p className="font-lora text-sm text-ink-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </>
  );

  if (href) {
    if (internal) {
      return (
        <a
          href={href}
          className="block p-6 border border-border-light hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all bg-white group"
        >
          {content}
          <span className="font-raleway text-xs font-semibold uppercase tracking-wide text-primary group-hover:underline">
            Learn More →
          </span>
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-6 border border-border-light hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all bg-white group"
      >
        {content}
        <span className="font-raleway text-xs font-semibold uppercase tracking-wide text-primary group-hover:underline">
          Visit Resource →
        </span>
      </a>
    );
  }

  return (
    <div className="p-6 border border-border-light bg-white">{content}</div>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Education & Tools"
        title="Real Estate Resources"
        subtitle="Helpful guides, tools, and links for buyers, sellers, and anyone navigating the real estate process in West Georgia."
        image="/images/accessory/wide-office-journey-realty-group.jpg"
        imageAlt="Journey Realty Group office"
      />

      {/* Buyer resources */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Buying"
            title="Resources for Home Buyers"
            align="left"
            className="mb-10 max-w-xl"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {buyerResources.map((r) => (
              <ResourceCard key={r.title} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* Seller resources */}
      <section className="py-20 md:py-24 bg-surface border-t border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Selling"
            title="Resources for Home Sellers"
            align="left"
            className="mb-10 max-w-xl"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellerResources.map((r) => (
              <ResourceCard key={r.title} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* General education */}
      <section className="py-20 md:py-24 bg-white border-t border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Education"
            title="Real Estate Basics"
            subtitle="Plain-language explanations of common real estate concepts, terms, and processes."
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {generalResources.map((r) => (
              <ResourceCard key={r.title} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <section className="py-10 bg-surface border-t border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-lora text-xs text-ink-muted text-center max-w-3xl mx-auto leading-relaxed">
            The resources and information provided on this page are for general
            educational purposes only and do not constitute legal, financial, or
            tax advice. Always consult a qualified professional for advice
            specific to your situation.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
