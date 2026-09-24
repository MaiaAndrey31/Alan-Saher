"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { bookingSchema, type BookingSchema } from "@/lib/validations/booking";
import type { BookingSettingsDto } from "@/lib/content/dto";
import { Reveal } from "@/components/Reveal";
import { MagneticButton } from "@/components/MagneticButton";
import { track } from "@/lib/analytics";

const FIELDS: {
  name: keyof BookingSchema;
  label: string;
  type?: string;
  half?: boolean;
  required?: boolean;
}[] = [
  { name: "name", label: "Name", required: true, half: true },
  { name: "company", label: "Company", half: true },
  { name: "whatsapp", label: "WhatsApp", required: true, half: true },
  { name: "email", label: "Email", type: "email", required: true, half: true },
  { name: "city", label: "City", required: true, half: true },
  { name: "eventType", label: "Event type", required: true, half: true },
  { name: "eventDate", label: "Event date", type: "date", half: true },
];

export function Booking({ settings }: { settings: BookingSettingsDto }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BookingSchema>({ resolver: zodResolver(bookingSchema) });

  const honeypotRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: BookingSchema) => {
    setStatus("loading");
    track("booking_submit");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, company_website: honeypotRef.current?.value ?? "" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
        if (body?.errors) {
          for (const [field, messages] of Object.entries(body.errors)) {
            if (messages?.[0]) setError(field as keyof BookingSchema, { message: messages[0] });
          }
        }
        throw new Error("Request failed");
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="booking" aria-label="Booking" className="relative border-t border-border py-[var(--section-padding-y)]">
      <div className="container-edit grid grid-cols-1 gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">{settings.eyebrow}</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            {settings.heading}
          </h2>
          <p className="mt-6 max-w-sm text-sm text-fg-muted">{settings.intro}</p>
        </Reveal>

        <div className="lg:col-span-7">
          {!settings.isFormEnabled ? (
            <p className="text-sm text-fg-muted">Booking requests are temporarily paused. Please check back soon.</p>
          ) : status === "success" ? (
            <div role="status" className="border border-border p-10 text-center">
              <p className="font-display text-2xl">{settings.successTitle}</p>
              <p className="mt-3 text-sm text-fg-muted">{settings.successMessage}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-xs uppercase tracking-[0.25em] text-accent"
              >
                Send another request
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(onSubmit)(e)} noValidate className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
              {/* Honeypot — invisible to real visitors, tabIndex/autoComplete off; a filled value signals a bot. */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <input ref={honeypotRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" />
              </div>
              {FIELDS.map((field) => (
                <div key={field.name} className={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label htmlFor={field.name} className="block text-xs uppercase tracking-[0.2em] text-fg-muted">
                    {field.label} {field.required && <span aria-hidden="true">*</span>}
                  </label>
                  <input
                    id={field.name}
                    type={field.type ?? "text"}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                    className="mt-2 w-full border-b border-border bg-transparent py-2 text-fg outline-none transition-colors focus:border-accent"
                    {...register(field.name)}
                  />
                  {errors[field.name] && (
                    <p id={`${field.name}-error`} className="mt-1 text-xs text-red-400">
                      {errors[field.name]?.message as string}
                    </p>
                  )}
                </div>
              ))}

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-xs uppercase tracking-[0.2em] text-fg-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-fg outline-none transition-colors focus:border-accent"
                  {...register("message")}
                />
              </div>

              <div className="sm:col-span-2">
                {status === "error" && (
                  <p role="alert" className="mb-4 text-sm text-red-400">
                    Something went wrong sending your request. Please try again.
                  </p>
                )}
                <MagneticButton>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="border border-fg px-8 py-3 text-xs uppercase tracking-[0.25em] transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending…" : "Request Booking"}
                  </button>
                </MagneticButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
