import Image from "next/image";
import Button from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background image */}
      <Image
        src="/images/accessory/old-keys-journey-realty-group.jpg"
        alt=""
        fill
        className="object-cover object-center"
        aria-hidden="true"
        priority={false}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-ink/70" aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="font-raleway text-xs font-semibold uppercase tracking-[0.25em] text-white/70 mb-4">
          Ready to Get Started?
        </p>
        <h2
          id="cta-heading"
          className="font-raleway font-bold text-3xl md:text-4xl text-white leading-tight mb-5"
        >
          Let&apos;s Find Your Next Home Together
        </h2>
        <p className="font-lora text-lg text-white/80 leading-relaxed max-w-2xl mx-auto mb-10">
          Whether you are just starting your search or ready to make a move, our
          team is here to help. Reach out today and let&apos;s talk about what
          you are looking for.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href="/contact" variant="white" size="lg">
            Contact Us
          </Button>
          <Button
            href="/selling#cma"
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-primary"
          >
            Get a Free CMA
          </Button>
        </div>
      </div>
    </section>
  );
}
