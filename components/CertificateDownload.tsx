"use client";

import { useState } from "react";
import { getLumaEventUrl } from "@/lib/brand";
import { downloadCertificatePng, sanitizeCertificateName } from "@/lib/certificate";
import { NAME_MAX } from "@/lib/constants";

export function CertificateDownload({ defaultName = "" }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const lumaUrl = getLumaEventUrl();

  async function handleDownload(event: React.FormEvent) {
    event.preventDefault();
    const safeName = sanitizeCertificateName(name);
    if (!safeName) {
      setError("Enter your name as you want it on the certificate.");
      return;
    }

    setError("");
    setPending(true);
    try {
      await downloadCertificatePng(safeName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download certificate.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card overflow-hidden">
      <form onSubmit={handleDownload} className="space-y-4 p-6 sm:p-8">
        <p className="eyebrow">Attendance</p>
        <h2 className="heading-md">Download your certificate</h2>
        <p className="text-sm text-body">
          Enter the name you want printed and download a certificate of
          attendance for this meetup.
        </p>
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Your name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            maxLength={NAME_MAX}
            className="field font-normal"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className="btn-app">
            {pending ? "Preparing…" : "Download certificate"}
          </button>
          {lumaUrl ? (
            <a
              href={lumaUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Open Luma event
            </a>
          ) : null}
        </div>
      </form>
    </section>
  );
}
