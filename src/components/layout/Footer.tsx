import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  buying: [
    { label: "Search Listings", href: "/properties" },
    { label: "Buying Resources", href: "/buying" },
    { label: "Mortgage Calculator", href: "/buying#mortgage-calculator" },
    { label: "First-Time Buyers", href: "/buying#first-time-buyers" },
  ],
  selling: [
    { label: "Selling Resources", href: "/selling" },
    { label: "Request a CMA", href: "/selling#cma" },
    { label: "Home Valuation", href: "/selling#cma" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Meet the Team", href: "/team" },
    { label: "Resources", href: "/resources" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <div className="flex flex-col leading-none">
                <span className="font-raleway font-bold text-xl tracking-tight text-white">
                  Journey
                </span>
                <span className="font-raleway font-light text-sm tracking-[0.25em] text-primary uppercase">
                  Realty Group
                </span>
              </div>
            </div>
            <p className="font-lora text-sm text-white/70 leading-relaxed mb-6">
              Whether you are buying or selling, we are with you every step of
              the journey. Serving Tallapoosa, GA and the surrounding West
              Georgia area.
            </p>
            <div className="space-y-3">
              <a
                href="https://maps.google.com/?q=102+Head+Ave+Tallapoosa+GA+30176"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-white/70 hover:text-primary transition-colors text-sm font-lora"
              >
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                102 Head Ave., Tallapoosa, GA 30176
              </a>
              <a
                href="tel:7708557995"
                className="flex items-center gap-2.5 text-white/70 hover:text-primary transition-colors text-sm font-lora"
              >
                <Phone size={14} className="text-primary shrink-0" />
                (770) 855-7995
              </a>
              <a
                href="tel:7708553622"
                className="flex items-center gap-2.5 text-white/70 hover:text-primary transition-colors text-sm font-lora"
              >
                <Phone size={14} className="text-primary shrink-0" />
                (770) 855-3622
              </a>
              <a
                href="mailto:info@journeyrealtygroup.net"
                className="flex items-center gap-2.5 text-white/70 hover:text-primary transition-colors text-sm font-lora"
              >
                <Mail size={14} className="text-primary shrink-0" />
                info@journeyrealtygroup.net
              </a>
            </div>
          </div>

          {/* Buying */}
          <div>
            <h3 className="font-raleway text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-5">
              Buying
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.buying.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-lora text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Selling */}
          <div>
            <h3 className="font-raleway text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-5">
              Selling
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.selling.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-lora text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-raleway text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-5">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-lora text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-raleway text-xs text-white/50 text-center md:text-left">
            &copy; {currentYear} Journey Realty Group. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="font-raleway text-xs text-white/50 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <p className="font-raleway text-xs text-white/50">
              REALTOR® &nbsp;|&nbsp; Equal Housing Opportunity
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
