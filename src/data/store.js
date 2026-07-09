import { useSyncExternalStore } from 'react'
import { SEED_LISTINGS } from './seed'

// -----------------------------------------------------------------------------
// Demo data store. Backed by localStorage for persistence + offline (PWA); the
// source of truth React reads is an in-memory cache so getSnapshot returns a
// STABLE reference (a fresh JSON.parse each call causes an infinite loop).
//
// Verification workflow statuses (both listings and tenants):
//   pending -> in_review -> verified | rejected | needs_info
//
// >>> GOING REAL: swap load()/commit() for Supabase; add Auth + a role check on
//     /admin. Component API (useListings, addListing, setListingStatus, ...)
//     stays identical, so pages don't change.
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

// Session-only video playback. Video files are too large for localStorage, so
// uploaded videos live as in-memory object URLs (blob:) keyed by listing id.
// They play back during the browser session but don't survive a refresh — the
// real product streams them from Cloudinary/Mux. Not persisted on purpose.
const sessionVideos = new Map()
export function setSessionVideo(listingId, objectUrl) {
  sessionVideos.set(listingId, objectUrl)
  listeners.forEach((l) => l())
}
export function getSessionVideo(listingId) {
  return sessionVideos.get(listingId) || null
}
export function useSessionVideo(listingId) {
  return useSyncExternalStore(
    subscribe,
    () => sessionVideos.get(listingId) || null,
    () => null,
  )
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

try {
  if (localStorage.getItem(KEYS.listings) == null) {
    localStorage.setItem(KEYS.listings, JSON.stringify(cache.listings))
  }
} catch {
  /* storage disabled — session runs from cache only */
}

function commit(key, value) {
  cache[key] = value
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value))
  } catch (e) {
    // Most likely a quota error from too many uploaded images.
    console.warn('Storage write failed (quota?). Data kept in memory for this session.', e)
  }
  listeners.forEach((l) => l())
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const now = () => new Date().toISOString()

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
    status: 'pending', // new landlord listings await verification
    verified: false, // combined flag kept for back-compat
    inspected: false, // "Verified Listing" — field agent inspection
    reviewNote: '',
    reviewedBy: '',
    reviewedAt: '',
    createdAt: now(),
    dealType: 'rent', // rent | buy | land
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
    // idVerified = "Identity-Verified Landlord" (KYC / vNIN). Distinct from
    // inspected. The two badges are NEVER merged — that's the differentiator.
    landlord: { verified: false, idVerified: false, since: String(new Date().getFullYear()), ...data.landlord },
  }
  commit('listings', [listing, ...cache.listings])
  return listing
}
// Full status control for the admin workflow. Approving sets BOTH the listing
// inspection badge and the landlord KYC badge; they render separately.
export function setListingStatus(id, status, { note = '', reviewedBy = 'Admin' } = {}) {
  commit(
    'listings',
    cache.listings.map((l) => {
      if (l.id !== id) return l
      const verified = status === 'verified'
      return {
        ...l,
        status,
        verified,
        inspected: verified,
        reviewNote: note,
        reviewedBy,
        reviewedAt: now(),
        landlord: { ...l.landlord, verified, idVerified: verified },
      }
    }),
  )
}

// ---- Tenants (collection + "logged in" pointer) ------------------------------
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
// Create or update the active tenant's screening profile (starts pending).
export function saveTenant(profile) {
  const current = getCurrentTenant()
  if (current) {
    const updated = { ...current, ...profile, savedAt: now() }
    commit('tenants', cache.tenants.map((t) => (t.id === current.id ? updated : t)))
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
  commit('tenants', [record, ...cache.tenants])
  commit('currentTenant', record.id)
  // Carry over anything saved before the profile existed.
  const guest = cache.saved.guest || []
  if (guest.length) commit('saved', { ...cache.saved, [record.id]: guest, guest: [] })
  return record
}
export function setTenantStatus(id, status, { note = '', reviewedBy = 'Admin' } = {}) {
  commit(
    'tenants',
    cache.tenants.map((t) =>
      t.id === id ? { ...t, status, reviewNote: note, reviewedBy, reviewedAt: now() } : t,
    ),
  )
}

// ---- Rental requests (tenant -> landlord) ------------------------------------
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
  commit('messages', [record, ...cache.messages])
  return record
}

// ---- Message threads (tenant <-> landlord, with attached profile card) -------
export function getThreads() {
  return cache.threads
}
export function useThreads() {
  return useSyncExternalStore(subscribe, getThreads, getThreads)
}
export function getThreadFor(listingId, tenantId) {
  return cache.threads.find((t) => t.listingId === listingId && t.tenantId === tenantId)
}
// Open a thread and auto-attach the tenant's profile card. This is the core
// interaction: the landlord sees who's asking before replying.
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
    cache.threads.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, { from, text, at: now() }] } : t,
    ),
  )
}

// ---- Escrow state machine ----------------------------------------------------
// ESCROW_HELD -> VIEWING_CONFIRMED -> RELEASED (auto 48h if no dispute)
//            \-> DISPUTED -> UNDER_REVIEW -> MEDIATION -> REFUNDED | FORFEITED
// ESCROW_HELD -> AUTO_REFUNDED (landlord never confirms within 7 days)
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

// ---- Saved / bookmarked listings (per tenant) --------------------------------
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

// Danger button for demos: wipe everything back to seed.
export function resetDemo() {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
  cache.listings = SEED_LISTINGS
  cache.tenants = []
  cache.currentTenant = null
  cache.requests = []
  cache.messages = []
  cache.threads = []
  cache.escrows = []
  cache.saved = {}
  try {
    localStorage.setItem(KEYS.listings, JSON.stringify(SEED_LISTINGS))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}
