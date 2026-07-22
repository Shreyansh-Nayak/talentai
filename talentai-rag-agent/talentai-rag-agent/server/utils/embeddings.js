/**
 * Local embedding generation using @xenova/transformers.
 * Runs entirely in-process (no external API, no cost) using the
 * all-MiniLM-L6-v2 model (384-dim sentence embeddings).
 *
 * The model (~90MB) is downloaded once and cached under
 * server/.cache/ on first use, then reused from disk.
 */

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    // Lazy import: @xenova/transformers is ESM-only, so we use dynamic import
    // from this CommonJS file.
    embedderPromise = import('@xenova/transformers').then(({ pipeline, env }) => {
      env.cacheDir = process.env.EMBEDDING_CACHE_DIR || './.cache';
      return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    });
  }
  return embedderPromise;
}

/**
 * Embed a single piece of text into a normalized 384-dim vector.
 * Returns null for empty input (callers should skip storing/searching these).
 */
async function embedText(text) {
  if (!text || !text.trim()) return null;

  const embedder = await getEmbedder();
  // Truncate to keep inference fast; MiniLM's effective context is short anyway.
  const input = text.trim().slice(0, 2000);
  const output = await embedder(input, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Embed many texts sequentially. Kept simple (no batching) since this
 * only runs during ingestion/backfill, not on the request hot path.
 */
async function embedBatch(texts) {
  const results = [];
  for (const t of texts) {
    results.push(await embedText(t));
  }
  return results;
}

module.exports = { embedText, embedBatch, getEmbedder };
