import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X, AlertCircle, Calendar, BookOpen, UserCheck } from 'lucide-react'

function EnrollmentManager() {
  const [enrollments, setEnrollments] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  // Inline grading state
  const [editingId, setEditingId] = useState(null)
  const [tempGrade, setTempGrade] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [enrollRes, studRes, courseRes] = await Promise.all([
        fetch('/api/enrollments'),
        fetch('/api/students'),
        fetch('/api/courses')
      ])

      if (enrollRes.ok && studRes.ok && courseRes.ok) {
        const enrollData = await enrollRes.json()
        const studData = await studRes.json()
        const courseData = await courseRes.json()

        setEnrollments(enrollData)
        setStudents(studData)
        setCourses(courseData)
        setError(null)
      } else {
        setError("Failed to load backend entities.")
      }
    } catch (err) {
      console.error(err)
      setError("Server connection lost. Please verify Spring Boot is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedStudentId || !selectedCourseId) {
      setFormError("Please select both a student and a course.")
      return
    }

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(selectedStudentId, 10),
          courseId: parseInt(selectedCourseId, 10)
        })
      })

      if (response.ok) {
        setSelectedStudentId('')
        setSelectedCourseId('')
        fetchInitialData()
      } else {
        const errData = await response.json()
        setFormError(errData.message || "Enrollment failed. Student might already be enrolled in this course.")
      }
    } catch (err) {
      console.error(err)
      setFormError("Network error. Please try again.")
    }
  }

  const startEditingGrade = (enrollment) => {
    setEditingId(enrollment.id)
    setTempGrade(enrollment.grade || 'Pending')
  }

  const saveGradeUpdate = async (id) => {
    try {
      const response = await fetch(`/api/enrollments/${id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: tempGrade })
      })

      if (response.ok) {
        setEditingId(null)
        fetchInitialData()
      } else {
        alert("Failed to save grade.")
      }
    } catch (err) {
      console.error(err)
      alert("Network error: Could not save grade.")
    }
  }

  const cancelEnrollment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this student enrollment?")) {
      return
    }

    try {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchInitialData()
      } else {
        alert("Failed to cancel enrollment.")
      }
    } catch (err) {
      console.error(err)
      alert("Network error: Could not complete cancel request.")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Enrollment & Grading</h1>
          <p>Register students into courses, assign grades, and monitor overall course sizes.</p>
        </div>
      </div>

      {/* Connection Error Alert */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle className="text-danger" size={20} />
          <span className="text-danger" style={{ fontSize: '0.9rem', fontWeight: '500' }}>{error}</span>
        </div>
      )}

      {/* Dual Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Enroll Student Panel */}
        <div className="card">
          <h2 className="chart-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} className="brand-accent" />
            Enroll Student in Course
          </h2>

          <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {formError && (
              <div style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
              <label>Select Student <span className="text-danger">*</span></label>
              <select
                className="filter-select"
                style={{ width: '100%' }}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Choose a Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
              <label>Select Course <span className="text-danger">*</span></label>
              <select
                className="filter-select"
                style={{ width: '100%' }}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Choose a Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '42px', minWidth: '150px' }}>
              <Plus size={18} />
              Process Enrollment
            </button>
          </form>
        </div>

        {/* Enrollments Table Panel */}
        <div className="card">
          <h2 className="chart-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} className="brand-accent" />
            Active Course Enrollments
          </h2>

          {loading ? (
            <div className="spinner-container" style={{ padding: '2rem' }}>
              <div className="spinner"></div>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Enrollment ID</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr.id}>
                      <td>#{enr.id}</td>
                      <td style={{ fontWeight: '600' }}>
                        {enr.student.firstName} {enr.student.lastName}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                          ID: #{enr.student.id} | {enr.student.department}
                        </span>
                      </td>
                      <td>
                        <span className="course-code" style={{ fontSize: '0.7rem' }}>{enr.course.courseCode}</span>
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginTop: '0.25rem' }}>
                          {enr.course.title}
                        </span>
                      </td>
                      <td>{enr.enrollmentDate}</td>
                      <td>
                        {editingId === enr.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <select
                              className="filter-select"
                              style={{ padding: '0.35rem 1.5rem 0.35rem 0.5rem', fontSize: '0.8rem', minWidth: '100px' }}
                              value={tempGrade}
                              onChange={(e) => setTempGrade(e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B">B</option>
                              <option value="B-">B-</option>
                              <option value="C+">C+</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="F">F</option>
                              <option value="W">W (Withdrawn)</option>
                            </select>
                            <button
                              className="btn btn-primary btn-icon"
                              style={{ padding: '0.35rem' }}
                              onClick={() => saveGradeUpdate(enr.id)}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ padding: '0.35rem' }}
                              onClick={() => setEditingId(null)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={`badge ${
                              enr.grade === 'A' || enr.grade === 'A+' || enr.grade === 'A-' || enr.grade === 'B+' || enr.grade === 'B' ? 'badge-success' :
                              enr.grade === 'Pending' ? 'badge-warning' : 'badge-primary'
                            }`}>
                              {enr.grade || 'Pending'}
                            </span>
                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ padding: '0.25rem', border: 'none', background: 'none' }}
                              onClick={() => startEditingGrade(enr)}
                              title="Update Grade"
                            >
                              <Edit2 size={13} style={{ color: 'var(--text-secondary)' }} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => cancelEnrollment(enr.id)}
                          title="Cancel Enrollment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
              No enrollments registered yet. Select a student and course above to enroll.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnrollmentManager
