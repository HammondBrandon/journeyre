import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  /** Applied to the <h2> for aria-labelledby references */
  id?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className,
  id,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "font-raleway text-xs font-semibold uppercase tracking-[0.2em] mb-3",
            light ? "text-primary-light" : "text-primary"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "font-raleway font-bold text-3xl md:text-4xl leading-tight",
          light ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed font-lora",
            light ? "text-white/80" : "text-ink-muted"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
