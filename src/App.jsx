import { useEffect, useRef, useState } from 'react';
import { BOOKING_URL, PHONE, PHONE_HREF, EMAIL } from './config';

const AIRPORT = { x: 420, y: 300 };

function ChartHero() {
  const svgRef = useRef(null);
  const [heading, setHeading] = useState(10);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const onMove = (e) => {
      const r = svg.getBoundingClientRect();
      const sx = r.width / 600, sy = r.height / 600;
      const ax = r.left + AIRPORT.x * sx, ay = r.top + AIRPORT.y * sy;
      const deg = (Math.atan2(e.clientX - ax, ay - e.clientY) * 180) / Math.PI;
      setHeading((deg + 360) % 360);
      setTouched(true);
    };
    window.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerdown', onMove);
    return () => { window.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerdown', onMove); };
  }, []);

  const hdg = String(Math.round(heading) % 360).padStart(3, '0');
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <figure className="chart" aria-label="Chart of Fairhope Executive Airport on the eastern shore of Mobile Bay">
      <svg ref={svgRef} viewBox="0 0 600 600" role="img" aria-hidden="true">
        <defs>
          <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="var(--water-line)" strokeWidth="1" />
          </pattern>
          <clipPath id="frame"><rect x="0" y="0" width="600" height="600" rx="6" /></clipPath>
        </defs>
        <g clipPath="url(#frame)">
          <rect width="600" height="600" fill="var(--paper-2)" />
          {/* lat/long grid */}
          {[100, 200, 300, 400, 500].map((v) => (
            <g key={v} stroke="var(--grid)" strokeWidth="1">
              <line x1={v} y1="0" x2={v} y2="600" />
              <line x1="0" y1={v} x2="600" y2={v} />
            </g>
          ))}
          {/* terrain contours */}
          <g fill="none" stroke="var(--terrain)" strokeWidth="1.4">
            <path d="M330 40 C420 70 520 40 600 90" />
            <path d="M300 110 C380 140 470 120 600 170" />
            <path d="M470 230 C520 210 560 250 600 240" />
            <path d="M260 470 C340 440 430 500 520 470 S600 430 610 450" />
            <path d="M300 540 C380 520 460 570 600 540" />
          </g>
          {/* Mobile Bay */}
          <path
            d="M0 0 L190 0 C200 60 175 110 205 170 C232 222 214 270 236 330 C252 378 228 430 250 490 C262 530 246 570 258 600 L0 600 Z"
            fill="var(--water)"
          />
          <path
            d="M0 0 L190 0 C200 60 175 110 205 170 C232 222 214 270 236 330 C252 378 228 430 250 490 C262 530 246 570 258 600 L0 600 Z"
            fill="url(#hatch)" opacity=".55"
          />
          <path
            d="M190 0 C200 60 175 110 205 170 C232 222 214 270 236 330 C252 378 228 430 250 490 C262 530 246 570 258 600"
            fill="none" stroke="var(--water-line)" strokeWidth="2.5"
          />
          <text x="60" y="250" className="chart-water">Mobile Bay</text>
          {/* town */}
          <g fill="var(--town)">
            <rect x="248" y="250" width="44" height="30" rx="3" opacity=".55" />
            <rect x="256" y="284" width="30" height="22" rx="3" opacity=".55" />
          </g>
          <text x="244" y="242" className="chart-town">Fairhope</text>
          {/* approach path + plane */}
          <path id="approach" d="M120 40 C230 70 320 120 380 190 S424 268 420 300"
            fill="none" stroke="var(--magenta)" strokeWidth="1.5" strokeDasharray="6 6" opacity=".7" />
          <g className="plane">
            <path d="M0 -11 L2 -3 L11 2 L11 4 L2 1 L1.5 8 L4 10 L4 11.5 L0 10.5 L-4 11.5 L-4 10 L-1.5 8 L-2 1 L-11 4 L-11 2 L-2 -3 Z"
              fill="var(--ink)" />
          </g>
          {/* compass rose */}
          <g transform={`translate(${AIRPORT.x} ${AIRPORT.y})`}>
            <circle r="120" fill="none" stroke="var(--blue)" strokeWidth="1.2" opacity=".8" />
            {ticks.map((t) => (
              <line key={t} x1="0" y1={-120} x2="0" y2={t % 30 === 0 ? -106 : -113}
                stroke="var(--blue)" strokeWidth={t % 90 === 0 ? 2.2 : 1.2} transform={`rotate(${t})`} />
            ))}
            {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([l, d]) => (
              <text key={l} className="chart-rose" transform={`rotate(${d}) translate(0 -91)`} textAnchor="middle" dominantBaseline="middle">{l}</text>
            ))}
            {/* heading needle */}
            <g className="needle" style={{ transform: `rotate(${heading}deg)` }}>
              <line x1="0" y1="-44" x2="0" y2="-124" stroke="var(--magenta)" strokeWidth="2.5" />
              <path d="M0 -136 L7 -122 L-7 -122 Z" fill="var(--magenta)" />
            </g>
            {/* airport symbol */}
            <circle r="30" fill="var(--paper-2)" stroke="var(--magenta)" strokeWidth="7" />
            <rect x="-4.5" y="-40" width="9" height="80" rx="1.5" fill="var(--magenta)" transform="rotate(10)" />
          </g>
          <g className="chart-label" transform="translate(420 470)" textAnchor="middle">
            <text y="0">FAIRHOPE EXEC</text>
            <text y="22">(KCQF)</text>
          </g>
        </g>
      </svg>
      <figcaption className="readout" aria-live="off">
        <span>Heading</span>
        <strong>{hdg}°</strong>
        <em>{touched ? 'All roads lead to KCQF' : 'Point anywhere to steer'}</em>
      </figcaption>
    </figure>
  );
}

