import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, BookOpen, Users } from 'lucide-react'

function CourseList() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Course Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    instructor: ''
  })
  const [formError, setFormError] = useState(null)

  // Course Roll (Enrolled Students) Modal State
  const [isRollModalOpen, setIsRollModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [loadingRoll, setLoadingRoll] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [search])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const url = search ? `/api/courses?search=${encodeURIComponent(search)}` : '/api/courses'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
        setError(null)
      } else {
        setError("Failed to fetch courses catalog.")
      }
    } catch (err) {
      console.error(err)
      setError("Server connection lost. Please verify Spring Boot is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value, 10) || 1 : value
    }))
  }

  const openAddModal = () => {
    setEditingCourse(null)
    setFormData({
      courseCode: '',
      title: '',
      description: '',
      credits: 3,
      instructor: ''
    })
    setFormError(null)
    setIsFormModalOpen(true)
  }

  const openEditModal = (course, e) => {
    e.stopPropagation() // Prevent triggering card click
    setEditingCourse(course)
    setFormData({
      courseCode: course.courseCode || '',
      title: course.title || '',
      description: course.description || '',
      credits: course.credits || 3,
      instructor: course.instructor || ''
    })
    setFormError(null)
    setIsFormModalOpen(true)
  }

  const openRollModal = async (course) => {
    setSelectedCourse(course)
    setIsRollModalOpen(true)
    setLoadingRoll(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/enrollments`)
      if (response.ok) {
        const data = await response.json()
        setEnrolledStudents(data)
      } else {
        console.error("Failed to load enrollment roster.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRoll(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!formData.courseCode || !formData.title || !formData.credits || !formData.instructor) {
      setFormError("All required fields must be completed.")
      return
    }

    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses'
      const method = editingCourse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsFormModalOpen(false)
        fetchCourses()
      } else {
        const errData = await response.json()
        setFormError(errData.message || "Failed to submit course. Code may already be in use.")
      }
    } catch (err) {
      console.error(err)
      setFormError("Network error. Please try again.")
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this course? This will remove all student enrollments for it.")) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourses()
      } else {
        alert("Failed to delete course.")
      }
    } catch (err) {
      console.error(err)
      alert("Network error: Could not complete delete request.")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Course Catalog</h1>
          <p>Create and structure academic programs, assign instructors, and monitor class rosters.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Create Course
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search courses by code, title, or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Server Error Alert */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
          <AlertCircle className="text-danger" size={20} />
          <span className="text-danger" style={{ fontSize: '0.9rem', fontWeight: '500' }}>{error}</span>
        </div>
      )}

      {/* Course Cards Grid */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="course-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.id} onClick={() => openRollModal(course)} style={{ cursor: 'pointer' }}>
              <div>
                <div className="course-badge-row">
                  <span className="course-code">{course.courseCode}</span>
                  <span className="course-credits">{course.credits} Credits</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description || 'No description provided for this course.'}</p>
              </div>

              <div className="course-footer">
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Instructor</span>
                  <span className="course-instructor">{course.instructor}</span>
                </div>

                <div className="course-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-secondary btn-icon"
                    onClick={(e) => openEditModal(course, e)}
                    title="Edit Course"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-danger btn-icon"
                    onClick={(e) => handleDelete(course.id, e)}
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
          No courses found. Click "Create Course" to add one.
        </div>
      )}

      {/* Create/Edit Course Modal */}
      <div className={`modal-overlay ${isFormModalOpen ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">{editingCourse ? 'Modify Course Details' : 'Create Academic Course'}</h2>
            <button className="modal-close" onClick={() => setIsFormModalOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Course Code <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="courseCode"
                  className="form-control"
                  required
                  placeholder="e.g. CS101"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Credits <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="credits"
                  className="form-control"
                  required
                  min={1}
                  max={8}
                  value={formData.credits}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Course Title <span className="text-danger">*</span></label>
              <input
                type="text"
                name="title"
                className="form-control"
                required
                placeholder="e.g. Introduction to Programming"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Instructor Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="instructor"
                className="form-control"
                required
                placeholder="e.g. Dr. Alan Turing"
                value={formData.instructor}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={3}
                placeholder="Write a brief overview of course objectives..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Course Roll / Enrolled Students Modal */}
      <div className={`modal-overlay ${isRollModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '650px' }}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Class Roll & Grades</h2>
              <span className="course-code" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                {selectedCourse?.courseCode} - {selectedCourse?.title}
              </span>
            </div>
            <button className="modal-close" onClick={() => setIsRollModalOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '1rem' }}>
            {loadingRoll ? (
              <div className="spinner-container" style={{ padding: '2rem' }}>
                <div className="spinner"></div>
              </div>
            ) : enrolledStudents.length > 0 ? (
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((enr) => (
                    <tr key={enr.id}>
                      <td style={{ fontWeight: '600' }}>{enr.student.firstName} {enr.student.lastName}</td>
                      <td>{enr.student.email}</td>
                      <td>{enr.student.department}</td>
                      <td>
                        <span className={`badge ${
                          enr.grade === 'A' || enr.grade === 'A+' || enr.grade === 'A-' || enr.grade === 'B+' || enr.grade === 'B' ? 'badge-success' :
                          enr.grade === 'Pending' ? 'badge-warning' : 'badge-primary'
                        }`}>
                          {enr.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center" style={{ padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                No students enrolled in this course yet.
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setIsRollModalOpen(false)}>
              Close Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseList
