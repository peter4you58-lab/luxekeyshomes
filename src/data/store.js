import { useSyncExternalStore } from 'react'
import { SEED_LISTINGS } from './seed'
import { supabase } from '../lib/supabase'

// -----------------------------------------------------------------------------
// Data store — DUAL MODE.
//   * If Supabase keys are configured: listings, tenant profiles, and contact
//     messages live in real Postgres (shared across everyone, RLS-protected),
//     hydrated into the in-memory cache below and kept live via realtime.
//   * If not: everything falls back to localStorage exactly as before, so the
//     app keeps working before/without a backend.
// The in-memory `cache` stays the synchronous source of truth React reads, so
// the component API (useListings, addListing, setListingStatus, ...) is
// unchanged — pages don't need edits. Writes update the cache immediately
// (optimistic) and persist to Supabase in the background.
//
// Threads, escrow, saved bookmarks and session video remain local demo state.
// -----------------------------------------------------------------------------

const KEYS = {
  listings: 'pc.listings',
  tenants: 'pc.tenants',
  currentTenant: 'pc.currentTenant',
  requests: 'pc.requests',
  messages: 'pc.messages',
  threads: 'pc.threads',
  escrows: 'pc.escrows',
  saved: 'pc.saved',
}
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

const sessionVideos = new Map()
export function setSessionVideo(listingId, objectUrl) {
  sessionVideos.set(listingId, objectUrl)
  emit()
}
export function getSessionVideo(listingId) {
  return sessionVideos.get(listingId) || null
}
export function useSessionVideo(listingId) {
  return useSyncExternalStore(subscribe, () => sessionVideos.get(listingId) || null, () => null)
}

function loadRaw(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const cache = {
  listings: loadRaw(KEYS.listings, null) ?? SEED_LISTINGS,
  tenants: loadRaw(KEYS.tenants, []),
  currentTenant: loadRaw(KEYS.currentTenant, null),
  requests: loadRaw(KEYS.requests, []),
  messages: loadRaw(KEYS.messages, []),
  threads: loadRaw(KEYS.threads, []),
  escrows: loadRaw(KEYS.escrows, []),
  saved: loadRaw(KEYS.saved, {}),
}

// localStorage seeding only matters in fallback mode
if (!supabase) {
  try {
    if (localStorage.getItem(KEYS.listings) == null) {
      localStorage.setItem(KEYS.listings, JSON.stringify(cache.listings))
    }
  } catch {
    /* storage disabled — session runs from cache only */
  }
}

function commit(key, value) {
  cache[key] = value
  if (!supabase) {
    try {
      localStorage.setItem(KEYS[key], JSON.stringify(value))
    } catch (e) {
      console.warn('Storage write failed (quota?). Kept in memory this session.', e)
    }
  }
  emit()
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const now = () => new Date().toISOString()

// ---- row <-> object mappers (Supabase mode) ---------------------------------
const rowToListing = (r) => ({ ...r.data, id: r.id, status: r.status, verified: r.verified, inspected: r.inspected })
const listingToRow = (l) => ({
  id: l.id,
  owner: null,
  status: l.status,
  deal_type: l.dealType || 'rent',
  state: l.state || null,
  verified: !!l.verified,
  inspected: !!l.inspected,
  data: l,
})
const rowToTenant = (r) => ({ ...r.data, id: r.id, status: r.status })
const tenantToRow = (t) => ({ id: t.id, status: t.status || 'pending', data: t })
const rowToMessage = (r) => ({ id: r.id, name: r.name, email: r.email, message: r.message, read: r.read, createdAt: r.created_at })

// ---- hydrate from Supabase + realtime ---------------------------------------
async function hydrate() {
  if (!supabase) return
  try {
    const [{ data: listings }, { data: tenants }, { data: messages }] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
      supabase.from('tenants').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
    ])
    if (listings) cache.listings = listings.map(rowToListing)
    if (tenants) cache.tenants = tenants.map(rowToTenant)
    if (messages) cache.messages = messages.map(rowToMessage)
    emit()
  } catch (e) {
    console.warn('Supabase hydrate failed — showing seed/cached data.', e)
  }
}
if (supabase) {
  hydrate()
  supabase
    .channel('luxekeys-db')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, hydrate)
    .subscribe()
}

