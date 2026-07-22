/**
 * One-time backfill: embeds any existing Job/Company documents that
 * predate the RAG feature (so they have no `embedding` field yet).
 * New docs get embedded automatically via the pre('save') hooks in
 * their models - this script is only needed once, after deploying
 * the RAG feature onto a database that already has data in it.
 *
 * Usage: node scripts/backfillEmbeddings.js
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const Job = require('../models/Job');
const Company = require('../models/Company');

(async () => {
  await connectDB();

  const jobs = await Job.find({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
  });
  console.log(`Backfilling ${jobs.length} jobs...`);
  for (const job of jobs) {
    job.markModified('title'); // force the pre-save hook to regenerate the embedding
    await job.save();
    console.log(`  ✓ ${job.title}`);
  }

  const companies = await Company.find({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
  });
  console.log(`Backfilling ${companies.length} companies...`);
  for (const company of companies) {
    company.markModified('name');
    await company.save();
    console.log(`  ✓ ${company.name}`);
  }

  console.log('✅ Backfill complete.');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});
