"use client";

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseNumber(value: string) {
  return parseFloat(value.replace(/,/g, "")) || 0;
}

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("300000");
  const [downPayment, setDownPayment] = useState("20");
  const [downMode, setDownMode] = useState<"percent" | "dollar">("percent");
  const [interestRate, setInterestRate] = useState("7.0");
  const [loanTerm, setLoanTerm] = useState<15 | 30>(30);

  const result = useMemo(() => {
    const price = parseNumber(homePrice);
    const rate = parseFloat(interestRate) || 0;
    const dp =
      downMode === "percent"
        ? price * (parseNumber(downPayment) / 100)
        : parseNumber(downPayment);

    const principal = price - dp;
    if (principal <= 0 || rate <= 0) return null;

    const monthlyRate = rate / 100 / 12;
    const n = loanTerm * 12;
    const monthly =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);

    const totalPaid = monthly * n;
    const totalInterest = totalPaid - principal;
    const downPct = price > 0 ? (dp / price) * 100 : 0;

    return { monthly, principal, totalInterest, dp, downPct };
  }, [homePrice, downPayment, downMode, interestRate, loanTerm]);

  const inputClass =
    "w-full border border-border bg-white px-3 py-2.5 font-lora text-sm text-ink focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block font-raleway font-semibold text-xs text-ink-muted uppercase tracking-wide mb-1.5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Inputs */}
      <div className="space-y-5">
        <div>
          <label className={labelClass}>Home Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-lora text-sm text-ink-muted">$</span>
            <input
              type="number"
              min="0"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              className={`${inputClass} pl-6`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Down Payment</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              {downMode === "dollar" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-lora text-sm text-ink-muted">$</span>
              )}
              <input
                type="number"
                min="0"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className={`${inputClass} ${downMode === "dollar" ? "pl-6" : ""}`}
              />
              {downMode === "percent" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-lora text-sm text-ink-muted">%</span>
              )}
            </div>
            <div className="flex border border-border overflow-hidden shrink-0">
              {(["percent", "dollar"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDownMode(mode)}
                  className={`px-3 py-2 font-raleway text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                    downMode === mode
                      ? "bg-primary text-white"
                      : "bg-white text-ink-muted hover:bg-surface"
                  }`}
                >
                  {mode === "percent" ? "%" : "$"}
                </button>
              ))}
            </div>
          </div>
          {result && (
            <p className="mt-1 font-lora text-xs text-ink-muted">
              {formatCurrency(result.dp)} ({result.downPct.toFixed(1)}%)
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Interest Rate</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-lora text-sm text-ink-muted">%</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Loan Term</label>
          <div className="flex border border-border overflow-hidden">
            {([30, 15] as const).map((term) => (
              <button
                key={term}
                onClick={() => setLoanTerm(term)}
                className={`flex-1 py-2.5 font-raleway text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  loanTerm === term
                    ? "bg-primary text-white"
                    : "bg-white text-ink-muted hover:bg-surface"
                }`}
              >
                {term}-Year Fixed
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col">
        {result ? (
          <div className="border border-border-light bg-surface p-6 flex flex-col gap-6 h-full">
            <div className="text-center">
              <p className={labelClass + " text-center"}>Estimated Monthly Payment</p>
              <p className="font-raleway font-bold text-4xl text-primary mt-1">
                {formatCurrency(result.monthly)}
              </p>
              <p className="font-lora text-xs text-ink-muted mt-1">
                Principal &amp; interest only
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Loan Amount", value: formatCurrency(result.principal) },
                { label: "Down Payment", value: formatCurrency(result.dp) },
                { label: "Total Interest", value: formatCurrency(result.totalInterest) },
                {
                  label: "Total Cost",
                  value: formatCurrency(result.principal + result.totalInterest + result.dp),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-border-light pb-3 last:border-0 last:pb-0">
                  <span className="font-raleway text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</span>
                  <span className="font-lora text-sm text-ink font-medium">{value}</span>
                </div>
              ))}
            </div>

            <p className="font-lora text-xs text-ink-muted leading-relaxed mt-auto">
              This estimate does not include property taxes, homeowners insurance, or HOA fees. Contact a lender for a full quote.
            </p>
          </div>
        ) : (
          <div className="border border-border-light bg-surface p-6 flex items-center justify-center h-full min-h-[200px]">
            <p className="font-lora text-sm text-ink-muted text-center">
              Enter a home price and interest rate to see your estimate.
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button href="/contact" variant="outline" className="w-full">
            Connect with a Local Lender
          </Button>
        </div>
      </div>
    </div>
  );
}
