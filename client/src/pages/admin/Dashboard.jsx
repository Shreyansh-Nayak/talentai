import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/common/AdminLayout';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [activity, setActivity] = useState([]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        api.get('/users'),
        api.get('/jobs?limit=100'),
        api.get('/applications/employer/all').catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const jobs  = jobsRes.data?.jobs || [];

      setStats({
        totalUsers:  users.length,
        activeJobs:  jobs.filter(j => j.status === 'active').length,
        totalJobs:   jobs.length,
        flaggedJobs: jobs.filter(j => j.status === 'flagged').length,
        seekers:     users.filter(u => u.role === 'seeker').length,
        employers:   users.filter(u => u.role === 'employer').length,
        admins:      users.filter(u => u.role === 'admin').length,
        pending:     users.filter(u => !u.isVerified).length,
      });

      // Build recent activity from users
      const recent = users
        .slice(-5)
        .reverse()
        .map(u => ({
          id:     u._id,
          user:   u.name,
          role:   u.role,
          action: u.role === 'employer' ? 'Registered as employer' : 'Joined as job seeker',
          time:   new Date(u.createdAt).toLocaleDateString(),
          avatar: u.name?.charAt(0)?.toUpperCase() || 'U',
        }));
      setActivity(recent);

    } catch (err) {
      toast.error('Failed to load admin stats');
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

  const metrics = [
    { label: 'Total Users',     value: stats?.totalUsers  || 0, change: `${stats?.pending || 0} pending`,  color: 'text-blue-400',   bg: 'from-blue-500/10'   },
    { label: 'Active Jobs',     value: stats?.activeJobs  || 0, change: `${stats?.totalJobs || 0} total`,   color: 'text-yellow-400', bg: 'from-yellow-500/10' },
    { label: 'Flagged Jobs',    value: stats?.flaggedJobs || 0, change: 'Needs review',                     color: 'text-red-400',    bg: 'from-red-500/10'    },
    { label: 'Employers',       value: stats?.employers   || 0, change: `${stats?.seekers || 0} seekers`,   color: 'text-green-400',  bg: 'from-green-500/10'  },
  ];

  const weeklyData = [40, 55, 35, 70, 50, 85, 100];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Live data from MongoDB</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
          <button
            onClick={fetchStats}
            className="btn-outline text-sm px-4 py-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className={`bg-gradient-to-br ${m.bg} to-transparent border border-gray-800 rounded-xl p-4`}>
            <div className={`text-2xl font-extrabold ${m.color}`}>{m.value.toLocaleString()}</div>
            <div className="text-gray-400 text-xs mt-1">{m.label}</div>
            <div className="text-gray-500 text-xs mt-2">{m.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Weekly chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Weekly Activity</h2>
            <span className="text-xs text-gray-500">This week</span>
          </div>
          <div className="flex items-end gap-3 h-32">
            {weeklyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    i === 6
                      ? 'bg-gradient-to-t from-red-600 to-purple-500'
                      : 'bg-gradient-to-t from-red-900/60 to-purple-900/40'
                  }`}
                  style={{ height: `${val}%` }}
                />
                <span className="text-xs text-gray-500">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User breakdown */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">User Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Job Seekers', value: stats?.seekers   || 0, pct: stats?.totalUsers ? Math.round((stats.seekers  / stats.totalUsers) * 100) : 0, color: 'from-blue-500 to-cyan-500'     },
              { label: 'Employers',   value: stats?.employers || 0, pct: stats?.totalUsers ? Math.round((stats.employers/ stats.totalUsers) * 100) : 0, color: 'from-yellow-500 to-orange-500'  },
              { label: 'Admins',      value: stats?.admins    || 0, pct: stats?.totalUsers ? Math.round((stats.admins   / stats.totalUsers) * 100) : 0, color: 'from-red-500 to-purple-500'     },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-semibold text-white">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">Total Users</span>
            <span className="text-sm font-bold text-white">{(stats?.totalUsers || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Registrations</h2>
          <button onClick={() => navigate('/admin/users')} className="text-xs text-red-400 hover:text-red-300">View all →</button>
        </div>
        {activity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users yet</div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{item.user}</div>
                  <div className="text-xs text-gray-400 truncate">{item.action}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.role === 'seeker' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {item.role}
                  </span>
                  <span className="text-xs text-gray-600">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users',   icon: '👥', path: '/admin/users',     color: 'from-blue-500/10 to-blue-500/5',     border: 'border-blue-500/20'   },
          { label: 'Manage Jobs',    icon: '📋', path: '/admin/jobs',      color: 'from-yellow-500/10 to-yellow-500/5', border: 'border-yellow-500/20' },
          { label: 'View Analytics', icon: '📊', path: '/admin/analytics', color: 'from-green-500/10 to-green-500/5',   border: 'border-green-500/20'  },
          { label: 'View Reports',   icon: '🚨', path: '/admin/reports',   color: 'from-red-500/10 to-red-500/5',       border: 'border-red-500/20'    },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`bg-gradient-to-br ${action.color} border ${action.border} rounded-xl p-4 text-left hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="text-sm font-medium text-white">{action.label}</div>
          </button>
        ))}
      </div>
    </AdminLayout>
  );
}