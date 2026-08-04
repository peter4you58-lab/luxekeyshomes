import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useListings } from '../data/store'
import { STATES, PROPERTY_TYPES, DEAL_TYPES } from '../data/states'
import { photoStyle, cover, priceLabel, priceSuffix } from '../utils'
import ListingCard from '../components/ListingCard'
import { ListingBadges } from '../components/Badges'
import PhotoInner from '../components/PhotoInner'

export default function Home() {
  const listings = useListings()
  const [deal, setDeal] = useState('')
  const [state, setState] = useState('')
  const [type, setType] = useState('')
  const [q, setQ] = useState('')

  const live = useMemo(() => listings.filter((l) => l.status === 'verified'), [listings])

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (l.status !== 'verified') return false
      if (deal && l.dealType !== deal) return false
      if (state && l.state !== state) return false
      if (type && l.type !== type) return false
      if (q) {
        const hay = `${l.title} ${l.area} ${l.state} ${l.type}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [listings, deal, state, type, q])

  const landlords = new Set(live.map((l) => l.landlord?.name)).size
  const featured = live[0]

  return (
    <>
      <section className="hero">
        <div className="wrap hero__inner">
          <div className="rise">
            <span className="eyebrow">Nigeria&apos;s verified rental marketplace</span>
            <h1>
              Rent directly from a <span className="u">verified landlord.</span>
            </h1>
            <p className="hero__lead">
              Every home is inspected in person and every landlord verified — so you can deal directly, and view with
              confidence.
            </p>
            <div className="hero__cta">
              <a href="#browse" className="btn btn-primary btn-lg">
                Browse verified homes
              </a>
              <Link to="/list" className="btn btn-ghost btn-lg">
                List your property free
              </Link>
            </div>
            <div className="hero__trust">
              <div>
                <div className="n">{live.length}</div>
                <div className="l">Verified listings</div>
              </div>
              <div>
                <div className="n">{landlords}</div>
                <div className="l">Verified landlords</div>
              </div>
              <div>
                <div className="n">4</div>
                <div className="l">Cities live</div>
              </div>
            </div>
          </div>

          {featured && (
            <Link to={`/listing/${featured.id}`} className="hero-card rise" aria-label={featured.title}>
              <div className="hero-card__photo" style={photoStyle(featured.id)}>
                <PhotoInner listing={featured} />
                <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                  <ListingBadges listing={featured} />
                </div>
              </div>
              <div className="hero-card__body">
                <div className="hero-card__price">
                  {priceLabel(featured)}{' '}
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>{priceSuffix(featured)}</span>
                </div>
                <div className="hero-card__meta">
                  {featured.type} · {featured.area}, {featured.state}
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="section" id="browse" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div className="segmented" role="tablist" aria-label="Deal type">
              <button className={deal === '' ? 'on' : ''} onClick={() => setDeal('')}>All</button>
              {DEAL_TYPES.map((d) => (
                <button key={d.key} className={deal === d.key ? 'on' : ''} onClick={() => setDeal(d.key)}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters" role="search">
            <input
              type="search"
              placeholder="Search by area, street or landmark…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search listings"
            />
            <select value={state} onChange={(e) => setState(e.target.value)} aria-label="Filter by state">
              <option value="">All states + FCT</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by property type">
              <option value="">Any property type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="section__head" style={{ marginTop: 26 }}>
            <div>
              <h2>{state ? `Homes in ${state}` : 'Verified homes'}</h2>
              <p>{filtered.length} listing{filtered.length === 1 ? '' : 's'} available</p>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No listings here yet</h3>
              <p>
                Nothing matches this filter yet.{' '}
                <Link to="/list" style={{ color: 'var(--green-700)', textDecoration: 'underline' }}>
                  Invite a landlord to list free
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section__head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <span className="eyebrow">What verified tenants are saying</span>
              <h2 style={{ marginTop: 8 }}>Renting without the fear</h2>
            </div>
          </div>
          <div className="testi-grid">
            <div className="testi">
              <p>“I paid my deposit through the escrow, knowing that if Mrs. Eke had lied about the light, the funds would come back to me. The apartment was exactly as photographed.”</p>
              <div className="who">
                <div className="av">CA</div>
                <div><div className="nm">Chidinma A.</div><div className="mt">Tenant · Lagos</div></div>
              </div>
            </div>
            <div className="testi">
              <p>“Usually these platforms are flooded with agents asking for unregistered ‘caution fees’ or showing you terrible places. Finding a home with both badges verified gave me peace of mind.”</p>
              <div className="who">
                <div className="av">EO</div>
                <div><div className="nm">Emeka O.</div><div className="mt">Tenant · Enugu</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="how">
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>How it works</span>
            <h2 style={{ marginTop: 8, fontSize: 'clamp(24px,3.2vw,32px)' }}>List → Verify → Connect</h2>
            <div className="how__grid">
              <div className="how__step">
                <div className="k">LIST</div>
                <h3>Landlord lists direct</h3>
                <p>Owners post their own property in minutes — no agent, no commission, no listing fee.</p>
              </div>
              <div className="how__step">
                <div className="k">VERIFY</div>
                <h3>We run two checks</h3>
                <p>A field agent inspects the property (Verified Listing) and we KYC the owner (ID-Verified Landlord). Both badges, shown separately.</p>
              </div>
              <div className="how__step">
                <div className="k">CONNECT</div>
                <h3>Rent direct, safely</h3>
                <p>Tenants message with their profile attached, then pay through protected escrow. No middleman, no vanishing deposit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
