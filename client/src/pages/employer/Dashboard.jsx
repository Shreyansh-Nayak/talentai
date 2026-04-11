import { useNavigate } from 'react-router-dom';
import EmployerLayout from '../../components/common/EmployerLayout';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const metrics = [
  { label: 'Active Jobs',       value: '8',   change: '2 expiring soon',  color: 'text-yellow-400', bg: 'from-yellow-500/10' },
  { label: 'Total Applicants',  value: '247', change: '↑ 24 today',       color: 'text-blue-400',   bg: 'from-blue-500/10'  },
  { label: 'Shortlisted',       value: '31',  change: '↑ 5 this week',    color: 'text-green-400',  bg: 'from-green-500/10' },
  { label: 'Interviews Set',    value: '5',   change: '3 this week',      color: 'text-purple-400', bg: 'from-purple-500/10'},
];

const recentApplicants = [
  { id: 1, name: 'Arjun Kumar',    role: 'Senior Full Stack Engineer', exp: '5 yrs',  skills: 'React, Node.js, AWS',        ats: 92, status: 'Shortlisted', avatar: 'AK', color: 'from-blue-500 to-cyan-500'     },
  { id: 2, name: 'Priya Sharma',   role: 'Senior Full Stack Engineer', exp: '3 yrs',  skills: 'React, TypeScript, GraphQL', ats: 79, status: 'Under Review', avatar: 'PS', color: 'from-purple-500 to-pink-500'   },
  { id: 3, name: 'Mohammed Raza',  role: 'Senior Full Stack Engineer', exp: '7 yrs',  skills: 'Node.js, Python, K8s',       ats: 88, status: 'Shortlisted', avatar: 'MR', color: 'from-green-500 to-teal-500'    },
  { id: 4, name: 'Sneha Patel',    role: 'DevOps Engineer',            exp: '4 yrs',  skills: 'AWS, Terraform, Docker',     ats: 74, status: 'Under Review', avatar: 'SP', color: 'from-yellow-500 to-orange-500' },
];

const activeJobs = [
  { id: 1, title: 'Senior Full Stack Engineer', applicants: 142, new: 12, posted: 'Mar 28', status: 'Active'  },
  { id: 2, title: 'DevOps Engineer — Cloud',    applicants: 67,  new: 5,  posted: 'Apr 1',  status: 'Active'  },
  { id: 3, title: 'ML Engineer',                applicants: 38,  new: 8,  posted: 'Apr 3',  status: 'Active'  },
];

const statusConfig = {
  'Shortlisted':  'bg-green-500/10 text-green-400 border-green-500/20',
  'Under Review': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Rejected':     'bg-red-500/10 text-red-400 border-red-500/20',
  'Interview':    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const atsColor = (score) => {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

export default function EmployerDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  return (
    <EmployerLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hiring Dashboard 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {user?.name} — 24 new applicants today
          </p>
        </div>
        <button
          onClick={() => navigate('/employer/post-job')}
          className="btn-primary text-sm px-5 py-2.5"
        >
          + Post New Job
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`bg-gradient-to-br ${m.bg} to-transparent border border-gray-800 rounded-xl p-4`}
          >
            <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
            <div className="text-gray-400 text-xs mt-1">{m.label}</div>
            <div className="text-gray-500 text-xs mt-2">{m.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

        {/* Recent Applicants */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Applicants</h2>
            <button
              onClick={() => navigate('/employer/applicants')}
              className="text-xs text-yellow-400 hover:text-yellow-300"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all"
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${applicant.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {applicant.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{applicant.name}</div>
                  <div className="text-xs text-gray-400 truncate">{applicant.exp} · {applicant.skills}</div>
                </div>

                {/* ATS */}
                <div className="text-center flex-shrink-0">
                  <div className={`text-sm font-bold ${atsColor(applicant.ats)}`}>{applicant.ats}</div>
                  <div className="text-xs text-gray-600">ATS</div>
                </div>

                {/* Status */}
                <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${statusConfig[applicant.status]}`}>
                  {applicant.status}
                </span>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toast.success(`${applicant.name} shortlisted!`)}
                    className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => toast.success(`${applicant.name} rejected.`)}
                    className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Active Job Posts</h2>
            <button
              onClick={() => navigate('/employer/jobs')}
              className="text-xs text-yellow-400 hover:text-yellow-300"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
                onClick={() => navigate('/employer/applicants')}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm font-medium text-white leading-tight">{job.title}</div>
                  <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">{job.applicants} applicants</div>
                  <div className="text-xs text-blue-400">+{job.new} new</div>
                </div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    style={{ width: `${Math.min((job.applicants / 200) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">Posted {job.posted}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/employer/post-job')}
            className="w-full mt-3 btn-outline text-sm py-2.5 border-dashed"
          >
            + Post New Job
          </button>
        </div>
      </div>

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">✨</span>
              <h3 className="font-semibold text-white">AI Job Description Generator</h3>
            </div>
            <p className="text-sm text-gray-400">
              Generate compelling, bias-free job descriptions in seconds using AI
            </p>
          </div>
          <button
            onClick={() => navigate('/employer/jd-generator')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Try AI Generator →
          </button>
        </div>
      </div>

    </EmployerLayout>
  );
}