import Image from "next/image";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  dark?: boolean;
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt = "",
  dark = false,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative border-b overflow-hidden",
        image
          ? "border-transparent py-16 md:py-20"
          : dark
            ? "bg-ink border-transparent py-14 md:py-18"
            : "bg-surface border-border-light py-16 md:py-20",
      )}
    >
      {image && (
        <>
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover object-[25%_25%]"
            priority
          />
          <div className="absolute inset-0 bg-ink/60" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          {eyebrow && (
            <p
              className={cn(
                "font-raleway text-xs font-semibold uppercase tracking-[0.2em] mb-3",
                image || dark ? "text-primary-light" : "text-primary",
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "font-raleway font-bold text-4xl md:text-5xl leading-tight mb-5",
              image || dark ? "text-white" : "text-ink",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "font-lora text-lg leading-relaxed",
                image || dark ? "text-white/80" : "text-ink-secondary",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
