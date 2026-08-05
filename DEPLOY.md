# LuxeKeys — go live

Two phases. Phase A ships the code (site keeps working immediately, still on
localStorage). Phase B turns on the real backend. You can do B minutes or days
after A — nothing breaks in between.

────────────────────────────────────────────────────────
## PHASE A — push the code (site stays up the whole time)
────────────────────────────────────────────────────────
1. On github.com/peter4you58-lab/luxekeyshomes: Add file -> Upload files.
2. Drag the CONTENTS of this folder in (the `src` folder, `supabase`, `.github`,
   `package.json`, `package-lock.json`, `.env.example`). Paths must start at
   `src/...`, `package.json`, etc. — NOT inside a wrapper folder.
   You should see, among others:
     package.json      package-lock.json
     src/data/store.js  src/data/auth.js  src/lib/supabase.js
     src/pages/Admin.jsx  src/pages/Pricing.jsx
     src/App.jsx  src/components/Header.jsx
     supabase/schema.sql  .github/workflows/keep-alive.yml
3. Commit message: "Add Supabase backend + pricing page". Commit to `main`.
4. Vercel auto-deploys. Your site now has a Pricing page in the nav and is
   running exactly as before (localStorage) — safe. Nothing else changes yet.

   ⚠ package.json + package-lock.json MUST be included, or Vercel's build fails
   (they add the Supabase library).

────────────────────────────────────────────────────────
## PHASE B — turn on the real backend (free, ~15 min)
────────────────────────────────────────────────────────
1. supabase.com -> New project (free, no card). Region: EU West is fine for NG.
2. Settings -> API: copy the Project URL and the anon public key.
3. SQL Editor -> New query -> paste all of `supabase/schema.sql` -> Run.
   (Creates tables, row-level security, the verification audit table, the photo
   bucket, and seeds your sample listings.)
4. Make yourself staff:
   - Authentication -> Users -> Add user (your email + strong password).
   - SQL Editor, run with your email:
       update public.profiles set role='superadmin'
       where id=(select id from auth.users where email='you@luxekeyshomes.com');
5. Add the keys in Vercel -> Settings -> Environment Variables (Production + Preview):
       VITE_SUPABASE_URL        = your Project URL
       VITE_SUPABASE_ANON_KEY   = your anon public key
   Then Vercel -> Deployments -> Redeploy.
6. Keep it awake (free tier pauses after 7 days idle):
   GitHub repo -> Settings -> Secrets -> Actions -> add
       SUPABASE_KEEPALIVE_URL = https://YOUR-PROJECT.supabase.co/rest/v1/
   (The included workflow pings every 3 days.)

────────────────────────────────────────────────────────
## VERIFY IT'S LIVE
────────────────────────────────────────────────────────
- Open the site in two different browsers -> same listings (proves shared DB).
- /admin -> sign in with your EMAIL + password (not "jideofor").
- Approve a pending listing -> a row appears in the `verifications` table
  (Supabase -> Table editor). That's your audit trail.
- /list -> submit a property -> shows up in the admin queue as "pending".
- /pricing -> the business model is now visible to investors.

────────────────────────────────────────────────────────
## WHAT'S REAL vs. NEXT
────────────────────────────────────────────────────────
Real now: shared Postgres, staff auth + RLS (hardcoded-password hole closed),
public sees only verified listings, verification is an audited record, contact
messages + tenant submissions persist, photo bucket ready, pricing published.

Next milestone (not blocking launch): tenant/landlord login, which lets message
threads + escrow persist per-user securely. Deliberately not shipped as an open
table, because that would leak data.

Bridge to AWS later: this is plain Postgres + open-source Supabase. Lift the same
schema to RDS on EKS via Terraform when revenue justifies it — nothing wasted.
