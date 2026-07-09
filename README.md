# LuxeKeys Homes — Investor Demo

Domain: **luxekeyshomes.com**. Brand mark is a gold key on deep green; icons, favicon, and a shareable social banner (`public/og-banner.png`) are included.

Nigeria's verified rental marketplace. Tenants rent **directly from verified landlords** — no agents, no agency fees, no Jiji guesswork. Every landlord and listing carries a gold **verification seal**, which is the whole pitch: trust, made visible.

This is a **React + Vite PWA**. It runs fully on free tiers and needs **no backend** for the demo — all data (listings, tenant profiles, requests) persists in the browser via `localStorage`, so investors can add a listing and it stays.

---

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

Build for production:

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build
```

---

## Deploy free (no sleep, always-on)

Push this folder to a GitHub repo, then connect it to **Vercel** or **Netlify** — both have a free tier that stays awake, unlike Render.

**Vercel**
1. Push to GitHub.
2. vercel.com → New Project → import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`. Deploy.
4. `vercel.json` (included) handles SPA routing so deep links like `/list` don't 404.

**Netlify**
1. Push to GitHub.
2. netlify.com → Add new site → import the repo.
3. Build `npm run build`, publish `dist`. `netlify.toml` and `public/_redirects` are already set.

### Point your Namecheap `.com` at it
- **Vercel:** Project → Settings → Domains → add your domain → Vercel shows an A record (or nameservers). In Namecheap → Domain → Advanced DNS, add the record Vercel gives you. SSL is automatic and free.
- **Netlify:** Site → Domain settings → add custom domain → follow the DNS record shown. SSL auto-provisions.

DNS can take a few minutes to a few hours to propagate.

---

## The 3-minute investor walkthrough

1. **Open the home page.** "This is Jiji, but every listing is verified — see the gold seals." Point at the seals.
2. **Filter by state.** Show the dropdown covers all 36 states + FCT. "Built to scale nationwide from day one."
3. **Open a listing.** Show the verified landlord, ₦0 agent fee, and the escrow line. "Rent goes straight to the landlord, held safely until move-in."
4. **List a property** (`List your property`). Fill the 3 steps live. It publishes as **Pending verification**. "New landlords list free, and nothing goes live as trusted until we check ID + ownership."
5. **Approve it.** On the new listing, click *Approve verification (demo)* and watch the seal appear. "That seal is our moat — it's what Jiji can't offer."
6. **Register as a tenant**, then request the home. "Landlords see who's renting before they say yes — occupation, purpose, household. No more renting blind."

Use **Reset demo data** in the footer to clear anything you added before the next pitch.

> Cold-start tip: the app is static, so there's no server to wake — but if you later add Supabase, ping it before a meeting so the free tier isn't paused.

---

## Admin sign-in & team access

The admin console (`/admin`) now uses **per-person staff login** instead of a shared passcode. Accounts live in `src/data/adminAccounts.js` — edit that file to add your group members. Each account is tied to one of the six roles, and that role decides which tabs they see. Only a **SuperAdmin** can preview other role views; everyone else is locked to their own.

Seeded accounts (change the passwords before sharing):

| Username | Role |
| --- | --- |
| jideofor | SuperAdmin |
| moderator | Listings Moderator |
| verify | Verification Team |
| support | Customer Support |
| finance | Finance & Revenue |
| marketing | Marketing & Content |

**Security reality (important):** this is a front-end-only prototype, so these credentials ship inside the browser bundle. The login keeps casual visitors and investors out of the admin, but it is **not** real access control — a technical person could read the code or edit local storage. For genuine "only my group can access" enforcement, move auth to the server: **Supabase Auth** plus a role/`is_staff` check enforced by Postgres row-level security. That's the same step your brief already scoped, and none of the admin UI has to change when you do it.

## Admin Overview (how many users)

SuperAdmin, Support, and Marketing see an **Overview** tab with live counts: total registered accounts, tenants registered, landlords, supply-partner agents, total/verified listings, conversations started, and escrow transactions — plus a **Registered accounts** table listing every account with its type, verification status, and join date. In the demo these are derived from the browser's data; in production they read from your Supabase tables.

## Four perspectives (sandbox switcher)

A green bar at the top lets anyone flip between **Tenant · Landlord · Agent · Admin** — no login needed, so an investor can walk every side of the marketplace in one session. (In production these become real accounts via Supabase Auth + role.)

