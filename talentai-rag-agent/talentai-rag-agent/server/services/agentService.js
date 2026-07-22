/**
 * agentService.js
 * -----------------------------------------------------------------------
 * The platform Q&A agent. Uses Groq's tool-calling (function-calling) API
 * on llama-3.3-70b-versatile to let the model decide, per user turn,
 * whether it needs to:
 *   - semantically search the knowledge base / jobs / companies (RAG)
 *   - look up structured data (a user's own application status)
 *   - just answer directly from conversation context
 *
 * This is a ReAct-style loop: call the model -> if it asks for tool(s),
 * run them -> feed results back as tool messages -> call the model again
 * -> repeat until it returns a plain text answer or we hit MAX_STEPS.
 *
 * Every tool is scoped to req.user where relevant (e.g. get_application_status
 * only ever queries the current user's applications) so the agent can't be
 * used to enumerate other users' private data.
 * -----------------------------------------------------------------------
 */

const Groq = require('groq-sdk');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { retrieveContext } = require('./ragService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';
const MAX_STEPS = 5; // hard cap on tool-call round-trips per user turn

// ---------------------------------------------------------------------
// Tool definitions (OpenAI-compatible function-calling schema, which
// Groq's API mirrors).
// ---------------------------------------------------------------------
const toolDefs = [
  {
    type: 'function',
    function: {
      name: 'search_jobs',
      description:
        'Search active job listings by free-text query (role, skills, location, etc). Returns matching jobs with title, company, location, type, and salary.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search, e.g. "remote React jobs" or "backend engineer Bangalore"' },
          limit: { type: 'integer', description: 'Max results to return, default 5' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_company_info',
      description: 'Look up a specific company by name to get its description, industry, size, location, and verification status.',
      parameters: {
        type: 'object',
        properties: {
          companyName: { type: 'string' },
        },
        required: ['companyName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'rag_search',
      description:
        'Semantic search over platform FAQs/policies and how-it-works content (e.g. "how does ATS scoring work", "how do I verify my company"). Use this for questions about how the TalentAI platform works, not for job/company lookups.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_application_status',
      description:
        "Get the status of the current logged-in user's own job applications (e.g. 'applied', 'shortlisted', 'interview', 'rejected', 'hired'). Only works for the current user - cannot look up other users.",
      parameters: {
        type: 'object',
        properties: {
          jobTitleFilter: { type: 'string', description: 'Optional: filter by job title keyword' },
        },
      },
    },
  },
];

/**
 * Executes a single tool call and returns a JSON-serializable result.
 * `user` is the authenticated req.user, used to scope user-specific tools.
 */
async function executeTool(name, args, user) {
  switch (name) {
    case 'search_jobs': {
      const limit = Math.min(args.limit || 5, 10);
      const jobs = await Job.find({
        status: 'active',
        $text: { $search: args.query },
      })
        .select('title location type salary skills company')
        .populate('company', 'name isVerified')
        .limit(limit)
        .lean();

      // Text search can return zero hits on short/loose queries; fall back
      // to the RAG vector search over jobs so the agent still gets something
      // useful instead of an empty result.
      if (jobs.length === 0) {
        const semantic = await retrieveContext(args.query, { topK: limit, sources: ['job'] });
        return semantic.map((r) => ({
          title: r.meta.title,
          location: r.meta.location,
          type: r.meta.type,
          salary: r.meta.salary,
          skills: r.meta.skills,
        }));
      }

      return jobs.map((j) => ({
        title: j.title,
        location: j.location,
        type: j.type,
        salary: j.salary,
        skills: j.skills,
        company: j.company?.name,
        verified: j.company?.isVerified,
      }));
    }

    case 'get_company_info': {
      const company = await Company.findOne({
        name: { $regex: args.companyName, $options: 'i' },
      }).lean();
      if (!company) return { found: false };
      return {
        found: true,
        name: company.name,
        description: company.description,
        industry: company.industry,
        size: company.size,
        location: company.location,
        isVerified: company.isVerified,
      };
    }

    case 'rag_search': {
      const results = await retrieveContext(args.query, { topK: 4, sources: ['kb', 'job', 'company'] });
      return results.map((r) => ({ type: r.type, content: r.text, relevance: Number(r.score.toFixed(3)) }));
    }

    case 'get_my_application_status': {
      const filter = { user: user._id };
      const query = Application.find(filter)
        .populate({
          path: 'job',
          select: 'title company',
          populate: { path: 'company', select: 'name' },
          match: args.jobTitleFilter
            ? { title: { $regex: args.jobTitleFilter, $options: 'i' } }
            : {},
        })
        .select('status atsScore createdAt');

      const apps = (await query.lean()).filter((a) => a.job); // drop non-matches from populate `match`
      return apps.map((a) => ({
        job: a.job?.title,
        company: a.job?.company?.name,
        status: a.status,
        atsScore: a.atsScore,
        appliedOn: a.createdAt,
      }));
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

const SYSTEM_PROMPT = `You are the TalentAI Assistant, embedded in a job portal platform (TalentAI).
You help job seekers, employers, and general visitors with questions about:
- how the platform's features work (ATS scoring, resume enhancement, interview prep, job matching)
- finding jobs and companies on the platform
- their own application status (never anyone else's)

Rules:
- Use the provided tools to look up real data rather than guessing. Do not invent job listings, companies, or platform behavior.
- If a tool returns no results, say so plainly rather than making something up.
- Keep answers concise and direct. Use short lists for multiple jobs/results.
- If asked something outside the platform's scope (unrelated general knowledge), answer briefly but steer back to how you can help with TalentAI.
- Never reveal another user's private data (applications, emails, resumes).`;

/**
 * Runs the agent loop for one user turn.
 * @param {object} params
 * @param {object} params.user - authenticated req.user
 * @param {Array<{role, content}>} params.history - prior turns (user/assistant only)
 * @param {string} params.message - the new user message
 * @returns {Promise<{reply: string, toolTrace: Array}>}
 */
async function runAgent({ user, history = [], message }) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const toolTrace = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefs,
      tool_choice: 'auto',
      temperature: 0.4,
      max_tokens: 1000,
    });

    const choice = response.choices[0].message;

    // No tool calls -> the model is done, this is the final answer.
    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return { reply: choice.content, toolTrace };
    }

    // Append the assistant's tool-call request, then run each tool and
    // append its result, so the next model call has full context.
    messages.push(choice);

    for (const call of choice.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        args = {};
      }

      let result;
      try {
        result = await executeTool(call.function.name, args, user);
      } catch (err) {
        result = { error: err.message };
      }

      toolTrace.push({ tool: call.function.name, args, result });

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  // Hit MAX_STEPS without a final answer - fail gracefully rather than
  // looping forever or throwing.
  return {
    reply: "I wasn't able to fully resolve that - could you rephrase or narrow your question?",
    toolTrace,
  };
}

module.exports = { runAgent };
