"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  PaperPlaneTilt,
  WarningCircle,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/config";

type Status = "idle" | "submitting" | "success" | "error";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink transition focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20";
const labelCls = "block text-sm font-medium text-ink";

export default function LeadForm({
  variant,
  subject,
}: {
  variant: "contact" | "report";
  subject: string;
}) {
  const t = useTranslations("form");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("_honey")) return;

    setStatus("submitting");
    try {
      const res = await fetch(site.formsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: subject,
          _template: "table",
          _captcha: "false",
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          phone: data.get("phone") || undefined,
          company: data.get("company") || undefined,
          message: data.get("message") || undefined,
          consent: data.get("consent") ? "yes" : "no",
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-leaf/30 bg-mist p-6">
        <CheckCircle size={28} weight="fill" className="text-leaf" />
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
          {t(variant === "report" ? "reportSuccessTitle" : "successTitle")}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {t(variant === "report" ? "reportSuccessBody" : "successBody")}
        </p>
      </div>
    );
  }

  const busy = status === "submitting";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        name="_honey"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`firstName-${variant}`} className={labelCls}>
            {t("firstName")} <span className="text-leaf">*</span>
          </label>
          <input
            id={`firstName-${variant}`}
            name="firstName"
            required
            autoComplete="given-name"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`lastName-${variant}`} className={labelCls}>
            {t("lastName")} <span className="text-leaf">*</span>
          </label>
          <input
            id={`lastName-${variant}`}
            name="lastName"
            required
            autoComplete="family-name"
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`email-${variant}`} className={labelCls}>
          {t("email")} <span className="text-leaf">*</span>
        </label>
        <input
          id={`email-${variant}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`extra-${variant}`} className={labelCls}>
          {variant === "report" ? t("company") : t("phone")}
        </label>
        <input
          id={`extra-${variant}`}
          name={variant === "report" ? "company" : "phone"}
          type={variant === "report" ? "text" : "tel"}
          autoComplete={variant === "report" ? "organization" : "tel"}
          className={inputCls}
        />
      </div>

      {variant === "contact" && (
        <div className="space-y-2">
          <label htmlFor="message-contact" className={labelCls}>
            {t("message")} <span className="text-leaf">*</span>
          </label>
          <textarea
            id="message-contact"
            name="message"
            required
            rows={5}
            className={`${inputCls} resize-y`}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <input
          id={`consent-${variant}`}
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-leaf accent-leaf focus:ring-2 focus:ring-leaf/20"
        />
        <label
          htmlFor={`consent-${variant}`}
          className="text-xs leading-relaxed text-ink-muted"
        >
          {t.rich("consent", {
            privacy: (chunks) => (
              <Link
                href="/privacy"
                className="font-medium text-leaf underline underline-offset-2 transition-colors hover:text-forest"
              >
                {chunks}
              </Link>
            ),
          })}{" "}
          <span className="text-leaf">*</span>
        </label>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-red-700" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {t("errorTitle")}
            </p>
            <p className="mt-0.5 text-sm text-red-800/80">{t("errorBody")}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PaperPlaneTilt size={16} weight="bold" />
        {busy
          ? t("submitting")
          : variant === "report"
            ? t("reportSubmit")
            : t("submit")}
      </button>
    </form>
  );
}
