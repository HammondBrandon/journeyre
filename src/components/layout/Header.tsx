"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Properties",
    children: [
      { label: "Search Listings", href: "/properties" },
      { label: "Office Listings", href: "/office-listings" },
    ],
  },
  {
    label: "Buying",
    href: "/buying",
  },
  {
    label: "Selling",
    children: [
      { label: "Selling Resources", href: "/selling" },
      { label: "Request a CMA", href: "/selling#cma" },
    ],
  },
  {
    label: "About",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Meet the Team", href: "/team" },
    ],
  },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-ink text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between font-raleway">
          <p className="text-white/70">
            102 Head Ave., Tallapoosa, GA 30176
          </p>
          <a
            href="tel:7708557995"
            className="flex items-center gap-1.5 text-white/90 hover:text-primary transition-colors"
          >
            <Phone size={12} />
            (770) 855-7995
          </a>
        </div>
      </div>

      {/* Main nav */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-200",
          isScrolled ? "shadow-[var(--shadow-nav)]" : "border-b border-border-light"
        )}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20" ref={dropdownRef}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Journey Realty Group — Home">
              <div className="flex flex-col leading-none">
                <span className="font-raleway font-bold text-xl md:text-2xl tracking-tight text-ink">
                  Journey
                </span>
                <span className="font-raleway font-light text-sm md:text-base tracking-[0.25em] text-primary uppercase">
                  Realty Group
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-0">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.label ? null : item.label
                        )
                      }
                      className={cn(
                        "flex items-center gap-1 px-4 py-2 font-raleway text-xs font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer",
                        openDropdown === item.label
                          ? "text-primary"
                          : "text-ink-secondary hover:text-primary"
                      )}
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown
                        size={12}
                        className={cn(
                          "transition-transform duration-150",
                          openDropdown === item.label && "rotate-180"
                        )}
                      />
                    </button>

                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-border-light shadow-lg py-1 z-50">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-5 py-2.5 font-raleway text-xs font-medium tracking-wide text-ink-secondary hover:text-primary hover:bg-primary-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className="px-4 py-2 font-raleway text-xs font-semibold uppercase tracking-[0.12em] text-ink-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden md:inline-flex items-center px-5 py-2.5 bg-primary text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-primary-dark transition-colors"
              >
                Get in Touch
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-ink-secondary hover:text-primary transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-ink/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl flex flex-col transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-border-light">
            <span className="font-raleway font-bold text-lg text-ink">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-ink-secondary hover:text-primary"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item) =>
              item.children ? (
                <MobileDropdown
                  key={item.label}
                  item={item}
                  onNavigate={() => setMobileOpen(false)}
                />
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className="block px-6 py-3.5 font-raleway text-sm font-semibold uppercase tracking-wide text-ink-secondary hover:text-primary hover:bg-primary-50 transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="p-6 border-t border-border-light space-y-3">
            <a
              href="tel:7708557995"
              className="flex items-center gap-2 text-ink-secondary font-raleway text-sm"
            >
              <Phone size={14} className="text-primary" />
              (770) 855-7995
            </a>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-3 bg-primary text-white font-raleway text-xs font-semibold uppercase tracking-wide hover:bg-primary-dark transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileDropdown({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-3.5 font-raleway text-sm font-semibold uppercase tracking-wide text-ink-secondary hover:text-primary transition-colors cursor-pointer"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-150", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="bg-surface border-y border-border-light">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="block px-8 py-3 font-raleway text-sm text-ink-secondary hover:text-primary hover:bg-primary-50 transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
