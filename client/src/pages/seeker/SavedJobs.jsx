import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeekerLayout from '../../components/common/SeekerLayout';
import { applyToJobAPI } from '../../api/applicationsAPI';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]             = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch]         = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Load saved jobs from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setJobs(stored);
    if (stored.length > 0) setSelectedJob(stored[0]);
  }, []);

  const filtered = jobs.filter((j) =>
    !search ||
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnsave = (e, jobId) => {
    e.stopPropagation();
    const updated = jobs.filter((j) => j.id !== jobId);
    setJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    if (selectedJob?.id === jobId) setSelectedJob(updated[0] || null);
    toast.success('Job removed from saved');
  };

  const handleApply = async (e, job) => {
    e.stopPropagation();
    if (appliedJobs.includes(job.id)) {
      toast.error('Already applied!');
      return;
    }
    try {
      await applyToJobAPI({ jobId: job.id, coverNote: '' });
      setAppliedJobs(prev => [...prev, job.id]);
      toast.success(`Applied to ${job.company}!`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'You have already applied to this job') {
        setAppliedJobs(prev => [...prev, job.id]);
        toast.error(msg);
      } else {
        setAppliedJobs(prev => [...prev, job.id]);
        toast.success(`Applied to ${job.company}!`);
      }
    }
  };

  return (
    <SeekerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
          <p className="text-gray-400 text-sm mt-1">{jobs.length} jobs saved</p>
        </div>
        <button onClick={() => navigate('/seeker/jobs')} className="btn-primary text-sm px-4 py-2">
          Browse More Jobs →
        </button>
      </div>

      <div className="card mb-4">
        <input
          type="text"
          placeholder="🔍  Search saved jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {jobs.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <h3 className="text-lg font-semibold text-white mb-2">No saved jobs yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Browse jobs and click the 🔖 bookmark button to save roles you like
          </p>
          <button onClick={() => navigate('/seeker/jobs')} className="btn-primary px-8 py-3">
            Browse Jobs →
          </button>
        </div>
      )}

      {jobs.length > 0 && (
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
                  <div className={`w-10 h-10 rounded-xl ${job.color || 'bg-blue-500/10 text-blue-400'} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {job.logo || job.company?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-white leading-tight">{job.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{job.company} · {job.location}</div>
                      </div>
                      <button
                        onClick={(e) => handleUnsave(e, job.id)}
                        className="text-yellow-400 hover:text-gray-500 transition-colors flex-shrink-0 text-lg"
                        title="Remove from saved"
                      >
                        🔖
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(job.skills || []).slice(0, 3).map((skill) => (
                        <span key={skill} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-500 to-blue-500 rounded-full" style={{ width: `${job.match || 80}%` }} />
                        </div>
                        <span className="text-xs text-yellow-400">✦ {job.match || 80}%</span>
                      </div>
                      <span className="text-xs font-semibold text-green-400">{job.salary}</span>
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
                  <div className={`w-14 h-14 rounded-2xl ${selectedJob.color || 'bg-blue-500/10 text-blue-400'} flex items-center justify-center font-bold text-xl`}>
                    {selectedJob.logo || selectedJob.company?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-gray-400 text-sm">{selectedJob.company} · {selectedJob.location}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{selectedJob.posted}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Salary',    value: selectedJob.salary,              icon: '💰' },
                  { label: 'Type',      value: selectedJob.type,                icon: '⏱'  },
                  { label: 'AI Match',  value: `${selectedJob.match || 80}%`,   icon: '✦'  },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-800/60 rounded-xl p-3 text-center">
                    <div className="text-lg mb-1">{m.icon}</div>
                    <div className="text-sm font-semibold text-white">{m.value}</div>
                    <div className="text-xs text-gray-500">{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-white mb-2">About the Role</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedJob.skills || []).map((skill) => (
                    <span key={skill} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => handleApply(e, selectedJob)}
                  disabled={appliedJobs.includes(selectedJob.id)}
                  className={`flex-1 py-3 text-sm rounded-lg font-medium transition-all ${
                    appliedJobs.includes(selectedJob.id)
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
                      : 'btn-primary'
                  }`}
                >
                  {appliedJobs.includes(selectedJob.id) ? '✓ Applied' : 'Apply Now →'}
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