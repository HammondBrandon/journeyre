import { cn } from "@/lib/cn";
import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "ghost" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  external?: boolean;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark active:bg-primary-darker shadow-sm hover:shadow-md",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
  ghost:
    "text-primary bg-transparent hover:bg-primary-light",
  white:
    "bg-white text-ink hover:bg-primary-50 shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-raleway font-semibold tracking-wide uppercase text-xs rounded-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if ("href" in props && props.href !== undefined) {
    const { href, external } = props;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _href, ...buttonProps } = props as ButtonAsButton & {
    href?: undefined;
  };
  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