- **Tenant** (`/dashboard/tenant`) — saved homes, My Messages (threads), Payments (escrow history), and the renter profile.
- **Landlord** (`/dashboard/landlord`) — the **Verified Landlord Portal**: My Listed Properties (Active / Pending / Rejected), **Tenant Inquiries** where each incoming message shows the tenant's credential card *before* the landlord replies, an Escrows view, and a simulated WhatsApp inquiry alert.
- **Agent** (`/dashboard/agent`) — the restricted **Supply Desk**: an amber "Tier 2 restricted" banner, a performance/accountability rating, a **capped commission** (5% or ₦150,000, tenant-visible and fixed), a **zero-contract-touch** notice (agents never touch escrow), and a "Submit for ownership review" form where every submission carries the public **"Pending independent ownership verification"** tag. Agent accounts sit entirely outside the admin roles.
- **Admin** (`/admin`) — the staff console (passcode `propadmin`) with the six-role permission model and Escrow & Disputes.

**The cross-perspective demo to show investors:** as **Tenant**, message a landlord's flat; switch to **Landlord** and the inquiry is already there with your profile card attached. That single loop is the whole "smarter than Jiji / WhatsApp" pitch, shown live.

Homepage now also has a **testimonials** section and every card/listing has a **save (bookmark)** control that feeds the tenant's Saved tab.

## Adding real property photos (making it look pro)

The 8 sample listings ship with branded placeholders (property icon + city label). To replace them with real photos, drop files named `prop-1.jpg` … `prop-8.jpg` into `public/images/` (see the guide in that folder for which listing is which). Until a file exists, the placeholder shows — nothing ever appears broken.

Two legit photo sources:
- **Your own inspection photos** — ideal, and they *are* the "authentic photography" pitch. A teammate with a phone can shoot a handful.
- **Free stock:** Unsplash or Pexels (both free for commercial use).

Listings created in-app via the Landlord flow already display their uploaded photos — this file convention is only for the built-in samples. Don't embed random images from a web search: most are copyrighted.

## Trust model: two separate badges (never merged)

- **Verified Listing** (green) — the property was physically inspected by a LuxeKeys field agent.
- **ID-Verified Landlord** (gold) — the owner passed identity KYC (vNIN).

These are always shown *separately*, on cards and on the listing page. Showing both, distinctly, is a differentiator no Nigerian competitor offers cleanly. In the demo, an admin approval turns both on; in production they're two independent checks (a listing can be ID-verified but not yet inspected).

## Buy / Rent / Land + four launch markets

A segmented Buy | Rent | Land control filters the marketplace. Rent shows ₦/year; Buy and Land show a one-off price. Launch markets: **Abuja, Lagos, Enugu, Delta** (built to scale to all 36 states + FCT).

## The core interaction loop

1. Tenant opens a verified listing and clicks **Message landlord**.
2. The system **auto-attaches the tenant's screening profile card** to the thread — the landlord sees who's asking *before* replying. This is the single interaction that makes the platform smarter than a WhatsApp group or Jiji.
3. **Request viewing** drops a viewing request into the same thread.
4. **Pay deposit** starts the **escrow state machine** with a visual tracker:

```
ESCROW_HELD -> VIEWING_CONFIRMED -> RELEASED   (auto 48h if no dispute)
           \-> DISPUTED -> UNDER_REVIEW -> MEDIATION -> REFUNDED | FORFEITED
ESCROW_HELD -> AUTO_REFUNDED   (landlord never confirms within 7 days)
```

Everything simulated is labelled as simulated. In production the money leg is Paystack/Flutterwave split-pay.

## Single listing page extras

Property details (parking, furnishing, bed/bath), a **Landlord's preferred tenant** panel (occupation, max occupants, non-smoker, payment terms — lifestyle only, never tribal/ethnic), a **House rules** section, photo gallery, and video walkthrough embed.

## Admin: six-role permission model (RBAC)

Open `/admin` (sign in — see "Admin sign-in" above) and use the **Viewing as** switcher to change role. Each role only sees the tabs its permissions allow — this is real role-based access, not a stripped-down single view:

| Role | Sees |
| --- | --- |
| SuperAdmin | Everything |
| Listings Moderator | Landlord listings + all listings |
| Verification Team | Landlord + tenant verification queues |
| Customer Support | Tenant profiles + messages |
| Finance & Revenue | Escrow & disputes (with ₦ held / disputes summary) |
| Marketing & Content | All listings |

Each role also gets its own summary bar (e.g. Finance: "₦X held · N escrow transactions · N disputes"). **Agent accounts are not an admin role** — they sit in a separate restricted tier, by design, to prevent privilege-escalation bugs. The **Escrow & Disputes** tab shows every deposit's state machine with advance controls for the Finance/Dispute team.

## Admin console & verification workflow (`/admin`)