// ---- Listings ----------------------------------------------------------------
export function getListings() {
  return cache.listings
}
export function useListings() {
  return useSyncExternalStore(subscribe, getListings, getListings)
}
export function getListing(id) {
  return cache.listings.find((l) => l.id === id)
}
export function addListing(data) {
  const listing = {
    id: 'user-' + Date.now(),
    status: 'pending',
    verified: false,
    inspected: false,
    reviewNote: '',
    reviewedBy: '',
    reviewedAt: '',
    createdAt: now(),
    dealType: 'rent',
    agreementFee: 0,
    parking: '',
    furnishing: '',
    houseRules: '',
    mapLocation: '',
    preferredTenant: {},
    agentSubmitted: false,
    agentName: '',
    commissionPct: 0,
    photos: [],
    videoUrl: '',
    videoFileName: '',
    ...data,
    landlord: { verified: false, idVerified: false, since: String(new Date().getFullYear()), ...data.landlord },
  }
  cache.listings = [listing, ...cache.listings]
  if (supabase) {
    supabase.from('listings').insert(listingToRow(listing)).then(({ error }) => {
      if (error) console.warn('addListing persist failed', error)
    })
    emit()
  } else {
    commit('listings', cache.listings)
  }
  return listing
}
export function setListingStatus(id, status, { note = '', reviewedBy = 'Admin' } = {}) {
  let updated = null
  cache.listings = cache.listings.map((l) => {
    if (l.id !== id) return l
    const verified = status === 'verified'
    updated = {
      ...l,
      status,
      verified,
      inspected: verified,
      reviewNote: note,
      reviewedBy,
      reviewedAt: now(),
      landlord: { ...l.landlord, verified, idVerified: verified },
    }
    return updated
  })
  if (supabase && updated) {
    supabase
      .from('listings')
      .update({ status, verified: updated.verified, inspected: updated.inspected, data: updated })
      .eq('id', id)
      .then(({ error }) => error && console.warn('setListingStatus persist failed', error))
    // audit record — this is what makes "verified" provable
    supabase.from('verifications').insert({ listing_id: id, decision: status, note }).then(() => {})
    emit()
  } else {
    commit('listings', cache.listings)
  }
}

// ---- Tenants -----------------------------------------------------------------
export function getTenants() {
  return cache.tenants
}
export function useTenants() {
  return useSyncExternalStore(subscribe, getTenants, getTenants)
}
export function getCurrentTenant() {
  const id = cache.currentTenant
  return id ? cache.tenants.find((t) => t.id === id) || null : null
}
export function useTenant() {
  return useSyncExternalStore(subscribe, getCurrentTenant, getCurrentTenant)
}
export function saveTenant(profile) {
  const current = getCurrentTenant()
  if (current) {
    const updated = { ...current, ...profile, savedAt: now() }
    cache.tenants = cache.tenants.map((t) => (t.id === current.id ? updated : t))
    if (supabase) {
      supabase.from('tenants').update(tenantToRow(updated)).eq('id', updated.id).then(() => {})
      emit()
    } else {
      commit('tenants', cache.tenants)
    }
    return updated
  }
  const record = {
    id: 'tenant-' + Date.now(),
    status: 'pending',
    reviewNote: '',
    reviewedBy: '',
    reviewedAt: '',
    createdAt: now(),
    ...profile,
    savedAt: now(),
  }
  cache.tenants = [record, ...cache.tenants]
  cache.currentTenant = record.id
  if (supabase) {
    supabase.from('tenants').insert(tenantToRow(record)).then(({ error }) => error && console.warn('saveTenant persist failed', error))
    emit()
  } else {
    commit('tenants', cache.tenants)
    commit('currentTenant', record.id)
  }
  const guest = cache.saved.guest || []
  if (guest.length) commit('saved', { ...cache.saved, [record.id]: guest, guest: [] })
  return record
}
export function setTenantStatus(id, status, { note = '', reviewedBy = 'Admin' } = {}) {
  let updated = null
  cache.tenants = cache.tenants.map((t) => {
    if (t.id !== id) return t
    updated = { ...t, status, reviewNote: note, reviewedBy, reviewedAt: now() }
    return updated
  })
  if (supabase && updated) {
    supabase.from('tenants').update(tenantToRow(updated)).eq('id', id).then(() => {})
    emit()
  } else {
    commit('tenants', cache.tenants)
  }
}

// ---- Rental requests (local demo) -------------------------------------------
export function getRequests() {
  return cache.requests
}
export function useRequests() {
  return useSyncExternalStore(subscribe, getRequests, getRequests)
}
export function addRequest(req) {
  const record = { id: 'req-' + Date.now(), status: 'escrow_held', createdAt: now(), ...req }
  commit('requests', [record, ...cache.requests])
  return record
}

// ---- Contact messages --------------------------------------------------------
export function getMessages() {
  return cache.messages
}
export function useMessages() {
  return useSyncExternalStore(subscribe, getMessages, getMessages)
}
export function addMessage(msg) {
  const record = { id: 'msg-' + Date.now(), read: false, createdAt: now(), ...msg }
  cache.messages = [record, ...cache.messages]
  if (supabase) {
    supabase.from('messages').insert({ id: record.id, name: record.name, email: record.email, message: record.message, read: false })
      .then(({ error }) => error && console.warn('addMessage persist failed', error))
    emit()
  } else {
    commit('messages', cache.messages)
  }
  return record
}

