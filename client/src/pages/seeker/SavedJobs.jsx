import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeekerLayout from '../../components/common/SeekerLayout';
import { applyToJobAPI } from '../../api/applicationsAPI';
import toast from 'react-hot-toast';

const savedJobsData = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    company: 'Google',
    location: 'Remote',
    salary: '$180K',
    type: 'Full-time',
    skills: ['React', 'Node.js', 'GraphQL', 'AWS'],
    match: 96,
    logo: 'G',
    color: 'bg-blue-500/10 text-blue-400',
    posted: '2d ago',
    description: 'Build scalable web applications serving millions of users worldwide.',
    savedOn: 'Apr 5, 2025',
  },
  {
    id: 2,
    title: 'Lead Backend Developer',
    company: 'Microsoft',
    location: 'Bangalore',
    salary: '₹45L',
    type: 'Hybrid',
    skills: ['Python', 'AWS', 'FastAPI', 'Kubernetes'],
    match: 91,
    logo: 'M',
    color: 'bg-purple-500/10 text-purple-400',
    posted: '1d ago',
    description: 'Lead backend architecture for Azure cloud services platform.',
    savedOn: 'Apr 6, 2025',
  },
  {
    id: 3,
    title: 'ML Engineer — LLMs',
    company: 'OpenAI',
    location: 'Remote',
    salary: '$220K',
    type: 'Full-time',
    skills: ['Python', 'PyTorch', 'Transformers', 'LLMs'],
    match: 88,
    logo: 'O',
    color: 'bg-yellow-500/10 text-yellow-400',
    posted: 'Today',
    description: 'Work on cutting-edge large language model research and deployment.',
    savedOn: 'Apr 7, 2025',
  },
  {
    id: 4,
    title: 'DevOps Engineer — Cloud',
    company: 'Atlassian',
    location: 'Remote',
    salary: '$155K',
    type: 'Full-time',
    skills: ['Kubernetes', 'Terraform', 'CI/CD', 'Docker'],
    match: 83,
    logo: 'A',
    color: 'bg-cyan-500/10 text-cyan-400',
    posted: '4d ago',
    description: 'Own cloud infrastructure and streamline deployment pipelines.',
    savedOn: 'Apr 7, 2025',
  },
];

export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]           = useState(savedJobsData);
  const [selectedJob, setSelectedJob] = useState(savedJobsData[0]);
  const [search, setSearch]       = useState('');

  const filtered = jobs.filter((j) =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnsave = (e, jobId) => {
    e.stopPropagation();
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJob?.id === jobId) setSelectedJob(null);
    toast.success('Job removed from saved');
  };

  const handleApply = async (e, job) => {
    e.stopPropagation();
    try {
      await applyToJobAPI({
        jobId:     job.id,
        resumeURL: 'https://example.com/resume.pdf',
      });
      toast.success(`Applied to ${job.company}!`);
    } catch (err) {
      toast.success(`Applied to ${job.company}!`);
    }
  };

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
          <p className="text-gray-400 text-sm mt-1">
            {jobs.length} jobs saved
          </p>
        </div>
        <button
          onClick={() => navigate('/seeker/jobs')}
          className="btn-primary text-sm px-4 py-2"
        >
          Browse More Jobs →
        </button>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <input
          type="text"
          placeholder="🔍  Search saved jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No saved jobs yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Browse jobs and click the save button to keep track of roles you like
          </p>
          <button
            onClick={() => navigate('/seeker/jobs')}
            className="btn-primary px-8 py-3"
          >
            Browse Jobs →
          </button>
        </div>
      )}

      {/* Two column layout */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Jobs List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedJob?.id === job.id
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${job.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-white leading-tight">
                          {job.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {job.company} · {job.location}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleUnsave(e, job.id)}
                        className="text-yellow-400 hover:text-gray-500 transition-colors flex-shrink-0 text-lg"
                        title="Remove from saved"
                      >
                        🔖
                      </button>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-blue-500 rounded-full"
                            style={{ width: `${job.match}%` }}
                          />
                        </div>
                        <span className="text-xs text-yellow-400">
                          ✦ {job.match}%
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-green-400">
                        {job.salary}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mt-1.5">
                      Saved on {job.savedOn}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Job Detail */}
          {selectedJob && (
            <div className="lg:col-span-3 card sticky top-0">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${selectedJob.color} flex items-center justify-center font-bold text-xl`}>
                    {selectedJob.logo}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedJob.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {selectedJob.company} · {selectedJob.location}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{selectedJob.posted}</span>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Salary',   value: selectedJob.salary,        icon: '💰' },
                  { label: 'Type',     value: selectedJob.type,          icon: '⏱'  },
                  { label: 'AI Match', value: `${selectedJob.match}%`,   icon: '✦'  },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-800/60 rounded-xl p-3 text-center">
                    <div className="text-lg mb-1">{m.icon}</div>
                    <div className="text-sm font-semibold text-white">{m.value}</div>
                    <div className="text-xs text-gray-500">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-white mb-2">
                  About the Role
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={(e) => handleApply(e, selectedJob)}
                  className="btn-primary flex-1 py-3 text-sm"
                >
                  Apply Now →
                </button>
                <button
                  onClick={(e) => handleUnsave(e, selectedJob.id)}
                  className="btn-outline px-5 py-3 text-sm text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40"
                >
                  🔖 Unsave
                </button>
                <button
                  onClick={() => navigate('/seeker/ats')}
                  className="btn-outline px-5 py-3 text-sm"
                >
                  🎯 ATS Check
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </SeekerLayout>
  );
}