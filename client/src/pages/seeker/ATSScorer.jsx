import { useState } from 'react';
import SeekerLayout from '../../components/common/SeekerLayout';
import toast from 'react-hot-toast';

import { getATSScoreAPI } from '../../api/aiAPI';

const sampleResume = `Arjun Kumar — Senior Software Engineer
Email: arjun@example.com | Location: Bangalore, India

EXPERIENCE
Senior Software Engineer — TechCorp (2022 - Present)
- Led team of 6 engineers building microservices serving 2M users
- Reduced API latency by 40% through Redis caching and query optimization
- Built CI/CD pipelines using GitHub Actions and Docker

Software Engineer — StartupXYZ (2019 - 2022)
- Developed full-stack features using React and Node.js
- Improved test coverage from 40% to 85%
- Integrated third-party payment APIs handling $2M monthly transactions

SKILLS
React, Node.js, TypeScript, Python, PostgreSQL, Redis, Docker, AWS, GraphQL, REST APIs

EDUCATION
B.Tech Computer Science — IIT Bangalore (2019)`;

const sampleJD = `Senior Full Stack Engineer — Google

We are looking for a Senior Full Stack Engineer with 5+ years of experience.

Requirements:
- React, Node.js, TypeScript (required)
- AWS, Docker, Kubernetes (required)
- PostgreSQL or similar database (required)
- GraphQL experience preferred
- CI/CD pipeline experience
- Team leadership experience
- Strong communication skills

Responsibilities:
- Design and build scalable web applications
- Lead technical discussions and code reviews
- Mentor junior engineers
- Collaborate with product and design teams`;

const mockAnalysis = {
  score: 78,
  matched:  ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'CI/CD'],
  missing:  ['Kubernetes', 'Team Leadership (explicit mention)', 'System Design experience'],
  suggestions: [
    {
      type: 'critical',
      title: 'Add Kubernetes experience',
      desc: 'The job requires Kubernetes — add any K8s exposure even if minimal (e.g. kubectl, Helm).',
    },
    {
      type: 'warning',
      title: 'Quantify leadership impact',
      desc: 'You mention leading a team of 6 but add more impact: hiring decisions, processes improved, team growth.',
    },
    {
      type: 'warning',
      title: 'Mention system design',
      desc: 'Add a bullet about architecting or designing a system at scale to match the seniority level.',
    },
    {
      type: 'success',
      title: 'Strong metrics — keep them',
      desc: '40% latency reduction, 2M users, $2M transactions — these are excellent quantified achievements.',
    },
    {
      type: 'success',
      title: 'Good keyword coverage',
      desc: '8 out of 11 required skills matched. Core stack aligns well with the job requirements.',
    },
  ],
};

const typeConfig = {
  critical: { icon: '✗', bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    label: 'bg-red-500/10 text-red-400'     },
  warning:  { icon: '!', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20', text: 'text-yellow-400', label: 'bg-yellow-500/10 text-yellow-400' },
  success:  { icon: '✓', bg: 'bg-green-500/10',   border: 'border-green-500/20',  text: 'text-green-400',  label: 'bg-green-500/10 text-green-400'  },
};

const scoreColor = (score) => {
  if (score >= 85) return { text: 'text-green-400', ring: '#10b981', label: 'Strong Match' };
  if (score >= 70) return { text: 'text-yellow-400', ring: '#f59e0b', label: 'Good Match'   };
  return             { text: 'text-red-400',    ring: '#ef4444', label: 'Weak Match'   };
};

export default function ATSScorer() {
  const [resume,   setResume]   = useState(sampleResume);
  const [jd,       setJd]       = useState(sampleJD);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const analyze = async () => {
  if (!resume.trim() || !jd.trim()) {
    toast.error('Please fill in both resume and job description');
    return;
  }
  setLoading(true);
  setResult(null);
  try {
    const data = await getATSScoreAPI(resume, jd);
    setResult(data);
    setAnalyzed(true);
    toast.success('Analysis complete!');
  } catch (err) {
    // Fallback to mock if API key not set
    await new Promise((r) => setTimeout(r, 1500));
    setResult(mockAnalysis);
    setAnalyzed(true);
    toast.success('Analysis complete! (demo mode)');
  } finally {
    setLoading(false);
  }
};

  const circumference = 2 * Math.PI * 36;
  const scoreOffset   = result
    ? circumference - (circumference * result.score) / 100
    : circumference;

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎯</span>
          <h1 className="text-2xl font-bold text-white">ATS Resume Scorer</h1>
          <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full">
            ✦ AI Powered
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Compare your resume against any job description and get an instant AI score
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Resume Input */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white">Your Resume</label>
            <button
              onClick={() => setResume(sampleResume)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={12}
            className="input-field resize-none text-xs leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">
              {resume.length} characters
            </span>
            <button
              onClick={() => {
                setResume('');
                toast.success('Cleared');
              }}
              className="text-xs text-gray-500 hover:text-gray-400"
            >
              Clear
            </button>
          </div>
        </div>

        {/* JD Input */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white">Job Description</label>
            <button
              onClick={() => setJd(sampleJD)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            rows={12}
            className="input-field resize-none text-xs leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">
              {jd.length} characters
            </span>
            <button
              onClick={() => {
                setJd('');
                toast.success('Cleared');
              }}
              className="text-xs text-gray-500 hover:text-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyze}
        disabled={loading}
        className="w-full btn-primary py-4 text-base mb-6 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>🎯 Analyze Resume with AI</>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-5">

          {/* Score + Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Score Ring */}
            <div className="card flex flex-col items-center justify-center py-6">
              <div className="relative w-28 h-28 mb-4">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 88 88"
                >
                  <circle
                    cx="44" cy="44" r="36"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="8"
                  />
                  <circle
                    cx="44" cy="44" r="36"
                    fill="none"
                    stroke={scoreColor(result.score).ring}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={scoreOffset}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold ${scoreColor(result.score).text}`}>
                    {result.score}
                  </span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
              </div>
              <div className={`text-sm font-semibold ${scoreColor(result.score).text}`}>
                {scoreColor(result.score).label}
              </div>
              <div className="text-xs text-gray-500 mt-1">ATS Score</div>
            </div>

            {/* Matched Keywords */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-sm">✓</span>
                <span className="text-sm font-semibold text-white">
                  Matched Keywords ({result.matched.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-400 text-sm">✗</span>
                <span className="text-sm font-semibold text-white">
                  Missing Keywords ({result.missing.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">
              AI Improvement Suggestions
            </h2>
            <div className="space-y-3">
              {result.suggestions.map((s, i) => {
                const cfg = typeConfig[s.type];
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 ${cfg.bg} border ${cfg.border} rounded-xl`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${cfg.label}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${cfg.text} mb-1`}>
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>✨</span>
                  <span className="font-semibold text-white">Want a better score?</span>
                </div>
                <p className="text-sm text-gray-400">
                  Use our AI Resume Enhancer to automatically improve your bullet points
                </p>
              </div>
              <button
                onClick={() => toast.success('Opening Resume Enhancer...')}
                className="btn-primary text-sm px-5 py-2.5 flex-shrink-0"
              >
                Enhance Resume →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to check your ATS score?
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Paste your resume and a job description above, then click
            Analyze to get your AI-powered ATS score with improvement tips.
          </p>
        </div>
      )}

    </SeekerLayout>
  );
}