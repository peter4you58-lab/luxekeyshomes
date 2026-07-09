import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { saveTenant, useTenant } from '../data/store'
import { STATES } from '../data/states'
import { fileToResizedDataUrl } from '../utils'
import { Seal } from '../components/Seal'
import StatusBadge from '../components/StatusBadge'

const EMPTY = {
  fullName: '',
  phone: '',
  occupation: '',
  employer: '',
  purpose: '',
  household: '',
  preferredState: '',
  budget: '',
  idImage: '',
}

const PURPOSES = ['Residential — myself', 'Residential — family', 'Student', 'Corporate / staff housing', 'Short stay']
const HOUSEHOLD = ['Just me', '2 people', '3–4 people', '5+ people']

export default function TenantRegister() {
  const existing = useTenant()
  const [f, setF] = useState(existing || EMPTY)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ready = f.fullName.trim() && f.phone.trim() && f.occupation.trim() && f.purpose

  async function handleId(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await fileToResizedDataUrl(file, 1000, 0.7)
      setF((prev) => ({ ...prev, idImage: data }))
    } catch {
      /* ignore unreadable file */
    }
    e.target.value = ''
  }

  function submit() {
    saveTenant(f)
    if (next) navigate(next)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="wrap section">
        <div className="success-wrap rise">
          <div style={{ width: 'fit-content', margin: '0 auto 16px' }}>
            <StatusBadge status="pending" />
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 10 }}>Profile submitted for verification</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17 }}>
            Your renter profile is saved. Our team reviews it, and once you&apos;re verified you carry a trust badge that
            makes landlords far more likely to accept you — something Jiji can&apos;t offer. You can still browse and
            request homes while verification is in progress.
          </p>
          <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: 22 }}>
            Browse verified homes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <div className="form-shell">
        <span className="eyebrow">For tenants</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', marginTop: 8 }}>Create your renter profile</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8, marginBottom: 26 }}>
          Landlords rent faster to tenants they can see. Share the basics once — reuse it on every home you request.
        </p>

        <div className="form-card">
          <div className="two-col">
            <div className="field">
              <label>Full name</label>
              <input value={f.fullName} onChange={set('fullName')} placeholder="Your name" />
            </div>
            <div className="field">
              <label>Phone number</label>
              <input value={f.phone} onChange={set('phone')} placeholder="080..." inputMode="tel" />
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label>Occupation</label>
              <input value={f.occupation} onChange={set('occupation')} placeholder="e.g. Software engineer, trader, nurse" />
            </div>
            <div className="field">
              <label>
                Employer / business <span className="hint">— optional</span>
              </label>
              <input value={f.employer} onChange={set('employer')} placeholder="Where you work" />
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label>Purpose</label>
              <select value={f.purpose} onChange={set('purpose')}>
                <option value="">Select purpose</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Household size</label>
              <select value={f.household} onChange={set('household')}>
                <option value="">Select</option>
                {HOUSEHOLD.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label>
                Preferred state <span className="hint">— optional</span>
              </label>
              <select value={f.preferredState} onChange={set('preferredState')}>
                <option value="">Anywhere</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Budget / year (₦) <span className="hint">— optional</span>
              </label>
              <input value={f.budget} onChange={set('budget')} placeholder="e.g. 1500000" inputMode="numeric" />
            </div>
          </div>

          <div className="field">
            <label>
              ID document for verification <span className="hint">— optional, speeds up your trust badge</span>
            </label>
            <label className="uploader">
              <input type="file" accept="image/*" onChange={handleId} hidden />
              <span>{f.idImage ? '✓ ID uploaded — tap to replace' : '🪪 Upload NIN slip, voter’s card or driver’s licence'}</span>
            </label>
            {f.idImage && (
              <div className="thumbs">
                <div className="thumb">
                  <img src={f.idImage} alt="Uploaded ID document" />
                  <button type="button" className="thumb__x" onClick={() => setF({ ...f, idImage: '' })} aria-label="Remove ID">
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="callout">
            <span>Only landlords you request see your profile, and only our verification team sees your ID. We never sell your data or hand it to agents.</span>
          </div>

          <div className="form-actions">
            <span />
            <button className="btn btn-primary btn-lg" disabled={!ready} onClick={submit}>
              {next ? 'Save & continue to request' : 'Submit my profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
