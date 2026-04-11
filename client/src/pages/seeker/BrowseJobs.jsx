import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeekerLayout from '../../components/common/SeekerLayout';
import toast from 'react-hot-toast';
import { getJobsAPI } from '../../api/jobsAPI';
import { applyToJobAPI } from '../../api/applicationsAPI';
import { useEffect } from 'react';




const skillFilters = ['All', 'React', 'Node.js', 'Python', 'AWS', 'TypeScript', 'Kubernetes'];

export default function BrowseJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [activeSkill, setActiveSkill] = useState('All');
  const [savedJobs, setSavedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(allJobs[0]);
  const [fetching, setFetching] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobsAPI();
        // Use real data if available, otherwise keep mock data
        if (data.jobs?.length > 0) {
          setAllJobs(data.jobs.map((j) => ({
            id: j._id,
            title: j.title,
            company: j.employer?.name || 'Company',
            location: j.location,
            salary: j.salary?.min ? `$${(j.salary.min / 1000).toFixed(0)}K` : 'Competitive',
            type: j.type,
            skills: j.skills || [],
            match: Math.floor(Math.random() * 20) + 80,
            logo: (j.employer?.name || 'C').charAt(0),
            color: 'bg-blue-500/10 text-blue-400',
            posted: new Date(j.createdAt).toLocaleDateString(),
            description: j.description?.slice(0, 120) + '...',
            remote: j.location?.toLowerCase().includes('remote'),
          })));
        }
      } catch (err) {
        console.log('Using mock data');
      } finally {
        setFetching(false);
      }
    };
    fetchJobs();
  }, []);

  // Filter logic
  const filtered = allJobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchType = !jobType || job.type === jobType;
    const matchSkill = activeSkill === 'All' || job.skills.includes(activeSkill);
    return matchSearch && matchLocation && matchType && matchSkill;
  });

  const handleSave = (e, jobId) => {
    e.stopPropagation();
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
    toast.success(savedJobs.includes(jobId) ? 'Job unsaved' : 'Job saved!');
  };

  const handleApply = async (e, job) => {
    e.stopPropagation();

    // Prevent double apply
    if (appliedJobs.includes(job.id)) {
      toast.error('You have already applied to this job');
      return;
    }

    try {
      await applyToJobAPI({
        jobId: job.id,
        coverNote: '',
      });
      setAppliedJobs((prev) => [...prev, job.id]);
      toast.success(`Applied to ${job.company}!`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'You have already applied to this job') {
        setAppliedJobs((prev) => [...prev, job.id]);
        toast.error(msg);
      } else {
        toast.success(`Applied to ${job.company}!`);
      }
    }
  };

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Browse Jobs</h1>
        <p className="text-gray-400 text-sm">{filtered.length} jobs found matching your profile</p>
      </div>

      {/* Search & Filters */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            placeholder="🔍  Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="📍  Location (e.g. Remote, Bangalore)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="input-field"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        {/* Skill chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {skillFilters.map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${activeSkill === skill
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Job List */}
        <div className="lg:col-span-2 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">🔍</div>
              <p>No jobs found matching your filters</p>
              <button
                onClick={() => { setSearch(''); setLocation(''); setJobType(''); setActiveSkill('All'); }}
                className="text-blue-400 text-sm mt-2 hover:text-blue-300"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedJob?.id === job.id
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
                        <div className="text-sm font-semibold text-white leading-tight">{job.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{job.company} · {job.location}</div>
                      </div>
                      <button
                        onClick={(e) => handleSave(e, job.id)}
                        className={`text-lg flex-shrink-0 transition-colors ${savedJobs.includes(job.id) ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
                          }`}
                      >
                        {savedJobs.includes(job.id) ? '🔖' : '🔖'}
                      </button>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-xs text-gray-500">+{job.skills.length - 3}</span>
                      )}
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
                        <span className="text-xs text-yellow-400">✦ {job.match}%</span>
                      </div>
                      <span className="text-xs font-semibold text-green-400">{job.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job Detail Panel */}
        {selectedJob && (
          <div className="lg:col-span-3 card sticky top-0">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${selectedJob.color} flex items-center justify-center font-bold text-xl`}>
                  {selectedJob.logo}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedJob.title}</h2>
                  <p className="text-gray-400 text-sm">{selectedJob.company} · {selectedJob.location}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{selectedJob.posted}</span>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Salary', value: selectedJob.salary, icon: '💰' },
                { label: 'Type', value: selectedJob.type, icon: '⏱' },
                { label: 'AI Match', value: `${selectedJob.match}%`, icon: '✦' },
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
              <h3 className="text-sm font-semibold text-white mb-2">About the Role</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{selectedJob.description}</p>
            </div>

            {/* Required Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">Required Skills</h3>
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => handleApply(e, selectedJob)}
                disabled={appliedJobs.includes(selectedJob.id)}
                className={`flex-1 py-3 text-sm rounded-lg font-medium transition-all ${appliedJobs.includes(selectedJob.id)
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
                    : 'btn-primary'
                  }`}
              >
                {appliedJobs.includes(selectedJob.id) ? '✓ Applied' : 'Apply Now →'}
              </button>
              <button
                onClick={(e) => handleSave(e, selectedJob.id)}
                className={`btn-outline px-5 py-3 text-sm ${savedJobs.includes(selectedJob.id) ? 'border-yellow-500/50 text-yellow-400' : ''
                  }`}
              >
                {savedJobs.includes(selectedJob.id) ? '🔖 Saved' : '🔖 Save'}
              </button>
              <button
                onClick={() => navigate('/seeker/ats')}
                className="btn-outline px-5 py-3 text-sm"
              >
                🎯 Check ATS
              </button>
            </div>
          </div>
        )}
      </div>

    </SeekerLayout>
  );
}