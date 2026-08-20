const express = require('express');
const { pool } = require('../db');
const { attachRelations, attachRelationsToMany } = require('../lib/destinations');

const router = express.Router();

// GET /api/destinations?q=&state=&category=&sort=name|state
router.get('/destinations', async (req, res) => {
  const { q = '', state = '', category = '', sort = 'name' } = req.query;

  const clauses = [`status = 'published'`];
  const params = [];

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    clauses.push(
      `(lower(name_en) LIKE $${params.length} OR lower(name_hi) LIKE $${params.length} OR lower(state) LIKE $${params.length} OR lower(district) LIKE $${params.length})`
    );
  }
  if (state) {
    params.push(state);
    clauses.push(`state = $${params.length}`);
  }
  if (category) {
    params.push(category);
    clauses.push(`category = $${params.length}`);
  }

  const orderBy = sort === 'state' ? 'state ASC, name_en ASC' : 'name_en ASC';
  const { rows } = await pool.query(
    `SELECT * FROM destinations WHERE ${clauses.join(' AND ')} ORDER BY ${orderBy}`,
    params
  );
  res.json(await attachRelationsToMany(rows));
});

// GET /api/destinations/nearby?lat=&lng=&radius_km=
router.get('/destinations/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = parseFloat(req.query.radius_km) || 25;
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  // Haversine distance computed in SQL; fine at this table size.
  const { rows } = await pool.query(
    `SELECT *, (
       6371 * acos(
         cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
         + sin(radians($1)) * sin(radians(lat))
       )
     ) AS distance_km
     FROM destinations
     WHERE status = 'published'
     HAVING (
       6371 * acos(
         cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
         + sin(radians($1)) * sin(radians(lat))
       )
     ) <= $3
     ORDER BY distance_km ASC`,
    [lat, lng, radiusKm]
  ).catch(async () => {
    // Some PG versions don't like HAVING without GROUP BY — fallback via subquery.
    return pool.query(
      `SELECT * FROM (
         SELECT *, (
           6371 * acos(
             cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
             + sin(radians($1)) * sin(radians(lat))
           )
         ) AS distance_km
         FROM destinations WHERE status = 'published'
       ) sub
       WHERE distance_km <= $3
       ORDER BY distance_km ASC`,
      [lat, lng, radiusKm]
    );
  });

  res.json(await attachRelationsToMany(rows));
});

// GET /api/destinations/:slug
router.get('/destinations/:slug', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM destinations WHERE slug = $1 AND status = 'published'`,
    [req.params.slug]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(await attachRelations(rows[0]));
});

// GET /api/meta/states — distinct states among published destinations
router.get('/meta/states', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT state FROM destinations WHERE status = 'published' ORDER BY state`
  );
  res.json(rows.map((r) => r.state));
});

module.exports = router;
