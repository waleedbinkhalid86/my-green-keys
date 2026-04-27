'use client';

import { useState } from 'react';

export default function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [assignmentText, setAssignmentText] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [assignTo, setAssignTo] = useState('class');
  const [schedule, setSchedule] = useState('now');
  const [searchStudent, setSearchStudent] = useState('');
  const [schoolName, setSchoolName] = useState('Green Valley Primary School');
  const [primaryColor, setPrimaryColor] = useState('#4CAF50');

  // Sample data
  const leaderboardData = [
    { rank: 1, name: 'Sarah Ahmed', wpm: 42, accuracy: 96, lessons: 28, streak: 7, badge: '🏆' },
    { rank: 2, name: 'Omar Khan', wpm: 38, accuracy: 94, lessons: 25, streak: 5, badge: '⭐' },
    { rank: 3, name: 'Fatima Ali', wpm: 35, accuracy: 91, lessons: 22, streak: 4, badge: '🌿' },
    { rank: 4, name: 'Zahra Hassan', wpm: 33, accuracy: 90, lessons: 20, streak: 3, badge: '' },
    { rank: 5, name: 'Amir Ibrahim', wpm: 31, accuracy: 88, lessons: 19, streak: 2, badge: '' },
    { rank: 6, name: 'Noor Rashid', wpm: 29, accuracy: 87, lessons: 18, streak: 2, badge: '' },
    { rank: 7, name: 'Hana Karim', wpm: 28, accuracy: 86, lessons: 17, streak: 1, badge: '' },
    { rank: 8, name: 'Karim Saleh', wpm: 26, accuracy: 84, lessons: 16, streak: 1, badge: '' },
    { rank: 9, name: 'Layla Ahmed', wpm: 25, accuracy: 83, lessons: 15, streak: 0, badge: '' },
    { rank: 10, name: 'Hassan Ali', wpm: 24, accuracy: 82, lessons: 14, streak: 0, badge: '' },
  ];

  const allStudentsData = [
    { id: 1, name: 'Sarah Ahmed', gender: 'F', age: 10, wpm: 42, accuracy: 96, lessons: 28, lastActive: '10 mins ago', status: 'active' },
    { id: 2, name: 'Omar Khan', gender: 'M', age: 11, wpm: 38, accuracy: 94, lessons: 25, lastActive: '1 hour ago', status: 'active' },
    { id: 3, name: 'Fatima Ali', gender: 'F', age: 10, wpm: 35, accuracy: 91, lessons: 22, lastActive: '3 hours ago', status: 'active' },
    { id: 4, name: 'Amir Ibrahim', gender: 'M', age: 12, wpm: 31, accuracy: 88, lessons: 19, lastActive: '1 day ago', status: 'needs-attention' },
    { id: 5, name: 'Noor Rashid', gender: 'F', age: 10, wpm: 29, accuracy: 87, lessons: 18, lastActive: '3 days ago', status: 'needs-attention' },
    { id: 6, name: 'Hana Karim', gender: 'F', age: 11, wpm: 28, accuracy: 86, lessons: 17, lastActive: '5 days ago', status: 'inactive' },
    { id: 7, name: 'Karim Saleh', gender: 'M', age: 10, wpm: 26, accuracy: 84, lessons: 16, lastActive: '1 week ago', status: 'inactive' },
    { id: 8, name: 'Layla Ahmed', gender: 'F', age: 9, wpm: 25, accuracy: 83, lessons: 15, lastActive: '2 weeks ago', status: 'inactive' },
  ];

  const ecoFeedData = [
    { id: 1, studentName: 'Sarah', action: 'Watering plants', icon: '💧', time: '2 hours ago' },
    { id: 2, studentName: 'Omar', action: 'Planted a tree', icon: '🌱', time: 'Yesterday' },
    { id: 3, studentName: 'Fatima', action: 'Water for birds', icon: '🐦', time: '2 days ago' },
    { id: 4, studentName: 'Zahra', action: 'Recycling bin sort', icon: '♻️', time: '3 days ago' },
    { id: 5, studentName: 'Amir', action: 'Composting', icon: '🌿', time: '4 days ago' },
  ];

  const savedLessons = [
    { id: 1, name: 'The Water Cycle', createdAt: 'Mar 15', uses: 3 },
    { id: 2, name: 'Solar Energy Facts', createdAt: 'Mar 10', uses: 5 },
    { id: 3, name: 'Biodiversity Story', createdAt: 'Feb 28', uses: 2 },
  ];

  const filteredStudents = allStudentsData.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'needs-attention':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'needs-attention':
        return 'Needs attention';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* ========== TOP NAVIGATION ========== */}
      <nav
        className="sticky top-0 z-50 shadow-sm border-b"
        style={{ backgroundColor: '#1e2832', borderBottomColor: '#4CAF50' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                🌿 My Green Keys
              </div>
              <div className="h-8 border-l" style={{ borderColor: '#4CAF50' }}></div>
              <div>
                <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
                <p className="text-sm text-gray-300">Welcome back, Ms. Ahmed 👋</p>
              </div>
            </div>

            {/* School Info & Actions */}
            <div className="flex items-center gap-8">
              <div className="text-right hidden md:block">
                <p className="text-white font-semibold">{schoolName}</p>
                <p className="text-sm" style={{ color: '#4CAF50' }}>📍 School Logo</p>
              </div>
              <button className="text-white text-2xl hover:opacity-80 transition">🔔</button>
              <button
                className="px-4 py-2 rounded font-semibold text-white transition"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ========== OVERVIEW CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: '👥', label: 'Total students', value: '48' },
            { icon: '📚', label: 'Lessons completed today', value: '127' },
            { icon: '⚡', label: 'Class average WPM', value: '28' },
            { icon: '🌿', label: 'Eco actions this week', value: '12' },
          ].map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border-2 transition hover:shadow-lg"
              style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
            >
              <div className="text-4xl mb-2">{card.icon}</div>
              <p className="text-gray-600 text-sm font-medium">{card.label}</p>
              <p className="text-4xl font-bold mt-2" style={{ color: '#1e2832' }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ========== CLASS LEADERBOARD ========== */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1e2832' }}>
            🏆 Class Leaderboard — Top Typists
          </h2>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">WPM</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Accuracy</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Lessons</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Streak</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((student) => (
                  <tr
                    key={student.rank}
                    className={`border-t transition ${
                      student.rank <= 3 ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                    style={
                      student.rank <= 3
                        ? { backgroundColor: '#f0fdf4', borderBottomColor: '#e5e7eb' }
                        : { borderBottomColor: '#e5e7eb' }
                    }
                  >
                    <td className="px-6 py-4 font-bold">
                      {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4" style={{ color: '#4CAF50' }}>
                      <strong>{student.wpm} WPM</strong>
                    </td>
                    <td className="px-6 py-4">{student.accuracy}%</td>
                    <td className="px-6 py-4">{student.lessons}</td>
                    <td className="px-6 py-4">{student.streak > 0 ? `🔥${student.streak}` : '—'}</td>
                    <td className="px-6 py-4 text-lg">{student.badge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== ALL STUDENTS TABLE ========== */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2832' }}>
              👥 All Students
            </h2>
            <button
              className="px-4 py-2 rounded font-semibold text-white transition"
              style={{ backgroundColor: '#4CAF50' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              📥 Export as CSV
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
              style={{ borderColor: searchStudent ? '#4CAF50' : '#e5e7eb' }}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Age</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">WPM</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Accuracy</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Lessons Done</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Active</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t hover:bg-gray-50 cursor-pointer transition"
                    style={{ borderBottomColor: '#e5e7eb' }}
                    onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-gray-700">{student.gender}</td>
                    <td className="px-6 py-4 text-gray-700">{student.age}</td>
                    <td className="px-6 py-4" style={{ color: '#4CAF50' }}>
                      <strong>{student.wpm}</strong>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{student.accuracy}%</td>
                    <td className="px-6 py-4 text-gray-700">{student.lessons}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.lastActive}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                        {getStatusText(student.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded row details */}
          {selectedStudent && (
            <div className="mt-4 p-6 rounded-lg border-2" style={{ backgroundColor: '#f9fafb', borderColor: '#4CAF50' }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: '#1e2832' }}>
                📊 Detailed Progress — {filteredStudents.find(s => s.id === selectedStudent)?.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total WPM</p>
                  <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                    {filteredStudents.find(s => s.id === selectedStudent)?.wpm}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Accuracy</p>
                  <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                    {filteredStudents.find(s => s.id === selectedStudent)?.accuracy}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                  <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                    {filteredStudents.find(s => s.id === selectedStudent)?.lessons}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Eco Actions</p>
                  <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                    8
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========== CUSTOM LESSON CREATOR ========== */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1e2832' }}>
            📖 Assign a lesson to the class
          </h2>
          <div className="rounded-lg border p-6" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
            <div className="space-y-4">
              {/* Lesson Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson Name</label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="e.g., The Water Cycle, Solar Energy..."
                  className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
                  style={{ borderColor: lessonName ? '#4CAF50' : '#e5e7eb' }}
                />
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste any text, story, science fact or passage here...
                </label>
                <textarea
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value.slice(0, 1000))}
                  placeholder="Enter your lesson content (max 1000 characters)..."
                  rows={6}
                  className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition resize-none"
                  style={{ borderColor: assignmentText ? '#4CAF50' : '#e5e7eb' }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {assignmentText.length}/1000 characters
                </p>
              </div>

              {/* Difficulty, Assign to, Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
                    style={{ borderColor: '#4CAF50' }}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to</label>
                  <select
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
                    style={{ borderColor: '#4CAF50' }}
                  >
                    <option value="class">Whole class</option>
                    <option value="individual">Individual student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule</label>
                  <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
                    style={{ borderColor: '#4CAF50' }}
                  >
                    <option value="now">Now</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="pick">Pick date</option>
                  </select>
                </div>
              </div>

              {/* Assign Button */}
              <button
                className="w-full py-3 rounded font-bold text-white transition text-lg"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
              >
                ✅ Assign Lesson
              </button>
            </div>
          </div>

          {/* Saved Lessons Library */}
          {savedLessons.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2832' }}>
                📚 Saved Lesson Library
              </h3>
              <div className="space-y-2">
                {savedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 rounded border"
                    style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{lesson.name}</p>
                      <p className="text-sm text-gray-500">
                        Created {lesson.createdAt} • Used {lesson.uses}x
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded text-sm font-semibold transition"
                        style={{ backgroundColor: '#4CAF50', color: 'white' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                      >
                        ♻️ Reuse
                      </button>
                      <button
                        className="px-3 py-1 rounded text-sm font-semibold transition"
                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========== ECO ACTIONS FEED ========== */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1e2832' }}>
            🌿 Recent eco actions from students
          </h2>
          <div className="space-y-3">
            {ecoFeedData.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded border"
                style={{ backgroundColor: '#f0fdf4', borderColor: '#4CAF50' }}
              >
                <p className="font-semibold text-gray-900">
                  {item.studentName} uploaded: {item.action} {item.icon}
                </p>
                <p className="text-sm text-gray-600 mt-1">— {item.time}</p>
              </div>
            ))}
          </div>
          <button
            className="mt-4 px-4 py-2 rounded font-semibold transition"
            style={{ backgroundColor: 'transparent', color: '#4CAF50', border: '2px solid #4CAF50' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            View all →
          </button>
        </div>

        {/* ========== SCHOOL BRANDING SECTION ========== */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1e2832' }}>
            🏫 School customization
          </h2>
          <div className="rounded-lg border p-6" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
            <div className="space-y-4">
              {/* School Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
                  style={{ borderColor: '#4CAF50' }}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Logo</label>
                <button
                  className="px-6 py-3 rounded font-semibold text-white transition"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                >
                  📤 Upload Logo
                </button>
                <p className="text-sm text-gray-600 mt-2">Current: Logo Placeholder (200x200px recommended)</p>
              </div>

              {/* Color Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer border-2"
                      style={{ borderColor: primaryColor }}
                    />
                    <p className="font-mono text-gray-700">{primaryColor}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
                  <div
                    className="w-full h-10 rounded border-2"
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                  ></div>
                </div>
              </div>

              {/* Save Button */}
              <button
                className="w-full py-3 rounded font-bold text-white transition text-lg"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* ========== PROGRESS REPORTS ========== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1e2832' }}>
            📊 Generate reports
          </h2>
          <div className="rounded-lg border p-6" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className="py-3 rounded font-bold text-white transition text-lg"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                >
                  📈 Generate Class Report
                </button>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Generate Individual Student Report
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded border-2 border-gray-300 focus:outline-none transition"
                    style={{ borderColor: '#4CAF50' }}
                  >
                    <option>Select a student...</option>
                    {allStudentsData.map((student) => (
                      <option key={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded" style={{ accentColor: '#4CAF50' }} />
                  <span className="text-gray-700 font-medium">Send to school admin</span>
                </label>
              </div>

              <button
                className="w-full py-3 rounded font-bold text-white transition text-lg"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              >
                📥 Download as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
