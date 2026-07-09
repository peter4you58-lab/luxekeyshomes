import { Link } from 'react-router-dom'

export default function DashboardHead({ persona, title, subtitle, tabs, active, onTab }) {
  return (
    <div className="dash-head">
      <div className="dash-head__top">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="dash-persona">
          <div className="dash-persona__avatar">{persona.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          <div>
            <div className="dash-persona__name">{persona.name}</div>
            <div className="dash-persona__role">{persona.role}</div>
          </div>
        </div>
      </div>
      {tabs && (
        <div className="tabs" style={{ marginTop: 18 }}>
          {tabs.map((t) => (
            <button key={t.key} className={'tab' + (active === t.key ? ' tab--active' : '')} onClick={() => onTab(t.key)}>
              {t.label}
              {t.count != null && <span className="count">{t.count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FindPropertiesLink() {
  return (
    <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}>
      ← Find properties
    </Link>
  )
}
