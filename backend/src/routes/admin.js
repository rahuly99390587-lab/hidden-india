























// const express = require('express');
// const { pool } = require('../db');
// const { requireAdmin } = require('../middleware/auth');
// const { uniqueSlug, attachRelations, attachRelationsToMany, replaceRelations } = require('../lib/destinations');

// const router = express.Router();
// router.use(requireAdmin);

// const FIELDS = [
//   'name_en', 'name_hi', 'state', 'district', 'category', 'lat', 'lng',
//   'short_en', 'short_hi', 'about_en', 'about_hi', 'history_en', 'history_hi',
//   'culture_en', 'culture_hi', 'best_time_en', 'best_time_hi', 'cover_image',
//   'status', 'verified',
// ];

// // GET /api/admin/dashboard — quick stats for the admin home
// router.get('/dashboard', async (req, res) => {
//   const { rows } = await pool.query(`
//     SELECT status, count(*)::int AS n FROM destinations GROUP BY status
//   `);
//   const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.n]));
//   const { rows: total } = await pool.query('SELECT count(*)::int AS n FROM destinations');
//   res.json({
//     total: total[0].n,
//     published: byStatus.published || 0,
//     draft: byStatus.draft || 0,
//   });
// });

// // GET /api/admin/destinations — all statuses, for the admin table
// router.get('/destinations', async (req, res) => {
//   const { rows } = await pool.query('SELECT * FROM destinations ORDER BY updated_at DESC');
//   res.json(await attachRelationsToMany(rows));
// });

// // POST /api/admin/destinations — create
// router.post('/destinations', async (req, res) => {
//   const body = req.body || {};
//   if (!body.name_en || !body.state || body.lat == null || body.lng == null) {
//     return res.status(400).json({ error: 'name_en, state, lat, lng are required' });
//   }

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     const slug = await uniqueSlug(body.name_en);
//     const values = FIELDS.map((f) => (body[f] === undefined ? null : body[f]));
//     const { rows } = await client.query(
//       `INSERT INTO destinations (slug, ${FIELDS.join(', ')})
//        VALUES ($1, ${FIELDS.map((_, i) => `$${i + 2}`).join(', ')})
//        RETURNING *`,
//       [slug, ...values]
//     );
//     await replaceRelations(client, rows[0].id, {
//       images: body.images, tips: body.tips, sources: body.sources, nearby: body.nearby,
//     });
//     await client.query('COMMIT');
//     res.status(201).json(await attachRelations(rows[0]));
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // PUT /api/admin/destinations/:id — update
// router.put('/destinations/:id', async (req, res) => {
//   const { id } = req.params;
//   const body = req.body || {};

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     const { rows: existingRows } = await client.query('SELECT * FROM destinations WHERE id = $1', [id]);
//     if (!existingRows[0]) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ error: 'Not found' });
//     }

//     let slug = existingRows[0].slug;
//     if (body.name_en && body.name_en !== existingRows[0].name_en) {
//       slug = await uniqueSlug(body.name_en, id);
//     }

//     const merged = { ...existingRows[0], ...body };
//     const values = FIELDS.map((f) => merged[f]);
//     const { rows } = await client.query(
//       `UPDATE destinations SET slug = $1, ${FIELDS.map((f, i) => `${f} = $${i + 2}`).join(', ')}
//        WHERE id = $${FIELDS.length + 2} RETURNING *`,
//       [slug, ...values, id]
//     );
//     await replaceRelations(client, id, {
//       images: body.images ?? existingRows[0].images,
//       tips: body.tips ?? existingRows[0].tips,
//       sources: body.sources ?? existingRows[0].sources,
//       nearby: body.nearby ?? existingRows[0].nearby,
//     });
//     await client.query('COMMIT');
//     res.json(await attachRelations(rows[0]));
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // DELETE /api/admin/destinations/:id
// router.delete('/destinations/:id', async (req, res) => {
//   const { rowCount } = await pool.query('DELETE FROM destinations WHERE id = $1', [req.params.id]);
//   if (!rowCount) return res.status(404).json({ error: 'Not found' });
//   res.status(204).end();
// });

// // POST /api/admin/destinations/import — bulk create from parsed CSV rows
// // Body: { rows: [{ name_en, name_hi, state, district, category, latitude, longitude,
// //                   short_description_en, short_description_hi, description_en,
// //                   description_hi, cover_image, best_time_en, verified }] }
// router.post('/destinations/import', async (req, res) => {
//   const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
//   const results = [];

//   for (const r of rows) {
//     const lat = parseFloat(r.latitude);
//     const lng = parseFloat(r.longitude);
//     if (!r.name_en || !r.state || Number.isNaN(lat) || Number.isNaN(lng)) {
//       results.push({ name_en: r.name_en || null, ok: false, error: 'Missing/invalid required field' });
//       continue;
//     }
//     try {
//       const slug = await uniqueSlug(r.name_en);
//       const { rows: inserted } = await pool.query(
//         `INSERT INTO destinations
//           (slug, name_en, name_hi, state, district, category, lat, lng,
//            short_en, short_hi, about_en, about_hi, best_time_en, cover_image, status, verified)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'draft',$15)
//          RETURNING id, slug`,
//         [
//           slug, r.name_en, r.name_hi || '', r.state, r.district || '', r.category || 'heritage',
//           lat, lng, r.short_description_en || '', r.short_description_hi || '',
//           r.description_en || '', r.description_hi || '', r.best_time_en || '',
//           r.cover_image || '', String(r.verified).toLowerCase() === 'true',
//         ]
//       );
//       results.push({ name_en: r.name_en, ok: true, id: inserted[0].id, slug: inserted[0].slug });
//     } catch (err) {
//       results.push({ name_en: r.name_en, ok: false, error: err.message });
//     }
//   }

