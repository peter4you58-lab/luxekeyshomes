import { mapQueryFor, mapEmbedUrl, mapDirectionsUrl, mapViewUrl } from '../utils'

// Shows where the property is so a tenant can go and inspect it. The embedded
// map is best-effort (keyless); the directions/view links always work.
export default function LocationMap({ listing }) {
  const query = mapQueryFor(listing)
  return (
    <div className="panel" style={{ paddingBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>📍 Location &amp; inspection</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <a className="btn btn-ghost btn-sm" href={mapViewUrl(listing)} target="_blank" rel="noreferrer">View on map</a>
          <a className="btn btn-primary btn-sm" href={mapDirectionsUrl(listing)} target="_blank" rel="noreferrer">Get directions</a>
        </div>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '10px 0 12px' }}>{query}</p>
      <div className="map-embed">
        <iframe
          title="Property location"
          src={mapEmbedUrl(listing)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="hint" style={{ fontSize: 12, marginTop: 8 }}>
        Approximate area shown. Tap “Get directions” to navigate here for your inspection. Precise pins use a Maps API key in the full build.
      </p>
    </div>
  )
}
