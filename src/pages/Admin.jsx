import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useListings,
  useTenants,
  useMessages,
  useEscrows,
  useThreads,
  setListingStatus,
  setTenantStatus,
} from '../data/store'
import { naira, photoStyle, cover, STATUS_META, ESCROW_META } from '../utils'
import { findAccount } from '../data/adminAccounts'
import StatusBadge from '../components/StatusBadge'
import EscrowTracker from '../components/EscrowTracker'

// Six admin roles + the restricted agent tier sits outside this table entirely.
// Each role only sees the tabs it's permitted — a concrete RBAC demo.
const ROLES = {
  superadmin: { label: 'SuperAdmin', tabs: ['overview', 'landlords', 'tenants', 'escrows', 'messages', 'all'] },
  moderator: { label: 'Listings Moderator', tabs: ['landlords', 'all'] },
  verification: { label: 'Verification Team', tabs: ['landlords', 'tenants'] },
  support: { label: 'Customer Support', tabs: ['overview', 'tenants', 'messages'] },
  finance: { label: 'Finance & Revenue', tabs: ['escrows'] },
  marketing: { label: 'Marketing & Content', tabs: ['overview', 'all'] },
}
const HELD_STATES = ['ESCROW_HELD', 'VIEWING_CONFIRMED', 'DISPUTED', 'UNDER_REVIEW', 'MEDIATION']
const DISPUTE_STATES = ['DISPUTED', 'UNDER_REVIEW', 'MEDIATION']

const REVIEWER = 'Admin (QA)'

const LANDLORD_CHECKS = [
  'Government ID matches landlord name',
  'Proof of ownership / authority to let provided',
  'Property photos look genuine (not stock or duplicated)',
  'Phone number reachable',
  'No duplicate or known-scam listing',
]
const TENANT_CHECKS = [
  'ID document provided and legible',
  'Name on ID matches profile',
  'Occupation / employer plausible',
  'No prior flags on this person',
]

function useAdminAuth() {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pc.adminUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const login = (account) => {
    const safe = { username: account.username, name: account.name, role: account.role }
    try {
      sessionStorage.setItem('pc.adminUser', JSON.stringify(safe))
    } catch {
      /* ignore */
    }
    setUser(safe)
  }
  const logout = () => {
    try {
      sessionStorage.removeItem('pc.adminUser')
    } catch {
      /* ignore */
    }
    setUser(null)
  }
  return [user, login, logout]
}

function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState(false)
  const attempt = () => {
    const account = findAccount(u, p)
    if (account) onLogin(account)
    else setErr(true)
  }
  return (
    <div className="wrap section">
      <div className="admin-lock">
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Staff sign in</h1>
        <p className="admin-sub">Restricted to LuxeKeys team members.</p>
        <div className="form-card">
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Username</label>
            <input value={u} onChange={(e) => { setU(e.target.value); setErr(false) }} placeholder="e.g. jideofor" autoComplete="username" />
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Password</label>
            <input type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(false) }}
              onKeyDown={(e) => e.key === 'Enter' && attempt()} placeholder="Your password" autoComplete="current-password" />
            {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 6 }}>Incorrect username or password.</p>}
          </div>
          <button className="btn btn-primary btn-block" onClick={attempt}>Sign in</button>
          <p className="hint" style={{ fontSize: 12, marginTop: 12, textAlign: 'center' }}>
            Team accounts are managed in <code>src/data/adminAccounts.js</code>. This front-end login is for the prototype —
            real access control comes from server-side auth (Supabase).
          </p>
        </div>
      </div>
    </div>
  )
}

