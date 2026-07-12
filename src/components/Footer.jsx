import { Link } from 'react-router-dom'
import { resetDemo } from '../data/store'

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
          <span className="demo-tag">Investor demo</span>
          <button
            className="linkbtn"
            onClick={() => {
              if (confirm('Reset the demo? This clears all listings and profiles you added and restores the sample data.')) {
                resetDemo()
              }
            }}
          >
            Reset demo data
          </button>
        </div>
      </div>
    </footer>
  )
}
