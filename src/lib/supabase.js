import { createClient } from '@supabase/supabase-js'

// Reads keys from environment. If they're absent (e.g. before you've set up
// the project), `supabase` is null and the app falls back to localStorage —
// so the site never hard-breaks. Set the two VITE_ vars to go live.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const hasSupabase = !!supabase
