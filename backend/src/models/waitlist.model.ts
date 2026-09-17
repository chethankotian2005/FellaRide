export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  /** free-text — e.g. "3rd Year CSE", "Tech Park shuttle riders" */
  affiliation?: string;
  createdAt: string;
}
