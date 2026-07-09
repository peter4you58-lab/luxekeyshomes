import { Link } from 'react-router-dom'
import { photoStyle, cover, priceLabel, priceSuffix } from '../utils'
import { ListingBadges } from './Badges'
import PhotoInner from './PhotoInner'
import StatusBadge from './StatusBadge'
import { isSaved, toggleSaved, useSaved } from '../data/store'

export default function ListingCard({ listing }) {
  useSaved()
  const saved = isSaved(listing.id)
  const anyBadge = (listing.inspected ?? listing.verified) || (listing.landlord?.idVerified ?? listing.landlord?.verified)
  return (
    <Link to={`/listing/${listing.id}`} className="card rise">
      <div className="card__photo" style={photoStyle(listing.id)}>
        <PhotoInner listing={listing} />
        <div className="card__badge">
          {anyBadge ? <ListingBadges listing={listing} /> : <StatusBadge status={listing.status} />}
        </div>
        <button
          className={'save-btn' + (saved ? ' save-btn--on' : '')}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(listing.id) }}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
      <div className="card__body">
        <div className="card__type">{listing.type}</div>
        <div className="card__title">{listing.title}</div>
        <div className="card__where">
          {listing.area ? listing.area + ', ' : ''}
          {listing.state}
        </div>
        <div className="card__foot">
          <div className="card__price">
            {priceLabel(listing)} <span>{priceSuffix(listing)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
