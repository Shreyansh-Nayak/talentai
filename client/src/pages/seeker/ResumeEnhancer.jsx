import { useState } from 'react';
import SeekerLayout from '../../components/common/SeekerLayout';
import toast from 'react-hot-toast';
import { enhanceResumeAPI } from '../../api/aiAPI';

const sampleBullets = `- worked on the frontend team building features
- helped fix some bugs in production
- contributed to the api layer
- did code reviews for team members
- worked with databases and wrote some queries
- participated in sprint planning and standups`;

const enhancedOutput = [
  'Spearheaded development of 6 core frontend features using React and TypeScript, increasing user engagement by 28%',
  'Diagnosed and resolved 15+ critical production bugs, reducing P1 incident rate by 35% over 2 months',
  'Designed and implemented 8 RESTful API endpoints in Node.js, processing 500K+ daily requests with 99.9% uptime',
  'Conducted 40+ pull request reviews enforcing coding standards, reducing code defects by 22% across a 6-engineer team',
  'Optimized 12 PostgreSQL queries using indexing and query planning, cutting average response time from 800ms to 120ms',
  'Collaborated in agile ceremonies (sprint planning, standups, retros), consistently delivering features 15% ahead of schedule',
];

const tips = [
  { icon: '🎯', title: 'Start with strong action verbs', desc: 'Use words like: Architected, Spearheaded, Optimized, Reduced, Delivered, Engineered.' },
  { icon: '📊', title: 'Add numbers everywhere', desc: 'Quantify with %, $, users, requests, time saved, team size — anything measurable.' },
  { icon: '🔑', title: 'Include keywords naturally', desc: 'Mirror the exact keywords from the job description to pass ATS scanners.' },
  { icon: '✂️', title: 'Keep bullets to 1-2 lines', desc: 'Concise bullets are easier to scan. Lead with the result, then the method.' },
];

export default function ResumeEnhancer() {
  const [bullets,  setBullets]  = useState(sampleBullets);
  const [role,     setRole]     = useState('Senior Software Engineer');
  const [industry, setIndustry] = useState('Tech / SaaS');
  const [enhanced, setEnhanced] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState(false);

  const enhance = async () => {
  if (!bullets.trim()) {
    toast.error('Please paste your bullet points first');
    return;
  }
  setLoading(true);
  setEnhanced([]);
  try {
    const data = await enhanceResumeAPI(bullets, role, industry);
    setEnhanced(data.enhanced || enhancedOutput);
    toast.success('Resume bullets enhanced!');
  } catch (err) {
    // Fallback to mock
    await new Promise((r) => setTimeout(r, 1500));
    setEnhanced(enhancedOutput);
    toast.success('Bullets enhanced! (demo mode)');
  } finally {
    setLoading(false);
  }
};

  const copyAll = () => {
    const text = enhanced.map((b) => `• ${b}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyOne = (bullet) => {
    navigator.clipboard.writeText(`• ${bullet}`);
    toast.success('Copied!');
  };

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">✨</span>
          <h1 className="text-2xl font-bold text-white">AI Resume Enhancer</h1>
          <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full">
            ✦ AI Powered
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Transform weak bullet points into compelling, metrics-driven achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — Input */}
        <div className="lg:col-span-2 space-y-4">

          {/* Config */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Target Role
                </label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="input-field"
                >
                  <option>Tech / SaaS</option>
                  <option>Finance / Fintech</option>
                  <option>Healthcare</option>
                  <option>E-commerce</option>
                  <option>Consulting</option>
                  <option>Startup</option>
                </select>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-white">
                Your Current Bullet Points
              </label>
              <button
                onClick={() => setBullets(sampleBullets)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={bullets}
              onChange={(e) => setBullets(e.target.value)}
              placeholder={`Paste your resume bullets here, one per line:\n- worked on the frontend...\n- helped fix bugs...`}
              rows={8}
              className="input-field resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600">
                {bullets.split('\n').filter((l) => l.trim()).length} bullet points
              </span>
              <button
                onClick={() => setBullets('')}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Enhance Button */}
          <button
            onClick={enhance}
            disabled={loading}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enhancing with AI...
              </>
            ) : (
              <>✨ Enhance My Resume Bullets</>
            )}
          </button>

          {/* Output */}
          {enhanced.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">
                  ✨ Enhanced Bullets
                </h2>
                <button
                  onClick={copyAll}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    copied
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'btn-outline'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy All'}
                </button>
              </div>

              <div className="space-y-3">
                {enhanced.map((bullet, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                    <p className="text-sm text-gray-200 leading-relaxed flex-1">
                      {bullet}
                    </p>
                    <button
                      onClick={() => copyOne(bullet)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 hover:text-gray-300 flex-shrink-0 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>

              {/* Before/After Compare */}
              <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <div className="text-xs font-semibold text-blue-400 mb-3">
                  Before vs After
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-red-400 mb-1.5">❌ Before</div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      "worked on the frontend team building features"
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-green-400 mb-1.5">✓ After</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      "Spearheaded development of 6 core frontend features using React and TypeScript, increasing user engagement by 28%"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Tips */}
        <div className="space-y-4">

          {/* Tips Card */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4">
              💡 Resume Writing Tips
            </h3>
            <div className="space-y-4">
              {tips.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white mb-0.5">
                      {tip.title}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Verbs */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">
              ⚡ Strong Action Verbs
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Architected', 'Engineered', 'Spearheaded', 'Optimized',
                'Reduced', 'Delivered', 'Scaled', 'Automated',
                'Mentored', 'Launched', 'Improved', 'Designed',
                'Built', 'Led', 'Deployed', 'Integrated',
              ].map((verb) => (
                <button
                  key={verb}
                  onClick={() => {
                    navigator.clipboard.writeText(verb);
                    toast.success(`"${verb}" copied!`);
                  }}
                  className="text-xs bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500/40 hover:text-blue-400 px-2.5 py-1 rounded-full transition-all"
                >
                  {verb}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">Click to copy</p>
          </div>

          {/* ATS Score CTA */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="text-sm font-semibold text-white mb-1">
              🎯 Check Your ATS Score
            </div>
            <p className="text-xs text-gray-400 mb-3">
              After enhancing, compare your new resume against a job description
            </p>
            <button
              onClick={() => toast.success('Opening ATS Scorer...')}
              className="btn-primary w-full text-xs py-2"
            >
              Go to ATS Scorer →
            </button>
          </div>
        </div>
      </div>

    </SeekerLayout>
  );
}