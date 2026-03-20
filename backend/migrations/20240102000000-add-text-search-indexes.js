/**
 * Migration: add-text-search-indexes
 *
 * Adds MongoDB $text indexes to the press-releases and clippings collections
 * to replace full-collection-scan $regex queries with indexed text search.
 *
 * press-releases: title, content, summary
 * clippings:      title, summary, source
 *
 * Run:  npm run migrate:up
 * Roll: npm run migrate:down
 *
 * NOTE: Index creation on existing collections is online in MongoDB (no downtime),
 * but adds temporary write overhead. Schedule during a low-traffic window if
 * either collection is large.
 */

/** @param {import('mongodb').Db} db */
async function up(db) {
  await db.collection('press-releases').createIndex(
    { title: 'text', content: 'text', summary: 'text' },
    { name: 'pressreleases_text_search' }
  );

  await db.collection('clippings').createIndex(
    { title: 'text', summary: 'text', source: 'text' },
    { name: 'clippings_text_search' }
  );
}

/** @param {import('mongodb').Db} db */
async function down(db) {
  await db.collection('press-releases').dropIndex('pressreleases_text_search').catch(() => {});
  await db.collection('clippings').dropIndex('clippings_text_search').catch(() => {});
}

module.exports = { up, down };