You (the team) are the admin. Open `/admin`, unlock with the demo passcode **`propadmin`**, and you get a staff console — hidden from the public site chrome.

**The QA workflow**, for both landlords and tenants:

```
Pending  ->  In review  ->  Verified  |  Rejected  |  Needs info
```

1. A new landlord listing or tenant profile arrives as **Pending**.
2. Click **Review** -> **Begin QA review** (moves it to *In review*, opens the checklist).
3. Work the **QA checklist** — ID matches name, proof of ownership, photos genuine, etc. **Approve is locked until every box is ticked.**
4. **Approve & verify** (applies the gold seal live on the public listing), **Request more info**, or **Reject** with a reason. The decision, reviewer, and note are recorded so you can show investors your review funnel.

The console also has tabs for **rental requests** (with escrow state) and a **Messages** inbox fed by the Contact page.

> Replace the passcode with real staff sign-in (Supabase Auth + a role check) for production. The demo passcode is shown on the lock screen on purpose so your team and investors can get in.

## Contact Us

`/contact` — a working contact form. In the demo, submissions land in the admin **Messages** tab. In production, point it at email / Formspree / a Supabase table.

## Photos & video

- **Photos:** real file upload from phone or computer (landlord listings + tenant ID). Images are **resized on the device** to stay small so the no-backend demo doesn't blow past browser storage. In production these go to **Cloudinary**.
- **Video:** paste a **YouTube or Vimeo link** — it embeds on the listing. Direct video-file upload isn't in the demo (video files are too large to store client-side); that's a Cloudinary/Mux job once funded, and the UI says so honestly.

## What's real vs. simulated (be honest with investors)

| Piece | In this demo | In production |
| --- | --- | --- |
| Listings / profiles | Browser `localStorage` | Supabase (Postgres) |
| Landlord & tenant verification | Admin QA console + checklist (passcode gate) | Same workflow + real staff auth (Supabase) |
| Escrow / payments | "Escrow held" UI state | Paystack (test mode → live) |
| Photos | Real on-device upload (resized, stored locally) | Cloudinary uploads |
| Video | YouTube/Vimeo link embed | Direct upload via Cloudinary/Mux |
| Contact messages | Saved to admin inbox (localStorage) | Email / Formspree / Supabase |
| Maps / geo-search | Not wired | Google Maps API (free tier) |

The verification *process* is the pitch — the demo shows the *experience* of it. Have a one-paragraph answer ready for "how do you verify landlords at scale?"

---

## Going real: swap localStorage → Supabase

All data access lives in `src/data/store.js`. The component API (`useListings`, `addListing`, `saveTenant`, …) is deliberately isolated, so you replace the internals without touching any page:

- `listings` → a `listings` table
- tenant profile → a `profiles` row per authenticated user
- requests → a `rental_requests` table

Add Supabase Auth for real landlord/tenant sign-in, then wire Paystack test keys for the escrow flow. None of the UI needs to change.

---

## Project structure

```
src/
  data/
    states.js      # 36 states + FCT, property types
    seed.js        # sample listings for the demo
    store.js       # localStorage-backed store (swap for Supabase here)
  components/
    Header, Footer, ListingCard, Seal
  pages/
    Home           # hero + state filter + verified grid + "why we beat Jiji"
    ListingDetail  # listing + gallery + video + request-to-rent + escrow
    ListProperty   # landlord 3-step flow with photo upload + video link
    TenantRegister # tenant screening profile + ID upload
    Contact        # contact form -> admin inbox
    Admin          # staff verification console + QA workflow (the ops core)
public/
  manifest.webmanifest, sw.js, icons  # PWA (installable to home screen)
```

Change the brand name in one place: search `LuxeKeys` across `index.html`, `src/components/Header.jsx`, and `public/manifest.webmanifest`.

## Videos, photos & inspection map

- **Photos:** landlords upload real photos in the List Property flow (already working). Sample listings use `public/images/prop-N.jpg` — see that folder's guide.
- **Video:** landlords can either paste a YouTube/Vimeo link OR upload a video file. Uploaded files play back on the listing during the browser session (via an in-memory blob URL) so investors can see the upload-and-watch experience live; they don't persist past a refresh because video is too large for browser storage. Permanent streaming is a Cloudinary/Mux job in the funded build.
- **Location map:** each listing shows a **Location & inspection** section — an embedded map plus a **Get directions** button that opens Google Maps navigation so tenants can find the property to inspect it. Landlords set the address in the "Map location" field. The demo uses a keyless embed (approximate area); precise pins use a Google Maps API key + geocoding in production.
