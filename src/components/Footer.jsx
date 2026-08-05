import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__row">
        <div>
          <strong style={{ color: 'var(--green-900)' }}>LuxeKeys Homes</strong> — verified rentals, direct from landlords.
          <br />
          <span style={{ fontSize: 13 }}>Cutting out agents across all 36 states + FCT.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link to="/contact" className="linkbtn" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>Contact</Link>
        </div>
      </div>
    </footer>
  )
}
