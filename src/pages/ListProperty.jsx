import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addListing, setSessionVideo } from '../data/store'
import { STATES, PROPERTY_TYPES, DEAL_TYPES } from '../data/states'
import { fileToResizedDataUrl } from '../utils'
import { Seal } from '../components/Seal'
import StatusBadge from '../components/StatusBadge'

const EMPTY = {
  landlordName: '',
  phone: '',
  title: '',
  type: '',
  dealType: 'rent',
  state: '',
  area: '',
  rentPerYear: '',
  bedrooms: '',
  bathrooms: '',
  parking: '',
  furnishing: '',
  description: '',
  videoUrl: '',
  mapLocation: '',
  prefOccupation: '',
  maxOccupants: '',
  nonSmoker: false,
  paymentTerms: '',
  houseRules: '',
}
const MAX_PHOTOS = 5
const FURNISHINGS = ['Unfurnished', 'Semi-furnished', 'Fully furnished']

export default function ListProperty() {
  const [step, setStep] = useState(1)
  const [f, setF] = useState(EMPTY)
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [videoObjectUrl, setVideoObjectUrl] = useState('')
  const [created, setCreated] = useState(null)
  const navigate = useNavigate()

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const step1Ok = f.landlordName.trim() && f.phone.trim()
  const step2Ok = f.title.trim() && f.type && f.state && f.rentPerYear

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const room = MAX_PHOTOS - photos.length
    const next = []
    for (const file of files.slice(0, room)) {
      try {
        next.push(await fileToResizedDataUrl(file))
      } catch {
        /* skip unreadable file */
      }
    }
    setPhotos((p) => [...p, ...next])
    setUploading(false)
    e.target.value = '' // allow re-selecting the same file
  }

  function removePhoto(i) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
  }

  function handleVideo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Object URL streams the file without loading it all into memory — works
    // for large videos, plays this session only (not persisted).
    const url = URL.createObjectURL(file)
    setVideoFile(file)
    setVideoObjectUrl(url)
    e.target.value = ''
  }

  function publish() {
    const listing = addListing({
      title: f.title.trim(),
      type: f.type,
      dealType: f.dealType,
      state: f.state,
      area: f.area.trim(),
      rentPerYear: Number(f.rentPerYear) || 0,
      bedrooms: Number(f.bedrooms) || 0,
      bathrooms: Number(f.bathrooms) || 0,
      parking: f.parking.trim(),
      furnishing: f.furnishing,
      description: f.description.trim() || 'Direct-to-owner listing on LuxeKeys.',
      houseRules: f.houseRules.trim(),
      mapLocation: f.mapLocation.trim(),
      preferredTenant: {
        occupation: f.prefOccupation.trim(),
        maxOccupants: Number(f.maxOccupants) || undefined,
        nonSmoker: f.nonSmoker,
        paymentTerms: f.paymentTerms.trim(),
      },
      photos,
      videoUrl: f.videoUrl.trim(),
      videoFileName: videoFile ? videoFile.name : '',
      landlord: { name: f.landlordName.trim(), verified: false, idVerified: false },
    })
    if (videoObjectUrl) setSessionVideo(listing.id, videoObjectUrl)
    setCreated(listing)
  }

  if (created) {
    return (
      <div className="wrap section">
        <div className="success-wrap rise">
          <div style={{ width: 'fit-content', margin: '0 auto 16px' }}>
            <StatusBadge status="pending" />
          </div>
          <h1 style={{ fontSize: 34, marginBottom: 10 }}>Your property is submitted</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17 }}>
            <strong>{created.title}</strong> is in {created.state} — with no agent involved. It now enters our
            verification queue. Once our team confirms your identity and ownership, it goes live with the gold seal.
          </p>
          <div className="callout" style={{ textAlign: 'left', marginTop: 22 }}>
            <span>
              Verification takes 24–48 hours in the real product (ID + proof of ownership). Our review team approves it
              from the admin console, then the <Seal /> appears on your listing.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/listing/${created.id}`)}>
              View my listing
            </button>
            <Link to="/" className="btn btn-ghost btn-lg">
              Back to browse
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <div className="form-shell">
        <span className="eyebrow">For landlords</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', marginTop: 8 }}>List your property</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8, marginBottom: 26 }}>
          Reach tenants directly. No agent, no commission, no listing fee.
        </p>

        <div className="steps" aria-hidden="true">
          <div className={'steps__item' + (step >= 1 ? ' steps__item--done' : '')} />
          <div className={'steps__item' + (step >= 2 ? ' steps__item--done' : '')} />
          <div className={'steps__item' + (step >= 3 ? ' steps__item--done' : '')} />
        </div>

        <div className="form-card">
          {step === 1 && (
            <div className="rise">
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>Who owns this property?</h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 18, fontSize: 15 }}>
                This is you, the landlord — dealing directly, no middleman.
              </p>
              <div className="field">
                <label>Your full name</label>
                <input value={f.landlordName} onChange={set('landlordName')} placeholder="e.g. Mrs. Adeyemi" />
              </div>
              <div className="field">
                <label>
                  Phone number <span className="hint">— tenants reach you here after verification</span>
                </label>
                <input value={f.phone} onChange={set('phone')} placeholder="080..." inputMode="tel" />
              </div>
              <div className="callout">
                <span>Your identity and proof of ownership are checked before your listing gets the verified seal. Tenants trust the seal — it&apos;s what sets you apart from Jiji.</span>
              </div>
              <div className="form-actions">
                <span />
                <button className="btn btn-primary" disabled={!step1Ok} onClick={() => setStep(2)}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rise">
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>About the property</h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 18, fontSize: 15 }}>
                The details tenants search and filter by.
              </p>
              <div className="field">
                <label>Listing is for</label>
                <div className="segmented" style={{ display: 'flex' }}>
                  {DEAL_TYPES.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      className={f.dealType === d.key ? 'on' : ''}
                      style={{ flex: 1 }}
                      onClick={() => setF({ ...f, dealType: d.key })}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Listing title</label>
                <input value={f.title} onChange={set('title')} placeholder="e.g. 2-bedroom flat, tiled, all ensuite" />
              </div>
              <div className="two-col">
                <div className="field">
                  <label>Property type</label>
                  <select value={f.type} onChange={set('type')}>
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>State</label>
                  <select value={f.state} onChange={set('state')}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>
                  Area / neighbourhood <span className="hint">— optional</span>
                </label>
                <input value={f.area} onChange={set('area')} placeholder="e.g. Yaba, Lekki Phase 1, Independence Layout" />
              </div>
              <div className="two-col">
                <div className="field">
                  <label>Annual rent (₦)</label>
                  <input value={f.rentPerYear} onChange={set('rentPerYear')} placeholder="e.g. 1800000" inputMode="numeric" />
                </div>
                <div className="field">
                  <label>Bedrooms</label>
                  <input value={f.bedrooms} onChange={set('bedrooms')} placeholder="e.g. 2" inputMode="numeric" />
                </div>
              </div>
              <div className="field">
                <label>Bathrooms</label>
                <input value={f.bathrooms} onChange={set('bathrooms')} placeholder="e.g. 2" inputMode="numeric" />
              </div>
              <div className="two-col">
                <div className="field">
                  <label>Parking <span className="hint">— optional</span></label>
                  <input value={f.parking} onChange={set('parking')} placeholder="e.g. 2 cars" />
                </div>
                <div className="field">
                  <label>Furnishing <span className="hint">— optional</span></label>
                  <select value={f.furnishing} onChange={set('furnishing')}>
                    <option value="">Select</option>
                    {FURNISHINGS.map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn btn-primary" disabled={!step2Ok} onClick={() => setStep(3)}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rise">
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>Photos, video &amp; description</h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 18, fontSize: 15 }}>
                Real photos build trust and rent faster.
              </p>

              <div className="field">
                <label>
                  Property photos <span className="hint">— up to {MAX_PHOTOS}, from your phone or computer</span>
                </label>
                <label className="uploader">
                  <input type="file" accept="image/*" multiple onChange={handleFiles} hidden />
                  <span>{uploading ? 'Adding photos…' : photos.length ? 'Add more photos' : '📷 Tap to upload photos'}</span>
                </label>
                {photos.length > 0 && (
                  <div className="thumbs">
                    {photos.map((src, i) => (
                      <div className="thumb" key={i}>
                        <img src={src} alt={`Property photo ${i + 1}`} />
                        <button type="button" className="thumb__x" onClick={() => removePhoto(i)} aria-label="Remove photo">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label>
                  Video walkthrough <span className="hint">— optional</span>
                </label>
                <label className="uploader">
                  <input type="file" accept="video/*" onChange={handleVideo} hidden />
                  <span>{videoFile ? `✓ ${videoFile.name} — tap to replace` : '🎥 Upload a video file (plays in this demo session)'}</span>
                </label>
                {videoObjectUrl && (
                  <div className="video-box" style={{ marginTop: 10 }}>
                    <video src={videoObjectUrl} controls playsInline />
                  </div>
                )}
                <p className="hint" style={{ marginTop: 10, fontSize: 12.5 }}>Or paste a YouTube / Vimeo link instead:</p>
                <input value={f.videoUrl} onChange={set('videoUrl')} placeholder="https://youtu.be/..." style={{ marginTop: 6 }} />
                <p className="hint" style={{ marginTop: 6, fontSize: 12 }}>
                  Uploaded files play for this demo session; the full build streams video permanently from Cloudinary/Mux.
                </p>
              </div>

              <div className="field">
                <label>
                  Map location / address <span className="hint">— helps tenants find it for inspection</span>
                </label>
                <input value={f.mapLocation} onChange={set('mapLocation')} placeholder="e.g. 12 Adeyemi St, Yaba, Lagos" />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  value={f.description}
                  onChange={set('description')}
                  placeholder="Condition, power supply, water, security, what makes it a good home…"
                />
              </div>

              <div className="panel" style={{ marginTop: 0, marginBottom: 18 }}>
                <h3>Preferred tenant <span className="hint" style={{ fontWeight: 400 }}>— optional</span></h3>
                <div className="two-col">
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>Ideal occupation</label>
                    <input value={f.prefOccupation} onChange={set('prefOccupation')} placeholder="e.g. Working professional" />
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>Max occupants</label>
                    <input value={f.maxOccupants} onChange={set('maxOccupants')} placeholder="e.g. 3" inputMode="numeric" />
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Payment terms</label>
                  <input value={f.paymentTerms} onChange={set('paymentTerms')} placeholder="e.g. Annual, one year upfront" />
                </div>
                <label className="check" style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={f.nonSmoker} onChange={(e) => setF({ ...f, nonSmoker: e.target.checked })} />
                  <span>Non-smoker preferred</span>
                </label>
                <p className="hint" style={{ fontSize: 12, marginTop: 8 }}>
                  Lifestyle preferences only — tribal or ethnic filters are never allowed.
                </p>
              </div>

              <div className="field">
                <label>House rules <span className="hint">— optional</span></label>
                <textarea value={f.houseRules} onChange={set('houseRules')} placeholder="e.g. No loud parties after 10pm. Visitors sign in at the gate." style={{ minHeight: 80 }} />
              </div>

              <div className="callout">
                <span>
                  When you submit, your listing enters the <strong>verification queue</strong> as{' '}
                  <StatusBadge status="pending" />. It earns the <Seal /> once our team approves it. No agent ever touches it.
                </span>
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="btn btn-gold btn-lg" onClick={publish} disabled={uploading}>
                  Submit for verification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
