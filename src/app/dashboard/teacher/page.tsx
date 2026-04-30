'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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

  const [teacherId, setTeacherId] = useState<string>('');
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [classes, setClasses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [createClassName, setCreateClassName] = useState('');
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [createClassError, setCreateClassError] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState<Array<{ id: string; full_name: string | null; email: string | null }>>([]);

  const generateClassCode = useMemo(() => {
    const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O, 1/I
    return () => {
      const suffix = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
      return `GRN${suffix}`;
    };
  }, []);

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

  const loadClasses = async () => {
    setClassesLoading(true);
    setClassesError('');
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setClasses([]);
        setTeacherId('');
        setSelectedClassId('');
        setClassesError('You must be logged in to view classes.');
        return;
      }
      setTeacherId(userData.user.id);

      const { data, error } = await supabase
        .from('classes')
        .select('id, name, code')
        .eq('teacher_id', userData.user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const list = (data as Array<{ id: string; name: string; code: string }> | null) ?? [];
      setClasses(list);
      if (list.length > 0) {
        setSelectedClassId((prev) => prev || list[0].id);
      } else {
        setSelectedClassId('');
      }
    } catch (err) {
      setClassesError(err instanceof Error ? err.message : 'Failed to load classes.');
      setClasses([]);
      setSelectedClassId('');
    } finally {
      setClassesLoading(false);
    }
  };

  const loadEnrolledStudents = async (classId: string) => {
    if (!classId) {
      setEnrolledStudents([]);
      return;
    }
    setStudentsLoading(true);
    setStudentsError('');
    try {
      const supabase = createClient();
      const { data: enrollments, error: enrollErr } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', classId);
      if (enrollErr) throw enrollErr;
      const studentIds = ((enrollments as Array<{ student_id: string }> | null) ?? []).map((e) => e.student_id);
      if (studentIds.length === 0) {
        setEnrolledStudents([]);
        return;
      }

      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);
      if (profilesErr) throw profilesErr;
      setEnrolledStudents((profiles as Array<{ id: string; full_name: string | null; email: string | null }> | null) ?? []);
    } catch (err) {
      setStudentsError(err instanceof Error ? err.message : 'Failed to load students.');
      setEnrolledStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    void loadClasses();
  }, []);

  useEffect(() => {
    void loadEnrolledStudents(selectedClassId);
  }, [selectedClassId]);

  const handleCreateClass = async () => {
    setCreateClassError('');
    setCreateClassLoading(true);
    try {
      if (!teacherId) {
        setCreateClassError('You must be logged in to create a class.');
        return;
      }
      if (!createClassName.trim()) {
        setCreateClassError('Class name is required.');
        return;
      }

      const supabase = createClient();

      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateClassCode();
        const { error } = await supabase.from('classes').insert([
          {
            teacher_id: teacherId,
            name: createClassName.trim(),
            code,
            school_id: null,
          },
        ]);

        if (!error) {
          setShowCreateClass(false);
          setCreateClassName('');
          await loadClasses();
          return;
        }

        lastErr = error;
        // If code is unique and insert failed for some other reason, stop retrying.
        if (!String((error as { message?: string }).message || '').toLowerCase().includes('duplicate')) {
          break;
        }
      }

      throw lastErr ?? new Error('Failed to create class.');
    } catch (err) {
      setCreateClassError(err instanceof Error ? err.message : 'Failed to create class.');
    } finally {
      setCreateClassLoading(false);
    }
  };

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
      {showCreateClass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'white',
              width: 'min(560px, 95vw)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e2832' }}>Create Class</div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
                  Generates a 6-character class code (example: GRN42X).
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateClass(false)}
                style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {createClassError && (
              <div
                style={{
                  background: '#ffebee',
                  border: '1px solid #ef5350',
                  color: '#c62828',
                  padding: '10px 12px',
                  borderRadius: 12,
                  marginTop: 12,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                {createClassError}
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#1e2832', marginBottom: 6 }}>Class name</label>
              <input
                value={createClassName}
                onChange={(e) => setCreateClassName(e.target.value)}
                placeholder="e.g. Grade 4A"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 10,
                  fontSize: '1rem',
                }}
                disabled={createClassLoading}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setShowCreateClass(false)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e0e0e0',
                  background: 'white',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
                disabled={createClassLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreateClass()}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#4CAF50',
                  color: 'white',
                  fontWeight: 900,
                  cursor: createClassLoading ? 'not-allowed' : 'pointer',
                  opacity: createClassLoading ? 0.7 : 1,
                }}
                disabled={createClassLoading}
              >
                {createClassLoading ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* ========== CLASSES ========== */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2832' }}>
              🏫 Classes
            </h2>
            <button
              className="px-4 py-2 rounded font-semibold text-white transition"
              style={{ backgroundColor: '#4CAF50' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
              onClick={() => {
                setCreateClassError('');
                setShowCreateClass(true);
              }}
            >
              ➕ Create Class
            </button>
          </div>

          {classesError && (
            <div className="p-4 rounded border mb-4" style={{ backgroundColor: '#ffebee', borderColor: '#ef5350', color: '#c62828' }}>
              {classesError}
            </div>
          )}

          {classesLoading ? (
            <div className="p-6 rounded border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="p-6 rounded border" style={{ backgroundColor: '#f0fdf4', borderColor: '#4CAF50' }}>
              <p className="font-semibold text-gray-900">No classes yet.</p>
              <p className="text-sm text-gray-600 mt-1">Create a class to generate a code students can use to join.</p>
            </div>
          ) : (
            <div className="rounded-lg border p-6" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassId(c.id)}
                      className="px-4 py-2 rounded-full font-semibold transition border"
                      style={{
                        backgroundColor: selectedClassId === c.id ? '#E8F5E9' : 'white',
                        borderColor: selectedClassId === c.id ? '#4CAF50' : '#e5e7eb',
                        color: selectedClassId === c.id ? '#2e7d32' : '#374151',
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Selected class code</div>
                  <div className="text-2xl font-black" style={{ color: '#4CAF50', letterSpacing: '0.12em' }}>
                    {classes.find((c) => c.id === selectedClassId)?.code || '—'}
                  </div>
                  <div className="text-xs text-gray-500">Students join using this code on the Lesson page.</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2832' }}>
                  👥 Enrolled students
                </h3>
                {studentsError && (
                  <div className="p-4 rounded border mb-3" style={{ backgroundColor: '#ffebee', borderColor: '#ef5350', color: '#c62828' }}>
                    {studentsError}
                  </div>
                )}
                {studentsLoading ? (
                  <div className="p-4 rounded border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                    Loading students...
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="p-4 rounded border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                    No students enrolled yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                    <table className="w-full min-w-[640px]">
                      <thead style={{ backgroundColor: '#f3f4f6' }}>
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((s) => (
                          <tr key={s.id} className="border-t" style={{ borderBottomColor: '#e5e7eb' }}>
                            <td className="px-6 py-4 font-semibold text-gray-900">{s.full_name || s.id}</td>
                            <td className="px-6 py-4 text-gray-700">{s.email || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
            <table className="w-full min-w-[720px]">
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
            <table className="w-full min-w-[900px]">
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
