import { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import toast from 'react-hot-toast';

const initialUsers = [
  {
    id: 1,
    name: 'Arjun Kumar',
    email: 'arjun@example.com',
    role: 'seeker',
    location: 'Bangalore, India',
    joined: 'Jan 12, 2025',
    status: 'Active',
    applications: 12,
    avatar: 'AK',
    color: 'from-blue-500 to-cyan-500',
    lastActive: '2 min ago',
  },
  {
    id: 2,
    name: 'TechCorp Inc.',
    email: 'hr@techcorp.com',
    role: 'employer',
    location: 'Mumbai, India',
    joined: 'Feb 3, 2025',
    status: 'Active',
    applications: 8,
    avatar: 'TC',
    color: 'from-yellow-500 to-orange-500',
    lastActive: '15 min ago',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'seeker',
    location: 'Mumbai, India',
    joined: 'Mar 1, 2025',
    status: 'Pending',
    applications: 5,
    avatar: 'PS',
    color: 'from-purple-500 to-pink-500',
    lastActive: '1h ago',
  },
  {
    id: 4,
    name: 'StartupXYZ',
    email: 'jobs@startupxyz.com',
    role: 'employer',
    location: 'Delhi, India',
    joined: 'Mar 10, 2025',
    status: 'Active',
    applications: 3,
    avatar: 'SX',
    color: 'from-green-500 to-teal-500',
    lastActive: '3h ago',
  },
  {
    id: 5,
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    role: 'seeker',
    location: 'Delhi, India',
    joined: 'Mar 15, 2025',
    status: 'Suspended',
    applications: 2,
    avatar: 'RV',
    color: 'from-red-500 to-orange-500',
    lastActive: '2d ago',
  },
  {
    id: 6,
    name: 'Anjali Singh',
    email: 'anjali@example.com',
    role: 'seeker',
    location: 'Chennai, India',
    joined: 'Apr 1, 2025',
    status: 'Active',
    applications: 7,
    avatar: 'AS',
    color: 'from-pink-500 to-rose-500',
    lastActive: '30 min ago',
  },
  {
    id: 7,
    name: 'Mohammed Raza',
    email: 'raza@example.com',
    role: 'seeker',
    location: 'Hyderabad, India',
    joined: 'Apr 3, 2025',
    status: 'Active',
    applications: 9,
    avatar: 'MR',
    color: 'from-green-500 to-emerald-500',
    lastActive: '5 min ago',
  },
  {
    id: 8,
    name: 'MegaCorp HR',
    email: 'hr@megacorp.com',
    role: 'employer',
    location: 'Pune, India',
    joined: 'Apr 5, 2025',
    status: 'Pending',
    applications: 0,
    avatar: 'MC',
    color: 'from-blue-500 to-purple-500',
    lastActive: 'Never',
  },
];

const statusConfig = {
  Active:    { color: 'bg-green-500/10 text-green-400 border-green-500/20'  },
  Pending:   { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  Suspended: { color: 'bg-red-500/10 text-red-400 border-red-500/20'        },
};

const roleConfig = {
  seeker:   { color: 'bg-blue-500/10 text-blue-400',   label: 'Job Seeker' },
  employer: { color: 'bg-yellow-500/10 text-yellow-400', label: 'Employer'  },
  admin:    { color: 'bg-red-500/10 text-red-400',      label: 'Admin'      },
};

export default function AdminUsers() {
  const [users, setUsers]           = useState(initialUsers);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = users
    .filter((u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter((u) => roleFilter === 'All' || u.role === roleFilter.toLowerCase())
    .filter((u) => statusFilter === 'All' || u.status === statusFilter);

  const updateUserStatus = (id, status) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u))
    );
    toast.success(`User ${status.toLowerCase()}!`);
    if (selectedUser?.id === id) {
      setSelectedUser((prev) => ({ ...prev, status }));
    }
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (selectedUser?.id === id) setSelectedUser(null);
    toast.success('User deleted!');
  };

  const stats = {
    total:    users.length,
    seekers:  users.filter((u) => u.role === 'seeker').length,
    employers:users.filter((u) => u.role === 'employer').length,
    pending:  users.filter((u) => u.status === 'Pending').length,
  };

  return (
    <AdminLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} users found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.success('Exporting users...')}
            className="btn-outline text-sm px-4 py-2"
          >
            Export CSV
          </button>
          <button
            onClick={() => toast.success('Invite sent!')}
            className="btn-primary text-sm px-4 py-2"
          >
            + Invite User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Users',  value: stats.total,     color: 'text-white',          bg: 'from-gray-800'        },
          { label: 'Job Seekers',  value: stats.seekers,   color: 'text-blue-400',       bg: 'from-blue-500/10'     },
          { label: 'Employers',    value: stats.employers, color: 'text-yellow-400',     bg: 'from-yellow-500/10'   },
          { label: 'Pending',      value: stats.pending,   color: 'text-yellow-400',     bg: 'from-yellow-500/10'   },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="🔍  Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option>All</option>
            <option>Seeker</option>
            <option>Employer</option>
            <option>Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option>All</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Users List */}
        <div className="lg:col-span-3 card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium pb-3 uppercase tracking-wider">User</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3 uppercase tracking-wider">Role</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3 uppercase tracking-wider">Status</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3 uppercase tracking-wider">Joined</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-3 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`cursor-pointer transition-colors hover:bg-gray-800/40 ${
                    selectedUser?.id === user.id ? 'bg-red-500/5' : ''
                  }`}
                >
                  {/* User */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                        {user.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${roleConfig[user.role]?.color}`}>
                      {roleConfig[user.role]?.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${statusConfig[user.status]?.color}`}>
                      {user.status}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-3 pr-4">
                    <span className="text-xs text-gray-500">{user.joined}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {user.status === 'Pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateUserStatus(user.id, 'Active'); }}
                          className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      {user.status === 'Active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateUserStatus(user.id, 'Suspended'); }}
                          className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status === 'Suspended' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateUserStatus(user.id, 'Active'); }}
                          className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }}
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
              <div className="text-4xl mb-3">👥</div>
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* User Detail Panel */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-4">

              {/* Profile Card */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedUser.color} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{selectedUser.name}</div>
                    <div className="text-xs text-gray-400">{selectedUser.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig[selectedUser.role]?.color}`}>
                        {roleConfig[selectedUser.role]?.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[selectedUser.status]?.color}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Location',    value: selectedUser.location   },
                    { label: 'Joined',      value: selectedUser.joined     },
                    { label: 'Last Active', value: selectedUser.lastActive },
                    { label: selectedUser.role === 'employer' ? 'Jobs Posted' : 'Applications',
                      value: selectedUser.applications },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-xs text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {selectedUser.status === 'Pending' && (
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'Active')}
                      className="w-full py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                    >
                      ✓ Verify Account
                    </button>
                  )}
                  {selectedUser.status === 'Active' && (
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'Suspended')}
                      className="w-full py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/20 transition-colors"
                    >
                      ⚠️ Suspend Account
                    </button>
                  )}
                  {selectedUser.status === 'Suspended' && (
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'Active')}
                      className="w-full py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                    >
                      ✓ Restore Account
                    </button>
                  )}
                  <button
                    onClick={() => toast.success(`Email sent to ${selectedUser.name}`)}
                    className="w-full py-2 btn-outline text-sm"
                  >
                    ✉️ Send Email
                  </button>
                  <button
                    onClick={() => deleteUser(selectedUser.id)}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                  >
                    🗑 Delete Account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3">👤</div>
              <p className="text-gray-500 text-sm">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}