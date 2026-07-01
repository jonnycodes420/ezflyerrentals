const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// POST /api/reservations
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone, pickup_date, return_date, flight_number, notes } = req.body;

  if (!pickup_date || !return_date || new Date(pickup_date) >= new Date(return_date)) {
    return res.status(400).json({ success: false, error: 'pickup_date must be before return_date.' });
  }

  // Count overlapping reservations across all 3 vehicles
  const { count, error: countError } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'declined')
    .lt('pickup_date', return_date)
    .gt('return_date', pickup_date);

  if (countError) {
    console.error(countError);
    return res.status(500).json({ success: false, error: 'Availability check failed.' });
  }

  if (count >= 3) {
    return res.status(409).json({ success: false, error: 'No vehicles available for those dates.' });
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert([{ first_name, last_name, email, phone, pickup_date, return_date, flight_number, notes, status: 'pending' }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to create reservation.' });
  }

  return res.status(201).json({ success: true, data });
});

// GET /api/reservations
router.get('/', async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from('reservations')
    .select('*')
    .order('pickup_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to fetch reservations.' });
  }

  return res.json({ success: true, data });
});

// PUT /api/reservations/:id/status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['confirmed', 'declined'].includes(status)) {
    return res.status(400).json({ success: false, error: "status must be 'confirmed' or 'declined'." });
  }

  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: 'Reservation not found.' });
  }

  return res.json({ success: true, data });
});

module.exports = router;
