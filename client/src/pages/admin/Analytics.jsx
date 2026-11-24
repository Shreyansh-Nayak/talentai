import { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [usersRes, jobsRes] = await Promise.all([
        api.get('/users'),
        api.get('/jobs?limit=200'),
      ]);
      const users = usersRes.data || [];
      const jobs  = jobsRes.data?.jobs || [];

      // Group jobs by month
      const byMonth = {};
      jobs.forEach(j => {
        const m = new Date(j.createdAt).toLocaleString('default', { month: 'short' });
        byMonth[m] = (byMonth[m] || 0) + 1;
      });

      // Group users by role
      const seekers   = users.filter(u => u.role === 'seeker').length;
      const employers = users.filter(u => u.role === 'employer').length;
      const admins    = users.filter(u => u.role === 'admin').length;

      setData({
        totalUsers: users.length, seekers, employers, admins,
        totalJobs:  jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        closedJobs: jobs.filter(j => j.status === 'closed').length,
        flaggedJobs:jobs.filter(j => j.status === 'flagged').length,
        byMonth,
        recentJobs:  jobs.slice(0, 5),
        recentUsers: users.slice(-5).reverse(),
      });
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const months = Object.keys(data?.byMonth || {});
  const maxJobs = Math.max(...Object.values(data?.byMonth || { x: 1 }), 1);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time data from MongoDB</p>
        </div>
        <button onClick={fetchAnalytics} className="btn-outline text-sm px-4 py-2">Refresh</button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users',   value: data?.totalUsers,  color: 'text-blue-400',   bg: 'from-blue-500/10'   },
          { label: 'Total Jobs',    value: data?.totalJobs,   color: 'text-yellow-400', bg: 'from-yellow-500/10' },
          { label: 'Active Jobs',   value: data?.activeJobs,  color: 'text-green-400',  bg: 'from-green-500/10'  },
          { label: 'Flagged Jobs',  value: data?.flaggedJobs, color: 'text-red-400',    bg: 'from-red-500/10'    },
        ].map(m => (
          <div key={m.label} className={`bg-gradient-to-br ${m.bg} to-transparent border border-gray-800 rounded-xl p-4`}>
            <div className={`text-2xl font-extrabold ${m.color}`}>{m.value ?? 0}</div>
            <div className="text-gray-400 text-xs mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Jobs by month chart */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Jobs Posted by Month</h2>
          {months.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No job data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-36 mt-2">
              {months.map(month => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-500">{data.byMonth[month]}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-red-600 to-purple-500"
                    style={{ height: `${(data.byMonth[month] / maxJobs) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User breakdown */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">User Role Breakdown</h2>
          <div className="space-y-5">
            {[
              { label: 'Job Seekers', value: data?.seekers,   total: data?.totalUsers, color: 'from-blue-500 to-cyan-500'     },
              { label: 'Employers',   value: data?.employers, total: data?.totalUsers, color: 'from-yellow-500 to-orange-500'  },
              { label: 'Admins',      value: data?.admins,    total: data?.totalUsers, color: 'from-red-500 to-purple-500'     },
            ].map(item => {
              const pct = item.total ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value} <span className="text-xs text-gray-500">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Closed Jobs',  value: data?.closedJobs,  color: 'text-gray-400'   },
                { label: 'Active Jobs',  value: data?.activeJobs,  color: 'text-green-400'  },
                { label: 'Flagged',      value: data?.flaggedJobs, color: 'text-red-400'    },
              ].map(s => (
                <div key={s.label} className="bg-gray-800/50 rounded-lg p-3">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value ?? 0}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent jobs table */}
      <div className="card mb-5">
        <h2 className="font-semibold text-white mb-4">Recently Posted Jobs</h2>
        {(data?.recentJobs || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No jobs posted yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Title','Location','Type','Salary','Applicants','Status','Posted'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {data.recentJobs.map(job => (
                <tr key={job._id} className="hover:bg-gray-800/30">
                  <td className="py-3 pr-4 text-sm text-white font-medium">{job.title}</td>
                  <td className="py-3 pr-4 text-xs text-gray-400">{job.location}</td>
                  <td className="py-3 pr-4 text-xs text-gray-400">{job.type}</td>
                  <td className="py-3 pr-4 text-xs text-green-400">
                    {job.salary?.min ? `$${(job.salary.min/1000).toFixed(0)}K` : 'N/A'}
                  </td>
                  <td className="py-3 pr-4 text-xs text-yellow-400">{job.applicants?.length || 0}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      job.status === 'active'  ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      job.status === 'flagged' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent signups */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Recent User Signups</h2>
        {(data?.recentUsers || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No users yet</div>
        ) : (
          <div className="space-y-3">
            {data.recentUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {u.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{u.name}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  u.role === 'employer' ? 'bg-yellow-500/10 text-yellow-400' :
                  u.role === 'admin'    ? 'bg-red-500/10 text-red-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {u.role}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(u.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}