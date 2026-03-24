"use client";

import { useState } from "react";
import { buttonClass, Field, inputClass, Notice, textareaClass } from "@/components/tools/common";

type FormState = {
  name: string;
  email: string;
  message: string;
  company: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
  company: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: data.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setStatus({
        tone: "success",
        message: "Message sent successfully",
      });
      setForm(initialState);
    } catch {
      setStatus({
        tone: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {status ? <Notice tone={status.tone}>{status.message}</Notice> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={120}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
          />
        </label>
      </div>

      <Field label="Message" hint="Include the tool name or page URL if you are reporting a problem.">
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={3000}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className={textareaClass}
        />
      </Field>

      <button type="submit" disabled={isSubmitting} className={`${buttonClass} w-full sm:w-auto`}>
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
