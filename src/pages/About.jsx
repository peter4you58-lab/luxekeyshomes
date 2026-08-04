import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="eyebrow">About LuxeKeys Homes</span>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', marginTop: 10 }}>
            The trusted bridge between <span className="u">owners and renters.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-soft)', marginTop: 18, lineHeight: 1.6 }}>
            LuxeKeys Homes connects verified landlords and property owners directly with the people who want to rent or
            buy. Every home is inspected in person and every owner identity-verified, so trust is built into the deal
            before money ever changes hands.
          </p>
          <div className="hero__cta" style={{ marginTop: 24 }}>
            <Link to="/" className="btn btn-primary btn-lg">Browse verified homes</Link>
            <Link to="/list" className="btn btn-ghost btn-lg">List your property</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <div className="how">
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Our mission</span>
            <h2 style={{ marginTop: 8, fontSize: 'clamp(24px,3.2vw,32px)' }}>
              Merge property owners with the right people — safely, directly
            </h2>
            <p style={{ color: '#c8dcd2', fontSize: 16, marginTop: 12, maxWidth: 720 }}>
              In Nigeria, finding or letting a property too often means unregistered agents, endless "caution fees,"
              fake listings, and paying before you can trust anyone. We exist to fix that: put owners and clients in the
              same room, verify both sides, and protect the money until everyone is satisfied.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div className="panel" style={{ marginTop: 0 }}>
              <h3>The problem we solve</h3>
              <p className="rules-text" style={{ marginTop: 8 }}>
                Middlemen inflate costs and hide information. Renters get scammed with photos that don't match reality.
                Genuine landlords struggle to reach serious, trustworthy tenants. Trust is the missing piece.
              </p>
            </div>
            <div className="panel" style={{ marginTop: 0 }}>
              <h3>How LuxeKeys works</h3>
              <p className="rules-text" style={{ marginTop: 8 }}>
                Owners list directly and free. Our field team inspects the property (the green Verified Listing badge)
                and we confirm the owner's identity by KYC (the gold ID-Verified badge). Renters and buyers browse only
                verified homes, message owners with their profile attached, and pay through protected escrow that only
                releases after viewing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow">Who we serve</span>
              <h2 style={{ marginTop: 8 }}>One platform, both sides of the deal</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div className="panel" style={{ marginTop: 0 }}>
              <h3>Landlords &amp; property owners</h3>
              <p className="rules-text" style={{ marginTop: 8 }}>
                List your property in minutes, keep 100% of the rent — no commission — and reach verified tenants who
                already show you who they are. You choose who to accept.
              </p>
              <Link to="/list" className="btn btn-gold btn-sm" style={{ marginTop: 12 }}>List your property free</Link>
            </div>
            <div className="panel" style={{ marginTop: 0 }}>
              <h3>Renters &amp; buyers</h3>
              <p className="rules-text" style={{ marginTop: 8 }}>
                Browse homes that have been inspected and owners who are verified. Message directly, book a viewing with
                a map to the property, and let escrow protect your deposit until you've seen it.
              </p>
              <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Find a home</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ textAlign: 'center', maxWidth: 720 }}>
          <span className="eyebrow">Our promise</span>
          <h2 style={{ marginTop: 8 }}>Transparency, safety, and no middlemen</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17, marginTop: 12 }}>
            We never sell your data, never allow tribal or ethnic filtering, and never let money move until trust is
            established. That's the standard we hold ourselves to — for owners and clients alike.
          </p>
          <div className="hero__cta" style={{ justifyContent: 'center', marginTop: 22 }}>
            <Link to="/" className="btn btn-primary btn-lg">Browse verified homes</Link>
            <Link to="/contact" className="btn btn-ghost btn-lg">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
