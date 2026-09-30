"use client";

import { FormEvent, useState } from "react";
import { InfoShell, INK, INK_MUTED, PAPER_CARD, BRASS, LINE } from "../_components/InfoShell";

const SUPPORT_EMAIL = "accqudo@gmail.com";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const message = String(form.get("message") || "").trim();

    const mailSubject = subject || "Accqudo Support Request";
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;

    setSent(true);
  }

  return (
    <InfoShell title="Contact Accqudo" eyebrow="Accqudo · Support">
      <p>
        For account, test, payment, subscription, privacy or general support questions, email
        the Accqudo team at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <div
        className="my-8 border p-6"
        style={{ backgroundColor: PAPER_CARD, borderColor: LINE }}
      >
        <p className="text-xs uppercase tracking-wider" style={{ color: BRASS }}>
          Support email
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-2 inline-block text-lg font-semibold"
          style={{ color: INK, fontFamily: "var(--font-mono)" }}
        >
          {SUPPORT_EMAIL}
        </a>
      </div>

      <h2>Send an email</h2>
      <p>
        Fill in the form below. When you submit it, your device's configured email application
        will open with Accqudo's support address and your message pre-filled.
      </p>

      <form onSubmit={handleSubmit} className="not-prose mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold" style={{ color: INK }}>
              Your name
            </span>
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              className="w-full border bg-transparent px-4 py-3 text-sm outline-none focus:ring-1"
              style={{ borderColor: LINE, color: INK }}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold" style={{ color: INK }}>
              Your email
            </span>
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className="w-full border bg-transparent px-4 py-3 text-sm outline-none focus:ring-1"
              style={{ borderColor: LINE, color: INK }}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold" style={{ color: INK }}>
            Subject
          </span>
          <input
            required
            name="subject"
            type="text"
            className="w-full border bg-transparent px-4 py-3 text-sm outline-none"
            style={{ borderColor: LINE, color: INK }}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold" style={{ color: INK }}>
            Message
          </span>
          <textarea
            required
            name="message"
            rows={7}
            className="w-full resize-y border bg-transparent px-4 py-3 text-sm outline-none"
            style={{ borderColor: LINE, color: INK }}
          />
        </label>

        <button
          type="submit"
          className="px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: BRASS }}
        >
          Open Email & Send
        </button>

        {sent && (
          <p className="text-xs" style={{ color: INK_MUTED }}>
            Your email application should now be open. If it did not open, email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold">
              {SUPPORT_EMAIL}
            </a>{" "}
            directly.
          </p>
        )}
      </form>

      <h2 className="mt-10">When contacting support</h2>
      <p>
        For payment or subscription issues, include the account email and payment/order reference
        if available. Do not send passwords, OTPs, card numbers, CVV values or other secret
        authentication information by email.
      </p>
    </InfoShell>
  );
}
