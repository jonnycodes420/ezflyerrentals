import { useState } from 'react';
import { createReservation } from '../lib/api';

export default function ReservationForm() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    pickup_date: '', return_date: '', flight_number: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createReservation(form);
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Sorry, no Palisades are available for those dates. Try adjusting your dates.');
      } else {
        setError('Something went wrong. Please try again.');
      }
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
        <p>Your request has been received! We&apos;ll confirm via email within a few hours.</p>
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="field">
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" required value={form.first_name} onChange={handleChange} placeholder="Jane" />
          </div>
          <div className="field">
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" required value={form.last_name} onChange={handleChange} placeholder="Smith" />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@example.com" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="pickup_date">Pick-Up Date</label>
            <input id="pickup_date" name="pickup_date" type="date" required value={form.pickup_date} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="return_date">Return Date</label>
            <input id="return_date" name="return_date" type="date" required value={form.return_date} onChange={handleChange} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="flight_number">Arriving flight # <span className="optional">(optional)</span></label>
          <input id="flight_number" name="flight_number" value={form.flight_number} onChange={handleChange} placeholder="e.g. AA1234" />
        </div>

        <div className="field">
          <label htmlFor="notes">Anything else we should know? <span className="optional">(optional)</span></label>
          <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Special requests, passenger count, etc." />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Request Reservation'}
        </button>
      </form>
    </div>
    </div>
  );
}
