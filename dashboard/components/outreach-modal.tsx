"use client";

import { useState } from "react";
import type { RankedMember } from "@/lib/api";

export function OutreachModal({
  member,
  onClose,
  onSubmit,
}: {
  member: RankedMember;
  onClose: () => void;
  onSubmit: (input: { memberId: string; message: string; channel: string }) => Promise<void>;
}) {
  const [message, setMessage] = useState(
    `Hey ${member.name.split(" ")[0]} — a few people from ${member.publicSignals.affiliation} are already ` +
      `carpooling on FellaRide. Want in?`,
  );
  const [channel, setChannel] = useState("email");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ memberId: member.id, message, channel });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log outreach");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-900">Log outreach to {member.name}</h3>
        <p className="mt-1 text-xs text-slate-500">
          Records a contextual message sent to this seed user for the campaign tracker.
        </p>

        <label className="mt-4 block text-xs font-medium text-slate-600">Channel</label>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="in-person">In person</option>
          <option value="sms">SMS</option>
        </select>

        <label className="mt-3 block text-xs font-medium text-slate-600">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || message.trim().length === 0}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Log outreach"}
          </button>
        </div>
      </div>
    </div>
  );
}
