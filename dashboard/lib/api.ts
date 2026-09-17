const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    // Dashboard data (rankings, funnel, campaign log) should always reflect
    // the latest state — never cache across requests.
    cache: "no-store",
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // response wasn't JSON — fall back to statusText.
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

// ---- Types (mirror backend/src/models/*.ts and route response shapes) ----

export interface PublicSignals {
  groupMemberships: number;
  postFrequency: number;
  statedCommuteInfo: string[];
  connectionCount: number;
  mentionsVehicle: boolean;
  affiliation: string;
}

export interface ComputedScores {
  connectorScore: number;
  likelyDriverScore: number;
  earlyAdopterScore: number;
  priorityScore: number;
}

export interface RankedMember {
  id: string;
  name: string;
  publicSignals: PublicSignals;
  computedScores: ComputedScores;
  reasons: string[];
}

export interface RankedMembersResponse {
  pilotCommunity: string;
  count: number;
  members: RankedMember[];
}

export interface FunnelCounts {
  discovered: number;
  contacted: number;
  registered: number;
  firstRide: number;
  referred: number;
  repeatRider: number;
}

export interface InterventionWithMember {
  id: string;
  memberId: string;
  memberName: string | null;
  message: string;
  channel: string;
  sentAt: string;
}

export interface InterventionsResponse {
  count: number;
  interventions: InterventionWithMember[];
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  affiliation?: string;
  createdAt: string;
}

// ---- Endpoints ----

export function getRankedMembers(): Promise<RankedMembersResponse> {
  return request("/discovery/ranked-members");
}

export function getFunnel(): Promise<FunnelCounts> {
  return request("/referrals/funnel");
}

export function getInterventions(): Promise<InterventionsResponse> {
  return request("/discovery/interventions");
}

export function postIntervention(input: {
  memberId: string;
  message: string;
  channel: string;
}): Promise<InterventionWithMember> {
  return request("/discovery/intervention", { method: "POST", body: JSON.stringify(input) });
}

export function postWaitlistSignup(input: {
  name: string;
  email: string;
  affiliation?: string;
}): Promise<WaitlistEntry> {
  return request("/waitlist", { method: "POST", body: JSON.stringify(input) });
}
