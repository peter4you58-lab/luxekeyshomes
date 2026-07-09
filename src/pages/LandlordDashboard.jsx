import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useListings, useThreads, useEscrows, addThreadMessage } from '../data/store'
import { PERSONAS } from '../data/personas'
import { naira, priceLabel, priceSuffix } from '../utils'
import DashboardHead, { FindPropertiesLink } from '../components/DashboardHead'
import StatusBadge from '../components/StatusBadge'
import EscrowTracker from '../components/EscrowTracker'
import { VerifiedListingBadge, IdVerifiedBadge } from '../components/Badges'

// The landlord persona owns their seed listings plus anything created via /list.
function ownsListing(l, name) {
  return l.landlord?.name === name || String(l.id).startsWith('user-')
}

function InquiryCard({ thread }) {
  const [reply, setReply] = useState('')
  const c = thread.tenantCard
  return (
    <div className="form-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <strong>{thread.listingTitle}</strong>
        <StatusBadge status={c.status || 'pending'} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-700)', margin: '12px 0 4px' }}>
        Tenant credential card
      </div>
      <div className="profile-card" style={{ margin: 0 }}>
        <div className="pc-name">{c.fullName}</div>
        <div className="pc-rows">
          <span>Occupation: <b style={{ color: 'var(--ink)' }}>{c.occupation || '—'}</b></span>
          <span>Purpose: <b style={{ color: 'var(--ink)' }}>{c.purpose || '—'}</b></span>
          <span>Employer: <b style={{ color: 'var(--ink)' }}>{c.employer || '—'}</b></span>
          <span>Household: <b style={{ color: 'var(--ink)' }}>{c.household || '—'}</b></span>
          {c.budget ? <span>Budget/yr: <b style={{ color: 'var(--ink)' }}>{naira(c.budget)}</b></span> : null}
        </div>
      </div>

      <div className="thread" style={{ maxHeight: 180, marginTop: 12 }}>
        {thread.messages.length === 0 && <p className="hint" style={{ textAlign: 'center' }}>No messages yet.</p>}
        {thread.messages.map((m, i) => (
          <div key={i} className={'msg msg--' + m.from}>{m.text}</div>
        ))}
      </div>
      <div className="msg-compose">
        <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to tenant…" onKeyDown={(e) => { if (e.key === 'Enter' && reply.trim()) { addThreadMessage(thread.id, 'landlord', reply.trim()); setReply('') } }} />
        <button className="btn btn-primary btn-sm" onClick={() => { if (reply.trim()) { addThreadMessage(thread.id, 'landlord', reply.trim()); setReply('') } }}>Send</button>
      </div>
    </div>
  )
}

export default function LandlordDashboard() {
  const listings = useListings()
  const threads = useThreads()
  const escrows = useEscrows()
  const persona = PERSONAS.landlord
  const [tab, setTab] = useState('listings')
  const [dismissed, setDismissed] = useState(false)

  const mine = listings.filter((l) => ownsListing(l, persona.name))
  const mineIds = new Set(mine.map((l) => l.id))
  const inquiries = threads.filter((t) => mineIds.has(t.listingId))
  const myEscrows = escrows.filter((e) => mineIds.has(e.listingId))

  const active = mine.filter((l) => l.status === 'verified')
  const pending = mine.filter((l) => l.status !== 'verified' && l.status !== 'rejected')
  const rejected = mine.filter((l) => l.status === 'rejected')

  const tabs = [
    { key: 'listings', label: 'My listed properties', count: mine.length },
    { key: 'inquiries', label: 'Tenant inquiries', count: inquiries.length },
    { key: 'escrow', label: 'Escrows', count: myEscrows.length },
  ]

  const latestInquiry = inquiries[0]

  return (
    <div className="wrap section">
      <FindPropertiesLink />
      <DashboardHead
        persona={persona}
        title="Verified Landlord Portal"
        subtitle="Submit property checklists, review incoming tenant credential cards, and manage verified escrows."
        tabs={tabs}
        active={tab}
        onTab={setTab}
      />

      {latestInquiry && !dismissed && (
        <div className="whatsapp-alert">
          <div>
            <div className="wa-title">📲 WhatsApp integration (simulated)</div>
            <div className="wa-body">New inquiry on “{latestInquiry.listingTitle}” from {latestInquiry.tenantName}.</div>
          </div>
          <button className="linkbtn" style={{ color: 'var(--green-700)' }} onClick={() => setDismissed(true)}>Clear notifications</button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {tab === 'listings' && (
          mine.length ? (
            <>
              {[['Active — verified', active], ['Pending verification', pending], ['Rejected', rejected]].map(([label, group]) =>
                group.length ? (
                  <div key={label} style={{ marginBottom: 22 }}>
                    <h3 style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 12 }}>{label} ({group.length})</h3>
                    <div className="grid">
                      {group.map((l) => (
                        <Link to={`/listing/${l.id}`} className="card" key={l.id}>
                          <div className="card__body" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                              {l.inspected ? <VerifiedListingBadge /> : <StatusBadge status={l.status} />}
                              {l.landlord?.idVerified && <IdVerifiedBadge />}
                            </div>
                            <div className="card__title">{l.title}</div>
                            <div className="card__where">{l.area ? l.area + ', ' : ''}{l.state}</div>
                            <div className="card__foot">
                              <div className="card__price">{priceLabel(l)} <span>{priceSuffix(l)}</span></div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
              <Link to="/list" className="btn btn-gold">+ List new property</Link>
            </>
          ) : (
            <div className="empty">
              <h3>No properties yet</h3>
              <p><Link to="/list" style={{ color: 'var(--green-700)', textDecoration: 'underline' }}>List your first property</Link> — free, no agent.</p>
            </div>
          )
        )}

        {tab === 'inquiries' && (
          inquiries.length ? (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {inquiries.map((t) => <InquiryCard key={t.id} thread={t} />)}
            </div>
          ) : (
            <div className="empty">
              <h3>No inquiries yet</h3>
              <p>When a tenant messages one of your listings, their credential card appears here — before you reply. Try it: switch to the Tenant perspective and message one of your homes.</p>
            </div>
          )
        )}

        {tab === 'escrow' && (
          myEscrows.length ? (
            <div style={{ display: 'grid', gap: 14 }}>
              {myEscrows.map((e) => <EscrowTracker key={e.id} escrow={e} />)}
            </div>
          ) : (
            <div className="empty"><h3>No escrows yet</h3><p>Deposits paid on your listings show their escrow state here.</p></div>
          )
        )}
      </div>
    </div>
  )
}
