import { useState, useEffect } from 'react';
import EmployerLayout from '../../components/common/EmployerLayout';
import {
  getAllEmployerApplicationsAPI,
  updateApplicationStatusAPI,
} from '../../api/applicationsAPI';
import { getMyJobsAPI } from '../../api/jobsAPI';
import toast from 'react-hot-toast';

const statusConfig = {
  applied:      { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      label: 'Applied'      },
  under_review: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Under Review' },
  shortlisted:  { color: 'bg-green-500/10 text-green-400 border-green-500/20',    label: 'Shortlisted'  },
  interview:    { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Interview'    },
  rejected:     { color: 'bg-red-500/10 text-red-400 border-red-500/20',          label: 'Rejected'     },
  hired:        { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Hired'        },
};

const atsColor = (score) => {
  if (!score)      return 'text-gray-500';
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

export default function Applicants() {
  const [applications,     setApplications]     = useState([]);
  const [jobs,             setJobs]             = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedJob,      setSelectedJob]      = useState('all');
  const [statusFilter,     setStatusFilter]     = useState('All');
  const [search,           setSearch]           = useState('');
  const [selectedApplicant,setSelectedApplicant]= useState(null);
  const [sortBy,           setSortBy]           = useState('date');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsData, jobsData] = await Promise.all([
        getAllEmployerApplicationsAPI(),
        getMyJobsAPI(),
      ]);
      setApplications(appsData);
      setJobs(jobsData);
      if (appsData.length > 0) setSelectedApplicant(appsData[0]);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const updated = await updateApplicationStatusAPI(id, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
      if (selectedApplicant?._id === id) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Status updated to ${statusConfig[newStatus]?.label}!`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Filter applicants
  const filtered = applications
    .filter((a) => selectedJob === 'all' || a.job?._id === selectedJob)
    .filter((a) => statusFilter === 'All' || a.status === statusFilter)
    .filter((a) =>
      !search ||
      a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.user?.profile?.skills?.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === 'atsScore') return (b.atsScore || 0) - (a.atsScore || 0);
      if (sortBy === 'name')     return a.user?.name?.localeCompare(b.user?.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) return (
    <EmployerLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </EmployerLayout>
  );

  return (
    <EmployerLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Applicants</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} candidates found
          </p>
        </div>
        <button
          onClick={() => toast.success('Exporting CSV...')}
          className="btn-outline text-sm px-4 py-2"
        >
          Export CSV
        </button>
      </div>

      {/* Job Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedJob('all')}
          className={`text-xs px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
            selectedJob === 'all'
              ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          All Jobs ({applications.length})
        </button>
        {jobs.map((job) => (
          <button
            key={job._id}
            onClick={() => setSelectedJob(job._id)}
            className={`text-xs px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
              selectedJob === job._id
                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {job.title} ({applications.filter((a) => a.job?._id === job._id).length})
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="🔍  Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="All">All Statuses</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="atsScore">Sort by ATS Score</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No applicants yet
          </h3>
          <p className="text-gray-400 text-sm">
            Applicants will appear here once candidates apply to your jobs
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Applicant List */}
          <div className="lg:col-span-2 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">👥</div>
                <p>No applicants found</p>
              </div>
            ) : (
              filtered.map((applicant) => (
                <div
                  key={applicant._id}
                  onClick={() => setSelectedApplicant(applicant)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedApplicant?._id === applicant._id
                      ? 'border-yellow-500/50 bg-yellow-500/5'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {applicant.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-white truncate">
                          {applicant.user?.name || 'Applicant'}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusConfig[applicant.status]?.color}`}>
                          {statusConfig[applicant.status]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">
                        {applicant.job?.title} · {new Date(applicant.createdAt).toLocaleDateString()}
                      </div>
                      {applicant.user?.profile?.skills?.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {applicant.user.profile.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className={`text-base font-bold ${atsColor(applicant.atsScore)}`}>
                        {applicant.atsScore || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">ATS</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Applicant Detail */}
          {selectedApplicant && (
            <div className="lg:col-span-3 space-y-4">
              <div className="card">

                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {selectedApplicant.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white">
                      {selectedApplicant.user?.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedApplicant.user?.profile?.title || 'Candidate'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {selectedApplicant.user?.profile?.location && (
                        <span className="text-xs text-gray-500">
                          📍 {selectedApplicant.user.profile.location}
                        </span>
                      )}
                      {selectedApplicant.user?.profile?.experience && (
                        <span className="text-xs text-gray-500">
                          💼 {selectedApplicant.user.profile.experience} yrs exp
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className={`text-2xl font-extrabold ${atsColor(selectedApplicant.atsScore)}`}>
                      {selectedApplicant.atsScore || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">ATS Score</div>
                  </div>
                </div>

                {/* ATS Bar */}
                {selectedApplicant.atsScore && (
                  <div className="mb-5">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          selectedApplicant.atsScore >= 85
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : selectedApplicant.atsScore >= 70
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                            : 'bg-gradient-to-r from-red-500 to-rose-400'
                        }`}
                        style={{ width: `${selectedApplicant.atsScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { icon: '✉️', label: 'Email',    value: selectedApplicant.user?.email       },
                    { icon: '📅', label: 'Applied',  value: new Date(selectedApplicant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    { icon: '💼', label: 'Job',      value: selectedApplicant.job?.title        },
                    { icon: '📍', label: 'Location', value: selectedApplicant.user?.profile?.location || 'N/A' },
                  ].map((info) => (
                    <div key={info.label} className="bg-gray-800/60 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-0.5">{info.icon} {info.label}</div>
                      <div className="text-xs text-white font-medium truncate">
                        {info.value || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {selectedApplicant.user?.profile?.skills?.length > 0 && (
                  <div className="mb-5">
                    <div className="text-xs text-gray-400 font-medium mb-2">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.user.profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Note */}
                {selectedApplicant.coverNote && (
                  <div className="bg-gray-800/60 rounded-xl p-4 mb-5">
                    <div className="text-xs text-gray-400 font-medium mb-2">Cover Note</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {selectedApplicant.coverNote}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="mb-4">
                  <div className="text-xs text-gray-400 font-medium mb-2">
                    Update Status
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => updateStatus(selectedApplicant._id, key)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          selectedApplicant.status === key
                            ? val.color
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => toast.success('Opening resume...')}
                    className="btn-primary py-2.5 text-xs"
                  >
                    📄 Resume
                  </button>
                  <button
                    onClick={() => toast.success(`Interview scheduled with ${selectedApplicant.user?.name}!`)}
                    className="btn-outline py-2.5 text-xs"
                  >
                    📅 Schedule
                  </button>
                  <button
                    onClick={() => toast.success(`Email sent to ${selectedApplicant.user?.name}!`)}
                    className="btn-outline py-2.5 text-xs"
                  >
                    ✉️ Email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </EmployerLayout>
  );
}