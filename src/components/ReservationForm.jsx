import { useState, useCallback, Fragment } from 'react';
import { createReservation } from '../lib/api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const STEP_LABELS = ['Trip & Contact', 'Driver Verification', 'Insurance & Agreement'];

function calcAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const EMPTY_FIELDS = {
  first_name: '', last_name: '', email: '', phone: '',
  pickup_date: '', return_date: '', flight_number: '', notes: '',
  date_of_birth: '', license_number: '', license_state: '', license_expiry: '',
  insurance_choice: '', insurance_provider: '', insurance_policy_number: '',
  signature_name: '',
};

export default function ReservationForm() {
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [licFront, setLicFront] = useState(null);
  const [licFrontPreview, setLicFrontPreview] = useState('');
  const [licBack, setLicBack] = useState(null);
  const [licBackPreview, setLicBackPreview] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');

  const set = (name, value) => setFields(prev => ({ ...prev, [name]: value }));
  const handleChange = (e) => { set(e.target.name, e.target.value); setStepError(''); };

  const age = calcAge(fields.date_of_birth);
  const ageUnder25 = !!fields.date_of_birth && age !== null && age < 25;

  const handleFile = useCallback((file, setFile, setPreview) => {
    if (!file) return;
    setFile(file);
    setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
  }, []);

  const validateStep1 = () => {
    const { first_name, last_name, email, phone, pickup_date, return_date } = fields;
    if (!first_name || !last_name || !email || !phone || !pickup_date || !return_date) {
      setStepError('Please fill in all required fields.'); return false;
    }
    if (new Date(pickup_date) >= new Date(return_date)) {
      setStepError('Pick-up date must be before return date.'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { date_of_birth, license_number, license_state, license_expiry } = fields;
    if (!date_of_birth || !license_number || !license_state || !license_expiry) {
      setStepError('Please fill in all required driver verification fields.'); return false;
    }
    if (ageUnder25) { setStepError('Renters must be 25 or older.'); return false; }
    if (!licFront)  { setStepError('Please upload the front of your driver\'s license.'); return false; }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStepError('');
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => { setStepError(''); setStep(s => s - 1); window.scrollTo(0, 0); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.insurance_choice) { setStepError('Please select an insurance option.'); return; }
    if (fields.insurance_choice === 'own_coverage' && (!fields.insurance_provider || !fields.insurance_policy_number)) {
      setStepError('Please provide your insurance provider and policy number.'); return;
    }
    if (!termsAgreed) { setStepError('You must agree to the terms.'); return; }
    if (!fields.signature_name) { setStepError('Signature is required.'); return; }

    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    fd.append('terms_agreed', 'true');
    if (licFront) fd.append('license_front', licFront);
    if (licBack)  fd.append('license_back',  licBack);

    setLoading(true);
    setError('');
    try {
      await createReservation(fd);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-page">
        <div className="card success-card">
          <div className="success-icon">✓</div>
          <h2>Request Received!</h2>
          <p>Your request has been received! We&apos;ll verify your details and confirm via email within a few hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="card">
        <div className="card-header">
          <h1>EzFlyer Rentals</h1>
          <p className="tagline">Private Airport Car Rental — Fairhope, AL</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className="step-track">
            {[1, 2, 3].map((n, i) => (
              <Fragment key={n}>
                <div className={`step-dot-wrap${step >= n ? ' active' : ''}${step > n ? ' done' : ''}`}>
                  <div className="step-dot">{step > n ? '✓' : n}</div>
                  <span className="step-label">{STEP_LABELS[i]}</span>
                </div>
                {n < 3 && <div className={`step-line${step > n ? ' filled' : ''}`} />}
              </Fragment>
            ))}
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* ── STEP 1: Trip & Contact ── */}
        {step === 1 && (
          <div>
            <div className="row">
              <div className="field">
                <label>First Name</label>
                <input name="first_name" required value={fields.first_name} onChange={handleChange} placeholder="Jane" />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input name="last_name" required value={fields.last_name} onChange={handleChange} placeholder="Smith" />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" required value={fields.email} onChange={handleChange} placeholder="jane@example.com" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input name="phone" type="tel" required value={fields.phone} onChange={handleChange} placeholder="(555) 000-0000" />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Pick-Up Date</label>
                <input name="pickup_date" type="date" required value={fields.pickup_date} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Return Date</label>
                <input name="return_date" type="date" required value={fields.return_date} onChange={handleChange} />
              </div>
            </div>
            <div className="field">
              <label>Arriving flight # <span className="optional">(optional)</span></label>
              <input name="flight_number" value={fields.flight_number} onChange={handleChange} placeholder="e.g. AA1234" />
            </div>
            <div className="field">
              <label>Anything else we should know? <span className="optional">(optional)</span></label>
              <textarea name="notes" rows={3} value={fields.notes} onChange={handleChange} placeholder="Special requests, passenger count, etc." />
            </div>
            {stepError && <p className="error-msg">{stepError}</p>}
            <button type="button" className="btn-primary" onClick={nextStep}>Next →</button>
          </div>
        )}

        {/* ── STEP 2: Driver Verification ── */}
        {step === 2 && (
          <div>
            <div className="field">
              <label>Date of Birth</label>
              <input name="date_of_birth" type="date" required value={fields.date_of_birth} onChange={handleChange} />
              {ageUnder25 && <p className="inline-error">Renters must be 25 or older.</p>}
              {fields.date_of_birth && !ageUnder25 && age !== null && (
                <p className="inline-ok">Age: {age} ✓</p>
              )}
            </div>
            <div className="field">
              <label>Driver&apos;s License Number</label>
              <input name="license_number" required value={fields.license_number} onChange={handleChange} placeholder="e.g. D123456789" />
            </div>
            <div className="row">
              <div className="field">
                <label>License State</label>
                <select name="license_state" required value={fields.license_state} onChange={handleChange}>
                  <option value="">Select state…</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>License Expiration Date</label>
                <input name="license_expiry" type="date" required value={fields.license_expiry} onChange={handleChange} />
              </div>
            </div>

            <div className="field">
              <label>License Photo — Front <span className="required-tag">Required</span></label>
              <label className="file-upload-area">
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0], setLicFront, setLicFrontPreview)} />
                {licFrontPreview
                  ? <img src={licFrontPreview} className="thumb-preview" alt="License front preview" />
                  : <span className="file-upload-prompt">↑ Click to upload front of license</span>}
              </label>
            </div>

            <div className="field">
              <label>License Photo — Back <span className="optional">(optional)</span></label>
              <label className="file-upload-area">
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0], setLicBack, setLicBackPreview)} />
                {licBackPreview
                  ? <img src={licBackPreview} className="thumb-preview" alt="License back preview" />
                  : <span className="file-upload-prompt">↑ Click to upload back of license</span>}
              </label>
            </div>

            {stepError && <p className="error-msg">{stepError}</p>}
            <div className="btn-row">
              <button type="button" className="btn-secondary" onClick={prevStep}>← Back</button>
              <button type="button" className="btn-primary" onClick={nextStep} disabled={ageUnder25}>Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Insurance & Agreement ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h3 className="section-title">Insurance</h3>
            <div className="radio-group">
              {[
                { value: 'own_coverage',   title: 'I have my own auto insurance',      desc: "You'll provide your policy details below." },
                { value: 'damage_waiver',  title: 'Add EzFlyer Damage Waiver',          desc: 'Coverage details will be confirmed and added at pickup.' },
              ].map(opt => (
                <label key={opt.value} className={`radio-option${fields.insurance_choice === opt.value ? ' selected' : ''}`}>
                  <input type="radio" name="insurance_choice" value={opt.value}
                    checked={fields.insurance_choice === opt.value} onChange={handleChange} />
                  <div>
                    <p className="radio-title">{opt.title}</p>
                    <p className="radio-desc">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {fields.insurance_choice === 'own_coverage' && (
              <div className="insurance-fields">
                <div className="field">
                  <label>Insurance Provider</label>
                  <input name="insurance_provider" value={fields.insurance_provider} onChange={handleChange} placeholder="e.g. State Farm" />
                </div>
                <div className="field">
                  <label>Policy Number</label>
                  <input name="insurance_policy_number" value={fields.insurance_policy_number} onChange={handleChange} placeholder="e.g. SF-1234567" />
                </div>
              </div>
            )}

            {fields.insurance_choice === 'damage_waiver' && (
              <p className="info-note">The damage waiver rate will be confirmed and included in your rental agreement at pickup.</p>
            )}

            <h3 className="section-title">Terms &amp; Conditions</h3>
            <div className="terms-box">
              <p className="terms-placeholder-notice">⚠️ PLACEHOLDER — REQUIRES LEGAL REVIEW BEFORE LAUNCH</p>
              <p>These Terms and Conditions (&quot;Agreement&quot;) govern the rental of vehicles from EzFlyer Rentals, operating at Fairhope Executive Airport, Fairhope, AL. By submitting this reservation request you agree to all terms below.</p>
              <p><strong>1. Age Requirement.</strong> Renters must be at least 25 years of age at the time of pickup. A valid driver&apos;s license will be inspected at pickup and must not be expired.</p>
              <p><strong>2. Authorized Drivers.</strong> Only the approved renter named in this agreement may operate the vehicle. Sub-renting or lending the vehicle to any third party is strictly prohibited.</p>
              <p><strong>3. Insurance.</strong> Renters must carry valid personal auto insurance covering the rental vehicle, or purchase the EzFlyer Damage Waiver at pickup. Renters are financially responsible for all damage not covered by their selected insurance option.</p>
              <p><strong>4. Fuel Policy.</strong> Vehicles must be returned with the same fuel level as at the time of pickup. A refueling service fee will be charged for vehicles returned with less fuel.</p>
              <p><strong>5. Late Returns.</strong> Returns more than two (2) hours after the agreed return time will incur an additional full-day rental charge.</p>
              <p><strong>6. Prohibited Uses.</strong> The vehicle may not be used for commercial hire, off-road driving, competitive racing or events, towing, or transportation across international borders.</p>
              <p><strong>7. Cancellations.</strong> Cancellations made more than 48 hours before the scheduled pickup are free of charge. Cancellations within 48 hours may incur a one-day rental fee at the sole discretion of EzFlyer Rentals.</p>
              <p><strong>8. Liability Limitation.</strong> EzFlyer Rentals is not liable for loss of or damage to personal property left in the vehicle, any loss-of-use claims, or indirect or consequential damages of any kind.</p>
              <p><strong>9. Governing Law.</strong> This Agreement shall be governed by the laws of the State of Alabama.</p>
              <p className="terms-placeholder-notice">⚠️ END PLACEHOLDER — Replace with attorney-reviewed terms before launch.</p>
            </div>

            <label className="checkbox-row">
              <input type="checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
              <span>I have read and agree to the Terms &amp; Conditions and confirm that I am 25 or older.</span>
            </label>

            <h3 className="section-title">Signature</h3>
            <div className="field">
              <label>Type your full legal name to sign</label>
              <input
                name="signature_name"
                className="signature-input"
                value={fields.signature_name}
                onChange={handleChange}
                placeholder="Jane A. Smith"
                required
              />
            </div>

            {stepError && <p className="error-msg">{stepError}</p>}
            <div className="btn-row">
              <button type="button" className="btn-secondary" onClick={prevStep}>← Back</button>
              <button type="submit" className="btn-primary" disabled={loading || !termsAgreed}>
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
