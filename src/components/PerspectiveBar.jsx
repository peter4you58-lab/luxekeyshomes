import { useLocation, useNavigate } from 'react-router-dom'

const VIEWS = [
  { key: 'tenant', label: 'Tenant', to: '/dashboard/tenant', icon: '👤' },
  { key: 'landlord', label: 'Landlord', to: '/dashboard/landlord', icon: '🏠' },
  { key: 'agent', label: 'Agent', to: '/dashboard/agent', icon: '🤝' },
  { key: 'admin', label: 'Admin', to: '/admin', icon: '🛡️' },
]

function activeView(pathname) {
  if (pathname.startsWith('/dashboard/landlord')) return 'landlord'
  if (pathname.startsWith('/dashboard/agent')) return 'agent'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/dashboard/tenant')) return 'tenant'
  return null // public browse — no perspective highlighted
}

export default function PerspectiveBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active = activeView(pathname)

  return (
    <div className="perspective-bar">
      <div className="wrap perspective-bar__row">
        <span className="perspective-bar__label">
          <span className="pb-dot" /> Verified Real Estate Rental Platform · Prototype
        </span>
        <div className="perspective-bar__right">
          <span className="perspective-bar__hint">View sandbox perspective:</span>
          <div className="perspective-toggle">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                className={active === v.key ? 'on' : ''}
                onClick={() => navigate(v.to)}
              >
                <span aria-hidden="true">{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
