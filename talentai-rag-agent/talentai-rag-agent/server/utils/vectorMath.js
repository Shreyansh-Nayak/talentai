/**
 * Since embeddings from utils/embeddings.js are already L2-normalized
 * (normalize: true), the dot product of two vectors IS their cosine
 * similarity - no need to divide by magnitudes.
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

module.exports = { cosineSimilarity };
