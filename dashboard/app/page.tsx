import { WaitlistForm } from "@/components/waitlist-form";

const PILOT_COMMUNITY_NAME =
  process.env.NEXT_PUBLIC_PILOT_COMMUNITY_NAME ?? "your community";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row md:items-start md:gap-16">
        <div className="max-w-md">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Coming to {PILOT_COMMUNITY_NAME}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Share rides with people already on your route.
          </h1>
          <p className="mt-4 text-base text-slate-600">
            FellaRide matches drivers and passengers commuting the same way, at the same
            time — starting with your own community. Join the waitlist and we&apos;ll let
            you know the moment it opens up.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600">✓</span>
              Matched by real route and departure time, not guesswork
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600">✓</span>
              Invite people on your route directly — no cold outreach
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600">✓</span>
              Built for one community at a time, so matches are always nearby
            </li>
          </ul>
        </div>

        <div className="w-full max-w-sm">
          <WaitlistForm />
        </div>
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        FellaRide — built for the Butterfly Effect hackathon.
      </footer>
    </div>
  );
}
