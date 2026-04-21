import SectionHeader from "@/components/ui/SectionHeader";
import { Star } from "lucide-react";

// Placeholder testimonials — update with real client reviews
const testimonials = [
  {
    id: "1",
    name: "Client Name",
    location: "Tallapoosa, GA",
    quote:
      "Working with Journey Realty Group was an amazing experience from start to finish. Our agent was always available to answer questions and guided us through every step of buying our first home.",
    rating: 5,
  },
  {
    id: "2",
    name: "Client Name",
    location: "Bremen, GA",
    quote:
      "We sold our home faster than we expected and got a great price. The team was professional, knowledgeable, and made the entire process stress-free. We could not be happier.",
    rating: 5,
  },
  {
    id: "3",
    name: "Client Name",
    location: "Cedartown, GA",
    quote:
      "As someone relocating from out of state, having a local expert in my corner made all the difference. Journey Realty Group helped us find the perfect home in a neighborhood we love.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section
      className="py-20 md:py-28 bg-ink"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          eyebrow="Client Stories"
          title="What Our Clients Say"
          subtitle="Real experiences from buyers and sellers who trusted us with their journey."
          light
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="bg-white/5 border border-white/10 p-7 flex flex-col gap-5"
            >
              {/* Stars */}
              <div
                className="flex gap-1"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-primary fill-primary"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="font-lora text-sm text-white/80 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <footer className="border-t border-white/10 pt-5">
                <cite className="not-italic">
                  <p className="font-raleway font-semibold text-sm text-white">
                    {t.name}
                  </p>
                  <p className="font-raleway text-xs text-white/50 mt-0.5">
                    {t.location}
                  </p>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
