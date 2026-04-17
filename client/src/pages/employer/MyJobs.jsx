import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerLayout from '../../components/common/EmployerLayout';
import { getMyJobsAPI, deleteJobAPI, updateJobAPI } from '../../api/jobsAPI';
import toast from 'react-hot-toast';

const statusConfig = {
  active:  { color: 'bg-green-500/10 text-green-400 border-green-500/20',  label: 'Active'  },
  closed:  { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',     label: 'Closed'  },
  draft:   { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     label: 'Draft'   },
  flagged: { color: 'bg-red-500/10 text-red-400 border-red-500/20',        label: 'Flagged' },
};

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyJobsAPI();
      setJobs(data || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job post?')) return;
    try {
      await deleteJobAPI(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted!');
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateJobAPI(id, { status });
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status } : j));
      toast.success(`Job ${status}!`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = jobs
    .filter(j => filter === 'All' || j.status === filter.toLowerCase())
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <EmployerLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </EmployerLayout>
  );

  return (
    <EmployerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Job Posts</h1>
          <p className="text-gray-400 text-sm mt-1">{jobs.length} total job posts</p>
        </div>
        <button onClick={() => navigate('/employer/post-job')} className="btn-primary text-sm px-4 py-2">
          + Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',   value: jobs.length,                              color: 'text-white'        },
          { label: 'Active',  value: jobs.filter(j=>j.status==='active').length,  color: 'text-green-400'  },
          { label: 'Closed',  value: jobs.filter(j=>j.status==='closed').length,  color: 'text-gray-400'   },
          { label: 'Applicants', value: jobs.reduce((a,j)=>(a+(j.applicants?.length||0)),0), color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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
            placeholder="🔍  Search job posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="input-field"
          >
            <option>All</option>
            <option>Active</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {jobs.length === 0 ? 'No job posts yet' : 'No jobs match filters'}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {jobs.length === 0 ? 'Create your first job post to start receiving applications' : 'Try adjusting your search or filter'}
          </p>
          {jobs.length === 0 && (
            <button onClick={() => navigate('/employer/post-job')} className="btn-primary px-8 py-3">
              Post Your First Job →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => (
            <div key={job._id} className="card hover:border-gray-700 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {job.title?.charAt(0) || 'J'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {job.location} · {job.type} · Posted {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${statusConfig[job.status]?.color}`}>
                      {statusConfig[job.status]?.label}
                    </span>
                  </div>

                  {/* Skills */}
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500">
                      👥 {job.applicants?.length || 0} applicant{job.applicants?.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-green-400 font-medium">
                      💰 {job.salary?.min ? `$${(job.salary.min/1000).toFixed(0)}K – $${(job.salary.max/1000).toFixed(0)}K` : 'Not specified'}
                    </span>
                    <span className="text-xs text-gray-500">
                      🎓 {job.experience}+ yrs exp
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate('/employer/applicants')}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    View Applicants
                  </button>
                  <div className="flex gap-2">
                    {job.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(job._id, 'closed')}
                        className="flex-1 text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(job._id, 'active')}
                        className="flex-1 text-xs bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="flex-1 text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </EmployerLayout>
  );
}