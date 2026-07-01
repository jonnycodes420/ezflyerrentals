import { useState, useEffect, useCallback } from 'react';
import { getReservations, updateStatus } from '../lib/api';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'declined'];

const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', declined: 'Declined' };

export default function AdminView() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReservations(filter === 'all' ? '' : filter);
      setReservations(res.data.data);
    } catch {
      // silent — table will stay empty
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateStatus(id, status);
      await fetchReservations();
    } finally {
      setActionLoading(null);
    }
  };

  const rowClass = (status) => {
    if (status === 'confirmed') return 'row-confirmed';
    if (status === 'declined') return 'row-declined';
    return 'row-pending';
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1>EzFlyer Rentals — Admin</h1>
        <p className="tagline">Fairhope Executive Airport · 3 × 2024 Hyundai Palisade</p>
      </div>

      <div className="filter-bar">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
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
              {reservations.map((r) => (
                <tr key={r.id} className={rowClass(r.status)}>
                  <td>{r.first_name} {r.last_name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.pickup_date}</td>
                  <td>{r.return_date}</td>
                  <td>{r.flight_number || '—'}</td>
                  <td className="notes-cell">{r.notes || '—'}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status]}</span>
                  </td>
                  <td className="actions-cell">
                    {r.status !== 'confirmed' && (
                      <button
                        className="btn-confirm"
                        disabled={!!actionLoading}
                        onClick={() => handleStatus(r.id, 'confirmed')}
                      >
                        {actionLoading === r.id + 'confirmed' ? '…' : 'Confirm'}
                      </button>
                    )}
                    {r.status !== 'declined' && (
                      <button
                        className="btn-decline"
                        disabled={!!actionLoading}
                        onClick={() => handleStatus(r.id, 'declined')}
                      >
                        {actionLoading === r.id + 'declined' ? '…' : 'Decline'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
