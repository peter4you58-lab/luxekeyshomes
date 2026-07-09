// Demo personas for the sandbox perspective switcher. No real auth — this lets
// investors flip between Tenant / Landlord / Agent / Admin to see each side.
// In production these become real accounts (Supabase Auth + role).
export const PERSONAS = {
  tenant: { name: 'Adebayo Chukwuma', role: 'Tenant Profile Active' },
  landlord: { name: 'Mrs. Adeyemi', role: 'Identity-Verified Landlord' },
  agent: { name: 'Agent Collins', role: 'Supply Partner Tier' },
  admin: { name: 'SuperAdmin Director', role: 'Platform SuperAdmin' },
}

// Agent commission is strictly capped and tenant-visible — never editable.
export const AGENT_COMMISSION = { pct: 5, cap: 150000 }
export const AGENT_RATING = { score: 4.8, tours: 14 }
