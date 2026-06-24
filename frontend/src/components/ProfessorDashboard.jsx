import React, { useState, useEffect } from 'react'
import { BookOpen, GraduationCap, ClipboardList, User, Award, Mail, Phone, Calendar, Briefcase, Plus, Check, X, MapPin, Edit2, Camera, HelpCircle, Save } from 'lucide-react'

function ProfessorDashboard({ currentUser, onProfileUpdate }) {
  const [professor, setProfessor] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  
  // Grade Editing states
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null)
  const [tempGrade, setTempGrade] = useState('Pending')
  const [gradeSuccess, setGradeSuccess] = useState(null)

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    gender: '',
    officeLocation: '',
    bio: '',
    profileImage: ''
  })
  const [editFormError, setEditFormError] = useState(null)

  // Selected Course for Roster
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  useEffect(() => {
    if (currentUser?.email) {
      fetchProfessorData(currentUser.email)
    }
  }, [currentUser])

  const fetchProfessorData = async (email) => {
    try {
      setLoading(true)
      setProfileError(null)

      // 1. Fetch professor profile
      const profRes = await fetch(`/api/professors/email/${encodeURIComponent(email)}`)
      if (!profRes.ok) {
        throw new Error("Professor profile not found. Verify your credentials exist in the system.")
      }
      const profData = await profRes.json()
      setProfessor(profData)
      if (onProfileUpdate) {
        onProfileUpdate(profData)
      }

      // 2. Fetch all courses
      const coursesRes = await fetch('/api/courses')
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      // 3. Fetch all enrollments
      const enrollmentsRes = await fetch('/api/enrollments')
      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData)
      }

    } catch (err) {
      console.error(err)
      setProfileError(err.message || "Failed to load professor dashboard details.")
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = () => {
    if (!professor) return
    setEditFormData({
      firstName: professor.firstName || '',
      lastName: professor.lastName || '',
      phone: professor.phone || '',
      department: professor.department || 'Computer Science',
      gender: professor.gender || '',
      officeLocation: professor.officeLocation || '',
      bio: professor.bio || '',
      profileImage: professor.profileImage || ''
    })
    setEditFormError(null)
    setIsEditModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Selected image is too large. Please upload an image smaller than 1MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, profileImage: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault()
    setEditFormError(null)

    if (!editFormData.firstName || !editFormData.lastName || !editFormData.department) {
      setEditFormError("First name, Last name, and Department are required.")
      return
    }

    try {
      const response = await fetch(`/api/professors/${professor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: professor.id,
          email: professor.email,
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          phone: editFormData.phone,
          department: editFormData.department,
          gender: editFormData.gender,
          officeLocation: editFormData.officeLocation,
          bio: editFormData.bio,
          profileImage: editFormData.profileImage
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setProfessor(updated)
        if (onProfileUpdate) {
          onProfileUpdate(updated)
        }
        setIsEditModalOpen(false)
      } else {
        const errData = await response.json()
        setEditFormError(errData.message || "Failed to update profile details.")
      }
    } catch (err) {
      console.error(err)
      setEditFormError("Network error. Could not update profile details.")
    }
  }

  const startEditingGrade = (enrollmentId, currentGrade) => {
    setEditingEnrollmentId(enrollmentId)
    setTempGrade(currentGrade || 'Pending')
    setGradeSuccess(null)
  }

  const saveGradeUpdate = async (enrollmentId) => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: tempGrade })
      })

      if (response.ok) {
        setEditingEnrollmentId(null)
        setGradeSuccess("Grade updated successfully!")
        
        // Refresh enrollments data
        const enrollmentsRes = await fetch('/api/enrollments')
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json()
          setEnrollments(enrollmentsData)
        }
      } else {
        alert("Failed to save grade changes.")
      }
    } catch (err) {
      console.error(err)
      alert("Network error: Could not save grade changes.")
    }
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (profileError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <h2 className="text-danger" style={{ marginBottom: '1rem' }}>Dashboard Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{profileError}</p>
          <button className="btn btn-primary" onClick={() => fetchProfessorData(currentUser.email)}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Filter courses taught by this professor (matching their last name or full name)
  const professorFullName = `${professor?.firstName} ${professor?.lastName}`
  const profLastName = professor?.lastName || ""
  const assignedCourses = courses.filter(course => 
    course.instructor.toLowerCase().includes(profLastName.toLowerCase()) || 
    course.instructor.toLowerCase().includes(professorFullName.toLowerCase())
  )

  const assignedCourseIds = assignedCourses.map(c => c.id)
  
  // Filter enrollments for courses taught by this professor
  const profEnrollments = enrollments.filter(enr => enr.course && assignedCourseIds.includes(enr.course.id))

  // Find students in the currently selected course roster
  const selectedCourse = assignedCourses.find(c => c.id === selectedCourseId)
  const roster = selectedCourseId 
    ? profEnrollments.filter(enr => enr.course?.id === selectedCourseId)
    : []

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Welcome, Professor {professor?.firstName} {professor?.lastName}</h1>
          <p>Manage your assigned classes, grade enrollments, and check rosters.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div className="user-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {professor?.profileImage ? (
                <img src={professor.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  {(professor?.firstName?.substring(0, 1) || 'P').toUpperCase()}
                  {(professor?.lastName?.substring(0, 1) || '').toUpperCase()}
                </>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Dr. {professor?.firstName} {professor?.lastName}</h2>
            <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>Faculty Member</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Mail size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{professor?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Phone size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)' }}>{professor?.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Briefcase size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)' }}>{professor?.department}</span>
            </div>
            {professor?.officeLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>Office: {professor.officeLocation}</span>
              </div>
            )}
            {professor?.gender && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <User size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>Gender: {professor.gender}</span>
              </div>
            )}
            {professor?.bio && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--primary)', wordBreak: 'break-word' }}>
                "{professor.bio}"
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={openEditModal}
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
            >
              <Edit2 size={14} /> Edit Faculty Profile
            </button>
          </div>
        </div>

        {/* Assigned courses & Grading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Taught Courses list */}
          <div className="card">
            <h2 className="chart-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} className="brand-accent" />
              Assigned Courses Catalog ({assignedCourses.length})
            </h2>
            {assignedCourses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {assignedCourses.map((course, idx) => {
                  const numStudents = enrollments.filter(e => e.course?.id === course.id).length
                  const isSelected = selectedCourseId === course.id
                  return (
                    <div 
                      key={idx} 
                      className={`course-card ${isSelected ? 'active-selection' : ''}`}
                      style={{ 
                        cursor: 'pointer', 
                        minHeight: '140px',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setSelectedCourseId(course.id)
                        setEditingEnrollmentId(null)
                        setGradeSuccess(null)
                      }}
                    >
                      <div className="course-badge-row" style={{ marginBottom: '0.5rem' }}>
                        <span className="course-code">{course.courseCode}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{course.credits} Cr</span>
                      </div>
                      <h3 className="course-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enrolled Students</span>
                        <span className="badge badge-primary">{numStudents} Students</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No courses currently assigned. Please contact the administrator.
              </div>
            )}
          </div>

          {/* Roster / Grading panel */}
          {selectedCourseId && (
            <div className="card" style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 className="chart-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={20} className="brand-accent" />
                  Roster & Grades: {selectedCourse?.courseCode} - {selectedCourse?.title}
                </h2>
                <button className="btn btn-secondary btn-icon" onClick={() => setSelectedCourseId(null)} title="Close Roster">
                  <X size={15} />
                </button>
              </div>

              {gradeSuccess && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-glow)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  ✓ {gradeSuccess}
                </div>
              )}

              {roster.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student Profile</th>
                        <th>Email Address</th>
                        <th>Department</th>
                        <th>Registered Date</th>
                        <th>Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((enr, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {enr.student?.profileImage ? (
                                  <img src={enr.student.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  `${enr.student?.firstName?.substring(0, 1)}${enr.student?.lastName?.substring(0, 1)}`.toUpperCase()
                                )}
                              </div>
                              <span>{enr.student?.firstName} {enr.student?.lastName}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{enr.student?.email}</td>
                          <td>
                            <span className="badge badge-primary">{enr.student?.department}</span>
                          </td>
                          <td>{enr.enrollmentDate || 'N/A'}</td>
                          <td>
                            {editingEnrollmentId === enr.id ? (
                              <select
                                className="form-control"
                                style={{ 
                                  padding: '0.2rem 0.5rem', 
                                  height: '32px', 
                                  fontSize: '0.85rem',
                                  width: '100px', 
                                  backgroundColor: 'var(--bg-tertiary)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--primary)'
                                }}
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
                                <option value="C-">C-</option>
                                <option value="D">D</option>
                                <option value="F">F</option>
                              </select>
                            ) : (
                              <span className={`badge ${
                                enr.grade?.toUpperCase() === 'PENDING'
                                  ? 'badge-warning'
                                  : ['A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(enr.grade?.toUpperCase())
                                  ? 'badge-success'
                                  : 'badge-primary'
                              }`}>
                                {enr.grade}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingEnrollmentId === enr.id ? (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-primary btn-icon" style={{ padding: '0.3rem' }} onClick={() => saveGradeUpdate(enr.id)} title="Save Grade">
                                  <Save size={14} />
                                </button>
                                <button className="btn btn-secondary btn-icon" style={{ padding: '0.3rem' }} onClick={() => setEditingEnrollmentId(null)} title="Cancel">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => startEditingGrade(enr.id, enr.grade)}>
                                Assign Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem' }}>
                  No students are currently enrolled in this course catalog.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Faculty Edit Profile Modal */}
      <div className={`modal-overlay ${isEditModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} className="brand-accent" />
              Update Faculty Profile
            </h2>
            <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleProfileUpdateSubmit}>
            {editFormError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <X size={16} />
                <span>{editFormError}</span>
              </div>
            )}

            {/* Profile Image Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <div className="user-avatar" style={{ width: '90px', height: '90px', fontSize: '2.5rem', overflow: 'hidden', border: '3px solid var(--border-color)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editFormData.profileImage ? (
                  <img src={editFormData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'P'
                )}
                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '0.65rem',
                  padding: '0.25rem 0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}>
                  <Camera size={12} />
                  <span style={{ fontSize: '9px' }}>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Upload profile picture (Max 1MB)</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>First Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  required
                  value={editFormData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  required
                  value={editFormData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={editFormData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1-555-0101"
                />
              </div>
              <div className="form-group">
                <label>Office Location</label>
                <input
                  type="text"
                  name="officeLocation"
                  className="form-control"
                  value={editFormData.officeLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Science Hall, Room 304"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Department <span className="text-danger">*</span></label>
                <select
                  name="department"
                  className="form-control"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  value={editFormData.department}
                  onChange={handleInputChange}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  value={editFormData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Short Bio</label>
              <textarea
                name="bio"
                className="form-control"
                rows="3"
                value={editFormData.bio}
                onChange={handleInputChange}
                placeholder="Brief summary of your academic achievements..."
                style={{ resize: 'none', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfessorDashboard
