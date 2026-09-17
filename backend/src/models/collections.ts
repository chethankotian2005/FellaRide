// Firestore collection names, centralized so routes/services never hardcode strings.
export const Collections = {
  users: "users",
  rides: "rides",
  matches: "matches",
  referralEvents: "referralEvents",
  communityMembers: "communityMembers",
  interventions: "interventions",
  waitlist: "waitlist",
} as const;
