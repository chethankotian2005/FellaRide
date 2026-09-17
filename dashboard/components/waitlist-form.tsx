"use client";

import { FormEvent, useState } from "react";
import { ApiError, postWaitlistSignup } from "@/lib/api";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await postWaitlistSignup({ name, email, affiliation: affiliation || undefined });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong — try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-sm font-medium text-emerald-800">You&apos;re on the list! 🎉</p>
        <p className="mt-1 text-xs text-emerald-700">
          We&apos;ll reach out as soon as FellaRide opens up in your community.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-xs font-medium text-slate-600">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">
          Department / group <span className="text-slate-400">(optional)</span>
        </label>
        <input
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. 3rd Year CSE"
        />
      </div>

      {status === "error" && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Joining..." : "Join the waitlist"}
      </button>
    </form>
  );
}
