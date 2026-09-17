"use client";

import { Fragment, useState } from "react";
import type { RankedMember } from "@/lib/api";
import { ScoreBar } from "./ui";

export function RankedMembersTable({
  members,
  onLogOutreach,
}: {
  members: RankedMember[];
  onLogOutreach: (member: RankedMember) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4 font-medium">Member</th>
            <th className="py-2 pr-4 font-medium">Priority</th>
            <th className="py-2 pr-4 font-medium">Connector</th>
            <th className="py-2 pr-4 font-medium">Likely driver</th>
            <th className="py-2 pr-4 font-medium">Early adopter</th>
            <th className="py-2 pr-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const expanded = expandedId === m.id;
            return (
              <Fragment key={m.id}>
                <tr
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  onClick={() => setExpandedId(expanded ? null : m.id)}
                >
                  <td className="py-2 pr-4">
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.publicSignals.affiliation}</p>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {m.computedScores.priorityScore}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <ScoreBar value={m.computedScores.connectorScore} colorClassName="bg-sky-500" />
                  </td>
                  <td className="py-2 pr-4">
                    <ScoreBar value={m.computedScores.likelyDriverScore} colorClassName="bg-amber-500" />
                  </td>
                  <td className="py-2 pr-4">
                    <ScoreBar value={m.computedScores.earlyAdopterScore} colorClassName="bg-violet-500" />
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogOutreach(m);
                      }}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Log outreach
                    </button>
                  </td>
                </tr>
                {expanded && (
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td colSpan={6} className="px-4 py-3">
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Why this score
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {m.reasons.map((r, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-slate-400">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
