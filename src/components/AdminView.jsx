import { useState, useEffect, useCallback, Fragment } from 'react';
import { getReservations, updateStatus } from '../lib/api';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'declined'];
const STATUS_LABELS  = { pending: 'Pending', confirmed: 'Confirmed', declined: 'Declined' };

const INS_LABELS = { own_coverage: 'Own Coverage', damage_waiver: 'Damage Waiver' };

function fmtDate(d)  { return d ? new Date(d + 'T00:00:00').toLocaleDateString() : '—'; }
function fmtTs(ts)   { return ts ? new Date(ts).toLocaleString() : '—'; }

export default function AdminView() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter]             = useState('all');
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId]     = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReservations(filter === 'all' ? '' : filter);
      setReservations(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateStatus(id, status);
      await fetchReservations();
    } finally {
      setActionLoading(null);
    }
  };

  const toggleDetail = (id) => setExpandedId(prev => prev === id ? null : id);

  const rowClass = (s) =>
    s === 'confirmed' ? 'row-confirmed' : s === 'declined' ? 'row-declined' : 'row-pending';

  const expanded = reservations.find(r => r.id === expandedId);

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1>EzFlyer Rentals — Admin</h1>
        <p className="tagline">Fairhope Executive Airport · 3 × 2024 Hyundai Palisade</p>
      </div>

      <div className="filter-bar">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={`filter-btn${filter === s ? ' active' : ''}`}
            onClick={() => { setFilter(s); setExpandedId(null); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-msg">Loading…</p>
      ) : reservations.length === 0 ? (
        <p className="empty-msg">No reservations found.</p>
      ) : (
        <>
          <div className="table-scroll">
            <table className="res-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Pick-Up</th>
                  <th>Return</th>
                  <th>Flight #</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <Fragment key={r.id}>
                    <tr className={rowClass(r.status)}>
                      <td>{r.first_name} {r.last_name}</td>
                      <td>{r.email}</td>
                      <td>{r.phone}</td>
                      <td>{fmtDate(r.pickup_date)}</td>
                      <td>{fmtDate(r.return_date)}</td>
                      <td>{r.flight_number || '—'}</td>
                      <td className="notes-cell">{r.notes || '—'}</td>
                      <td>
                        <span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status]}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className={`btn-details${expandedId === r.id ? ' open' : ''}`}
                          onClick={() => toggleDetail(r.id)}
                        >
                          {expandedId === r.id ? 'Hide' : 'Details'}
                        </button>
                        {r.status !== 'confirmed' && (
                          <button className="btn-confirm" disabled={!!actionLoading}
                            onClick={() => handleStatus(r.id, 'confirmed')}>
                            {actionLoading === r.id + 'confirmed' ? '…' : 'Confirm'}
                          </button>
                        )}
                        {r.status !== 'declined' && (
                          <button className="btn-decline" disabled={!!actionLoading}
                            onClick={() => handleStatus(r.id, 'declined')}>
                            {actionLoading === r.id + 'declined' ? '…' : 'Decline'}
                          </button>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {expanded && (
            <div className="detail-panel">
              <div className="detail-panel-header">
                <h3>Verification Details — {expanded.first_name} {expanded.last_name}</h3>
                <button className="detail-close" onClick={() => setExpandedId(null)}>✕ Close</button>
              </div>

              <div className="detail-section">
                <p className="detail-section-title">Driver Info</p>
                <div className="detail-grid">
                  <DetailItem label="Date of Birth"    value={fmtDate(expanded.date_of_birth)} />
                  <DetailItem label="Age Confirmed"    value={expanded.age_confirmed ? 'Yes' : 'No'} />
                  <DetailItem label="License #"        value={expanded.license_number || '—'} />
                  <DetailItem label="State"            value={expanded.license_state || '—'} />
                  <DetailItem label="Expiry"           value={fmtDate(expanded.license_expiry)} />
                </div>
              </div>

              <div className="detail-section">
                <p className="detail-section-title">Insurance</p>
                <div className="detail-grid">
                  <DetailItem label="Coverage Type"   value={INS_LABELS[expanded.insurance_choice] || '—'} />
                  {expanded.insurance_choice === 'own_coverage' && (
                    <>
                      <DetailItem label="Provider"    value={expanded.insurance_provider || '—'} />
                      <DetailItem label="Policy #"    value={expanded.insurance_policy_number || '—'} />
                    </>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <p className="detail-section-title">Agreement</p>
                <div className="detail-grid">
                  <DetailItem label="Terms Agreed"    value={expanded.terms_agreed ? 'Yes' : 'No'} />
                  <DetailItem label="Agreed At"       value={fmtTs(expanded.terms_agreed_at)} />
                  <DetailItem label="Signature"       value={expanded.signature_name || '—'} signature />
                </div>
              </div>

              {(expanded.license_front_url || expanded.license_back_url) && (
                <div className="detail-section">
                  <p className="detail-section-title">License Photos</p>
                  <div className="detail-photos">
                    {expanded.license_front_url && (
                      <a href={expanded.license_front_url} target="_blank" rel="noreferrer" className="photo-link">
                        View Front ↗
                      </a>
                    )}
                    {expanded.license_back_url && (
                      <a href={expanded.license_back_url} target="_blank" rel="noreferrer" className="photo-link">
                        View Back ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailItem({ label, value, signature }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className={`detail-value${signature ? ' detail-signature' : ''}`}>{value}</span>
    </div>
  );
}
