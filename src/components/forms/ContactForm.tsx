"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Button from "@/components/ui/Button";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.enum(["buying", "selling", "cma", "general", "other"]),
  message: z.string().min(10, "Please enter a message (at least 10 characters)"),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
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
          Message Sent!
        </h3>
        <p className="font-lora text-ink-secondary max-w-sm mx-auto">
          Thank you for reaching out. We will get back to you as soon as
          possible, typically within one business day.
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Contact form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Full Name <span className="text-primary">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            className={inputClass}
            {...register("name")}
          />
          {errors.name && <p className={errorClass} role="alert">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email Address <span className="text-primary">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            className={inputClass}
            {...register("email")}
          />
          {errors.email && <p className={errorClass} role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>Phone Number</label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="Optional"
            {...register("phone")}
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClass}>
            I&apos;m interested in... <span className="text-primary">*</span>
          </label>
          <select id="contact-subject" className={selectClass} {...register("subject")}>
            <option value="">Select a topic...</option>
            <option value="buying">Buying a Home</option>
            <option value="selling">Selling My Home</option>
            <option value="cma">Free Home Valuation / CMA</option>
            <option value="general">General Inquiry</option>
            <option value="other">Other</option>
          </select>
          {errors.subject && <p className={errorClass} role="alert">{errors.subject.message}</p>}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-primary">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className={inputClass}
          placeholder="Tell us how we can help..."
          {...register("message")}
        />
        {errors.message && <p className={errorClass} role="alert">{errors.message.message}</p>}
      </div>

      {status === "error" && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200" role="alert">
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
        {status === "submitting" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