//   res.json({
//     imported: results.filter((r) => r.ok).length,
//     failed: results.filter((r) => !r.ok).length,
//     results,
//   });
// });

// module.exports = router;



































































































const express = require('express');
const { pool } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { uniqueSlug, attachRelations, attachRelationsToMany, replaceRelations } = require('../lib/destinations');

const router = express.Router();
router.use(requireAdmin);

const FIELDS = [
  'name_en', 'name_hi', 'state', 'district', 'category', 'lat', 'lng',
  'short_en', 'short_hi', 'about_en', 'about_hi', 'history_en', 'history_hi',
  'culture_en', 'culture_hi', 'best_time_en', 'best_time_hi', 'cover_image',
  'food_en', 'food_hi', 'food_image', 'stay_en', 'stay_hi', 'stay_image',
  'local_language_en', 'local_language_hi', 'budget_en', 'budget_hi',
  'status', 'verified',
];

// GET /api/admin/dashboard — quick stats for the admin home
router.get('/dashboard', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT status, count(*)::int AS n FROM destinations GROUP BY status
  `);
  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  const { rows: total } = await pool.query('SELECT count(*)::int AS n FROM destinations');
  res.json({
    total: total[0].n,
    published: byStatus.published || 0,
    draft: byStatus.draft || 0,
  });
});

// GET /api/admin/destinations — all statuses, for the admin table
router.get('/destinations', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM destinations ORDER BY updated_at DESC');
  res.json(await attachRelationsToMany(rows));
});

// POST /api/admin/destinations — create
router.post('/destinations', async (req, res) => {
  const body = req.body || {};
  if (!body.name_en || !body.state || body.lat == null || body.lng == null) {
    return res.status(400).json({ error: 'name_en, state, lat, lng are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const slug = await uniqueSlug(body.name_en);
    const values = FIELDS.map((f) => (body[f] === undefined ? null : body[f]));
    const { rows } = await client.query(
      `INSERT INTO destinations (slug, ${FIELDS.join(', ')})
       VALUES ($1, ${FIELDS.map((_, i) => `$${i + 2}`).join(', ')})
       RETURNING *`,
      [slug, ...values]
    );
    await replaceRelations(client, rows[0].id, {
      images: body.images, tips: body.tips, sources: body.sources, nearby: body.nearby,
    });
    await client.query('COMMIT');
    res.status(201).json(await attachRelations(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/admin/destinations/:id — update
router.put('/destinations/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existingRows } = await client.query('SELECT * FROM destinations WHERE id = $1', [id]);
    if (!existingRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }

    let slug = existingRows[0].slug;
    if (body.name_en && body.name_en !== existingRows[0].name_en) {
      slug = await uniqueSlug(body.name_en, id);
    }

    const merged = { ...existingRows[0], ...body };
    const values = FIELDS.map((f) => merged[f]);
    const { rows } = await client.query(
      `UPDATE destinations SET slug = $1, ${FIELDS.map((f, i) => `${f} = $${i + 2}`).join(', ')}
       WHERE id = $${FIELDS.length + 2} RETURNING *`,
      [slug, ...values, id]
    );
    await replaceRelations(client, id, {
      images: body.images ?? existingRows[0].images,
      tips: body.tips ?? existingRows[0].tips,
      sources: body.sources ?? existingRows[0].sources,
      nearby: body.nearby ?? existingRows[0].nearby,
    });
    await client.query('COMMIT');
    res.json(await attachRelations(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/destinations/:id
router.delete('/destinations/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM destinations WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// POST /api/admin/destinations/import — bulk create from parsed CSV rows
// Body: { rows: [{ name_en, name_hi, state, district, category, latitude, longitude,
//                   short_description_en, short_description_hi, description_en,
//                   description_hi, cover_image, best_time_en, verified }] }
router.post('/destinations/import', async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const results = [];

  for (const r of rows) {
    const lat = parseFloat(r.latitude);
    const lng = parseFloat(r.longitude);
    if (!r.name_en || !r.state || Number.isNaN(lat) || Number.isNaN(lng)) {
      results.push({ name_en: r.name_en || null, ok: false, error: 'Missing/invalid required field' });
      continue;
    }
    try {
      const slug = await uniqueSlug(r.name_en);
      const { rows: inserted } = await pool.query(
        `INSERT INTO destinations
          (slug, name_en, name_hi, state, district, category, lat, lng,
           short_en, short_hi, about_en, about_hi, best_time_en, cover_image, status, verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'draft',$15)
         RETURNING id, slug`,
        [
          slug, r.name_en, r.name_hi || '', r.state, r.district || '', r.category || 'heritage',
          lat, lng, r.short_description_en || '', r.short_description_hi || '',
          r.description_en || '', r.description_hi || '', r.best_time_en || '',
          r.cover_image || '', String(r.verified).toLowerCase() === 'true',
        ]
      );
      results.push({ name_en: r.name_en, ok: true, id: inserted[0].id, slug: inserted[0].slug });
    } catch (err) {
      results.push({ name_en: r.name_en, ok: false, error: err.message });
    }
  }

  res.json({
    imported: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
});

module.exports = router;