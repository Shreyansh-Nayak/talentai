import SeekerLayout from '../../components/common/SeekerLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const metrics = [
  { label: 'Applications',  value: '12', change: '↑ 3 this week', color: 'text-blue-400',   bg: 'from-blue-500/10 to-blue-500/5' },
  { label: 'Shortlisted',   value: '5',  change: '↑ 2 new',       color: 'text-yellow-400', bg: 'from-yellow-500/10 to-yellow-500/5' },
  { label: 'Profile Score', value: '87', change: '↑ 5 pts',        color: 'text-green-400',  bg: 'from-green-500/10 to-green-500/5' },
  { label: 'AI Matches',    value: '3',  change: 'Today',          color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-500/5' },
];

const recentJobs = [
  { id: 1, title: 'Senior Full Stack Engineer', company: 'Google',    location: 'Remote',    salary: '$180K', match: 96, logo: 'G', color: 'bg-blue-500/10 text-blue-400' },
  { id: 2, title: 'Lead Backend Developer',     company: 'Microsoft', location: 'Bangalore', salary: '₹45L',  match: 91, logo: 'M', color: 'bg-purple-500/10 text-purple-400' },
  { id: 3, title: 'ML Engineer — LLMs',         company: 'OpenAI',    location: 'Remote',    salary: '$220K', match: 88, logo: 'O', color: 'bg-yellow-500/10 text-yellow-400' },
];

const recentApplications = [
  { company: 'Google',    role: 'Senior Full Stack Engineer', status: 'Shortlisted', statusColor: 'bg-green-500/10 text-green-400',  ats: 92 },
  { company: 'OpenAI',    role: 'ML Engineer',                status: 'Applied',     statusColor: 'bg-blue-500/10 text-blue-400',   ats: 78 },
  { company: 'Stripe',    role: 'Backend Engineer',           status: 'Interview',   statusColor: 'bg-yellow-500/10 text-yellow-400', ats: 85 },
];

export default function SeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">You have 3 new AI matches today</p>
        </div>
        <button
          onClick={() => navigate('/seeker/profile')}
          className="btn-primary text-sm px-4 py-2"
        >
          Upload Resume
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className={`bg-gradient-to-br ${m.bg} border border-gray-800 rounded-xl p-4`}>
            <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
            <div className="text-gray-400 text-xs mt-1">{m.label}</div>
            <div className="text-green-400 text-xs mt-2">{m.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* AI Job Matches */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">AI Job Matches</h2>
            <button
              onClick={() => navigate('/seeker/jobs')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate('/seeker/jobs')}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${job.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {job.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{job.title}</div>
                  <div className="text-xs text-gray-400">{job.company} · {job.location}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-blue-500 rounded-full"
                        style={{ width: `${job.match}%` }}
                      />
                    </div>
                    <span className="text-xs text-yellow-400">✦ {job.match}% match</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-green-400">{job.salary}</div>
                  <div className="text-xs text-gray-500">/year</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Applications</h2>
            <button
              onClick={() => navigate('/seeker/applications')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.company} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{app.role}</div>
                  <div className="text-xs text-gray-400">{app.company}</div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-sm font-bold text-blue-400">{app.ats}</div>
                  <div className="text-xs text-gray-500">ATS</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${app.statusColor}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ATS Score Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎯</span>
              <h3 className="font-semibold text-white">Your Resume ATS Score: 78/100</h3>
            </div>
            <p className="text-sm text-gray-400">
              Missing keywords: <span className="text-red-400">Docker, Kubernetes</span> · Add metrics to bullet points
            </p>
          </div>
          <button
            onClick={() => navigate('/seeker/ats')}
            className="btn-primary text-sm px-5 py-2 flex-shrink-0"
          >
            Improve Score →
          </button>
        </div>
      </div>

    </SeekerLayout>
  );
}