function ReviewDrawer({ item, onClose }) {
  const isTenant = item.kind === 'tenant'
  const listings = useListings()
  const tenants = useTenants()
  // Read LIVE data from the store so status transitions (pending -> in_review
  // -> decision) re-render the drawer instead of showing a stale snapshot.
  const data = isTenant ? tenants.find((t) => t.id === item.id) : listings.find((l) => l.id === item.id)
  const checksList = isTenant ? TENANT_CHECKS : LANDLORD_CHECKS
  const [checks, setChecks] = useState(() => checksList.map(() => false))
  const [note, setNote] = useState('')

  useEffect(() => {
    setChecks(checksList.map(() => false))
    setNote('')
  }, [item.id]) // reset when a different item opens

  if (!data) return null

  const allChecked = checks.every(Boolean)
  const decided = ['verified', 'rejected', 'needs_info'].includes(data.status)

  function decide(status) {
    if (isTenant) setTenantStatus(data.id, status, { note, reviewedBy: REVIEWER })
    else setListingStatus(data.id, status, { note, reviewedBy: REVIEWER })
    onClose()
  }
  function startReview() {
    if (isTenant) setTenantStatus(data.id, 'in_review', { reviewedBy: REVIEWER })
    else setListingStatus(data.id, 'in_review', { reviewedBy: REVIEWER })
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <StatusBadge status={data.status} />
          <button className="linkbtn" style={{ color: 'var(--ink-soft)' }} onClick={onClose}>
            Close ✕
          </button>
        </div>

        <h2>{isTenant ? data.fullName : data.title}</h2>
        <p className="admin-sub" style={{ marginBottom: 16 }}>
          {isTenant ? `${data.occupation || 'Tenant'} · ${data.purpose || ''}` : `${data.type} · ${data.area ? data.area + ', ' : ''}${data.state}`}
        </p>

        {/* Evidence */}
        {isTenant ? (
          <>
            {data.idImage ? (
              <img className="id-doc" src={data.idImage} alt="Tenant ID document" />
            ) : (
              <div className="callout" style={{ marginBottom: 10 }}>
                <span>No ID uploaded. Request one before verifying.</span>
              </div>
            )}
            <div className="fact-row"><span>Phone</span><strong>{data.phone || '—'}</strong></div>
            <div className="fact-row"><span>Employer</span><strong>{data.employer || '—'}</strong></div>
            <div className="fact-row"><span>Household</span><strong>{data.household || '—'}</strong></div>
            <div className="fact-row"><span>Preferred state</span><strong>{data.preferredState || 'Anywhere'}</strong></div>
            <div className="fact-row"><span>Budget/yr</span><strong>{data.budget ? naira(data.budget) : '—'}</strong></div>
          </>
        ) : (
          <>
            <div className="detail__photo" style={{ height: 170, ...photoStyle(data.id, cover(data)) }} />
            {data.photos && data.photos.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {data.photos.slice(1).map((p, i) => (
                  <div key={i} style={{ width: 60, height: 44, borderRadius: 6, ...photoStyle(data.id + i, p) }} />
                ))}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <div className="fact-row"><span>Landlord</span><strong>{data.landlord?.name || '—'}</strong></div>
              <div className="fact-row"><span>Rent/yr</span><strong>{naira(data.rentPerYear)}</strong></div>
              <div className="fact-row"><span>Bed / bath</span><strong>{data.bedrooms || '—'} / {data.bathrooms || '—'}</strong></div>
              <div className="fact-row"><span>Video</span><strong>{data.videoUrl ? 'Provided' : '—'}</strong></div>
            </div>
            <p className="detail__desc" style={{ fontSize: 14, marginTop: 12 }}>{data.description}</p>
          </>
        )}

        {decided ? (
          <div className="callout" style={{ marginTop: 16 }}>
            <span>
              Decision: <strong>{STATUS_META[data.status].label}</strong> by {data.reviewedBy || 'Admin'}.
              {data.reviewNote ? ` Note: “${data.reviewNote}”.` : ''}{' '}
              <button className="linkbtn" style={{ color: '#6b551d', fontWeight: 700 }} onClick={startReview}>
                Re-open review
              </button>
            </span>
          </div>
        ) : data.status === 'pending' ? (
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary btn-block" onClick={startReview}>
              Begin QA review
            </button>
            <p className="hint" style={{ fontSize: 12.5, marginTop: 8, textAlign: 'center' }}>
              Moves this into the reviewer&apos;s queue and opens the checklist.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>QA checklist</h3>
            {checksList.map((c, i) => (
              <label key={i} className={'check' + (checks[i] ? ' check--on' : '')}>
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => setChecks((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                />
                <span>{c}</span>
              </label>
            ))}

            <div className="field" style={{ marginTop: 12 }}>
              <label>Reviewer note <span className="hint">— shown to the user if you reject or request info</span></label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Proof of ownership was unreadable — please re-upload." style={{ minHeight: 70 }} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              <button className="btn btn-approve btn-sm" disabled={!allChecked} onClick={() => decide('verified')} title={!allChecked ? 'Tick every check first' : undefined}>
                ✓ Approve &amp; verify
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => decide('needs_info')}>
                Request more info
              </button>
              <button className="btn btn-reject btn-sm" onClick={() => decide('rejected')}>
                Reject
              </button>
            </div>
            {!allChecked && <p className="hint" style={{ fontSize: 12, marginTop: 8 }}>All checks must pass before you can approve.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  const [user, login, logout] = useAdminAuth()
  const listings = useListings()
  const tenants = useTenants()
  const messages = useMessages()
  const escrows = useEscrows()
  const threads = useThreads()
  const [roleOverride, setRoleOverride] = useState('')
  const [tab, setTab] = useState('landlords')
  const [open, setOpen] = useState(null)

  const pendingListings = useMemo(
    () => listings.filter((l) => l.status !== 'verified' && l.status !== 'rejected'),
    [listings],
  )
  const pendingTenants = useMemo(
    () => tenants.filter((t) => t.status !== 'verified' && t.status !== 'rejected'),
    [tenants],
  )
  const heldTotal = escrows.filter((e) => HELD_STATES.includes(e.state)).reduce((s, e) => s + (e.amount || 0), 0)
  const disputes = escrows.filter((e) => DISPUTE_STATES.includes(e.state)).length

  if (!user) return <Login onLogin={login} />

  // Non-superadmins are locked to their assigned role; only SuperAdmin can preview other role views.
  const isSuper = user.role === 'superadmin'
  const role = isSuper ? roleOverride || 'superadmin' : user.role
  const allowedTabs = ROLES[role].tabs
  const activeTab = allowedTabs.includes(tab) ? tab : allowedTabs[0]

  const TAB_LABELS = {
    overview: ['Overview', null],
    landlords: ['Landlords', pendingListings.length],
    tenants: ['Tenants', pendingTenants.length],
    escrows: ['Escrow & Disputes', escrows.length],
    messages: ['Messages', messages.length],
    all: ['All listings', null],
  }
  const summary = {
    superadmin: `Full access · ${pendingListings.length + pendingTenants.length} items awaiting review · ${disputes} disputes`,
    moderator: `${pendingListings.length} listings pending · ${listings.filter((l) => l.status === 'verified').length} verified · ${listings.filter((l) => l.status === 'rejected').length} rejected`,
    verification: `${pendingListings.length} listings + ${pendingTenants.length} tenants awaiting checks`,
    support: `${messages.length} messages · ${pendingTenants.length} tenant profiles to review`,
    finance: `${naira(heldTotal)} held · ${escrows.length} escrow transactions · ${disputes} disputes`,
    marketing: `${listings.filter((l) => l.status === 'verified').length} verified listings · 4 cities live`,
  }[role]

  return (
    <div className="wrap section">
      <div className="admin-head">
        <div>
          <span className="eyebrow">Staff console</span>
          <h1>Verification, escrow &amp; QA</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{ROLES[user.role].label}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          <Link to="/" className="btn btn-ghost btn-sm">← Site</Link>
        </div>
      </div>

      <div className="role-bar">
        <span style={{ fontWeight: 700 }}>Viewing as</span>
        {isSuper ? (
          <select value={role} onChange={(e) => setRoleOverride(e.target.value)} aria-label="Preview role">
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        ) : (
          <span style={{ fontWeight: 700, background: 'rgba(255,255,255,0.14)', padding: '6px 12px', borderRadius: 8 }}>
            {ROLES[role].label}
          </span>
        )}
        <span className="role-summary">{summary}</span>
      </div>
      <p className="admin-sub">
        {isSuper
          ? 'As SuperAdmin you can preview any role view. Each role only sees its permitted tabs — real role-based access, not a stripped-down single view.'
          : 'You see only what your role permits. Agent accounts sit entirely outside these roles.'}
      </p>

      <div className="tabs">
        {allowedTabs.map((t) => {
          const [label, count] = TAB_LABELS[t]
          return (
            <button key={t} className={'tab' + (activeTab === t ? ' tab--active' : '')} onClick={() => setTab(t)}>
              {label}
              {count != null && <span className="count">{count}</span>}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <Overview listings={listings} tenants={tenants} escrows={escrows} threads={threads} messages={messages} heldTotal={heldTotal} disputes={disputes} />
      )}

      {activeTab === 'landlords' && (
        <ReviewList items={pendingListings} kind="listing" empty="No landlord listings waiting. New submissions land here." onOpen={setOpen} />
      )}
      {activeTab === 'all' && <ReviewList items={listings} kind="listing" empty="No listings yet." onOpen={setOpen} />}
      {activeTab === 'tenants' && (
        <ReviewList items={pendingTenants} kind="tenant" empty="No tenants waiting. Renter profiles appear here for verification." onOpen={setOpen} />
      )}

      {activeTab === 'escrows' && (
        <>
          <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="stat"><div className="n">{naira(heldTotal)}</div><div className="l">Currently held in escrow</div></div>
            <div className="stat"><div className="n">{escrows.length}</div><div className="l">Escrow transactions</div></div>
            <div className="stat"><div className="n">{disputes}</div><div className="l">Open disputes</div></div>
          </div>
          {escrows.length === 0 ? (
            <div className="empty"><h3>No escrow activity</h3><p>When a tenant pays a deposit, the transaction and its state machine appear here.</p></div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {escrows.map((e) => (
                <EscrowTracker key={e.id} escrow={e} admin />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'messages' && (
        <div className="review-list">
          {messages.length === 0 && <div className="empty"><h3>No messages</h3><p>Contact form submissions arrive here.</p></div>}
          {messages.map((m) => (
            <div className="review" key={m.id} style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <div className="review__title">{m.name} <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>· {m.email}</span></div>
                <div className="review__meta">{new Date(m.createdAt).toLocaleString()}</div>
                <p style={{ marginTop: 8, marginBottom: 0 }}>{m.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <ReviewDrawer item={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

// Analytics: how many users, accounts registered, and platform activity.
function Overview({ listings, tenants, escrows, threads, messages, heldTotal, disputes }) {
  // Landlord "accounts" = distinct landlord names among non-agent listings.
  const landlordNames = new Set(
    listings.filter((l) => !l.agentSubmitted && l.landlord?.name).map((l) => l.landlord.name),
  )
  const agentNames = new Set(listings.filter((l) => l.agentSubmitted && l.agentName).map((l) => l.agentName))
  const totalAccounts = tenants.length + landlordNames.size + agentNames.size

  const accounts = [
    ...tenants.map((t) => ({ name: t.fullName, type: 'Tenant', status: t.status, when: t.createdAt })),
    ...[...landlordNames].map((n) => {
      const first = listings.filter((l) => l.landlord?.name === n).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))[0]
      return { name: n, type: 'Landlord', status: first?.status, when: first?.createdAt }
    }),
    ...[...agentNames].map((n) => ({ name: n, type: 'Agent', status: 'restricted', when: null })),
  ].sort((a, b) => (String(b.when || '') > String(a.when || '') ? 1 : -1))

  const stat = (n, l) => (
    <div className="stat"><div className="n">{n}</div><div className="l">{l}</div></div>
  )

  return (
    <>
      <div className="stat-row">
        {stat(totalAccounts, 'Total registered accounts')}
        {stat(tenants.length, 'Tenants registered')}
        {stat(landlordNames.size, 'Landlords')}
        {stat(agentNames.size, 'Supply-partner agents')}
      </div>
      <div className="stat-row">
        {stat(listings.length, 'Total listings')}
        {stat(listings.filter((l) => l.status === 'verified').length, 'Verified & live')}
        {stat(threads.length, 'Conversations started')}
        {stat(escrows.length, 'Escrow transactions')}
      </div>

      <h3 style={{ fontSize: 18, margin: '10px 0 12px' }}>Registered accounts ({accounts.length})</h3>
      <div className="acct-table">
        <div className="acct-row acct-row--head">
          <span>Name</span><span>Type</span><span>Status</span><span>Joined</span>
        </div>
        {accounts.map((a, i) => (
          <div className="acct-row" key={i}>
            <span style={{ fontWeight: 600 }}>{a.name}</span>
            <span>{a.type}</span>
            <span>{a.status ? <StatusBadge status={a.status === 'restricted' ? 'in_review' : a.status} /> : '—'}</span>
            <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{a.when ? new Date(a.when).toLocaleDateString() : '—'}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ReviewList({ items, kind, empty, onOpen }) {
  if (!items.length) {
    return (
      <div className="empty">
        <h3>All clear</h3>
        <p>{empty}</p>
      </div>
    )
  }
  return (
    <div className="review-list">
      {items.map((it) => {
        const isTenant = kind === 'tenant'
        const initials = (isTenant ? it.fullName : it.landlord?.name || 'PC')
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
        return (
          <div className="review" key={it.id}>
            {isTenant ? (
              <div className="landlord__avatar review__thumb" style={{ display: 'grid', placeItems: 'center', fontSize: 20 }}>
                {initials}
              </div>
            ) : (
              <div className="review__thumb" style={photoStyle(it.id, cover(it))} />
            )}
            <div>
              <div className="review__title">{isTenant ? it.fullName : it.title}</div>
              <div className="review__meta">
                {isTenant
                  ? `${it.occupation || 'Tenant'} · ${it.purpose || ''}`
                  : `${it.landlord?.name || 'Landlord'} · ${it.area ? it.area + ', ' : ''}${it.state} · ${naira(it.rentPerYear)}`}
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={it.status} />
              </div>
            </div>
            <div className="review__actions">
              <button className="btn btn-primary btn-sm" onClick={() => onOpen({ kind, id: it.id })}>
                Review
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
