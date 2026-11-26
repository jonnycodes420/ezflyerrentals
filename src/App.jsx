import { useState } from 'react';
import { BOOKING_URL, PHONE, PHONE_HREF, EMAIL, VEHICLES } from './config';

const lowest = Math.min(...VEHICLES.map((v) => v.rate));

function Logo({ size = 'sm' }) {
  return (
    <span className={`logo logo-${size}`}>
      <span className="logo-top">EZ FLYER</span>
      <span className="logo-bottom">Car Rentals</span>
    </span>
  );
}

function Suv() {
  return (
    <svg viewBox="0 0 240 92" className="art" aria-hidden="true">
      <path d="M18 64 V50 Q19 43 28 41 L62 37 L86 22 Q90 19 97 19 H177 Q184 19 188 23 L204 38 L217 41 Q224 43 224 51 V64 H196 M166 64 H76 M46 64 H18"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M70 37 L90 25 H129 V37 Z M136 25 H173 L190 37 H136 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="61" cy="64" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="61" cy="64" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="181" cy="64" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="181" cy="64" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Jet() {
  return (
    <svg viewBox="0 0 240 92" className="art" aria-hidden="true">
      <path d="M30 56 L176 50 Q200 49 214 42 L222 30 L230 30 L226 47 Q222 56 200 58 L120 61 L96 74 H84 L96 61 L40 63 Q28 62 30 56 Z"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M118 54 L140 40 H150 L138 53" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M48 55 h6 M62 54.5 h6 M76 54 h6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const icons = {
  plane: <path d="M3 13l7-2 4-8 2 1-2 7 6 1 2-2h2l-2 4 1 4h-2l-2-2-6 1 2 7-2 1-4-8-7-2z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
};
function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function ReserveCard() {
  const [vehicle, setVehicle] = useState(VEHICLES[0].id);
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of f.entries()) if (v) params.set(k, v);
    const sep = BOOKING_URL.includes('?') ? '&' : '?';
    window.location.href = BOOKING_URL.startsWith('#') ? BOOKING_URL : `${BOOKING_URL}${sep}${params}`;
  };
  return (
    <form className="reserve" onSubmit={submit} aria-labelledby="reserve-title">
      <h2 id="reserve-title">Reserve your vehicle</h2>
      <p className="reserve-sub">Staged at Flightline First before you arrive.</p>
      <div className="row2">
        <label>Pickup<input type="datetime-local" name="pick_up" /></label>
        <label>Return<input type="datetime-local" name="return" /></label>
      </div>
      <label>Vehicle
        <select name="vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
          {VEHICLES.map((v) => <option key={v.id} value={v.id}>{v.name} &middot; ${v.rate}/day</option>)}
        </select>
      </label>
      <div className="row2">
        <label>Tail number<input name="tail_number" placeholder="N123EZ (optional)" autoComplete="off" /></label>
        <label>Arriving from<input name="arriving_from" placeholder="KATL (optional)" autoComplete="off" /></label>
      </div>
      <button className="btn btn-gold btn-block" type="submit">Check availability</button>
      <p className="reserve-foot">From <strong>${lowest}/day</strong>, fees included &middot; 100 miles/day included</p>
    </form>
  );
}

const steps = [
  { t: 'Book & verify', d: 'Reserve online or by phone. Upload your license and proof of insurance, and e-sign your agreement.' },
  { t: 'Land at KCQF', d: 'Share your arrival time and tail number. Your SUV is cleaned, fueled, and staged at Flightline First.' },
  { t: 'Drive away', d: 'Grab your keys at the Flightline First desk, or use your code at the keybox after hours.' },
  { t: 'Return anytime', d: 'Park in the EZ Flyer spaces, snap a few photos, and drop the key. That’s it.' },
];

const faqs = [
  { q: 'What do I need to rent?', a: 'Renters must be 25 or older with a valid driver’s license, a major credit card, and proof of insurance.' },
  { q: 'Can I pick up after hours?', a: 'Yes. If the Flightline First desk is closed, your keys are waiting in the keybox and you’ll get the code before you land.' },
  { q: 'How many miles are included?', a: '100 miles per day. Fuel is simple: return it at the level you picked it up.' },
  { q: 'What does the daily rate include?', a: 'The airport concession and location fees are built into the rate. Only taxes are added at checkout.' },
];

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="wrap nav-inner">
          <a href="#" aria-label="EZ Flyer Car Rentals home"><Logo /></a>
          <nav aria-label="Main">
            <a href="#fleet">Fleet</a>
            <a href="#how">How it works</a>
            <a href="#rates">Rates</a>
            <a href="#corporate">Crew &amp; Corporate</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-right">
            <a className="nav-phone" href={PHONE_HREF}>{PHONE}</a>
            <a className="btn btn-gold btn-sm" href={BOOKING_URL}>Reserve</a>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <svg className="runway" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
            <path d="M600 0 L-200 300 M600 0 L1400 300 M600 0 L300 300 M600 0 L900 300" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">H.L. &ldquo;Sonny&rdquo; Callahan Airport &middot; KCQF &middot; Fairhope, AL</p>
              <h1>Your car is waiting <span>when you land.</span></h1>
              <p className="lede">Premium SUVs staged on-site at Flightline First. Book online, sign digitally, and drive away minutes after shutdown. No counter, no shuttle, no wait.</p>
              <div className="cta-row">
                <a className="btn btn-gold" href={BOOKING_URL}>Reserve a vehicle</a>
                <a className="btn btn-ghost" href={PHONE_HREF}>Call {PHONE}</a>
              </div>
              <dl className="hero-points">
                <div><dt>On the field</dt><dd>Cars parked at the FBO, never off-site.</dd></div>
                <div><dt>Any hour</dt><dd>After-hours keybox pickup and return.</dd></div>
                <div><dt>Paperless</dt><dd>Verify and e-sign before you take off.</dd></div>
              </dl>
            </div>
            <ReserveCard />
          </div>
        </section>

        <section className="strip" aria-label="Highlights">
          <div className="wrap strip-grid">
            <div><Icon name="plane" /><span>Planeside-ready at KCQF</span></div>
            <div><Icon name="clock" /><span>After-hours pickup</span></div>
            <div><Icon name="check" /><span>Detailed between every rental</span></div>
            <div><Icon name="receipt" /><span>Transparent, all-in pricing</span></div>
          </div>
        </section>

        <section id="how" className="how">
          <div className="wrap">
            <p className="kicker">How it works</p>
            <h2>From the ramp to the road in minutes.</h2>
            <p className="sub">Everything happens before you land, so you can step off and go.</p>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.t}>
                  <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="fleet" className="fleet">
          <div className="wrap">
            <p className="kicker">The fleet</p>
            <h2>Premium SUVs, ready for the Gulf Coast.</h2>
            <p className="sub">Room for crews, clients, golf bags, and beach gear.</p>
            <div className="fleet-grid">
              {VEHICLES.map((v) => (
                <article className="vcard" key={v.id}>
                  <div className="vcard-art">
                    <span className="tag">{v.available} available</span>
                    <Suv />
                  </div>
                  <div className="vcard-body">
                    <h3>{v.name}</h3>
                    <p className="vkind">{v.kind}</p>
                    <ul className="specs">{v.specs.map((s) => <li key={s}>{s}</li>)}</ul>
                    <div className="vprice">
                      <span><strong>${v.rate}</strong> / day</span>
                      <a href={BOOKING_URL}>Reserve</a>
                    </div>
                  </div>
                </article>
              ))}
              <article className="vcard" id="corporate">
                <div className="vcard-art">
                  <span className="tag">For operators</span>
                  <Jet />
                </div>
                <div className="vcard-body">
                  <h3>Crew &amp; Corporate</h3>
                  <p className="vkind">Accounts for flight departments</p>
                  <ul className="perks">
                    <li>Card on file, one-tap rebooking</li>
                    <li>Consolidated invoices for expense reports</li>
                    <li>Priority holds around your schedule</li>
                  </ul>
                  <div className="vprice">
                    <span className="vprice-label">Set up an account</span>
                    <a href={`mailto:${EMAIL}?subject=Crew%20%26%20Corporate%20account`}>Contact us</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="rates" className="rates">
          <div className="wrap rates-grid">
            <div>
              <p className="kicker kicker-left">Rates</p>
              <h2>One daily rate. <span>No surprises.</span></h2>
              <p className="sub sub-left">Airport fees are built into the price you see. 100 miles per day are included, and fuel is simple: return it at the level you picked it up.</p>
            </div>
            <table className="rate-table">
              <caption className="sr">Daily rates</caption>
              <tbody>
                {VEHICLES.map((v) => (
                  <tr key={v.id}><th scope="row">{v.name}</th><td>${v.rate.toFixed(2)} / day</td></tr>
                ))}
                <tr><th scope="row">Airport concession &amp; location fees</th><td>Included</td></tr>
                <tr><th scope="row">Mileage</th><td>100 miles / day</td></tr>
                <tr className="total"><th scope="row">Taxes</th><td>Added at checkout</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="faq">
          <div className="wrap faq-wrap">
            <p className="kicker">FAQ</p>
            <h2>Before you fly in.</h2>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="final">
          <div className="wrap final-inner">
            <Logo size="lg" />
            <h2>Flying into Fairhope?</h2>
            <p>Reserve now and your car will be waiting at Flightline First.</p>
            <div className="cta-row center">
              <a className="btn btn-gold" href={BOOKING_URL}>Reserve a vehicle</a>
              <a className="btn btn-ghost" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <h4>EZ Flyer Car Rentals</h4>
            <p>Premium on-airport rentals for private aviation at H.L. &ldquo;Sonny&rdquo; Callahan Airport (KCQF), Fairhope, Alabama.</p>
          </div>
          <div>
            <h4>Pickup</h4>
            <p>Flightline First<br />Fairhope, AL</p>
          </div>
          <div>
            <h4>Contact</h4>
            <p><a href={PHONE_HREF}>{PHONE}</a><br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          </div>
          <div>
            <h4>Explore</h4>
            <p><a href="#fleet">Fleet</a><br /><a href="#how">How it works</a><br /><a href="#rates">Rates</a><br /><a href="#faq">FAQ</a></p>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span>&copy; {new Date().getFullYear()} EZ Flyer Car Rentals, LLC</span>
          <span>Renters must be 25+ with a valid license, major credit card, and proof of insurance.</span>
        </div>
      </footer>
    </>
  );
}
