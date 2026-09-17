"use client";

// NOTE ON AUTH: this route is intentionally open in this prototype. In a real
// deployment, this page would sit behind an internal-auth check — e.g.
// Next.js middleware verifying a Firebase session cookie restricted to a
// growth-team allowlist, redirecting unauthenticated requests to a login
// page before rendering anything below.

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  FunnelCounts,
  InterventionWithMember,
  RankedMember,
  getFunnel,
  getInterventions,
  getRankedMembers,
  postIntervention,
} from "@/lib/api";
import { Card, ErrorBlock, LoadingBlock, SectionHeading, StatCard } from "@/components/ui";
import { RankedMembersTable } from "@/components/ranked-members-table";
import { CampaignTracker } from "@/components/campaign-tracker";
import { FunnelChart } from "@/components/funnel-chart";
import { OutreachModal } from "@/components/outreach-modal";

interface DashboardData {
  pilotCommunity: string;
  members: RankedMember[];
  funnel: FunnelCounts;
  interventions: InterventionWithMember[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outreachTarget, setOutreachTarget] = useState<RankedMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ranked, funnel, interventions] = await Promise.all([
        getRankedMembers(),
        getFunnel(),
        getInterventions(),
      ]);
      setData({
        pilotCommunity: ranked.pilotCommunity,
        members: ranked.members,
        funnel,
        interventions: interventions.interventions,
      });
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `Backend returned ${e.status}: ${e.message}`
          : "Could not reach the backend. Is it running?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount pattern: `load` sets state asynchronously
    // inside its own then/catch/finally, not synchronously in the effect
    // body, so this isn't the render-cascade pattern the rule targets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">FellaRide Growth Dashboard</h1>
            {data && <p className="text-xs text-slate-500">{data.pilotCommunity}</p>}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        {loading && !data && <LoadingBlock label="Loading dashboard..." />}
        {error && !data && <ErrorBlock message={error} onRetry={load} />}

        {data && (
          <>
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Discovered" value={data.funnel.discovered} />
              <StatCard label="Contacted" value={data.funnel.contacted} />
              <StatCard label="Registered" value={data.funnel.registered} />
              <StatCard label="First ride" value={data.funnel.firstRide} />
              <StatCard label="Referred" value={data.funnel.referred} />
              <StatCard label="Repeat rider" value={data.funnel.repeatRider} />
            </section>

            <Card className="p-5">
              <SectionHeading
                title="Growth-loop funnel"
                subtitle="Discovered → Contacted → Registered → First ride → Referred → Repeat rider"
              />
              <FunnelChart funnel={data.funnel} />
            </Card>

            <Card className="p-5">
              <SectionHeading
                title="Ranked seed users"
                subtitle="Candidate connectors, likely drivers, and early adopters for this pilot community — click a row for the signals behind its score."
              />
              {data.members.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No ranked members yet.</p>
              ) : (
                <RankedMembersTable members={data.members} onLogOutreach={setOutreachTarget} />
              )}
            </Card>

            <Card className="p-5">
              <SectionHeading
                title="Campaign / intervention tracker"
                subtitle="Contextual outreach sent to seed users and its logged outcome."
              />
              <CampaignTracker interventions={data.interventions} />
            </Card>
          </>
        )}
      </main>

      {outreachTarget && (
        <OutreachModal
          member={outreachTarget}
          onClose={() => setOutreachTarget(null)}
          onSubmit={async (input) => {
            await postIntervention(input);
            await load();
          }}
        />
      )}
    </div>
  );
}
