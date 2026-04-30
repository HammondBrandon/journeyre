import Image from "next/image";

export default function GAMLSDisclaimer() {
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-6 px-6 border-t border-border-light bg-surface">
      <Image
        src="/images/gamls-logos/gamls_idx_300x118.png"
        alt="Georgia MLS — Multiple Listing Service"
        width={120}
        height={47}
        className="shrink-0"
      />
      <p className="font-lora text-xs text-ink-muted leading-relaxed text-center sm:text-left">
        &copy; {year} Georgia MLS. All rights reserved. Information Deemed
        Reliable But Not Guaranteed. Listing data is provided for consumers&apos;
        personal, non-commercial use and may not be used for any purpose other
        than to identify prospective properties consumers may be interested in
        purchasing.
      </p>
    </div>
  );
}
