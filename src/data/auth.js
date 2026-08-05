import { supabase } from '../lib/supabase'

// Real staff auth, backed by Supabase. Replaces the old client-side password
// list. Only accounts whose profile role is NOT 'member' can enter /admin —
// and row-level security enforces the same rule server-side, so it's real.

async function profileFor(user) {
  const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
  return data
}

export async function staffSignIn(email, password) {
  if (!supabase) throw new Error('Auth not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
  const profile = await profileFor(data.user)
  if (!profile || profile.role === 'member') {
    await supabase.auth.signOut()
    throw new Error('This account is not a staff member.')
  }
  return { name: profile.full_name || email, role: profile.role, username: email }
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
}

// Restore an existing staff session on page load (returns null if none / not staff).
export async function currentStaff() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const profile = await profileFor(session.user)
  if (!profile || profile.role === 'member') return null
  return { name: profile.full_name || session.user.email, role: profile.role, username: session.user.email }
}
