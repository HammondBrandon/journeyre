import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Journey Realty Group.",
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 2026";

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <p className="font-raleway text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          Legal
        </p>
        <h1 className="font-raleway font-bold text-4xl text-ink leading-tight mb-3">
          Privacy Policy
        </h1>
        <p className="font-lora text-sm text-ink-muted mb-12">
          Last updated: {lastUpdated}
        </p>

        <div className="prose font-lora text-ink-secondary leading-relaxed space-y-6">
          <p>
            Journey Realty Group (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, and safeguard your
            information when you visit our website.
          </p>

          <h2 className="font-raleway font-bold text-xl text-ink mt-10 mb-4">
            Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            fill out a contact form, request a CMA, or communicate with us by
            email or phone. This may include your name, email address, phone
            number, and property information.
          </p>

          <h2 className="font-raleway font-bold text-xl text-ink mt-10 mb-4">
            How We Use Your Information
          </h2>
          <p>
            We use the information we collect to respond to your inquiries,
            provide real estate services, and communicate with you about
            properties and market information relevant to your needs. We do not
            sell your personal information to third parties.
          </p>

          <h2 className="font-raleway font-bold text-xl text-ink mt-10 mb-4">
            Cookies
          </h2>
          <p>
            Our website may use cookies and similar technologies to improve
            your browsing experience. You can control cookie settings through
            your browser preferences.
          </p>

          <h2 className="font-raleway font-bold text-xl text-ink mt-10 mb-4">
            Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at:
          </p>
          <address className="not-italic font-lora text-ink-secondary">
            Journey Realty Group
            <br />
            102 Head Ave., Tallapoosa, GA 30176
            <br />
            <a
              href="mailto:info@journeyrealtygroup.net"
              className="text-primary hover:underline"
            >
              info@journeyrealtygroup.net
            </a>
            <br />
            <a href="tel:7708557995" className="text-primary hover:underline">
              (770) 855-7995
            </a>
          </address>
        </div>
      </div>
    </section>
  );
}
