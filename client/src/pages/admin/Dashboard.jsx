import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/common/AdminLayout';
import toast from 'react-hot-toast';

const metrics = [
  { label: 'Total Users',      value: '128K', change: '↑ 1.2K today',  color: 'text-blue-400',   bg: 'from-blue-500/10'   },
  { label: 'Active Jobs',      value: '48.2K',change: '↑ 312 today',   color: 'text-yellow-400', bg: 'from-yellow-500/10' },
  { label: 'Companies',        value: '2.1K', change: '↑ 18 this week', color: 'text-green-400',  bg: 'from-green-500/10'  },
  { label: 'Reports Pending',  value: '14',   change: 'Needs review',   color: 'text-red-400',    bg: 'from-red-500/10'    },
];

const recentActivity = [
  { id: 1, user: 'Arjun Kumar',   role: 'Seeker',   action: 'Applied to Google',          time: '2m ago',  avatar: 'AK', color: 'from-blue-500 to-cyan-500'    },
  { id: 2, user: 'TechCorp Inc.', role: 'Employer', action: 'Posted new job',              time: '15m ago', avatar: 'TC', color: 'from-yellow-500 to-orange-500' },
  { id: 3, user: 'Priya Sharma',  role: 'Seeker',   action: 'ATS score generated',         time: '28m ago', avatar: 'PS', color: 'from-purple-500 to-pink-500'   },
  { id: 4, user: 'StartupXYZ',    role: 'Employer', action: 'Used AI JD Generator',        time: '1h ago',  avatar: 'SX', color: 'from-green-500 to-teal-500'    },
  { id: 5, user: 'Rahul Verma',   role: 'Seeker',   action: 'Completed interview prep',    time: '2h ago',  avatar: 'RV', color: 'from-red-500 to-orange-500'    },
];

const aiUsage = [
  { label: 'ATS Scores Generated',   value: '3,421', icon: '🎯', color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  { label: 'JD Generations',         value: '894',   icon: '✨', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Interview Preps',         value: '1,204', icon: '💬', color: 'text-green-400',  bg: 'bg-green-500/10'  },
  { label: 'Resume Enhancements',     value: '2,108', icon: '📄', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const weeklyData = [40, 65, 45, 80, 60, 90, 100];
const weekDays   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm mt-1">
            Last updated: just now · All systems operational
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
          <button
            onClick={() => toast.success('Report exported!')}
            className="btn-outline text-sm px-4 py-2"
          >
            Export Report
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Weekly Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Weekly Applications</h2>
            <span className="text-xs text-gray-500">This week</span>
          </div>
          <div className="flex items-end gap-3 h-32">
            {weeklyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-gray-500">{Math.round(val * 164)}</span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer hover:opacity-80 ${
                    i === 6
                      ? 'bg-gradient-to-t from-red-600 to-purple-500'
                      : 'bg-gradient-to-t from-red-900/60 to-purple-900/40'
                  }`}
                  style={{ height: `${val}%` }}
                  onClick={() => toast.success(`${weekDays[i]}: ${Math.round(val * 164)} applications`)}
                />
                <span className="text-xs text-gray-500">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Breakdown */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">User Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Job Seekers', value: '98,420', pct: 77, color: 'from-blue-500 to-cyan-500'    },
              { label: 'Employers',   value: '24,880', pct: 19, color: 'from-yellow-500 to-orange-500' },
              { label: 'Admins',      value: '12',     pct: 1,  color: 'from-red-500 to-purple-500'   },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">Total Users</span>
            <span className="text-sm font-bold text-white">128,312</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* AI Usage */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">AI Usage Today</h2>
          <div className="space-y-3">
            {aiUsage.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
              >
                <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 truncate">{item.label}</div>
                </div>
                <div className={`text-sm font-bold ${item.color} flex-shrink-0`}>
                  {item.value}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Total API Calls</span>
              <span className="text-sm font-bold text-white">7,627</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs text-red-400 hover:text-red-300"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{item.user}</div>
                  <div className="text-xs text-gray-400 truncate">{item.action}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.role === 'Seeker'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {item.role}
                  </span>
                  <span className="text-xs text-gray-600">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users',    icon: '👥', path: '/admin/users',     color: 'from-blue-500/10 to-blue-500/5',     border: 'border-blue-500/20'   },
          { label: 'Manage Jobs',     icon: '📋', path: '/admin/jobs',      color: 'from-yellow-500/10 to-yellow-500/5', border: 'border-yellow-500/20' },
          { label: 'View Analytics',  icon: '📊', path: '/admin/analytics', color: 'from-green-500/10 to-green-500/5',   border: 'border-green-500/20'  },
          { label: 'View Reports',    icon: '🚨', path: '/admin/reports',   color: 'from-red-500/10 to-red-500/5',       border: 'border-red-500/20'    },
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