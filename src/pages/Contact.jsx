import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addMessage } from '../data/store'
import { Seal } from '../components/Seal'

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ready = f.name.trim() && f.email.trim() && f.message.trim()

  function submit() {
    addMessage({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="wrap section">
        <div className="success-wrap rise">
          <div style={{ width: 'fit-content', margin: '0 auto 16px' }}>
            <Seal large label="Message received" />
          </div>
          <h1 style={{ fontSize: 30, marginBottom: 10 }}>Thanks — we&apos;ll be in touch</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17 }}>
            Your message has reached our team. We usually reply within one business day.
          </p>
          <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: 22 }}>
            Back to browse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <div className="form-shell">
        <span className="eyebrow">We&apos;re here to help</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', marginTop: 8 }}>Contact us</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8, marginBottom: 26 }}>
          Questions about listing, verification, or renting? Send us a note and a real person will respond.
        </p>

        <div className="form-card">
          <div className="two-col">
            <div className="field">
              <label>Your name</label>
              <input value={f.name} onChange={set('name')} placeholder="Full name" />
            </div>
            <div className="field">
              <label>Email or phone</label>
              <input value={f.email} onChange={set('email')} placeholder="How we reach you" />
            </div>
          </div>
          <div className="field">
            <label>Message</label>
            <textarea value={f.message} onChange={set('message')} placeholder="Tell us what you need…" />
          </div>
          <div className="form-actions">
            <span />
            <button className="btn btn-primary btn-lg" disabled={!ready} onClick={submit}>
              Send message
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 22, color: 'var(--ink-soft)', fontSize: 15 }}>
          <div>
            <strong style={{ color: 'var(--ink)' }}>Email</strong>
            <br />hello@luxekeyshomes.com
          </div>
          <div>
            <strong style={{ color: 'var(--ink)' }}>WhatsApp</strong>
            <br />+234 800 000 0000
          </div>
          <div>
            <strong style={{ color: 'var(--ink)' }}>Office</strong>
            <br />Abuja, Nigeria
          </div>
        </div>
      </div>
    </div>
  )
}
