// -----------------------------------------------------------------------------
// ADMIN TEAM ACCOUNTS (demo login)
//
// SECURITY NOTE — READ THIS:
// This is a front-end-only prototype. These credentials ship inside the browser
// bundle, so this login keeps casual visitors out but is NOT real access
// control — a technical person can read the code or edit local storage.
// For genuine "only my group can access" enforcement, move auth to the server
// (Supabase Auth + a Postgres row-level policy on an `is_staff` / role column).
// Until then: don't put anything truly sensitive behind this gate, and change
// these passwords before sharing the link.
//
// Add or remove your group members here. Each account is tied to one role, and
// that role decides which admin tabs they can see. Only 'superadmin' can switch
// between role views.
// -----------------------------------------------------------------------------
export const ADMIN_ACCOUNTS = [
  { username: 'jideofor', password: 'change-me-super', name: 'Jideofor P.', role: 'superadmin' },
  { username: 'moderator', password: 'change-me-mod', name: 'Listings Moderator', role: 'moderator' },
  { username: 'verify', password: 'change-me-ver', name: 'Verification Team', role: 'verification' },
  { username: 'support', password: 'change-me-sup', name: 'Customer Support', role: 'support' },
  { username: 'finance', password: 'change-me-fin', name: 'Finance & Revenue', role: 'finance' },
  { username: 'marketing', password: 'change-me-mkt', name: 'Marketing & Content', role: 'marketing' },
]

export function findAccount(username, password) {
  const u = String(username || '').trim().toLowerCase()
  return ADMIN_ACCOUNTS.find((a) => a.username.toLowerCase() === u && a.password === password) || null
}
