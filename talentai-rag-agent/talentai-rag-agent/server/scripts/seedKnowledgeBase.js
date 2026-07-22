/**
 * Seeds (or re-seeds) the KnowledgeBase collection.
 * Each doc's embedding is generated automatically by the model's
 * pre-save hook - no separate embedding step needed here.
 *
 * Usage: node scripts/seedKnowledgeBase.js
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const KnowledgeBase = require('../models/KnowledgeBase');
const seedData = require('../data/knowledgeBaseSeed');

(async () => {
  await connectDB();

  console.log(`Seeding ${seedData.length} knowledge base entries (embedding each one, this takes a bit)...`);

  await KnowledgeBase.deleteMany({});

  // Sequential, not insertMany, so each doc's pre('save') hook runs and
  // generates its embedding.
  for (const entry of seedData) {
    await KnowledgeBase.create(entry);
    console.log(`  ✓ embedded: ${entry.title}`);
  }

  console.log('✅ Knowledge base seeded and embedded.');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Knowledge base seeding failed:', err);
  process.exit(1);
});
