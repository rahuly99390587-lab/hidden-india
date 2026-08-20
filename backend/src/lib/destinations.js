const { pool } = require('../db');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uniqueSlug(base, excludeId = null) {
  let slug = slugify(base);
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await pool.query(
      excludeId
        ? 'SELECT id FROM destinations WHERE slug = $1 AND id != $2'
        : 'SELECT id FROM destinations WHERE slug = $1',
      excludeId ? [slug, excludeId] : [slug]
    );
    if (rows.length === 0) return slug;
    slug = `${slugify(base)}-${n++}`;
  }
}

// Attaches images/tips/sources arrays to a base destination row.
async function attachRelations(dest) {
  const [images, tips, sources] = await Promise.all([
    pool.query(
      'SELECT url, alt FROM destination_images WHERE destination_id = $1 ORDER BY sort_order',
      [dest.id]
    ),
    pool.query(
      'SELECT en, hi FROM destination_tips WHERE destination_id = $1 ORDER BY sort_order',
      [dest.id]
    ),
    pool.query(
      'SELECT organization, title, url FROM destination_sources WHERE destination_id = $1',
      [dest.id]
    ),
  ]);
  return {
    ...dest,
    images: images.rows,
    tips: tips.rows,
    sources: sources.rows,
  };
}

async function attachRelationsToMany(destinations) {
  return Promise.all(destinations.map(attachRelations));
}

// Replaces all images/tips/sources for a destination with the given arrays.
async function replaceRelations(client, destinationId, { images = [], tips = [], sources = [] }) {
  await client.query('DELETE FROM destination_images WHERE destination_id = $1', [destinationId]);
  await client.query('DELETE FROM destination_tips WHERE destination_id = $1', [destinationId]);
  await client.query('DELETE FROM destination_sources WHERE destination_id = $1', [destinationId]);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    await client.query(
      'INSERT INTO destination_images (destination_id, url, alt, sort_order) VALUES ($1, $2, $3, $4)',
      [destinationId, img.url || '', img.alt || '', i]
    );
  }
  for (let i = 0; i < tips.length; i++) {
    const tip = tips[i];
    await client.query(
      'INSERT INTO destination_tips (destination_id, en, hi, sort_order) VALUES ($1, $2, $3, $4)',
      [destinationId, tip.en || '', tip.hi || '', i]
    );
  }
  for (const src of sources) {
    await client.query(
      'INSERT INTO destination_sources (destination_id, organization, title, url) VALUES ($1, $2, $3, $4)',
      [destinationId, src.organization || '', src.title || '', src.url || '']
    );
  }
}

module.exports = { slugify, uniqueSlug, attachRelations, attachRelationsToMany, replaceRelations };
