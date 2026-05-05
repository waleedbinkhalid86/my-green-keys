'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchUser, setSearchUser] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [promoCodeName, setPromoCodeName] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [appliesTo, setAppliesToValue] = useState('all');
  const [usageLimit, setUsageLimit] = useState('unlimited');
  const [usageLimitNum, setUsageLimitNum] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [siteName, setSiteName] = useState('My Green Keys');
  const [tagline, setTagline] = useState('Learn to Type. Help the Planet.');
  const [contactEmail, setContactEmail] = useState('support@mygreen keys.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [ecoTab, setEcoTab] = useState('pending');

  // Sample data
  const allUsers = [
    { id: 1, name: 'Ahmed Hassan', email: 'ahmed@example.com', type: 'Student', plan: 'Free', joined: 'Mar 15, 2024', lastLogin: '2 mins ago', status: 'active' },
    { id: 2, name: 'Fatima Ahmed', email: 'fatima@example.com', type: 'Parent', plan: 'Pro', joined: 'Mar 10, 2024', lastLogin: '1 hour ago', status: 'active' },
    { id: 3, name: 'Omar Khan', email: 'omar@example.com', type: 'Teacher', plan: 'School', joined: 'Mar 5, 2024', lastLogin: '3 days ago', status: 'inactive' },
    { id: 4, name: 'Zahra Ali', email: 'zahra@example.com', type: 'Student', plan: 'Free', joined: 'Feb 28, 2024', lastLogin: '1 week ago', status: 'inactive' },
    { id: 5, name: 'Amir Ibrahim', email: 'amir@example.com', type: 'Student', plan: 'Pro', joined: 'Feb 20, 2024', lastLogin: '5 mins ago', status: 'active' },
    { id: 6, name: 'Noor Rashid', email: 'noor@example.com', type: 'Teacher', plan: 'School', joined: 'Feb 15, 2024', lastLogin: '2 hours ago', status: 'active' },
    { id: 7, name: 'Sarah Hassan', email: 'sarah@example.com', type: 'Parent', plan: 'Free', joined: 'Feb 10, 2024', lastLogin: '4 days ago', status: 'inactive' },
    { id: 8, name: 'Hassan Ali', email: 'hassan@example.com', type: 'Student', plan: 'Pro', joined: 'Feb 5, 2024', lastLogin: '30 mins ago', status: 'active' },
  ];

  const schoolsData = [
    { id: 1, name: 'Green Valley Primary School', package: 'School Pro', students: 45, teachers: 8, joined: 'Jan 15, 2024', status: 'active' },
    { id: 2, name: 'Sunshine Academy', package: 'School Basic', students: 120, teachers: 15, joined: 'Feb 1, 2024', status: 'active' },
    { id: 3, name: 'Future Leaders School', package: 'School Pro', students: 89, teachers: 12, joined: 'Mar 1, 2024', status: 'inactive' },
  ];

  const transactionsData = [
    { id: 1, date: 'Apr 26, 2024', user: 'Ahmed Hassan', plan: 'Pro Monthly', amount: '$9.99', status: 'completed' },
    { id: 2, date: 'Apr 25, 2024', user: 'Fatima Ahmed', plan: 'School Annual', amount: '$199.00', status: 'completed' },
    { id: 3, date: 'Apr 24, 2024', user: 'Omar Khan', plan: 'Pro Annual', amount: '$99.99', status: 'completed' },
    { id: 4, date: 'Apr 23, 2024', user: 'Zahra Ali', plan: 'Pro Monthly', amount: '$9.99', status: 'pending' },
    { id: 5, date: 'Apr 22, 2024', user: 'Amir Ibrahim', plan: 'School Monthly', amount: '$49.99', status: 'completed' },
  ];

  const promoCodesData = [
    { code: 'GREENSTART', discount: '20% off', appliesTo: 'All plans', used: 234, limit: 500, expiry: 'May 31, 2024', status: 'active' },
    { code: 'FAMILY2024', discount: '30% off', appliesTo: 'Family only', used: 156, limit: 200, expiry: 'Jun 30, 2024', status: 'active' },
    { code: 'SCHOOL100', discount: '1 free month', appliesTo: 'School only', used: 89, limit: 100, expiry: 'May 15, 2024', status: 'active' },
    { code: 'BACK2SCHOOL', discount: '25% off', appliesTo: 'All plans', used: 445, limit: 500, expiry: 'Aug 31, 2024', status: 'active' },
    { code: 'WELCOME10', discount: '10% off', appliesTo: 'All plans', used: 1023, limit: 'Unlimited', expiry: 'Dec 31, 2024', status: 'active' },
  ];

  const ecoApprovalsData = [
    { id: 1, studentName: 'Sarah Ahmed', school: 'Green Valley Primary', action: 'Watering plants', date: '2 hours ago', status: 'pending' },
    { id: 2, studentName: 'Omar Khan', school: 'Sunshine Academy', action: 'Planting a tree', date: '5 hours ago', status: 'pending' },
    { id: 3, studentName: 'Fatima Ali', school: 'Green Valley Primary', action: 'Water for birds', date: '1 day ago', status: 'approved' },
    { id: 4, studentName: 'Zahra Hassan', school: 'Future Leaders', action: 'Recycling sort', date: '2 days ago', status: 'rejected' },
    { id: 5, studentName: 'Amir Ibrahim', school: 'Sunshine Academy', action: 'Composting', date: '3 days ago', status: 'approved' },
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.type.toLowerCase() === userFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const recentEcoApprovals = ecoApprovalsData.filter(item => item.status === 'pending');
  const approvedEcoActions = ecoApprovalsData.filter(item => item.status === 'approved');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#10b981', text: '#ecfdf5' };
      case 'inactive':
        return { bg: '#6b7280', text: '#f3f4f6' };
      case 'completed':
        return { bg: '#10b981', text: '#ecfdf5' };
      case 'pending':
        return { bg: '#f59e0b', text: '#fffbeb' };
      case 'approved':
        return { bg: '#10b981', text: '#ecfdf5' };
      case 'rejected':
        return { bg: '#ef4444', text: '#fef2f2' };
      default:
        return { bg: '#6b7280', text: '#f3f4f6' };
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f1419' }}>
      {/* ========== SIDEBAR ========== */}
      <div
        className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r overflow-y-auto"
        style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: '#4CAF50' }}>
          <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
            🌿 MGK Admin
          </div>
          <p className="text-xs text-gray-400 mt-1">Control Panel</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'Users' },
            { id: 'schools', icon: '🏫', label: 'Schools' },
            { id: 'revenue', icon: '💰', label: 'Revenue' },
            { id: 'promo', icon: '🎟️', label: 'Promo Codes' },
            { id: 'eco', icon: '🌿', label: 'Eco Approvals' },
            { id: 'content', icon: '📖', label: 'Content' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded transition font-medium"
              style={{
                backgroundColor: activeSection === item.id ? '#4CAF50' : 'transparent',
                color: activeSection === item.id ? '#0f1419' : '#9ca3af',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = '#2d3e52';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: '#4CAF50' }}>
          <button
            className="w-full flex items-center gap-3 px-4 py-2 rounded transition font-medium"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7f1d1d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="ml-60 flex-1">
        <div className="mgk-container mgk-section-tight">
          {/* DASHBOARD SECTION */}
          {activeSection === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Good morning, Admin 👋</h1>
                <p className="text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString()}</p>
              </div>

              {/* Metric Cards */}
              <div className="mgk-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-10">
                {[
                  { icon: '👥', label: 'Total users', value: '1,247', change: '↑12%' },
                  { icon: '💰', label: 'Monthly revenue', value: '$8,432', change: '↑8%' },
                  { icon: '🏫', label: 'Active schools', value: '23', change: '↑3' },
                  { icon: '🌿', label: 'Eco actions', value: '156', change: '↑24%' },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                    style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                  >
                    <div className="text-3xl mb-2">{card.icon}</div>
                    <p className="text-gray-400 text-sm font-medium">{card.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                    <p className="text-sm mt-2" style={{ color: '#4CAF50' }}>
                      {card.change} this month
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="mgk-grid grid-cols-1 lg:grid-cols-2 mb-10">
                {/* Revenue Chart */}
                <div
                  className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <h2 className="text-lg font-bold text-white mb-4">📈 Revenue (Last 7 Days)</h2>
                  <div className="flex items-end justify-between h-40 gap-2">
                    {[45, 52, 38, 71, 62, 55, 48].map((value, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t transition hover:opacity-80"
                          style={{
                            height: `${(value / 75) * 100}%`,
                            backgroundColor: '#4CAF50',
                          }}
                          title={`$${value * 100}`}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Box */}
                <div className="space-y-4">
                  <div
                    className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                    style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                  >
                    <p className="text-gray-400 text-sm">Total This Week</p>
                    <p className="text-3xl font-bold text-white mt-2">$371,200</p>
                  </div>
                  <div
                    className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                    style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                  >
                    <p className="text-gray-400 text-sm">Total This Month</p>
                    <p className="text-3xl font-bold text-white mt-2">$1,293,450</p>
                  </div>
                </div>
              </div>

              {/* Recent Signups & Transactions */}
              <div className="mgk-grid grid-cols-1 lg:grid-cols-2">
                {/* Recent Signups */}
                <div
                  className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <h2 className="text-lg font-bold text-white mb-4">🆕 Recent Signups</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottomColor: '#2d3e52' }} className="border-b">
                          <th className="px-4 py-2 text-left text-gray-400 font-semibold">Name</th>
                          <th className="px-4 py-2 text-left text-gray-400 font-semibold">Type</th>
                          <th className="px-4 py-2 text-left text-gray-400 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.slice(0, 5).map((user) => (
                          <tr key={user.id} className="border-b hover:bg-opacity-50" style={{ borderBottomColor: '#2d3e52', backgroundColor: '#0f1419' }}>
                            <td className="px-4 py-2 text-gray-200">{user.name}</td>
                            <td className="px-4 py-2 text-gray-400">{user.type}</td>
                            <td className="px-4 py-2 text-gray-400">{user.joined}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div
                  className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <h2 className="text-lg font-bold text-white mb-4">💳 Recent Transactions</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottomColor: '#2d3e52' }} className="border-b">
                          <th className="px-4 py-2 text-left text-gray-400 font-semibold">User</th>
                          <th className="px-4 py-2 text-left text-gray-400 font-semibold">Plan</th>
                          <th className="px-4 py-2 text-left text-gray-400 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionsData.slice(0, 5).map((tx) => (
                          <tr key={tx.id} style={{ borderBottomColor: '#2d3e52' }} className="border-b">
                            <td className="px-4 py-2 text-gray-200">{tx.user}</td>
                            <td className="px-4 py-2 text-gray-400 text-xs">{tx.plan}</td>
                            <td className="px-4 py-2 text-green-400 font-semibold">{tx.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS SECTION */}
          {activeSection === 'users' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-6">👥 Users ({filteredUsers.length})</h1>

              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="flex-1 px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                  style={{ borderColor: searchUser ? '#4CAF50' : '#2d3e52' }}
                />
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-2 rounded border-2 bg-transparent text-white focus:outline-none transition"
                  style={{ borderColor: '#2d3e52' }}
                >
                  <option value="all">All Users</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                  <option value="teacher">Teachers</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#2d3e52' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: '#1a2332' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Plan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Joined</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Last Login</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const statusColors = getStatusColor(user.status);
                      return (
                        <tr key={user.id} style={{ backgroundColor: '#0f1419', borderBottomColor: '#2d3e52' }} className="border-b hover:bg-opacity-70 transition">
                          <td className="px-6 py-4 text-gray-200 font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                          <td className="px-6 py-4 text-gray-400">{user.type}</td>
                          <td className="px-6 py-4 text-gray-400">{user.plan}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{user.joined}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{user.lastLogin}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                            >
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#4CAF50', color: '#0f1419' }}>View</button>
                              <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#f59e0b', color: '#0f1419' }}>Suspend</button>
                              <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCHOOLS SECTION */}
          {activeSection === 'schools' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">🏫 Schools</h1>
                <button
                  className="px-4 py-2 rounded font-semibold text-white transition"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                >
                  ➕ Add New School
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#2d3e52' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: '#1a2332' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">School Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Package</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Students</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Teachers</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Joined</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolsData.map((school) => {
                      const statusColors = getStatusColor(school.status);
                      return (
                        <tr key={school.id} style={{ backgroundColor: '#0f1419', borderBottomColor: '#2d3e52' }} className="border-b hover:bg-opacity-70 transition">
                          <td className="px-6 py-4 text-gray-200 font-medium">{school.name}</td>
                          <td className="px-6 py-4 text-gray-400">{school.package}</td>
                          <td className="px-6 py-4 text-gray-400">{school.students}</td>
                          <td className="px-6 py-4 text-gray-400">{school.teachers}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{school.joined}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                            >
                              {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#4CAF50', color: '#0f1419' }}>Edit</button>
                              <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVENUE SECTION */}
          {activeSection === 'revenue' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-6">💰 Revenue</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                  className="p-6 rounded-lg border"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-4xl font-bold text-white mt-2">$8,432</p>
                </div>
                <div
                  className="p-6 rounded-lg border"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <p className="text-gray-400 text-sm">Total Revenue (All Time)</p>
                  <p className="text-4xl font-bold text-white mt-2">$42,156</p>
                </div>
              </div>

              {/* Revenue Chart */}
              <div
                className="p-6 rounded-xl border mb-8 shadow-sm transition-shadow hover:shadow-lg"
                style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
              >
                <h2 className="text-lg font-bold text-white mb-4">📊 Last 6 Months</h2>
                <div className="flex items-end justify-between h-56 gap-4">
                  {[32, 45, 38, 58, 52, 71].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t transition hover:opacity-80"
                        style={{
                          height: `${(value / 75) * 100}%`,
                          backgroundColor: '#4CAF50',
                        }}
                        title={`$${value * 1000}`}
                      ></div>
                      <p className="text-xs text-gray-400 mt-3">
                        {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'][i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Transactions</h2>
                <button
                  className="px-4 py-2 rounded font-semibold text-white transition"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                >
                  📥 Export CSV
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#2d3e52' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: '#1a2332' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">User</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Plan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsData.map((tx) => {
                      const statusColors = getStatusColor(tx.status);
                      return (
                        <tr key={tx.id} style={{ backgroundColor: '#0f1419', borderBottomColor: '#2d3e52' }} className="border-b hover:bg-opacity-70 transition">
                          <td className="px-6 py-4 text-gray-200">{tx.date}</td>
                          <td className="px-6 py-4 text-gray-400">{tx.user}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{tx.plan}</td>
                          <td className="px-6 py-4 text-green-400 font-semibold">{tx.amount}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                            >
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROMO CODES SECTION */}
          {activeSection === 'promo' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">🎟️ Promo Code Manager</h1>

              {/* Create New Code Form */}
              <div
                className="p-8 rounded-lg border mb-8"
                style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
              >
                <h2 className="text-xl font-bold text-white mb-6">Create New Promo Code</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Code Name</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER2024"
                        value={promoCodeName}
                        onChange={(e) => setPromoCodeName(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: promoCodeName ? '#4CAF50' : '#2d3e52' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 bg-transparent text-white focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      >
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed Amount $</option>
                        <option value="free">Free Months</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Value</label>
                      <input
                        type="number"
                        placeholder={discountType === 'percentage' ? '20' : discountType === 'fixed' ? '9.99' : '1'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Applies To</label>
                      <select
                        value={appliesTo}
                        onChange={(e) => setAppliesToValue(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 bg-transparent text-white focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      >
                        <option value="all">All plans</option>
                        <option value="family">Family only</option>
                        <option value="school">School only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Usage Limit</label>
                      <select
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 bg-transparent text-white focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      >
                        <option value="unlimited">Unlimited</option>
                        <option value="limited">Limited</option>
                      </select>
                    </div>
                    {usageLimit === 'limited' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Limit Number</label>
                        <input
                          type="number"
                          placeholder="500"
                          value={usageLimitNum}
                          onChange={(e) => setUsageLimitNum(e.target.value)}
                          className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                          style={{ borderColor: '#2d3e52' }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                      style={{ borderColor: '#2d3e52' }}
                    />
                  </div>

                  <button
                    className="w-full py-3 rounded font-bold text-white transition text-lg"
                    style={{ backgroundColor: '#4CAF50' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                  >
                    ✅ Create Code
                  </button>
                </div>
              </div>

              {/* Active Codes Table */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Active Codes</h2>
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#2d3e52' }}>
                  <table className="w-full">
                    <thead style={{ backgroundColor: '#1a2332' }}>
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Code</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Discount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Applies To</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Used</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Limit</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Expiry</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodesData.map((code) => {
                        const statusColors = getStatusColor(code.status);
                        return (
                          <tr key={code.code} style={{ backgroundColor: '#0f1419', borderBottomColor: '#2d3e52' }} className="border-b hover:bg-opacity-70 transition">
                            <td className="px-6 py-4 text-gray-200 font-bold">{code.code}</td>
                            <td className="px-6 py-4 text-gray-400">{code.discount}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm">{code.appliesTo}</td>
                            <td className="px-6 py-4 text-gray-400">{code.used}</td>
                            <td className="px-6 py-4 text-gray-400">{code.limit}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm">{code.expiry}</td>
                            <td className="px-6 py-4">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                              >
                                {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#4CAF50', color: '#0f1419' }}>Edit</button>
                                <button className="px-2 py-1 text-xs rounded hover:bg-opacity-80" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expired Codes */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Expired Codes</h2>
                <div
                  className="p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#2d3e52' }}
                >
                  <p className="text-gray-400">No expired codes to show</p>
                </div>
              </div>
            </div>
          )}

          {/* ECO APPROVALS SECTION */}
          {activeSection === 'eco' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-6">🌿 Eco Approvals</h1>

              {/* Tabs */}
              <div className="flex gap-4 mb-8 border-b" style={{ borderColor: '#2d3e52' }}>
                {['pending', 'approved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEcoTab(tab)}
                    className="px-6 py-3 font-semibold border-b-2 transition"
                    style={{
                      borderColor: ecoTab === tab ? '#4CAF50' : 'transparent',
                      color: ecoTab === tab ? '#4CAF50' : '#9ca3af',
                    }}
                  >
                    {tab === 'pending' ? '⏳ Pending' : '✅ Approved'}
                  </button>
                ))}
              </div>

              {/* Pending Cards */}
              {ecoTab === 'pending' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {recentEcoApprovals.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border overflow-hidden shadow-sm transition-shadow hover:shadow-lg"
                        style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                      >
                        <div className="bg-gray-600 h-40 flex items-center justify-center text-4xl">
                          🖼️
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-white">{item.studentName}</p>
                          <p className="text-sm text-gray-400">{item.school}</p>
                          <p className="text-sm text-gray-300 mt-2">{item.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                          <div className="flex gap-2 mt-4">
                            <button
                              className="flex-1 py-2 rounded font-semibold text-white transition text-sm"
                              style={{ backgroundColor: '#4CAF50' }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="flex-1 py-2 rounded font-semibold text-white transition text-sm"
                              style={{ backgroundColor: '#ef4444' }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Cards */}
              {ecoTab === 'approved' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedEcoActions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border overflow-hidden shadow-sm transition-shadow hover:shadow-lg"
                        style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                      >
                        <div className="bg-gray-600 h-40 flex items-center justify-center text-4xl">
                          🖼️
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-white">{item.studentName}</p>
                          <p className="text-sm text-gray-400">{item.school}</p>
                          <p className="text-sm text-gray-300 mt-2">{item.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                          <div className="mt-4 px-3 py-2 rounded text-center" style={{ backgroundColor: '#10b98122' }}>
                            <p className="text-sm font-semibold" style={{ color: '#10b981' }}>✅ Approved</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { label: 'Pending', value: recentEcoApprovals.length, icon: '⏳' },
                  { label: 'Approved', value: approvedEcoActions.length, icon: '✅' },
                  { label: 'Rejected', value: ecoApprovalsData.filter(i => i.status === 'rejected').length, icon: '❌' },
                  { label: 'This Month', value: '24', icon: '📊' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border text-center shadow-sm transition-shadow hover:shadow-lg"
                    style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                  >
                    <p className="text-2xl mb-1">{stat.icon}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENT SECTION */}
          {activeSection === 'content' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">📖 Content Management</h1>
                <button
                  className="px-4 py-2 rounded font-semibold text-white transition"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                >
                  ➕ Add Lesson Sentence
                </button>
              </div>

              <div
                className="p-8 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
              >
                <p className="text-gray-400 text-center py-12">Coming soon: Lesson content manager and eco topics editor</p>
              </div>
            </div>
          )}

          {/* SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">⚙️ Settings</h1>

              <div className="space-y-8">
                {/* Site Settings */}
                <div
                  className="p-8 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">Site Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Notifications */}
                <div
                  className="p-8 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">📧 Email Notifications</h2>
                  <div className="space-y-3">
                    {['New signups', 'Payment received', 'Admin alerts'].map((item) => (
                      <label key={item} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" style={{ accentColor: '#4CAF50' }} defaultChecked />
                        <span className="text-gray-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div
                  className="p-8 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Maintenance Mode</h2>
                      <p className="text-gray-400 text-sm mt-1">Take the site offline for maintenance</p>
                    </div>
                    <button
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className="px-6 py-2 rounded font-semibold text-white transition"
                      style={{ backgroundColor: maintenanceMode ? '#ef4444' : '#6b7280' }}
                    >
                      {maintenanceMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Admin Password */}
                <div
                  className="p-8 rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#1a2332', borderColor: '#4CAF50' }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">🔐 Change Admin Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 rounded border-2 text-white bg-transparent focus:outline-none transition"
                        style={{ borderColor: '#2d3e52' }}
                      />
                    </div>
                    <button
                      className="w-full py-3 rounded font-bold text-white transition text-lg"
                      style={{ backgroundColor: '#4CAF50' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                    >
                      💾 Update Password
                    </button>
                  </div>
                </div>

                {/* Save Changes Button */}
                <button
                  className="w-full py-3 rounded font-bold text-white transition text-lg"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                >
                  💾 Save All Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
