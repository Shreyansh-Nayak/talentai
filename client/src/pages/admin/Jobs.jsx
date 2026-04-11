import { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import toast from 'react-hot-toast';

const initialJobs = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    company: 'Google',
    location: 'Remote',
    type: 'Full-time',
    salary: '$180K',
    applicants: 142,
    status: 'Active',
    posted: 'Mar 28, 2025',
    logo: 'G',
    color: 'bg-blue-500/10 text-blue-400',
    skills: ['React', 'Node.js', 'GraphQL'],
    flagged: false,
  },
  {
    id: 2,
    title: 'ML Engineer — LLMs',
    company: 'OpenAI',
    location: 'Remote',
    type: 'Full-time',
    salary: '$220K',
    applicants: 89,
    status: 'Active',
    posted: 'Apr 1, 2025',
    logo: 'O',
    color: 'bg-yellow-500/10 text-yellow-400',
    skills: ['Python', 'PyTorch', 'LLMs'],
    flagged: false,
  },
  {
    id: 3,
    title: 'Suspicious Job Listing',
    company: 'Unknown Co.',
    location: 'Anywhere',
    type: 'Contract',
    salary: '$999K',
    applicants: 0,
    status: 'Flagged',
    posted: 'Apr 5, 2025',
    logo: '?',
    color: 'bg-red-500/10 text-red-400',
    skills: [],
    flagged: true,
  },
  {
    id: 4,
    title: 'DevOps Engineer — Cloud',
    company: 'Atlassian',
    location: 'Remote',
    type: 'Full-time',
    salary: '$155K',
    applicants: 67,
    status: 'Active',
    posted: 'Apr 1, 2025',
    logo: 'A',
    color: 'bg-cyan-500/10 text-cyan-400',
    skills: ['Kubernetes', 'Terraform', 'AWS'],
    flagged: false,
  },
  {
    id: 5,
    title: 'Frontend Engineer — React',
    company: 'Stripe',
    location: 'San Francisco',
    type: 'Hybrid',
    salary: '$175K',
    applicants: 54,
    status: 'Closed',
    posted: 'Mar 20, 2025',
    logo: 'S',
    color: 'bg-green-500/10 text-green-400',
    skills: ['React', 'TypeScript'],
    flagged: false,
  },
  {
    id: 6,
    title: 'Spam Listing — Work From Home',
    company: 'EasyMoney Ltd.',
    location: 'Remote',
    type: 'Part-time',
    salary: '$50K',
    applicants: 3,
    status: 'Flagged',
    posted: 'Apr 7, 2025',
    logo: '!',
    color: 'bg-red-500/10 text-red-400',
    skills: [],
    flagged: true,
  },
];

const statusConfig = {
  Active:  { color: 'bg-green-500/10 text-green-400 border-green-500/20'  },
  Closed:  { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20'     },
  Flagged: { color: 'bg-red-500/10 text-red-400 border-red-500/20'        },
  Draft:   { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'     },
};

export default function AdminJobs() {
  const [jobs, setJobs]               = useState(initialJobs);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = jobs
    .filter((j) =>
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    )
    .filter((j) => statusFilter === 'All' || j.status === statusFilter);

  const updateJobStatus = (id, status) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status, flagged: status === 'Flagged' } : j))
    );
    if (selectedJob?.id === id) setSelectedJob((prev) => ({ ...prev, status }));
    toast.success(`Job ${status.toLowerCase()}!`);
  };

  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
    toast.success('Job deleted!');
  };

  const stats = {
    total:   jobs.length,
    active:  jobs.filter((j) => j.status === 'Active').length,
    flagged: jobs.filter((j) => j.status === 'Flagged').length,
    closed:  jobs.filter((j) => j.status === 'Closed').length,
  };

  return (
    <AdminLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Management</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} jobs found</p>
        </div>
        <button
          onClick={() => toast.success('Exporting jobs...')}
          className="btn-outline text-sm px-4 py-2"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Jobs',  value: stats.total,   color: 'text-white',        bg: 'from-gray-800'       },
          { label: 'Active',      value: stats.active,  color: 'text-green-400',    bg: 'from-green-500/10'   },
          { label: 'Flagged',     value: stats.flagged, color: 'text-red-400',      bg: 'from-red-500/10'     },
          { label: 'Closed',      value: stats.closed,  color: 'text-gray-400',     bg: 'from-gray-500/10'    },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.bg} to-transparent border border-gray-800 rounded-xl p-4`}
          >
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="🔍  Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option>All</option>
            <option>Active</option>
            <option>Flagged</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Jobs List */}
        <div className="lg:col-span-3 card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium p-4 uppercase tracking-wider">Job</th>
                <th className="text-left text-xs text-gray-500 font-medium p-4 uppercase tracking-wider">Status</th>
                <th className="text-left text-xs text-gray-500 font-medium p-4 uppercase tracking-wider">Applicants</th>
                <th className="text-left text-xs text-gray-500 font-medium p-4 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`cursor-pointer transition-colors hover:bg-gray-800/40 ${
                    selectedJob?.id === job.id ? 'bg-red-500/5' : ''
                  } ${job.flagged ? 'border-l-2 border-red-500/50' : ''}`}
                >
                  {/* Job */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${job.color} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                        {job.logo}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                          {job.title}
                          {job.flagged && (
                            <span className="text-xs text-red-400">🚨</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{job.company} · {job.location}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${statusConfig[job.status]?.color}`}>
                      {job.status}
                    </span>
                  </td>

                  {/* Applicants */}
                  <td className="p-4">
                    <span className="text-sm font-semibold text-white">{job.applicants}</span>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {job.status !== 'Active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'Active'); }}
                          className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {job.status === 'Active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'Flagged'); }}
                          className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                        className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📋</div>
              <p>No jobs found</p>
            </div>
          )}
        </div>

        {/* Job Detail Panel */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="card space-y-4">

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl ${selectedJob.color} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                  {selectedJob.logo}
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedJob.title}</div>
                  <div className="text-xs text-gray-400">{selectedJob.company}</div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border mt-1 inline-block ${statusConfig[selectedJob.status]?.color}`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {[
                  { label: 'Location',    value: selectedJob.location   },
                  { label: 'Type',        value: selectedJob.type       },
                  { label: 'Salary',      value: selectedJob.salary     },
                  { label: 'Applicants',  value: selectedJob.applicants },
                  { label: 'Posted',      value: selectedJob.posted     },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1.5 border-b border-gray-800/50"
                  >
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {selectedJob.skills.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-2">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Flag warning */}
              {selectedJob.flagged && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="text-xs text-red-400 font-medium mb-1">🚨 Flagged Content</div>
                  <p className="text-xs text-gray-400">
                    This job post has been flagged for review. It may contain suspicious
                    content or violate platform guidelines.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {selectedJob.status !== 'Active' && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, 'Active')}
                    className="w-full py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                  >
                    ✓ Approve Job
                  </button>
                )}
                {selectedJob.status === 'Active' && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, 'Flagged')}
                    className="w-full py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/20 transition-colors"
                  >
                    🚨 Flag for Review
                  </button>
                )}
                <button
                  onClick={() => updateJobStatus(selectedJob.id, 'Closed')}
                  className="w-full py-2 btn-outline text-sm"
                >
                  Close Job
                </button>
                <button
                  onClick={() => deleteJob(selectedJob.id)}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                >
                  🗑 Delete Job
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}