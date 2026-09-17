"use client";

import type { InterventionWithMember } from "@/lib/api";
import { EmptyBlock } from "./ui";

export function CampaignTracker({ interventions }: { interventions: InterventionWithMember[] }) {
  if (interventions.length === 0) {
    return <EmptyBlock message='No outreach logged yet. Use "Log outreach" on a ranked member above to record one.' />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4 font-medium">Member</th>
            <th className="py-2 pr-4 font-medium">Message</th>
            <th className="py-2 pr-4 font-medium">Channel</th>
            <th className="py-2 pr-4 font-medium">Sent</th>
            <th className="py-2 pr-4 font-medium">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {interventions.map((i) => (
            <tr key={i.id} className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium text-slate-900">{i.memberName ?? i.memberId}</td>
              <td className="max-w-xs truncate py-2 pr-4 text-slate-600" title={i.message}>
                {i.message}
              </td>
              <td className="py-2 pr-4 text-slate-600">{i.channel}</td>
              <td className="py-2 pr-4 text-slate-500">{new Date(i.sentAt).toLocaleString()}</td>
              <td className="py-2 pr-4">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Sent
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
