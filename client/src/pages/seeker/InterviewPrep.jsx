import { useState } from 'react';
import SeekerLayout from '../../components/common/SeekerLayout';
import toast from 'react-hot-toast';
import { getInterviewQuestionsAPI } from '../../api/aiAPI';

const mockQuestions = {
  Technical: [
    {
      q: 'Explain the difference between server-side rendering (SSR) and client-side rendering (CSR). When would you choose one over the other?',
      tip: 'Mention Next.js for SSR, discuss SEO implications, and bring up performance trade-offs. Reference real metrics if possible.',
      answer: 'SSR renders HTML on the server for each request, improving SEO and initial load. CSR renders in the browser using JavaScript. Choose SSR for content-heavy or SEO-critical pages, CSR for highly interactive apps.',
    },
    {
      q: 'How does the Node.js event loop work? When would you use worker threads?',
      tip: 'Walk through the event loop phases: timers, pending callbacks, poll, check, close. Mention libuv and worker_threads for CPU-bound tasks.',
      answer: 'Node.js is single-threaded but uses libuv for async I/O via the event loop. Worker threads help with CPU-intensive tasks like image processing or heavy computation.',
    },
    {
      q: 'What is the difference between SQL and NoSQL databases? When would you use each?',
      tip: 'Give concrete examples — PostgreSQL for transactional data, MongoDB for flexible schemas, Redis for caching. Mention ACID compliance.',
      answer: 'SQL databases use structured schemas with ACID compliance — ideal for relational data. NoSQL offers flexibility and horizontal scaling — great for unstructured or rapidly changing data.',
    },
    {
      q: 'Explain how React reconciliation works and what triggers a re-render.',
      tip: 'Cover the virtual DOM diffing algorithm, keys in lists, and how useState/useContext trigger re-renders. Mention React.memo and useMemo for optimization.',
      answer: 'React builds a virtual DOM tree and diffs it against the previous render. State or prop changes trigger re-renders. Keys help React identify list items efficiently.',
    },
  ],
  Behavioral: [
    {
      q: 'Tell me about a time you led a technically challenging project under a tight deadline.',
      tip: 'Use the STAR method: Situation, Task, Action, Result. Quantify the outcome — "delivered 2 weeks early" or "reduced costs by 30%" creates stronger impressions.',
      answer: 'Structure: Set the scene briefly, explain your specific role, describe the key decisions you made, and lead with the quantified outcome.',
    },
    {
      q: 'Describe a situation where you disagreed with a technical decision made by your team or manager.',
      tip: 'Show you can disagree respectfully, back your position with data, and ultimately align with the team decision. Avoid speaking negatively about past employers.',
      answer: 'Highlight your ability to raise concerns constructively, present data or alternatives, and commit to the team decision once made.',
    },
    {
      q: 'How do you handle working with a difficult colleague or stakeholder?',
      tip: 'Focus on empathy, clear communication, and finding common ground. Give a specific example without badmouthing anyone.',
      answer: 'Emphasize understanding their perspective, establishing clear communication channels, and focusing on shared goals rather than personal differences.',
    },
  ],
  'System Design': [
    {
      q: 'Design a URL shortener like bit.ly. Walk through your approach.',
      tip: 'Cover: hashing strategy (MD5 vs base62), database choice (key-value store), caching layer (Redis), load balancing, and analytics. Estimate scale.',
      answer: 'Key components: URL hashing, a key-value store (DynamoDB), Redis cache for hot URLs, CDN for redirect speed, and an analytics pipeline for click tracking.',
    },
    {
      q: 'Design a rate-limiting system for a REST API handling 10M requests/day.',
      tip: 'Discuss token bucket vs sliding window algorithms, Redis for distributed state, per-user vs per-IP limits, and graceful degradation strategies.',
      answer: 'Use sliding window counter in Redis. Store user token counts with TTL. Return 429 with Retry-After header when limit exceeded. Use distributed Redis cluster for scale.',
    },
    {
      q: 'How would you design a real-time notification system?',
      tip: 'Cover WebSockets vs SSE vs polling. Discuss message queues (Kafka/RabbitMQ), delivery guarantees, fan-out strategies, and offline notification handling.',
      answer: 'Use WebSockets for real-time delivery, Kafka for message queuing and fan-out, Redis pub/sub for connected user routing, and push notifications for offline users.',
    },
  ],
};

