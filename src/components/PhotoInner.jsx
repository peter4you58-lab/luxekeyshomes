import { useState } from 'react'
import { cover } from '../utils'

function TypeIcon({ listing }) {
  const t = (listing?.type || '').toLowerCase()
  const deal = listing?.dealType
  if (deal === 'land' || t.includes('land')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l8 4-8 4-8-4 8-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 12l8 4 8-4M4 16l8 4 8-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }
  if (t.includes('duplex') || t.includes('bungalow')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 11l9-7 9 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9M10 19v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  // default: apartment building
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// Renders a real photo when the listing has one (uploaded data URL, or a file
// under /public/images). Falls back to a branded placeholder if there's no
// photo or the image fails to load — so nothing ever shows a broken image.
export default function PhotoInner({ listing, showCity = true }) {
  const src = cover(listing)
  const [failed, setFailed] = useState(false)
  const showImg = src && !failed
  return (
    <>
      {showImg ? (
        <img src={src} alt={listing.title || 'Property'} className="photo-img" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="photo-icon" aria-hidden="true"><TypeIcon listing={listing} /></span>
      )}
      {showCity && listing?.state && <span className="photo-city">{listing.state.replace('FCT - ', '')}</span>}
    </>
  )
}
