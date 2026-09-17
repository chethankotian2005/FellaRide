# Project Brief: FellaRide — Build a Community from Zero

**Hackathon:** Manipal Hackathon 2026 (M#26) — "The Butterfly Effect"
**Domain:** Culture & Community
**Problem Statement ID:** P06
**SDG Alignment:** SDG 11 — Sustainable Cities and Communities
**Partner Organization:** [FellaRide](https://fellaride.com/)

---

## 1. Problem Statement (Official)

> **Build a Community from Zero: The FellaRide Butterfly Effect**
>
> Carpooling communities face a difficult cold-start problem: a platform can provide value only when enough people from the same community are already using it. A university, corporate organization, residential community, alumni network, or professional group may contain hundreds or thousands of potential users, but identifying the right people and convincing them to participate is difficult when the platform starts with zero users. Publicly available digital signals may contain clues about where these communities exist, how their members interact, where they commute from, and which people could become early adopters. The challenge is to turn these scattered signals into a practical understanding of a community and identify the people most likely to help it become active. The goal is not simply to find an audience, but to understand the community well enough to create the conditions for its first meaningful interactions.
>
> Design a system that can help FellaRide build an active community from zero users within a selected community. The system should discover relevant public digital communities and signals, identify potential drivers, passengers, connectors, and early adopters, and determine how to engage them through contextual rather than purely promotional interventions. Teams may explore publicly accessible websites, social-media pages, forums, event information, community networks, geographic data, and other legally accessible sources, while deciding how AI should discover, prioritize, personalize, and learn from these signals. The solution should go beyond registrations and demonstrate a growth loop from discovery and engagement to ride creation, matching, referrals, and repeat activity.
>
> Teams should determine their own strategy, technology, intervention model, and success metrics, with the central question being: **what is the smallest intervention that can create the largest Butterfly Effect and turn the first few users into an active community?**

---

## 2. Why This Problem Statement

- Directly echoes the hackathon's own theme ("Butterfly Effect") — the PS uses the exact phrase, which gives us a natural narrative hook for the presentation and video.
- Culture & Community is a lower-competition domain relative to Healthcare/Cybersecurity/AI, which tend to attract the largest share of teams.
- The problem is structurally similar to real-time matching systems (driver/passenger roles, notifications, live status) — a pattern we've already built experience with, so execution risk is lower than in an unfamiliar domain.
- The Marketing/Media Strategy and Monetisation Strategy judging criteria are *inherent* to this problem rather than bolted on — a good growth-loop design naturally answers both.

---

## 3. Our Interpretation of the Problem

We are not just building "a carpooling app." We are building a **cold-start engine**: a system that, given one target community (e.g., a specific college, tech park, or residential layout), does three things in sequence:

1. **Discover** — map out the target community's structure using publicly accessible signals (college social pages, event listings, public groups, geographic commute clusters, etc.).
2. **Prioritize** — identify which individuals in that community are likely to be high-value seeds: natural "connectors" (people central to social graphs), likely drivers (own vehicles, regular commute patterns), and likely early adopters (already active in relevant public discussions).
3. **Activate** — engage these seeds with contextual, non-spammy interventions (e.g., a personalized invite referencing a real shared context — "your department's Tuesday commute," not a generic ad) and track them through a growth loop: registration → first ride created/matched → referral → repeat usage.

The deliverable is a working prototype that demonstrates this pipeline end-to-end for one chosen pilot community, plus dashboards showing the discovery → activation → growth-loop metrics.

---

## 4. Proposed Tech Stack

Two front-of-house surfaces, one shared backend:

| Layer | Technology | Purpose |
|---|---|---|
| **Mobile app** (drivers & passengers) | **Flutter** | The actual carpooling experience — ride creation, matching, in-app notifications, referral sharing. This is the product the "activated" community members use daily. |
| **Web app** (growth/ops dashboard) | **Next.js** | Internal-facing tool for the discovery → prioritization → activation pipeline: visualize the mapped community graph, show ranked seed users, launch/track contextual outreach campaigns, and display growth-loop analytics (funnel from discovery to repeat rides). Also doubles as the public landing/waitlist page for a chosen pilot community. |
| **Backend** | Node.js / Express | Shared API layer for both surfaces — auth, ride matching logic, referral tracking, community graph storage. |
| **Database** | Firebase (Firestore + Realtime Database) | Live ride/match state, user profiles, referral chains. |
| **Auth & Messaging** | Firebase Auth + Cloud Messaging | User login and push notifications (ride matches, referral nudges). |
| **Discovery/signal layer** | Public APIs / scraping (with legal-use scoping) + a scoring model | Feeds the Next.js dashboard's "who to activate first" ranking. Can start rules-based (recency, connection count, stated commute info) with room to layer in an LLM-based signal summarizer if time allows. |
| **Hosting** | Render (backend), Vercel (Next.js), Flutter build via standard app distribution | Consistent with prior deployment patterns. |

**Why this split:** the mobile app is the *product* end-users experience (needs to feel like a native app — Flutter is the right call there), while the growth/ops dashboard is an internal, data-dense, fast-to-iterate tool best served by a web app — Next.js is the right call there. This also lets both halves of the team work in parallel without blocking each other.

---

## 5. Core Features to Build (Prototype Scope)

### Mobile App (Flutter)
- [ ] Onboarding referencing the pilot community context (not generic sign-up)
- [ ] Driver/passenger profile setup
- [ ] Ride creation & matching (route + time based)
- [ ] Push notifications for matches and referral prompts
- [ ] In-app referral flow ("invite someone from your route")

### Growth Dashboard (Next.js)
- [ ] Community graph visualization for the chosen pilot community
- [ ] Ranked list of candidate seed users (connectors / likely drivers / likely early adopters) with the signals behind each ranking shown (explainability matters for judging)
- [ ] Campaign/intervention tracker — what contextual message was sent to whom, and outcome
- [ ] Growth-loop funnel: Discovered → Contacted → Registered → First Ride → Referred Someone → Repeat Rider
- [ ] Public-facing landing/waitlist page for the pilot community

### Backend
- [ ] Matching algorithm (route + time overlap)
- [ ] Referral chain tracking (who invited whom, conversion rate per referrer)
- [ ] Signal scoring service consumed by the dashboard

---

## 6. Judging Criteria Alignment

| Criterion | How This Project Addresses It |
|---|---|
| **Innovation Beyond Requirements** | The discovery-and-prioritization engine (not just a carpooling app) is the differentiated piece — most teams will build the ride-matching app; few will build the cold-start intelligence layer. |
| **Feasibility** | Matching + referral + notifications are well-understood patterns; scoped to one pilot community keeps Round 2's 36-hour build realistic. |
| **Marketing/Media Strategy** | This *is* the product — the growth dashboard's outreach/campaign tracking directly demonstrates outreach strategy and target-audience understanding. |
| **Monetisation Strategy** | Natural extension: per-active-community licensing to FellaRide-style platforms, or a referral-driven growth-as-a-service model for other cold-start marketplaces (job boards, local marketplaces, etc.) |
| **Adherence to Format** | Use the official Round 1 PPT template; keep video ≤ 2 minutes (or ≤ 3 with prototype demo per Section 6.4 of the rulebook). |
| **Prototype Bonus** | A working demo of discovery ranking + mobile matching flow, even partially functional, should be pursued given the explicit bonus marks. |

---

## 7. Open Questions / To Decide as a Team

- Which single community will we pilot this on for the demo (a specific college department, hostel block, or office park)? A concrete, named pilot will make the video and PPT far more convincing than an abstract description.
- How far do we take the "discovery" layer for Round 1 — fully automated signal scraping, or a semi-manual/rules-based version with a believable narrative for how it'd scale?
- Team name and role split (mobile vs. dashboard vs. backend/algorithm).
- Whether to attempt the optional prototype for Round 1 or focus purely on PPT + video given the tight timeline to today's deadline.

---

## 8. Round 1 Submission Checklist (per official rulebook)

- [ ] Presentation built on the **official PPT template only** (no custom layouts) — submit as **PDF**
- [ ] No institute name/logo anywhere in the submission
- [ ] Video ≤ 2 minutes (no prototype) or ≤ 3 minutes (with prototype demo included)
- [ ] Every team member appears in the video
- [ ] Video hosted on Google Drive ("Anyone with the link") or YouTube (Unlisted/Public) — verify access in incognito before submitting
- [ ] File naming: `TeamID_TeamName_P06`
- [ ] If including a prototype: GitHub repo must be public
- [ ] Submit via the official portal only (no email/external channels)
