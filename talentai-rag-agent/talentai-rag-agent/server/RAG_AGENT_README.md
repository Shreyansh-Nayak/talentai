# RAG + Agent Layer — Architecture Notes

This document explains what was added, why it was built this way, and the
trade-offs, so it's easy to talk through in an interview.

## What it does

A conversational agent (`POST /api/agent/chat`) that can answer questions
about:
- **the platform itself** — "how does ATS scoring work?", "how do I verify
  my company?" (retrieved from a `KnowledgeBase` collection via RAG)
- **jobs and companies** — "any remote React jobs?", "tell me about
  TechCorp" (retrieved from the existing `Job` / `Company` collections)
- **the current user's own data** — "what's the status of my application
  to X?" (structured DB lookup, scoped to `req.user`)

## Why an agent instead of "just RAG"

Pure RAG (embed query → retrieve chunks → stuff into a prompt) works for
"how does X work" questions, but falls over for "what's the status of my
application" or "find me backend jobs in Bangalore" — those need live,
structured, user-scoped data, not semantic chunks. So the model is given
**tools** and decides per-turn which one(s) to call:

```
User message
   -> LLM (Groq, llama-3.3-70b-versatile) with tool definitions
   -> if tool_calls returned: execute tools, feed results back, loop
   -> else: return the model's text as the final reply
```

This is a standard ReAct-style loop (`services/agentService.js`), capped at
`MAX_STEPS = 5` round-trips to bound latency/cost per turn.

## RAG pipeline

1. **Embedding**: `utils/embeddings.js` — local inference via
   `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384-dim). No external
   API call, no per-embedding cost. Trade-off: lower semantic quality than
   OpenAI's `text-embedding-3-*`, acceptable here because retrieval is over
   a small, domain-specific corpus (job titles/descriptions, FAQs), not
   open-domain text.
2. **Storage**: embeddings are stored as a plain `[Number]` field directly
   on `Job`, `Company`, and `KnowledgeBase` documents (see each model's
   `pre('save')` hook) — no separate vector database. This avoids a second
   system to keep in sync with the source of truth.
3. **Retrieval**: `services/ragService.js` does a **brute-force** scan —
   pull candidate docs with an embedding, score with cosine similarity in
   JS, sort, take top-K. This is `O(n)` per query.

### Why brute-force, and when it stops being enough

At a few thousand documents, an `O(n)` scan in Node is fast enough (single-
digit milliseconds) and keeps infrastructure to "one MongoDB instance."
That's the right call for a portfolio-scale app. Past that, the standard
move is one of:
- **MongoDB Atlas Vector Search** (`$vectorSearch` aggregation stage) — an
  HNSW-indexed ANN index living next to the data. Smallest migration: swap
  the three `Model.find()` scans in `ragService.js` for one aggregation
  pipeline per collection; nothing else in the pipeline changes.
- **A dedicated vector DB** (Pinecone, Weaviate, Qdrant) — worth it once
  you need cross-collection ANN search at real scale, hybrid search
  tuning, or multi-tenant isolation beyond what Atlas gives you for free.

## Chat memory

`ChatSession` stores only the final `user`/`assistant` turns per
conversation — not the intermediate tool-call/tool-result exchange, which
is regenerated fresh each turn from live data anyway. The last 10 turns are
replayed as context on each new message (`MAX_HISTORY_TURNS` in
`agentController.js`), which bounds prompt size as a conversation grows.

## Data flow summary

```
Job.save() / Company.save()  --pre-save hook-->  embedText()  -->  embedding[] stored inline
KnowledgeBase (seeded once)  --pre-save hook-->  embedText()  -->  embedding[] stored inline

User asks agent a question
   -> agentService.runAgent()
        -> Groq decides which tool(s) to call
             -> search_jobs        : Mongo $text search, falls back to ragService semantic search
             -> get_company_info   : direct Mongo lookup by name
             -> rag_search         : ragService.retrieveContext() across kb/job/company
             -> get_my_application_status : Mongo lookup scoped to req.user
        -> tool results fed back to Groq
   -> final answer persisted to ChatSession, returned to client
```

## Setup

```bash
npm install                       # pulls @xenova/transformers etc.
node scripts/seedKnowledgeBase.js # embeds and inserts platform FAQ content
node scripts/backfillEmbeddings.js  # only needed if you already have Job/Company data pre-dating this feature
```

First run downloads the ~90MB MiniLM model (cached under `server/.cache/`
by default — see `EMBEDDING_CACHE_DIR` in `.env.example`). This requires
normal internet access to `huggingface.co` the first time; after that it's
served from the local cache.

## What's next (LLD phase)

The system-design write-up (architecture diagram, sequence diagram for a
chat turn, scalability notes, DB schema) is being done as a separate pass —
this README covers the RAG/agent implementation itself.
