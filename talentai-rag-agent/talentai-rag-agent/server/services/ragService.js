const Job = require('../models/Job');
const Company = require('../models/Company');
const KnowledgeBase = require('../models/KnowledgeBase');
const { embedText } = require('../utils/embeddings');
const { cosineSimilarity } = require('../utils/vectorMath');

const DEFAULT_TOP_K = 5;
const RELEVANCE_FLOOR = 0.15; // below this, treat as "not actually relevant"
const MAX_CANDIDATES_PER_SOURCE = 500; // brute-force cap; see README for scaling notes

/**
 * Semantic search across Jobs, Companies, and the KnowledgeBase.
 *
 * Implementation note: this is brute-force - it pulls candidate embeddings
 * into memory and scores them with cosine similarity in JS. That's the
 * right call at this project's scale (fine up to a few thousand docs) and
 * keeps the whole thing running on a single MongoDB instance with zero
 * extra infra. Past that scale, replace the three Model.find() calls below
 * with MongoDB Atlas $vectorSearch aggregation stages (HNSW-indexed ANN
 * search) - the rest of the pipeline (query embedding, ranking, tool
 * interface) stays identical. See RAG_AGENT_README.md for the migration
 * path.
 */
async function retrieveContext(query, { topK = DEFAULT_TOP_K, sources = ['job', 'company', 'kb'] } = {}) {
  const queryEmbedding = await embedText(query);
  if (!queryEmbedding) return [];

  const candidates = [];

  if (sources.includes('job')) {
    const jobs = await Job.find({ status: 'active', embedding: { $exists: true, $not: { $size: 0 } } })
      .select('title description skills location type salary embedding company')
      .limit(MAX_CANDIDATES_PER_SOURCE)
      .lean();

    for (const j of jobs) {
      candidates.push({
        type: 'job',
        id: j._id,
        score: cosineSimilarity(queryEmbedding, j.embedding),
        text: `Job: ${j.title} | ${j.location} | ${j.type} | Skills: ${(j.skills || []).join(', ')}`,
        meta: j,
      });
    }
  }

  if (sources.includes('company')) {
    const companies = await Company.find({ embedding: { $exists: true, $not: { $size: 0 } } })
      .select('name description industry location size isVerified embedding')
      .limit(MAX_CANDIDATES_PER_SOURCE)
      .lean();

    for (const c of companies) {
      candidates.push({
        type: 'company',
        id: c._id,
        score: cosineSimilarity(queryEmbedding, c.embedding),
        text: `Company: ${c.name} | ${c.industry || 'N/A'} | ${c.description || ''}`,
        meta: c,
      });
    }
  }

  if (sources.includes('kb')) {
    const kb = await KnowledgeBase.find({ embedding: { $exists: true, $not: { $size: 0 } } })
      .select('title content category embedding')
      .lean();

    for (const k of kb) {
      candidates.push({
        type: 'kb',
        id: k._id,
        score: cosineSimilarity(queryEmbedding, k.embedding),
        text: `${k.title}: ${k.content}`,
        meta: k,
      });
    }
  }

  return candidates
    .filter((c) => c.score >= RELEVANCE_FLOOR)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

module.exports = { retrieveContext };
