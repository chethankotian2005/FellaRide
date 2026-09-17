"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FunnelCounts } from "@/lib/api";

const STAGE_LABELS: { key: keyof FunnelCounts; label: string }[] = [
  { key: "discovered", label: "Discovered" },
  { key: "contacted", label: "Contacted" },
  { key: "registered", label: "Registered" },
  { key: "firstRide", label: "First ride" },
  { key: "referred", label: "Referred someone" },
  { key: "repeatRider", label: "Repeat rider" },
];

const COLORS = ["#0ea5e9", "#38bdf8", "#34d399", "#10b981", "#a78bfa", "#f59e0b"];

export function FunnelChart({ funnel }: { funnel: FunnelCounts }) {
  const data = STAGE_LABELS.map(({ key, label }) => ({ stage: label, count: funnel[key] }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis
            type="category"
            dataKey="stage"
            width={110}
            tick={{ fontSize: 12, fill: "#334155" }}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
