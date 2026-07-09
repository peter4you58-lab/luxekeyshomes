export function naira(n) {
  if (n == null || isNaN(n)) return '—'
  return '₦' + Number(n).toLocaleString('en-NG')
}

// Deterministic, offline-safe "photo" — a warm gradient derived from the
// listing id so every card looks intentional without loading external images.
const PALETTES = [
  ['#0b3d2e', '#1b9c6b'],
  ['#123c52', '#2f7fa6'],
  ['#5a3d12', '#c0932f'],
  ['#3a2b52', '#7d5aa6'],
  ['#52122a', '#a63f5f'],
  ['#14463a', '#2f9c8a'],
]
function hash(str) {
  let h = 0
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}
export function photoStyle(seed, imageUrl) {
  if (imageUrl) {
    return { backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  const h = hash(seed)
  const [a, b] = PALETTES[h % PALETTES.length]
  const angle = 115 + (h % 60)
  return { background: `linear-gradient(${angle}deg, ${a}, ${b})` }
}

// Cover image for a listing: first uploaded photo, else legacy imageUrl, else gradient.
export function cover(listing) {
  if (listing?.photos && listing.photos.length) return listing.photos[0]
  return listing?.imageUrl
}

// Read an image File, resize on-device, return a compact JPEG data URL.
// Keeps localStorage-backed demo viable (no backend). Real uploads -> Cloudinary.
export function fileToResizedDataUrl(file, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Not an image'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

// Turn a YouTube / Vimeo link into an embeddable URL. Returns null if unsupported.
export function embedUrl(link) {
  if (!link) return null
  try {
    const u = new URL(link)
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

export const STATUS_META = {
  pending: { label: 'Pending', color: '#8a7a52', bg: '#f4f0e6', border: '#e2d6b8' },
  in_review: { label: 'In review', color: '#1d5fa8', bg: '#e7f0fb', border: '#c3d9f2' },
  verified: { label: 'Verified', color: '#12523c', bg: '#e5f2ec', border: '#bfe0d0' },
  rejected: { label: 'Rejected', color: '#9a2f1c', bg: '#fbe9e5', border: '#f0c9c0' },
  needs_info: { label: 'Needs info', color: '#8a5a10', bg: '#fcf1dd', border: '#f0dcb0' },
}

// Rent shows a /year suffix; buy and land show a one-off price.
export function priceLabel(listing) {
  if (listing?.dealType === 'buy' || listing?.dealType === 'land') return naira(listing.rentPerYear)
  return naira(listing?.rentPerYear)
}
export function priceSuffix(listing) {
  return listing?.dealType === 'rent' ? '/year' : ''
}

export const ESCROW_META = {
  ESCROW_HELD: { label: 'Escrow held', color: '#1d5fa8', bg: '#e7f0fb' },
  VIEWING_CONFIRMED: { label: 'Viewing confirmed', color: '#12523c', bg: '#e5f2ec' },
  RELEASED: { label: 'Released to landlord', color: '#12523c', bg: '#e5f2ec' },
  DISPUTED: { label: 'Disputed', color: '#9a2f1c', bg: '#fbe9e5' },
  UNDER_REVIEW: { label: 'Under review', color: '#8a5a10', bg: '#fcf1dd' },
  MEDIATION: { label: 'In mediation', color: '#8a5a10', bg: '#fcf1dd' },
  REFUNDED: { label: 'Refunded to tenant', color: '#12523c', bg: '#e5f2ec' },
  FORFEITED: { label: 'Forfeited to landlord', color: '#9a2f1c', bg: '#fbe9e5' },
  AUTO_REFUNDED: { label: 'Auto-refunded', color: '#12523c', bg: '#e5f2ec' },
}
// The happy-path stages shown as a stepper; branches render as side states.
export const ESCROW_MAIN_PATH = ['ESCROW_HELD', 'VIEWING_CONFIRMED', 'RELEASED']

// Location helpers for the inspection map. Uses a keyless Google Maps embed
// (falls back gracefully) and a directions link that always works. In
// production, a Maps API key + geocoding gives precise pins.
export function mapQueryFor(listing) {
  return (
    (listing?.mapLocation && listing.mapLocation.trim()) ||
    [listing?.area, listing?.state, 'Nigeria'].filter(Boolean).join(', ')
  )
}
export function mapEmbedUrl(listing) {
  return 'https://www.google.com/maps?q=' + encodeURIComponent(mapQueryFor(listing)) + '&z=15&output=embed'
}
export function mapDirectionsUrl(listing) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(mapQueryFor(listing))
}
export function mapViewUrl(listing) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQueryFor(listing))
}
