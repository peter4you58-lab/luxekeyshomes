import { advanceEscrow, ESCROW_TRANSITIONS } from '../data/store'
import { ESCROW_META, ESCROW_MAIN_PATH, naira } from '../utils'

const ACTION_LABELS = {
  VIEWING_CONFIRMED: 'Confirm viewing',
  RELEASED: 'Release to landlord',
  DISPUTED: 'Raise dispute',
  UNDER_REVIEW: 'Move to review',
  MEDIATION: 'Escalate to mediation',
  REFUNDED: 'Refund tenant',
  FORFEITED: 'Forfeit to landlord',
  AUTO_REFUNDED: 'Auto-refund (7d no confirm)',
}

export default function EscrowTracker({ escrow, admin = false }) {
  const meta = ESCROW_META[escrow.state]
  const idx = ESCROW_MAIN_PATH.indexOf(escrow.state)
  const onMainPath = idx !== -1
  const next = ESCROW_TRANSITIONS[escrow.state] || []

  return (
    <div className="escrow-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{naira(escrow.amount)}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Deposit · {escrow.tenantName} → {escrow.landlordName}</div>
        </div>
        <span className="escrow-state-pill" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
      </div>

      <div className="escrow-steps" style={{ marginTop: 16 }}>
        {ESCROW_MAIN_PATH.map((s, i) => {
          const done = onMainPath && i < idx
          const current = onMainPath && i === idx
          return (
            <div key={s} className={'escrow-step' + (done ? ' done' : '') + (current ? ' current' : '')}>
              <span className="dot">{done ? '✓' : i + 1}</span>
              <span className="lbl">{ESCROW_META[s].label}</span>
            </div>
          )
        })}
      </div>

      {!onMainPath && (
        <div className="branch-note">
          Dispute path: {ESCROW_META[escrow.state].label}. This deposit left the standard flow.
        </div>
      )}

      {next.length > 0 && (
        <div className="escrow-actions">
          {next.map((to) => {
            const isNegative = ['DISPUTED', 'FORFEITED'].includes(to)
            return (
              <button
                key={to}
                className={'btn btn-sm ' + (isNegative ? 'btn-reject' : to === 'RELEASED' || to === 'REFUNDED' ? 'btn-approve' : 'btn-ghost')}
                onClick={() => advanceEscrow(escrow.id, to)}
              >
                {ACTION_LABELS[to] || to}
              </button>
            )
          })}
        </div>
      )}

      <p className="hint" style={{ fontSize: 12, marginTop: 10 }}>
        Simulated escrow — no real money moves. In production this is Paystack/Flutterwave split-pay.
        {admin ? ' 48h auto-release and 7-day auto-refund run on timers in the live system.' : ''}
      </p>
    </div>
  )
}
