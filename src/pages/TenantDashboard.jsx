import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useTenant,
  useListings,
  useThreads,
  useEscrows,
  useSaved,
  getListing,
} from '../data/store'
import { PERSONAS } from '../data/personas'
import { naira } from '../utils'
import ListingCard from '../components/ListingCard'
import DashboardHead, { FindPropertiesLink } from '../components/DashboardHead'
import EscrowTracker from '../components/EscrowTracker'
import StatusBadge from '../components/StatusBadge'

export default function TenantDashboard() {
  const tenant = useTenant()
  useListings()
  const threads = useThreads()
  const escrows = useEscrows()
  const saved = useSaved()
  const [tab, setTab] = useState('saved')

  const persona = tenant
    ? { name: tenant.fullName, role: 'Tenant Profile Active' }
    : PERSONAS.tenant

  const myThreads = tenant ? threads.filter((t) => t.tenantId === tenant.id) : []
  const myEscrows = tenant ? escrows.filter((e) => e.tenantId === tenant.id) : []
  const savedListings = saved.map((id) => getListing(id)).filter(Boolean)

  const tabs = [
    { key: 'saved', label: 'Saved', count: savedListings.length },
    { key: 'messages', label: 'My messages', count: myThreads.length },
    { key: 'payments', label: 'Payments', count: myEscrows.length },
    { key: 'profile', label: 'My profile' },
  ]

  return (
    <div className="wrap section">
      <FindPropertiesLink />
      <DashboardHead
        persona={persona}
        title="My Tenant Dashboard"
        subtitle="Save homes, track your conversations, and follow your escrow — all in one place."
        tabs={tabs}
        active={tab}
        onTab={setTab}
      />

      {!tenant && (
        <div className="callout" style={{ marginTop: 18 }}>
          <span>
            You haven&apos;t created a renter profile yet.{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#6b551d', textDecoration: 'underline' }}>Create one</Link>{' '}
            so landlords can see who&apos;s asking.
          </span>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        {tab === 'saved' &&
          (savedListings.length ? (
            <div className="grid">
              {savedListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No saved homes yet</h3>
              <p>
                Tap the bookmark on any listing to save it here.{' '}
                <Link to="/" style={{ color: 'var(--green-700)', textDecoration: 'underline' }}>Browse homes</Link>.
              </p>
            </div>
          ))}

        {tab === 'messages' &&
          (myThreads.length ? (
            <div className="review-list">
              {myThreads.map((t) => (
                <Link to={`/listing/${t.listingId}`} className="review" key={t.id} style={{ gridTemplateColumns: '1fr auto', textDecoration: 'none' }}>
                  <div>
                    <div className="review__title">{t.listingTitle}</div>
                    <div className="review__meta">
                      with {t.landlordName} · {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                    </div>
                  </div>
                  <span className="btn btn-ghost btn-sm">Open</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty"><h3>No conversations yet</h3><p>Message a landlord from any listing to start a thread.</p></div>
          ))}

        {tab === 'payments' &&
          (myEscrows.length ? (
            <div style={{ display: 'grid', gap: 14 }}>
              {myEscrows.map((e) => (
                <EscrowTracker key={e.id} escrow={e} />
              ))}
            </div>
          ) : (
            <div className="empty"><h3>No payments yet</h3><p>Your deposit and escrow status will appear here after you pay.</p></div>
          ))}

        {tab === 'profile' &&
          (tenant ? (
            <div className="form-card" style={{ maxWidth: 620 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <h3 style={{ fontSize: 20 }}>{tenant.fullName}</h3>
                <StatusBadge status={tenant.status} />
              </div>
              <div className="fact-row"><span>Occupation</span><strong>{tenant.occupation || '—'}</strong></div>
              <div className="fact-row"><span>Employer</span><strong>{tenant.employer || '—'}</strong></div>
              <div className="fact-row"><span>Purpose</span><strong>{tenant.purpose || '—'}</strong></div>
              <div className="fact-row"><span>Household</span><strong>{tenant.household || '—'}</strong></div>
              <div className="fact-row"><span>Preferred state</span><strong>{tenant.preferredState || 'Anywhere'}</strong></div>
              <div className="fact-row"><span>Budget / yr</span><strong>{tenant.budget ? naira(tenant.budget) : '—'}</strong></div>
              <Link to="/register" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>Edit profile</Link>
            </div>
          ) : (
            <div className="empty"><h3>No profile</h3><p><Link to="/register" style={{ color: 'var(--green-700)', textDecoration: 'underline' }}>Create your renter profile</Link>.</p></div>
          ))}
      </div>
    </div>
  )
}
