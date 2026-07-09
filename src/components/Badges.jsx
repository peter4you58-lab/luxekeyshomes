// The two trust badges are ALWAYS shown separately, never merged:
//   VerifiedListingBadge  = property physically inspected by a field agent (green)
//   IdVerifiedBadge       = landlord/agent passed KYC / vNIN (gold)
// This distinction is a differentiator no competitor offers cleanly.

function HouseCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5l5 5 11-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function VerifiedListingBadge({ size = 'sm' }) {
  return (
    <span className={'vbadge vbadge--listing' + (size === 'lg' ? ' vbadge--lg' : '')} title="This property was physically inspected by a LuxeKeys field agent">
      <span className="vbadge__disc"><HouseCheck /></span>
      Verified Listing
    </span>
  )
}

export function IdVerifiedBadge({ size = 'sm', who = 'Landlord' }) {
  return (
    <span className={'vbadge vbadge--id' + (size === 'lg' ? ' vbadge--lg' : '')} title={`${who}'s identity confirmed by KYC (vNIN)`}>
      <span className="vbadge__disc"><HouseCheck /></span>
      ID-Verified {who}
    </span>
  )
}

// Convenience: render whichever badges a listing has earned, side by side.
export function ListingBadges({ listing, size = 'sm', who = 'Landlord' }) {
  const inspected = listing?.inspected ?? listing?.verified
  const idv = listing?.landlord?.idVerified ?? listing?.landlord?.verified
  if (!inspected && !idv) return null
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      {inspected && <VerifiedListingBadge size={size} />}
      {idv && <IdVerifiedBadge size={size} who={who} />}
    </span>
  )
}