export default function InterviewPrep() {
  const [role,     setRole]     = useState('Senior Full Stack Engineer');
  const [company,  setCompany]  = useState('FAANG');
  const [type,     setType]     = useState('Technical');
  const [questions,setQuestions]= useState([]);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showAnswer, setShowAnswer] = useState({});

  const generate = async () => {
  if (!role.trim()) {
    toast.error('Please enter a role');
    return;
  }
  setLoading(true);
  setQuestions([]);
  setExpanded(null);
  setShowAnswer({});
  try {
    const data = await getInterviewQuestionsAPI(role, company, type);
    setQuestions(data.questions || mockQuestions[type]);
    toast.success(`${data.questions?.length || 4} questions generated!`);
  } catch (err) {
    // Fallback to mock
    await new Promise((r) => setTimeout(r, 1000));
    setQuestions(mockQuestions[type] || mockQuestions['Technical']);
    toast.success('Questions generated! (demo mode)');
  } finally {
    setLoading(false);
  }
};

  const toggleAnswer = (i) => {
    setShowAnswer((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">💬</span>
          <h1 className="text-2xl font-bold text-white">AI Interview Prep</h1>
          <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full">
            ✦ AI Powered
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Generate role-specific interview questions with expert tips and sample answers
        </p>
      </div>

      {/* Config Card */}
      <div className="card mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs text-gray-400 mb-1.5">
              Role / Position
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior React Developer"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Company Type
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-field"
            >
              <option>FAANG</option>
              <option>Startup</option>
              <option>Mid-size Tech</option>
              <option>Enterprise</option>
              <option>Consulting</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Interview Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
            >
              <option>Technical</option>
              <option>Behavioral</option>
              <option>System Design</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : '✦ Generate Questions'}
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">
              {questions.length} {type} Questions for {role}
            </h2>
            <button
              onClick={() => { setShowAnswer({}); }}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Collapse All
            </button>
          </div>

          {questions.map((item, i) => (
            <div
              key={i}
              className="card border border-gray-800 hover:border-gray-700 transition-all duration-200"
            >
              {/* Question Header */}
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  Q{i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white leading-relaxed font-medium">
                    {item.q}
                  </p>
                </div>
                <span className="text-gray-500 text-sm flex-shrink-0">
                  {expanded === i ? '▲' : '▼'}
                </span>
              </div>

              {/* Expanded Content */}
              {expanded === i && (
                <div className="mt-4 space-y-3 pt-4 border-t border-gray-800">

                  {/* Tip */}
                  <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                    <span className="text-blue-400 text-sm flex-shrink-0 mt-0.5">💡</span>
                    <div>
                      <div className="text-xs font-semibold text-blue-400 mb-1">
                        Interviewer Tip
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {item.tip}
                      </p>
                    </div>
                  </div>

                  {/* Sample Answer Toggle */}
                  <button
                    onClick={() => toggleAnswer(i)}
                    className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>{showAnswer[i] ? '▼' : '▶'}</span>
                    {showAnswer[i] ? 'Hide' : 'Show'} Sample Answer
                  </button>

                  {showAnswer[i] && (
                    <div className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
                      <div className="text-xs font-semibold text-purple-400 mb-1">
                        Sample Answer Framework
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}

                  {/* Practice Button */}
                  <button
                    onClick={() => toast.success('Practice mode coming soon!')}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    🎤 Practice Out Loud
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="font-semibold text-white mb-1">
                  Want more questions?
                </div>
                <p className="text-sm text-gray-400">
                  Generate a different round type or switch to behavioral questions
                </p>
              </div>
              <button
                onClick={generate}
                className="btn-primary text-sm px-5 py-2.5 flex-shrink-0"
              >
                Regenerate →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 && !loading && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to ace your interview?
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Enter your target role and select the interview type above,
            then click Generate to get AI-powered questions with tips.
          </p>
          <button
            onClick={generate}
            className="btn-primary px-8 py-3"
          >
            Generate Questions →
          </button>
        </div>
      )}

    </SeekerLayout>
  );
}