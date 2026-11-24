import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur-md z-50">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ⚡ TalentAI
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors">Find Jobs</span>
          <span className="hover:text-white cursor-pointer transition-colors">For Employers</span>
          <span className="hover:text-white cursor-pointer transition-colors">AI Features</span>
          <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="btn-outline text-sm px-4 py-2"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary text-sm px-4 py-2"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 py-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-4 py-1.5 rounded-full mb-6">
          ✦ AI-Powered Career Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Find Your Dream Job
          <br />
          with{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          TalentAI matches candidates to roles using smart resume scoring,
          AI job matching, and real-time interview prep — all in one platform.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/register?role=seeker')}
            className="btn-primary px-8 py-3 text-base"
          >
            Find Jobs →
          </button>
          <button
            onClick={() => navigate('/register?role=employer')}
            className="btn-outline px-8 py-3 text-base"
          >
            Hire Talent
          </button>
        </div>

        {/* STATS */}
        <div className="flex items-center justify-center gap-12 mt-20 flex-wrap">
          {[
            { num: '48K+', label: 'Active Jobs' },
            { num: '120K+', label: 'Candidates' },
            { num: '94%', label: 'Match Rate' },
            { num: '2.1K+', label: 'Companies' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-white">{stat.num}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-3">
          Everything you need to get hired
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Powered by AI — built for modern job seekers and employers
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: '🎯',
              title: 'ATS Resume Scorer',
              desc: 'Instantly score your resume against any job description with actionable improvement tips.',
              ai: true,
              color: 'from-blue-500/10 to-blue-500/5',
              border: 'border-blue-500/20',
            },
            {
              icon: '🤖',
              title: 'Smart Job Matching',
              desc: 'AI analyzes your skills and experience to surface the most relevant opportunities.',
              ai: true,
              color: 'from-purple-500/10 to-purple-500/5',
              border: 'border-purple-500/20',
            },
            {
              icon: '💬',
              title: 'Interview Prep AI',
              desc: 'Get role-specific interview questions with expert tips, generated in real-time.',
              ai: true,
              color: 'from-cyan-500/10 to-cyan-500/5',
              border: 'border-cyan-500/20',
            },
            {
              icon: '📋',
              title: 'JD Generator',
              desc: 'Employers generate compelling, bias-free job descriptions in seconds.',
              ai: true,
              color: 'from-amber-500/10 to-amber-500/5',
              border: 'border-amber-500/20',
            },
            {
              icon: '✨',
              title: 'Resume Enhancer',
              desc: 'Rewrite bullet points, add industry keywords and boost your resume impact.',
              ai: true,
              color: 'from-green-500/10 to-green-500/5',
              border: 'border-green-500/20',
            },
            {
              icon: '👥',
              title: 'Candidate Pipeline',
              desc: 'Full applicant management — filter, shortlist, and communicate seamlessly.',
              ai: false,
              color: 'from-red-500/10 to-red-500/5',
              border: 'border-red-500/20',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`bg-gradient-to-br ${feature.color} border ${feature.border} rounded-xl p-6 hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              {feature.ai && (
                <span className="inline-flex items-center gap-1 mt-3 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full">
                  ✦ AI Powered
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-gray-400 mb-12">Get hired in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and upload your resume. Our AI instantly parses and scores it.' },
              { step: '02', title: 'Get AI Matched', desc: 'Our engine matches you to the best jobs based on your skills and experience.' },
              { step: '03', title: 'Apply & Prepare', desc: 'Apply in one click and use AI interview prep to ace your interviews.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to find your next role?</h2>
          <p className="text-gray-400 mb-8">
            Join 120,000+ professionals already using TalentAI
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary px-10 py-4 text-lg"
          >
            Get Started for Free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 px-8 py-6 text-center text-gray-500 text-sm">
        © 2025 TalentAI. Built with ⚡ and AI.
      </footer>

    </div>
  );
}