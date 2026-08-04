import { Link, NavLink } from 'react-router-dom'
import logoEmblem from '../assets/logo-emblem.png'

// LuxeKeys Homes brand mark: a gold key on a deep-green badge. The key is the
// recognizable symbol (like a monogram), tying "Luxe" + "Keys" to real estate.
export function BrandMark({ size = 34 }) {
  return (
    <svg className="brand__mark" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="url(#lk-bg)" />
      <g stroke="url(#lk-gold)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="19" cy="18" r="6.3" />
        <path d="M23.4 22.6l9 9" />
        <path d="M29 28.2l-2.4 2.4M32.4 31.6l-2.4 2.4" />
      </g>
      <circle cx="19" cy="18" r="2" fill="#1a5c38" />
      <defs>
        <linearGradient id="lk-bg" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#1f6b41" />
          <stop offset="1" stopColor="#164a2e" />
        </linearGradient>
        <linearGradient id="lk-gold" x1="12" y1="12" x2="36" y2="36">
          <stop stopColor="#e6cd7f" />
          <stop offset="1" stopColor="#c0932f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link to="/" className="brand">
          <img className="brand__mark" src={logoEmblem} alt="LuxeKeys Homes" />
          <span className="brand__word">
            Luxe<em>Keys</em>
            <span className="brand__sub">HOMES</span>
          </span>
        </Link>
        <div className="site-header__spacer" />
        <nav className="site-header__nav">
          <NavLink to="/" end className={({ isActive }) => 'navlink navlink--hide-sm' + (isActive ? ' navlink--active' : '')}>
            Browse
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => 'navlink navlink--hide-sm' + (isActive ? ' navlink--active' : '')}>
            For tenants
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 'navlink navlink--hide-sm' + (isActive ? ' navlink--active' : '')}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => 'navlink navlink--hide-sm' + (isActive ? ' navlink--active' : '')}>
            Contact
          </NavLink>
          <Link to="/list" className="btn btn-gold">
            List your property
          </Link>
        </nav>
      </div>
    </header>
  )
}
