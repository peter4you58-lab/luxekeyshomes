import { useState } from 'react'
import { useListings, addListing } from '../data/store'
import { PERSONAS, AGENT_COMMISSION, AGENT_RATING } from '../data/personas'
import { STATES, PROPERTY_TYPES } from '../data/states'
import { naira } from '../utils'
import DashboardHead, { FindPropertiesLink } from '../components/DashboardHead'
import StatusBadge from '../components/StatusBadge'

const EMPTY = { title: '', type: '', state: '', area: '', rentPerYear: '' }

export default function AgentDashboard() {
  const listings = useListings()
  const persona = PERSONAS.agent
  const [f, setF] = useState(EMPTY)
  const [justAdded, setJustAdded] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ready = f.title.trim() && f.type && f.state && f.rentPerYear

  const submissions = listings.filter((l) => l.agentSubmitted)

  function submit() {
    addListing({
      title: f.title.trim(),
      type: f.type,
      dealType: 'rent',
      state: f.state,
      area: f.area.trim(),
      rentPerYear: Number(f.rentPerYear) || 0,
      description: 'Submitted by a supply-partner agent. Pending independent ownership verification.',
      agentSubmitted: true,
      agentName: persona.name,
      commissionPct: AGENT_COMMISSION.pct,
      landlord: { name: 'Owner (pending contact)', verified: false, idVerified: false },
    })
    setF(EMPTY)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2500)
  }

  return (
    <div className="wrap section">
      <FindPropertiesLink />
      <DashboardHead
        persona={persona}
        title="Agent Supply Desk"
        subtitle="Submit properties for independent ownership review. Your account is a restricted supply-partner tier."
      />

      {/* Restricted permissions banner */}
      <div className="agent-restricted">
        <div>
          <div className="ar-title">⚠️ Restricted partner account permissions</div>
          <p style={{ margin: '4px 0 0', fontSize: 14 }}>
            You are authenticated as an <strong>Agent Supply Partner</strong>. Under LuxeKeys rules you cannot view
            direct landlord–tenant contracts, adjust escrow, or touch rental deposits. Commissions are strictly capped.
          </p>
        </div>
        <span className="tier-pill">🔒 Tier 2 restricted</span>
      </div>

      {/* Three constraint cards */}
      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 18 }}>
        <div className="stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="ar-badge ar-badge--gold">{AGENT_RATING.score}</div>
            <div>
              <div className="l">Performance rating</div>
              <div style={{ fontWeight: 700 }}>Accountability score</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>★★★★★ ({AGENT_RATING.tours} physical tours led)</div>
            </div>
          </div>
        </div>
        <div className="stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="ar-badge ar-badge--green">₦{Math.round(AGENT_COMMISSION.cap / 1000)}k</div>
            <div>
              <div className="l">Capped commission</div>
              <div style={{ fontWeight: 700 }}>Tenant-visible &amp; fixed</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{AGENT_COMMISSION.pct}% of rent, max {naira(AGENT_COMMISSION.cap)}. Under-the-table fees barred.</div>
            </div>
          </div>
        </div>
        <div className="stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="ar-badge ar-badge--red">🚫</div>
            <div>
              <div className="l">Escrow access</div>
              <div style={{ fontWeight: 700, color: 'var(--danger)' }}>Zero contract touch</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Deposits move directly into landlord–tenant escrow, bypassing agents.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginTop: 22, alignItems: 'start' }}>
        {/* Submit for ownership review */}
        <div className="form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 18 }}>Submit listing for ownership review</h3>
            <span className="ownership-tag">Tag: ownership unverified</span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 0 }}>
            Every listing you submit carries the public label <strong style={{ color: 'var(--danger)' }}>“Pending independent ownership verification”</strong>{' '}
            until the landlord completes identity linkage. Agents never self-verify.
          </p>
          <div className="field"><label>Property title</label><input value={f.title} onChange={set('title')} placeholder="e.g. 2-bedroom flat, Surulere" /></div>
          <div className="two-col">
            <div className="field"><label>Type</label>
              <select value={f.type} onChange={set('type')}><option value="">Select</option>{PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            </div>
            <div className="field"><label>State</label>
              <select value={f.state} onChange={set('state')}><option value="">Select</option>{STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
          </div>
          <div className="two-col">
            <div className="field"><label>Area</label><input value={f.area} onChange={set('area')} placeholder="e.g. Surulere" /></div>
            <div className="field"><label>Annual rent (₦)</label><input value={f.rentPerYear} onChange={set('rentPerYear')} placeholder="e.g. 1500000" inputMode="numeric" /></div>
          </div>
          <button className="btn btn-primary" disabled={!ready} onClick={submit}>Submit for ownership review</button>
          {justAdded && <p style={{ color: 'var(--green-700)', fontSize: 13.5, marginTop: 10 }}>✓ Submitted — now pending independent ownership verification.</p>}
        </div>

        {/* My submitted properties */}
        <div className="form-card">
          <h3 style={{ fontSize: 17, marginBottom: 4 }}>My submitted properties ({submissions.length})</h3>
          {submissions.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>You haven&apos;t submitted any listings in this session.</p>
          ) : (
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {submissions.map((l) => (
                <div key={l.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <strong style={{ fontSize: 14 }}>{l.title}</strong>
                    <StatusBadge status={l.status} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{l.area ? l.area + ', ' : ''}{l.state} · {naira(l.rentPerYear)}/yr</div>
                  {l.status !== 'verified' && (
                    <div style={{ fontSize: 11.5, color: 'var(--danger)', fontWeight: 700, marginTop: 4 }}>Pending independent ownership verification</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
