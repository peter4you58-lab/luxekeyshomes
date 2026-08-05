import { Link } from 'react-router-dom'

// Provisional pricing — the point is to make the business model legible to a
// visitor (and an investor): who pays, how much, at what trigger. Numbers are
// easy to change here in one place.
const LANDLORD_FEE = '₦5,000'

export default function Pricing() {
  return (
    <>
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Pricing</span>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', marginTop: 10 }}>
            Honest pricing. <span className="u">Tenants never pay us.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-soft)', marginTop: 18, lineHeight: 1.6 }}>
            No agent commission. No agreement fees. Landlords pay one small fee to have a home
            inspected and verified — and only verified homes ever go live.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Tenants */}
            <div className="panel" style={{ marginTop: 0 }}>
              <span className="eyebrow">For tenants &amp; buyers</span>
              <h2 style={{ margin: '10px 0 4px', fontSize: 'clamp(30px,4vw,40px)' }}>Free</h2>
              <p className="rules-text" style={{ marginBottom: 16 }}>Always. No fees, ever.</p>
              <ul className="rules-text" style={{ paddingLeft: 18, lineHeight: 1.9 }}>
                <li>Browse only inspected, verified homes</li>
                <li>Message landlords directly, profile attached</li>
                <li>Book viewings with a map to the property</li>
                <li>Escrow protection on your deposit</li>
              </ul>
              <Link to="/" className="btn btn-primary btn-block" style={{ marginTop: 18 }}>
                Browse verified homes
              </Link>
            </div>

            {/* Landlords */}
            <div className="panel" style={{ marginTop: 0, borderColor: 'var(--gold)', boxShadow: 'var(--shadow-md)' }}>
              <span className="eyebrow" style={{ color: 'var(--gold-deep)' }}>For landlords &amp; owners</span>
              <h2 style={{ margin: '10px 0 4px', fontSize: 'clamp(30px,4vw,40px)' }}>
                {LANDLORD_FEE} <span style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 500 }}>/ verified listing</span>
              </h2>
              <p className="rules-text" style={{ marginBottom: 16 }}>Charged only when your home passes verification. No commission — you keep 100% of the rent.</p>
              <ul className="rules-text" style={{ paddingLeft: 18, lineHeight: 1.9 }}>
                <li>Physical inspection by our field team</li>
                <li>Landlord ID (KYC) verification</li>
                <li>Both trust badges shown on your listing</li>
                <li>Reach verified tenants — no agents in between</li>
              </ul>
              <Link to="/list" className="btn btn-gold btn-block" style={{ marginTop: 18 }}>
                List your property
              </Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, marginTop: 22 }}>
            What you see is what you pay. A small escrow service fee on completed rentals is planned as we scale.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ textAlign: 'center', maxWidth: 680 }}>
          <span className="eyebrow">Why a fee at all?</span>
          <h2 style={{ marginTop: 8 }}>Because verification is real work</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17, marginTop: 12 }}>
            Someone physically visits and photographs every home and checks every landlord's identity.
            The fee keeps that process honest and sustainable — and it's why a LuxeKeys listing means
            something that a free classifieds post never can.
          </p>
          <div className="hero__cta" style={{ justifyContent: 'center', marginTop: 22 }}>
            <Link to="/list" className="btn btn-primary btn-lg">List your property</Link>
            <Link to="/contact" className="btn btn-ghost btn-lg">Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