const steps = [
  { t: 'Reserve online', d: 'Pick your dates and add your arrival details. It takes a couple of minutes.' },
  { t: 'Land at KCQF', d: 'Fly into Fairhope Executive Airport. We keep an eye on your arrival time.' },
  { t: 'Grab the keys', d: 'Your Palisade is parked and ready at the FBO. No shuttle, no counter line.' },
  { t: 'Drop it back', d: 'Return the car at the airport before you fly out and you are on your way.' },
];

const faqs = [
  { q: 'Where do I pick up the car?', a: 'Right at Fairhope Executive Airport (KCQF). After you book, we send the exact pickup spot and instructions.' },
  { q: 'What if my flight is running late?', a: 'Add your arrival details when you book. If plans change, call or text us and we will adjust your pickup.' },
  { q: 'How old do I need to be?', a: 'Renters must be at least 25 with a valid driver’s license.' },
  { q: 'Do I need my own insurance?', a: 'You can use your own auto policy or choose our damage waiver when you reserve.' },
  { q: 'How many people fit?', a: 'The Hyundai Palisade is a full three-row SUV, so there is room for your whole crew and their bags.' },
];

function Faq() {
  return (
    <div className="faq">
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>
            <span>{f.q}</span>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <a href="#" className="brand" aria-label="EzFlyer Rentals home">
          <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="4" /><rect x="14" y="3" width="4" height="26" rx="1" fill="currentColor" transform="rotate(10 16 16)" /></svg>
          <span>EzFlyer</span>
        </a>
        <nav>
          <a href="#how">How it works</a>
          <a href="#info">Info</a>
          <a className="btn btn-sm" href={BOOKING_URL}>Book a car</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">Car rental at Fairhope Executive Airport</p>
            <h1>Land.<br />Grab the keys.<br />Go.</h1>
            <p className="lede">
              EzFlyer keeps a small fleet of Hyundai Palisades waiting right on the field at KCQF,
              so your trip starts the moment you shut down.
            </p>
            <div className="cta-row">
              <a className="btn" href={BOOKING_URL}>Book a car</a>
              <a className="link" href="#how">See how it works</a>
            </div>
          </div>
          <ChartHero />
        </section>

        <section id="how" className="how">
          <h2>From the ramp to the road</h2>
          <ol>
            {steps.map((s, i) => (
              <li key={s.t}>
                <span className="num">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="info" className="info">
          <div className="car">
            <h2>Hyundai Palisade</h2>
            <p className="car-sub">Every car in the fleet is the same roomy three-row SUV.</p>
            <dl>
              <div><dt>Seats</dt><dd>Up to 8</dd></div>
              <div><dt>Fleet</dt><dd>3 cars</dd></div>
              <div><dt>Pickup</dt><dd>On the field</dd></div>
            </dl>
            <p className="note">With only three cars available, booking ahead is the best way to make sure one is waiting for you.</p>
          </div>

          <div className="needs">
            <h2>Before you book</h2>
            <ul>
              <li><strong>25 or older.</strong> Every renter needs to meet the minimum age.</li>
              <li><strong>Valid driver&rsquo;s license.</strong> You&rsquo;ll verify it when you reserve.</li>
              <li><strong>Insurance.</strong> Bring your own auto policy or add our damage waiver.</li>
            </ul>
          </div>
        </section>

        <section className="questions">
          <h2>Questions pilots ask</h2>
          <Faq />
        </section>

        <section className="final">
          <div>
            <h2>Flying into Fairhope?</h2>
            <p>Reserve your Palisade now and it will be ready when you land.</p>
          </div>
          <div className="final-actions">
            <a className="btn btn-light" href={BOOKING_URL}>Book a car</a>
            <p className="contact">
              <a href={PHONE_HREF}>{PHONE}</a>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
          </div>
        </section>
      </main>

      <footer className="foot">
        <p>EzFlyer Rentals, Fairhope Executive Airport (KCQF), Fairhope, Alabama</p>
        <p>&copy; {new Date().getFullYear()} EzFlyer Rentals</p>
      </footer>
    </>
  );
}
