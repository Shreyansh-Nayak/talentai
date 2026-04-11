import { useState, useEffect } from 'react';
import SeekerLayout from '../../components/common/SeekerLayout';
import { getMyApplicationsAPI } from '../../api/applicationsAPI';
import toast from 'react-hot-toast';

const statusConfig = {
  applied:      { label: 'Applied',      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    dot: 'bg-blue-400'    },
  under_review: { label: 'Under Review', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
  shortlisted:  { label: 'Shortlisted',  color: 'bg-green-500/10 text-green-400 border-green-500/20',  dot: 'bg-green-400'   },
  interview:    { label: 'Interview',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  rejected:     { label: 'Rejected',     color: 'bg-red-500/10 text-red-400 border-red-500/20',         dot: 'bg-red-400'    },
  hired:        { label: 'Hired',        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
};

const atsColor = (score) => {
  if (!score)       return 'text-gray-500';
  if (score >= 85)  return 'text-green-400';
  if (score >= 70)  return 'text-yellow-400';
  return 'text-red-400';
};

// Build timeline from status
const buildTimeline = (status) => {
  const steps = ['applied', 'under_review', 'shortlisted', 'interview', 'hired'];
  const labels = {
    applied:      'Applied',
    under_review: 'Under Review',
    shortlisted:  'Shortlisted',
    interview:    'Interview',
    hired:        'Hired / Offer',
  };

  if (status === 'rejected') {
    return steps.slice(0, steps.indexOf('shortlisted') + 1).map((s) => ({
      step:  labels[s],
      done:  true,
      final: s === 'shortlisted',
    })).concat([{ step: 'Rejected', done: true, rejected: true }]);
  }

  const currentIdx = steps.indexOf(status);
  return steps.map((s, i) => ({
    step: labels[s],
    done: i <= currentIdx,
  }));
};

export default function Applications() {
  const [applications,   setApplications]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filter,         setFilter]         = useState('All');
  const [selectedApp,    setSelectedApp]    = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplicationsAPI();
      setApplications(data);
      if (data.length > 0) setSelectedApp(data[0]);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filters = ['All', 'applied', 'shortlisted', 'interview', 'rejected'];

  const filtered = filter === 'All'
    ? applications
    : applications.filter((a) => a.status === filter);

  const stats = {
    total:       applications.length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interview:   applications.filter((a) => a.status === 'interview').length,
    rejected:    applications.filter((a) => a.status === 'rejected').length,
  };

  if (loading) return (
    <SeekerLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </SeekerLayout>
  );

  return (
    <SeekerLayout>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">My Applications</h1>
        <p className="text-gray-400 text-sm">
          Track all your job applications in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Applied',  value: stats.total,       color: 'text-blue-400',   bg: 'from-blue-500/10'   },
          { label: 'Shortlisted',    value: stats.shortlisted, color: 'text-green-400',  bg: 'from-green-500/10'  },
          { label: 'Interviews',     value: stats.interview,   color: 'text-yellow-400', bg: 'from-yellow-500/10' },
          { label: 'Rejected',       value: stats.rejected,    color: 'text-red-400',    bg: 'from-red-500/10'    },
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

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-4 py-1.5 rounded-full border transition-all duration-200 capitalize ${
              filter === f
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {f === 'All' ? 'All' : statusConfig[f]?.label}
            {f !== 'All' && (
              <span className="ml-1.5 opacity-60">
                {applications.filter((a) => a.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No applications yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Start applying to jobs and track your progress here
          </p>
          <a href="/seeker/jobs" className="btn-primary px-8 py-3">
            Browse Jobs →
          </a>
        </div>
      )}

      {/* Two column layout */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Applications List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📋</div>
                <p>No applications with this status</p>
              </div>
            ) : (
              filtered.map((app) => (
                <div
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedApp?._id === app._id
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {app.job?.employer?.name?.charAt(0) || app.job?.title?.charAt(0) || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-white truncate">
                          {app.job?.title || 'Job Title'}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusConfig[app.status]?.color}`}>
                          {statusConfig[app.status]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {app.job?.employer?.name || 'Company'} · {app.job?.location || 'Location'}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Applied {new Date(app.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                        <span className={`text-xs font-bold ${atsColor(app.atsScore)}`}>
                          {app.atsScore ? `ATS: ${app.atsScore}` : 'ATS: N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Application Detail */}
          {selectedApp && (
            <div className="lg:col-span-3 space-y-4">

              {/* Header Card */}
              <div className="card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {selectedApp.job?.employer?.name?.charAt(0) || 'J'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">
                      {selectedApp.job?.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {selectedApp.job?.employer?.name} · {selectedApp.job?.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${statusConfig[selectedApp.status]?.color}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[selectedApp.status]?.dot}`} />
                        {statusConfig[selectedApp.status]?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        Applied {new Date(selectedApp.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-green-400">
                      {selectedApp.job?.salary?.min
                        ? `$${(selectedApp.job.salary.min/1000).toFixed(0)}K`
                        : 'Competitive'}
                    </div>
                    <div className="text-xs text-gray-500">/year</div>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="bg-gray-800/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 font-medium">ATS Score</span>
                    <span className={`text-xl font-extrabold ${atsColor(selectedApp.atsScore)}`}>
                      {selectedApp.atsScore ? `${selectedApp.atsScore}/100` : 'Not scored'}
                    </span>
                  </div>
                  {selectedApp.atsScore && (
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          selectedApp.atsScore >= 85
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : selectedApp.atsScore >= 70
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                            : 'bg-gradient-to-r from-red-500 to-rose-400'
                        }`}
                        style={{ width: `${selectedApp.atsScore}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <h3 className="font-semibold text-white mb-5">
                  Application Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800" />
                  <div className="space-y-6">
                    {buildTimeline(selectedApp.status).map((step, i) => (
                      <div key={i} className="flex items-center gap-4 relative pl-10">
                        <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                          step.rejected
                            ? 'bg-red-500 border-red-500 text-white'
                            : step.done
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-gray-900 border-gray-700 text-gray-600'
                        }`}>
                          {step.rejected ? (
                            <span className="text-xs">✕</span>
                          ) : step.done ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between flex-1">
                          <span className={`text-sm font-medium ${
                            step.rejected ? 'text-red-400' :
                            step.done ? 'text-white' : 'text-gray-600'
                          }`}>
                            {step.step}
                          </span>
                          {step.done && !step.rejected && (
                            <span className="text-xs text-gray-500">✓ Done</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="card">
                <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/seeker/interview'}
                    className="btn-primary py-2.5 text-sm"
                  >
                    💬 Interview Prep
                  </button>
                  <button
                    onClick={() => window.location.href = '/seeker/ats'}
                    className="btn-outline py-2.5 text-sm"
                  >
                    🎯 Improve ATS Score
                  </button>
                  <button
                    onClick={() => toast('Withdrawal requested', { icon: '⚠️' })}
                    className="btn-outline py-2.5 text-sm col-span-2 text-red-400 border-red-500/20 hover:border-red-500/40"
                  >
                    Withdraw Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SeekerLayout>
  );
}