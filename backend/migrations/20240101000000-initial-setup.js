// migrations/20240101000000-initial-setup.js
// TODO: Replace with your actual initial migration

module.exports = {
  async up(db) {
    // Example: create a collection with a validator
    // await db.createCollection('tenants', { ... });
    console.log('Migration up: initial-setup');
  },

  async down(db) {
    // await db.collection('tenants').drop();
    console.log('Migration down: initial-setup');
  },
};
