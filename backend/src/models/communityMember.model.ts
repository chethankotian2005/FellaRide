export interface PublicSignals {
  /** number of public groups/pages/forums this person is associated with */
  groupMemberships: number;
  /** posts or comments per month in observed public sources */
  postFrequency: number;
  /** free-text snippets suggesting a commute pattern, e.g. "drives in from Kadri daily" */
  statedCommuteInfo: string[];
  /** proxy for social graph centrality (followers, connections, group co-membership) */
  connectionCount: number;
  /** whether public signals mention owning/driving a vehicle */
  mentionsVehicle: boolean;
  /** the community sub-group this person is associated with, e.g. a department or hostel block */
  affiliation: string;
}

export interface ComputedScores {
  connectorScore: number;
  likelyDriverScore: number;
  earlyAdopterScore: number;
  /** weighted combination of the three scores above, used for ranking */
  priorityScore: number;
}

export interface CommunityMember {
  id: string;
  name: string;
  publicSignals: PublicSignals;
  computedScores: ComputedScores;
  createdAt: string;
  updatedAt: string;
}
