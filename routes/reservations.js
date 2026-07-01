const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const supabase = require('../supabase');

const upload = multer({ storage: multer.memoryStorage() });

// ── helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function uploadPhoto(file, email) {
  const ext = path.extname(file.originalname).slice(1) || 'jpg';
  const filePath = `${email}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('license-photos')
    .upload(filePath, file.buffer, { contentType: file.mimetype });
  if (error) throw error;
  const { data } = supabase.storage.from('license-photos').getPublicUrl(filePath);
  return data.publicUrl;
}

function maskSensitive(record) {
  if (!record) return record;
  const out = { ...record };
  if (out.license_number) out.license_number = `****${out.license_number.slice(-4)}`;
  if (out.insurance_policy_number) out.insurance_policy_number = `****${out.insurance_policy_number.slice(-4)}`;
  return out;
}

// ── POST /api/reservations ────────────────────────────────────────────────────

router.post(
  '/',
  upload.fields([
    { name: 'license_front', maxCount: 1 },
    { name: 'license_back',  maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      first_name, last_name, email, phone,
      pickup_date, return_date, flight_number, notes,
      date_of_birth, license_number, license_state, license_expiry,
      insurance_choice, insurance_provider, insurance_policy_number,
      terms_agreed, signature_name,
    } = req.body;

    // ── date validation ──
    if (!pickup_date || !return_date || new Date(pickup_date) >= new Date(return_date)) {
      return res.status(400).json({ success: false, error: 'pickup_date must be before return_date.' });
    }

    // ── age (25+) ──
    if (!date_of_birth) {
      return res.status(400).json({ success: false, error: 'Date of birth is required.' });
    }
    if (calcAge(date_of_birth) < 25) {
      return res.status(400).json({ success: false, error: 'Renters must be 25 or older.' });
    }

    // ── license fields ──
    if (!license_number || !license_state || !license_expiry) {
      return res.status(400).json({ success: false, error: 'License number, state, and expiry are required.' });
    }
    if (new Date(license_expiry) < new Date(return_date)) {
      return res.status(400).json({ success: false, error: "Driver's license expires before the rental period ends." });
    }
    if (!req.files?.license_front) {
      return res.status(400).json({ success: false, error: 'Front photo of driver\'s license is required.' });
    }

    // ── insurance ──
    if (!['own_coverage', 'damage_waiver'].includes(insurance_choice)) {
      return res.status(400).json({ success: false, error: "insurance_choice must be 'own_coverage' or 'damage_waiver'." });
    }
    if (insurance_choice === 'own_coverage' && (!insurance_provider || !insurance_policy_number)) {
      return res.status(400).json({ success: false, error: 'Insurance provider and policy number are required for own coverage.' });
    }

    // ── terms & signature ──
    if (terms_agreed !== 'true' && terms_agreed !== true) {
      return res.status(400).json({ success: false, error: 'You must agree to the terms.' });
    }
    if (!signature_name) {
      return res.status(400).json({ success: false, error: 'Signature name is required.' });
    }

    // ── availability check (existing logic) ──
    const { count, error: countError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'declined')
      .lt('pickup_date', return_date)
      .gt('return_date', pickup_date);

    if (countError) {
      console.error('Availability check failed:', countError.message);
      return res.status(500).json({ success: false, error: 'Availability check failed.' });
    }
    if (count >= 3) {
      return res.status(409).json({ success: false, error: 'No vehicles available for those dates.' });
    }

    // ── upload photos ──
    let license_front_url, license_back_url;
    try {
      license_front_url = await uploadPhoto(req.files.license_front[0], email);
      if (req.files.license_back) {
        license_back_url = await uploadPhoto(req.files.license_back[0], email);
      }
    } catch (uploadErr) {
      console.error('Photo upload error:', uploadErr.message);
      return res.status(500).json({ success: false, error: 'Failed to upload license photos.' });
    }

    // ── insert ──
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        first_name, last_name, email, phone,
        pickup_date, return_date, flight_number, notes,
        date_of_birth, license_number, license_state, license_expiry,
        license_front_url,
        license_back_url: license_back_url || null,
        insurance_choice,
        insurance_provider:      insurance_choice === 'own_coverage' ? insurance_provider      : null,
        insurance_policy_number: insurance_choice === 'own_coverage' ? insurance_policy_number : null,
        terms_agreed:    true,
        terms_agreed_at: new Date().toISOString(),
        signature_name,
        age_confirmed: true,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to create reservation.' });
    }

    return res.status(201).json({ success: true, data: maskSensitive(data) });
  }
);

// ── GET /api/reservations ─────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from('reservations')
    .select('*')
    .order('pickup_date', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch reservations.' });
  }

  return res.json({ success: true, data: data.map(maskSensitive) });
});

// ── GET /api/reservations/:id ─────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch reservation.' });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: 'Reservation not found.' });
  }

  return res.json({ success: true, data: maskSensitive(data) });
});

// ── PUT /api/reservations/:id/status ─────────────────────────────────────────

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
    console.error(error.message);
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: 'Reservation not found.' });
  }

  return res.json({ success: true, data: maskSensitive(data) });
});

module.exports = router;
