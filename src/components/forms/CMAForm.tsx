"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Button from "@/components/ui/Button";

const cmaSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter the property address"),
  city: z.string().min(2, "Please enter the city"),
  state: z.string().optional(),
  zip: z.string().min(5, "Please enter a valid ZIP code"),
  propertyType: z.enum(["single-family", "condo-townhome", "land", "multi-family", "other"]),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  squareFootage: z.string().optional(),
  yearBuilt: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair", "needs-work"]).optional(),
  improvements: z.string().optional(),
  timeline: z.enum(["asap", "1-3-months", "3-6-months", "6-plus-months", "just-curious"]),
  additionalNotes: z.string().optional(),
});

type CMAFormData = z.infer<typeof cmaSchema>;

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function CMAForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CMAFormData>({
    resolver: zodResolver(cmaSchema),
  });

  const onSubmit = async (data: CMAFormData) => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/cma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12 px-6 bg-primary-light border border-primary/20">
        <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-raleway font-bold text-xl text-ink mb-3">
          Request Received!
        </h3>
        <p className="font-lora text-ink-secondary leading-relaxed max-w-sm mx-auto">
          Thank you for submitting your CMA request. One of our agents will
          review your property information and be in touch shortly.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 border border-border-light bg-white font-lora text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors";
  const errorClass = "mt-1 font-raleway text-xs text-red-500";
  const labelClass =
    "block font-raleway text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-1.5";
  const selectClass =
    "w-full px-4 py-3 border border-border-light bg-white font-lora text-sm text-ink focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="CMA request form">
      {/* Contact info */}
      <fieldset className="mb-8">
        <legend className="font-raleway text-sm font-bold uppercase tracking-[0.15em] text-ink mb-5 pb-3 border-b border-border-light w-full">
          Your Contact Information
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cma-name" className={labelClass}>
              Full Name <span className="text-primary">*</span>
            </label>
            <input
              id="cma-name"
              type="text"
              autoComplete="name"
              className={inputClass}
              {...register("name")}
            />
            {errors.name && <p className={errorClass} role="alert">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="cma-email" className={labelClass}>
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              id="cma-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && <p className={errorClass} role="alert">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="cma-phone" className={labelClass}>
              Phone Number <span className="text-primary">*</span>
            </label>
            <input
              id="cma-phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              {...register("phone")}
            />
            {errors.phone && <p className={errorClass} role="alert">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="cma-timeline" className={labelClass}>
              Selling Timeline <span className="text-primary">*</span>
            </label>
            <select id="cma-timeline" className={selectClass} {...register("timeline")}>
              <option value="">Select a timeline...</option>
              <option value="asap">As soon as possible</option>
              <option value="1-3-months">1–3 months</option>
              <option value="3-6-months">3–6 months</option>
              <option value="6-plus-months">6+ months</option>
              <option value="just-curious">Just curious about value</option>
            </select>
            {errors.timeline && <p className={errorClass} role="alert">{errors.timeline.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Property info */}
      <fieldset className="mb-8">
        <legend className="font-raleway text-sm font-bold uppercase tracking-[0.15em] text-ink mb-5 pb-3 border-b border-border-light w-full">
          Property Information
        </legend>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="cma-address" className={labelClass}>
              Property Address <span className="text-primary">*</span>
            </label>
            <input
              id="cma-address"
              type="text"
              autoComplete="street-address"
              className={inputClass}
              {...register("address")}
            />
            {errors.address && <p className={errorClass} role="alert">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="cma-city" className={labelClass}>
                City <span className="text-primary">*</span>
              </label>
              <input
                id="cma-city"
                type="text"
                autoComplete="address-level2"
                className={inputClass}
                {...register("city")}
              />
              {errors.city && <p className={errorClass} role="alert">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="cma-state" className={labelClass}>State</label>
              <input
                id="cma-state"
                type="text"
                defaultValue="GA"
                className={inputClass}
                {...register("state")}
              />
            </div>
            <div>
              <label htmlFor="cma-zip" className={labelClass}>
                ZIP Code <span className="text-primary">*</span>
              </label>
              <input
                id="cma-zip"
                type="text"
                autoComplete="postal-code"
                className={inputClass}
                {...register("zip")}
              />
              {errors.zip && <p className={errorClass} role="alert">{errors.zip.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="cma-type" className={labelClass}>
              Property Type <span className="text-primary">*</span>
            </label>
            <select id="cma-type" className={selectClass} {...register("propertyType")}>
              <option value="">Select property type...</option>
              <option value="single-family">Single-Family Home</option>
              <option value="condo-townhome">Condo / Townhome</option>
              <option value="land">Land / Lot</option>
              <option value="multi-family">Multi-Family</option>
              <option value="other">Other</option>
            </select>
            {errors.propertyType && <p className={errorClass} role="alert">{errors.propertyType.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Property details */}
      <fieldset className="mb-8">
        <legend className="font-raleway text-sm font-bold uppercase tracking-[0.15em] text-ink mb-5 pb-3 border-b border-border-light w-full">
          Property Details <span className="font-normal normal-case text-ink-muted text-xs">(optional but helpful)</span>
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
          <div>
            <label htmlFor="cma-beds" className={labelClass}>Bedrooms</label>
            <input
              id="cma-beds"
              type="number"
              min="0"
              className={inputClass}
              placeholder="e.g. 3"
              {...register("bedrooms")}
            />
          </div>
          <div>
            <label htmlFor="cma-baths" className={labelClass}>Bathrooms</label>
            <input
              id="cma-baths"
              type="number"
              min="0"
              step="0.5"
              className={inputClass}
              placeholder="e.g. 2"
              {...register("bathrooms")}
            />
          </div>
          <div>
            <label htmlFor="cma-sqft" className={labelClass}>Sq. Footage</label>
            <input
              id="cma-sqft"
              type="number"
              min="0"
              className={inputClass}
              placeholder="e.g. 1800"
              {...register("squareFootage")}
            />
          </div>
          <div>
            <label htmlFor="cma-year" className={labelClass}>Year Built</label>
            <input
              id="cma-year"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              className={inputClass}
              placeholder="e.g. 2005"
              {...register("yearBuilt")}
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="cma-condition" className={labelClass}>Overall Condition</label>
          <select id="cma-condition" className={selectClass} {...register("condition")}>
            <option value="">Select condition...</option>
            <option value="excellent">Excellent — Move-in ready, updated</option>
            <option value="good">Good — Well maintained, minor updates needed</option>
            <option value="fair">Fair — Some updating/repairs needed</option>
            <option value="needs-work">Needs Work — Major repairs or renovation needed</option>
          </select>
        </div>

        <div>
          <label htmlFor="cma-improvements" className={labelClass}>Recent Improvements</label>
          <textarea
            id="cma-improvements"
            rows={3}
            className={inputClass}
            placeholder="List any recent renovations, upgrades, or improvements (e.g. new roof 2022, kitchen remodel, HVAC replaced)..."
            {...register("improvements")}
          />
        </div>
      </fieldset>

      {/* Additional notes */}
      <fieldset className="mb-8">
        <legend className="font-raleway text-sm font-bold uppercase tracking-[0.15em] text-ink mb-5 pb-3 border-b border-border-light w-full">
          Additional Notes
        </legend>
        <div>
          <label htmlFor="cma-notes" className={labelClass}>
            Anything else we should know?
          </label>
          <textarea
            id="cma-notes"
            rows={4}
            className={inputClass}
            placeholder="Tell us anything else that might be helpful — your goals, concerns, preferred contact times, etc."
            {...register("additionalNotes")}
          />
        </div>
      </fieldset>

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200" role="alert">
          <p className="font-raleway text-sm text-red-700">
            Something went wrong. Please try again or call us at (770) 855-7995.
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === "submitting"}
        className="w-full justify-center"
      >
        {status === "submitting" ? "Submitting..." : "Submit CMA Request"}
      </Button>

      <p className="mt-4 font-lora text-xs text-ink-muted text-center">
        One of our agents will review your information and follow up within 1–2
        business days.
      </p>
    </form>
  );
}
