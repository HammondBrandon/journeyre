import SectionHeader from "@/components/ui/SectionHeader";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: "1",
    name: "Savannah Overton",
    location: "Google Review",
    quote:
      "HIGHLY recommend Journey Realty for selling and/or buying a home! Renae is hands down the best of the best! She worked so hard for us, communicated very well and timely (even during vacation), and fought for us to make sure we could get the best deal possible. She sold my parents their home and now ours. She's a true blessing! If buying a home can be made easy, she's the one to do it!",
    rating: 5,
  },
  {
    id: "2",
    name: "John Daniel",
    location: "Google Review",
    quote:
      "Journey Realty is a win win when it comes to home buying and selling. A Journey takes preparation and planning, but it should not be stressful. You should embrace it and enjoy each part of it. That's exactly what you get with Journey Realty. They will go above and beyond to make sure the home buying/selling process is enjoyable and their satisfaction comes from your happiness. I speak from experience, as Renae has assisted me with the purchase and sell of a couple of homes and the process was flawless. Trust the process, trust the people and embrace the Journey with Journey Realty!",
    rating: 5,
  },
  {
    id: "3",
    name: "Belinda Patrick",
    location: "Google Review",
    quote:
      "Journey Realty is top notch! They truly care about their clients and work tirelessly to help you find the perfect home for you or find the right buyer for yours!! I wouldn't use anyone else!",
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
