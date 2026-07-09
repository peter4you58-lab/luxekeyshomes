import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getListing,
  useTenant,
  useListings,
  useThreads,
  useEscrows,
  startThread,
  addThreadMessage,
  startEscrow,
  getThreadFor,
  getEscrowFor,
  isSaved,
  toggleSaved,
  useSaved,
  useSessionVideo,
} from '../data/store'
import { naira, photoStyle, cover, embedUrl, priceLabel, priceSuffix } from '../utils'
import { VerifiedListingBadge, IdVerifiedBadge } from '../components/Badges'
import StatusBadge from '../components/StatusBadge'
import PhotoInner from '../components/PhotoInner'
import LocationMap from '../components/LocationMap'
import ThreadPanel from '../components/ThreadPanel'
import EscrowTracker from '../components/EscrowTracker'

export default function ListingDetail() {
  const { id } = useParams()
  useListings()
  useThreads()
  useEscrows()
  useSaved()
  const listing = getListing(id)
  const tenant = useTenant()
  const navigate = useNavigate()
  const [activePhoto, setActivePhoto] = useState(0)
  const [openThread, setOpenThread] = useState(null)

  if (!listing) {
    return (
      <div className="wrap section">
        <div className="empty">
          <h3>Listing not found</h3>
          <p>
            It may have been removed. <Link to="/" style={{ color: 'var(--green-700)', textDecoration: 'underline' }}>Back to browse</Link>.
          </p>
        </div>
      </div>
    )
  }

  const photos = listing.photos && listing.photos.length ? listing.photos : [null]
  const mainPhoto = photos[activePhoto] || cover(listing)
  const video = embedUrl(listing.videoUrl)
  const pref = listing.preferredTenant || {}
  const hasPref = pref.occupation || pref.maxOccupants || pref.paymentTerms || pref.nonSmoker
  const initials = (listing.landlord?.name || 'PC').split(' ').map((w) => w[0]).slice(0, 2).join('')
  const escrow = tenant ? getEscrowFor(listing.id, tenant.id) : null
  const saved = isSaved(listing.id)
  const sessionVideo = useSessionVideo(listing.id)

  function requireTenant(then) {
    if (!tenant) {
      navigate('/register?next=' + encodeURIComponent(`/listing/${id}`))
      return
    }
    then()
  }
  function messageLandlord() {
    requireTenant(() => {
      const t = startThread({ listing, tenant })
      setOpenThread(t.id)
    })
  }
  function requestViewing() {
    requireTenant(() => {
      const t = getThreadFor(listing.id, tenant.id) || startThread({ listing, tenant })
      addThreadMessage(t.id, 'tenant', 'I would like to request a viewing of this property.')
      setOpenThread(t.id)
    })
  }
  function payDeposit() {
    requireTenant(() => {
      startEscrow({ listing, tenant, amount: listing.rentPerYear })
    })
  }

  return (
    <div className="wrap section">
      <Link to="/" className="navlink" style={{ paddingLeft: 0 }}>← Back to browse</Link>

      <div className="detail" style={{ marginTop: 14 }}>
        <div>
          <div className="detail__photo" style={photoStyle(listing.id)}>
            <PhotoInner listing={{ ...listing, photos: [mainPhoto].filter(Boolean) }} showCity={false} />
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, flexWrap: 'wrap', zIndex: 2 }}>
              {listing.inspected ? <VerifiedListingBadge size="lg" /> : <StatusBadge status={listing.status} />}
              {listing.landlord?.idVerified && <IdVerifiedBadge size="lg" />}
            </div>
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {photos.map((ph, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Photo ${i + 1}`}
                  style={{ width: 72, height: 54, borderRadius: 8, border: i === activePhoto ? '2px solid var(--green-500)' : '1px solid var(--line-strong)', padding: 0, overflow: 'hidden', cursor: 'pointer', ...photoStyle(listing.id + i, ph) }}
                />
              ))}
            </div>
          )}

          <div className="card__type" style={{ marginTop: 16 }}>{listing.type} · {listing.dealType === 'buy' ? 'For sale' : listing.dealType === 'land' ? 'Land' : 'For rent'}</div>
          <h1 className="detail__title">{listing.title}</h1>
          <div className="detail__where">{listing.area ? listing.area + ', ' : ''}{listing.state}</div>
          <p className="detail__desc">{listing.description}</p>

          {/* Property facts */}
          {(listing.bedrooms || listing.parking || listing.furnishing) && (
            <div className="panel">
              <h3>Property details</h3>
              <div className="pref-grid">
                {listing.bedrooms ? <div className="pref">🛏️ <span><b>{listing.bedrooms}</b> bedrooms</span></div> : null}
                {listing.bathrooms ? <div className="pref">🚿 <span><b>{listing.bathrooms}</b> bathrooms</span></div> : null}
                {listing.parking ? <div className="pref">🚗 <span>Parking: <b>{listing.parking}</b></span></div> : null}
                {listing.furnishing ? <div className="pref">🛋️ <span><b>{listing.furnishing}</b></span></div> : null}
              </div>
            </div>
          )}

          {/* Landlord's preferred tenant — the feature no competitor has */}
          {hasPref && (
            <div className="panel">
              <h3>Landlord&apos;s preferred tenant</h3>
              <div className="pref-grid">
                {pref.occupation ? <div className="pref">👤 <span><b>{pref.occupation}</b></span></div> : null}
                {pref.maxOccupants ? <div className="pref">👥 <span>Max <b>{pref.maxOccupants}</b> occupants</span></div> : null}
                {typeof pref.nonSmoker === 'boolean' ? <div className="pref">🚭 <span><b>{pref.nonSmoker ? 'Non-smoker' : 'Smoking ok'}</b></span></div> : null}
                {pref.paymentTerms ? <div className="pref">💳 <span>{pref.paymentTerms}</span></div> : null}
              </div>
              <p className="hint" style={{ fontSize: 12.5, marginTop: 10 }}>
                Lifestyle preferences only. Tribal or ethnic filters are never permitted on LuxeKeys.
              </p>
            </div>
          )}

          {/* House rules */}
          {listing.houseRules && (
            <div className="panel">
              <h3>House rules</h3>
              <div className="rules-text">{listing.houseRules}</div>
            </div>
          )}

          {(sessionVideo || video || listing.videoFileName) && (
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 17, marginBottom: 10 }}>Property walkthrough</h3>
              {sessionVideo ? (
                <>
                  <div className="video-box">
                    <video src={sessionVideo} controls playsInline />
                  </div>
                  <p className="hint" style={{ fontSize: 12, marginTop: 8 }}>
                    Demo upload — plays this session. The full build streams video permanently from Cloudinary/Mux.
                  </p>
                </>
              ) : video ? (
                <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <iframe src={video} title="Property video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
                </div>
              ) : (
                <div className="callout">
                  <span>A walkthrough video (“{listing.videoFileName}”) was uploaded this session. Uploaded files play until refresh in the demo; the full build streams them permanently from Cloudinary.</span>
                </div>
              )}
            </div>
          )}

          <LocationMap listing={listing} />

          {!listing.verified && (
            <div className="callout" style={{ marginTop: 18 }}>
              <span>
                {listing.status === 'rejected'
                  ? 'This listing did not pass verification and is not available.'
                  : listing.status === 'needs_info'
                  ? 'Our team has asked the landlord for more information before this can be verified.'
                  : 'This property is going through our two checks — field inspection and landlord KYC. It goes live once approved.'}
              </span>
            </div>
          )}
        </div>

        <aside className="aside">
          <div className="aside__price">
            {priceLabel(listing)} <span>{priceSuffix(listing) || (listing.dealType === 'buy' ? 'sale price' : 'price')}</span>
          </div>

          <div className="landlord">
            <div className="landlord__avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <div className="landlord__name">{listing.landlord?.name || 'Direct landlord'}</div>
              <div className="landlord__sub">Landlord since {listing.landlord?.since}</div>
            </div>
          </div>
          {listing.landlord?.idVerified ? (
            <div style={{ marginBottom: 8 }}><IdVerifiedBadge /></div>
          ) : null}

          <div className="fact-row"><span>Agent fee</span> <strong style={{ color: 'var(--green-700)' }}>₦0 — direct</strong></div>
          <div className="fact-row"><span>Agreement fee</span> <strong>{listing.agreementFee ? naira(listing.agreementFee) : '₦0'}</strong></div>

          {escrow ? (
            <EscrowTracker escrow={escrow} />
          ) : (
            <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary btn-block" onClick={messageLandlord} disabled={!listing.verified}>
                {tenant ? 'Message landlord' : 'Sign in to message landlord'}
              </button>
              <button className="btn btn-ghost btn-block" onClick={requestViewing} disabled={!listing.verified}>
                Request viewing
              </button>
              <button className="btn btn-gold btn-block" onClick={payDeposit} disabled={!listing.verified}>
                Pay deposit (escrow)
              </button>
              {!listing.verified && <p className="hint" style={{ fontSize: 12.5 }}>Actions unlock once this listing is verified.</p>}
            </div>
          )}

          <p className="note">
            Messaging attaches your screening profile so the landlord knows who&apos;s asking. Deposits are held in
            simulated escrow until viewing is confirmed.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <button
              className="linkbtn"
              style={{ fontSize: 13, textDecoration: 'none', color: saved ? '#d24a63' : 'var(--ink-soft)' }}
              onClick={() => toggleSaved(listing.id)}
            >
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            <button className="linkbtn" style={{ fontSize: 12.5 }}>Report listing</button>
          </div>
        </aside>
      </div>

      {openThread && <ThreadPanel threadId={openThread} onClose={() => setOpenThread(null)} />}
    </div>
  )
}
