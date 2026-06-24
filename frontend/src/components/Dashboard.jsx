import React, { useState, useEffect } from 'react'
import { Users, BookOpen, GraduationCap, ClipboardList, Plus, UserPlus, ArrowRight } from 'lucide-react'

function Dashboard({ onViewChange }) {
  const [stats, setStats] = useState({
    studentsCount: 0,
    coursesCount: 0,
    enrollmentsCount: 0,
    recentEnrollments: [],
    deptDistribution: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses'),
        fetch('/api/enrollments')
      ])

      if (studentsRes.ok && coursesRes.ok && enrollmentsRes.ok) {
        const students = await studentsRes.json()
        const courses = await coursesRes.json()
        const enrollments = await enrollmentsRes.json()

        // Calculate department distribution
        const deptMap = {}
        students.forEach(s => {
          const dept = s.department || 'Other'
          deptMap[dept] = (deptMap[dept] || 0) + 1
        })

        // Sort enrollments by ID desc to get most recent
        const sortedEnrollments = [...enrollments]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5)

        setStats({
          studentsCount: students.length,
          coursesCount: courses.length,
          enrollmentsCount: enrollments.length,
          recentEnrollments: sortedEnrollments,
          deptDistribution: deptMap
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    )
  }

  // Convert department map to array for custom CSS bar chart
  const deptData = Object.entries(stats.deptDistribution).map(([name, count]) => ({
    name,
    count
  }))

  const maxDeptCount = Math.max(...deptData.map(d => d.count), 1)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Welcome back, Admin</h1>
          <p>Here's an overview of PalAcademy operations today.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={fetchDashboardData}>
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-details">
            <h3>Total Students</h3>
            <div className="metric-value">{stats.studentsCount}</div>
          </div>
          <div className="metric-icon">
            <Users size={24} />
          </div>
        </div>

        <div className="metric-card color-success">
          <div className="metric-details">
            <h3>Courses Available</h3>
            <div className="metric-value">{stats.coursesCount}</div>
          </div>
          <div className="metric-icon">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="metric-card color-warning">
          <div className="metric-details">
            <h3>Total Enrollments</h3>
            <div className="metric-value">{stats.enrollmentsCount}</div>
          </div>
          <div className="metric-icon">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="metric-card color-danger">
          <div className="metric-details">
            <h3>Avg Class Size</h3>
            <div className="metric-value">
              {stats.coursesCount > 0 ? (stats.enrollmentsCount / stats.coursesCount).toFixed(1) : 0}
            </div>
          </div>
          <div className="metric-icon">
            <ClipboardList size={24} />
          </div>
        </div>
      </div>

      {/* Analytics & Activities Row */}
      <div className="analytics-section">
        {/* Department Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Students by Department</h2>
          </div>
          {deptData.length > 0 ? (
            <div className="chart-canvas">
              {deptData.map((dept, index) => {
                const heightPercentage = `${(dept.count / maxDeptCount) * 100}%`
                return (
                  <div className="chart-bar-container" key={index}>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: heightPercentage }}>
                        <span className="chart-bar-value">{dept.count}</span>
                      </div>
                    </div>
                    <div className="chart-bar-label">{dept.name}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
              No department data available.
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Recent Activity</h2>
          </div>
          <div className="activity-list">
            {stats.recentEnrollments.length > 0 ? (
              stats.recentEnrollments.map((enr, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-badge grade" />
                  <div className="activity-text">
                    <strong>{enr.student.firstName} {enr.student.lastName}</strong> enrolled in{' '}
                    <strong>{enr.course.courseCode}</strong>
                  </div>
                  <div className="activity-time">{enr.enrollmentDate}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                No recent enrollments.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="card">
        <h2 className="chart-title" style={{ marginBottom: '1.25rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onViewChange('students')}>
            <UserPlus size={18} />
            Manage Students
          </button>
          <button className="btn btn-secondary" onClick={() => onViewChange('courses')}>
            <Plus size={18} />
            Manage Courses
          </button>
          <button className="btn btn-secondary" onClick={() => onViewChange('enrollments')}>
            <GraduationCap size={18} />
            Enroll Student
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
