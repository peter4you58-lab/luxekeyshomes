import { useState } from 'react'
import { addThreadMessage, useThreads } from '../data/store'
import { naira } from '../utils'
import StatusBadge from './StatusBadge'

// The tenant's profile card is attached to the thread automatically — the
// landlord sees who's asking before replying. This is the core interaction.
function ProfileCard({ card }) {
  return (
    <div className="profile-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span className="pc-name">{card.fullName}</span>
        <StatusBadge status={card.status || 'pending'} />
      </div>
      <div className="pc-rows">
        <span>Occupation: <b style={{ color: 'var(--ink)' }}>{card.occupation || '—'}</b></span>
        <span>Purpose: <b style={{ color: 'var(--ink)' }}>{card.purpose || '—'}</b></span>
        <span>Employer: <b style={{ color: 'var(--ink)' }}>{card.employer || '—'}</b></span>
        <span>Household: <b style={{ color: 'var(--ink)' }}>{card.household || '—'}</b></span>
        {card.budget ? <span>Budget/yr: <b style={{ color: 'var(--ink)' }}>{naira(card.budget)}</b></span> : null}
      </div>
    </div>
  )
}

export default function ThreadPanel({ threadId, onClose }) {
  const threads = useThreads()
  const thread = threads.find((t) => t.id === threadId)
  const [text, setText] = useState('')
  if (!thread) return null

  function send() {
    if (!text.trim()) return
    addThreadMessage(thread.id, 'tenant', text.trim())
    setText('')
  }
  // Simulated landlord reply so the demo shows a two-sided conversation.
  function simulateReply() {
    addThreadMessage(thread.id, 'landlord', 'Thanks for your details — the flat is available. Would you like to book a viewing this weekend?')
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <strong>Message {thread.landlordName}</strong>
          <button className="linkbtn" style={{ color: 'var(--ink-soft)' }} onClick={onClose}>Close ✕</button>
        </div>
        <p className="admin-sub" style={{ marginBottom: 10 }}>{thread.listingTitle}</p>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-700)', marginBottom: 4 }}>
          Your profile card (shared with landlord)
        </div>
        <ProfileCard card={thread.tenantCard} />

        <div className="thread">
          {thread.messages.length === 0 && (
            <p className="hint" style={{ textAlign: 'center' }}>Say hello to start the conversation.</p>
          )}
          {thread.messages.map((m, i) => (
            <div key={i} className={'msg msg--' + m.from}>{m.text}</div>
          ))}
        </div>

        <div className="msg-compose">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message…"
          />
          <button className="btn btn-primary btn-sm" onClick={send}>Send</button>
        </div>
        <button className="linkbtn" style={{ marginTop: 10, color: 'var(--ink-soft)' }} onClick={simulateReply}>
          Simulate landlord reply (demo)
        </button>
      </div>
    </div>
  )
}