// ---- Message threads (local demo) -------------------------------------------
export function getThreads() {
  return cache.threads
}
export function useThreads() {
  return useSyncExternalStore(subscribe, getThreads, getThreads)
}
export function getThreadFor(listingId, tenantId) {
  return cache.threads.find((t) => t.listingId === listingId && t.tenantId === tenantId)
}
export function startThread({ listing, tenant, message }) {
  const existing = getThreadFor(listing.id, tenant.id)
  if (existing) {
    if (message) addThreadMessage(existing.id, 'tenant', message)
    return existing
  }
  const card = {
    fullName: tenant.fullName,
    occupation: tenant.occupation,
    employer: tenant.employer,
    purpose: tenant.purpose,
    household: tenant.household,
    budget: tenant.budget,
    status: tenant.status,
  }
  const thread = {
    id: 'thread-' + Date.now(),
    listingId: listing.id,
    listingTitle: listing.title,
    landlordName: listing.landlord?.name || 'Landlord',
    tenantId: tenant.id,
    tenantName: tenant.fullName,
    tenantCard: card,
    messages: message ? [{ from: 'tenant', text: message, at: now() }] : [],
    createdAt: now(),
  }
  commit('threads', [thread, ...cache.threads])
  return thread
}
export function addThreadMessage(threadId, from, text) {
  commit(
    'threads',
    cache.threads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, { from, text, at: now() }] } : t)),
  )
}

// ---- Escrow state machine (local demo) --------------------------------------
export const ESCROW_TRANSITIONS = {
  ESCROW_HELD: ['VIEWING_CONFIRMED', 'DISPUTED', 'AUTO_REFUNDED'],
  VIEWING_CONFIRMED: ['RELEASED', 'DISPUTED'],
  DISPUTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['MEDIATION'],
  MEDIATION: ['REFUNDED', 'FORFEITED'],
  RELEASED: [],
  REFUNDED: [],
  FORFEITED: [],
  AUTO_REFUNDED: [],
}
export function getEscrows() {
  return cache.escrows
}
export function useEscrows() {
  return useSyncExternalStore(subscribe, getEscrows, getEscrows)
}
export function getEscrowFor(listingId, tenantId) {
  return cache.escrows.find((e) => e.listingId === listingId && e.tenantId === tenantId)
}
export function startEscrow({ listing, tenant, amount }) {
  const existing = getEscrowFor(listing.id, tenant.id)
  if (existing) return existing
  const escrow = {
    id: 'escrow-' + Date.now(),
    listingId: listing.id,
    listingTitle: listing.title,
    landlordName: listing.landlord?.name || 'Landlord',
    tenantId: tenant.id,
    tenantName: tenant.fullName,
    amount,
    state: 'ESCROW_HELD',
    history: [{ state: 'ESCROW_HELD', at: now() }],
    createdAt: now(),
  }
  commit('escrows', [escrow, ...cache.escrows])
  return escrow
}
export function advanceEscrow(id, toState) {
  commit(
    'escrows',
    cache.escrows.map((e) => {
      if (e.id !== id) return e
      if (!(ESCROW_TRANSITIONS[e.state] || []).includes(toState)) return e
      return { ...e, state: toState, history: [...e.history, { state: toState, at: now() }] }
    }),
  )
}

// ---- Saved / bookmarked listings (local) ------------------------------------
const EMPTY_SAVED = []
function savedKey() {
  return getCurrentTenant()?.id || 'guest'
}
export function getSaved() {
  return cache.saved[savedKey()] || EMPTY_SAVED
}
export function useSaved() {
  return useSyncExternalStore(subscribe, getSaved, getSaved)
}
export function isSaved(listingId) {
  return getSaved().includes(listingId)
}
export function toggleSaved(listingId) {
  const key = savedKey()
  const cur = cache.saved[key] || []
  const next = cur.includes(listingId) ? cur.filter((x) => x !== listingId) : [listingId, ...cur]
  commit('saved', { ...cache.saved, [key]: next })
}

// Reset the LOCAL demo interactions. In Supabase mode this does NOT touch the
// real database (listings/tenants/messages) — those are managed from /admin.
export function resetDemo() {
  ;[KEYS.currentTenant, KEYS.requests, KEYS.threads, KEYS.escrows, KEYS.saved].forEach((k) => {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
  })
  cache.currentTenant = null
  cache.requests = []
  cache.threads = []
  cache.escrows = []
  cache.saved = {}
  if (supabase) {
    hydrate()
  } else {
    ;[KEYS.listings, KEYS.tenants, KEYS.messages].forEach((k) => {
      try { localStorage.removeItem(k) } catch { /* ignore */ }
    })
    cache.listings = SEED_LISTINGS
    cache.tenants = []
    cache.messages = []
    try { localStorage.setItem(KEYS.listings, JSON.stringify(SEED_LISTINGS)) } catch { /* ignore */ }
  }
  emit()
}
