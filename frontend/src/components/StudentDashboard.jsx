import React, { useState, useEffect } from 'react'
import { BookOpen, GraduationCap, ClipboardList, User, Award, Mail, Phone, Calendar, Briefcase, Plus, Check, X, MapPin, Edit2, Camera } from 'lucide-react'

function StudentDashboard({ currentUser, onProfileUpdate }) {
  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const [enrollError, setEnrollError] = useState(null)
  const [enrollSuccess, setEnrollSuccess] = useState(null)

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    department: '',
    gender: '',
    address: '',
    bio: '',
    profileImage: ''
  })
  const [editFormError, setEditFormError] = useState(null)

  const openEditModal = () => {
    if (!student) return
    setEditFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      department: student.department || 'Computer Science',
      gender: student.gender || '',
      address: student.address || '',
      bio: student.bio || '',
      profileImage: student.profileImage || ''
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
      if (file.size > 1024 * 1024) { // limit to 1MB
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

    if (!editFormData.firstName || !editFormData.lastName || !editFormData.dateOfBirth || !editFormData.department) {
      setEditFormError("All required fields must be completed.")
      return
    }

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          email: student.email, // email should not change
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          phone: editFormData.phone,
          dateOfBirth: editFormData.dateOfBirth,
          department: editFormData.department,
          gender: editFormData.gender,
          address: editFormData.address,
          bio: editFormData.bio,
          profileImage: editFormData.profileImage
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setStudent(updated)
        if (onProfileUpdate) {
          onProfileUpdate(updated)
        }
        setIsEditModalOpen(false)
      } else {
        const errData = await response.json()
        setEditFormError(errData.message || "Failed to update profile.")
      }
    } catch (err) {
      console.error(err)
      setEditFormError("Network error. Could not save profile changes.")
    }
  }

  useEffect(() => {
    if (currentUser?.email) {
      fetchStudentData(currentUser.email)
    }
  }, [currentUser])

  const fetchStudentData = async (email) => {
    try {
      setLoading(true)
      setProfileError(null)
      // 1. Fetch student profile by email
      const studentRes = await fetch(`/api/students/email/${encodeURIComponent(email)}`)
      if (!studentRes.ok) {
        throw new Error("Student profile not found. Make sure your student details exist in the directory.")
      }
      const studentData = await studentRes.json()
      setStudent(studentData)
      if (onProfileUpdate) {
        onProfileUpdate(studentData)
      }

      // 2. Fetch enrollments for this student
      const enrollmentsRes = await fetch(`/api/students/${studentData.id}/enrollments`)
      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData)
      }

      // 3. Fetch all courses to show catalog
      const coursesRes = await fetch('/api/courses')
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setAllCourses(coursesData)
      }

    } catch (err) {
      console.error(err)
      setProfileError(err.message || "Failed to load student dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    if (!student) return
    setEnrollError(null)
    setEnrollSuccess(null)

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          courseId: courseId
        })
      })

      if (response.ok) {
        setEnrollSuccess("Enrolled successfully!")
        // Refresh enrollments
        const enrollmentsRes = await fetch(`/api/students/${student.id}/enrollments`)
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json()
          setEnrollments(enrollmentsData)
        }
      } else {
        const errData = await response.json()
        setEnrollError(errData.message || "Failed to enroll in course.")
      }
    } catch (err) {
      console.error(err)
      setEnrollError("Network error. Could not enroll.")
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
          <button className="btn btn-primary" onClick={() => fetchStudentData(currentUser.email)}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalCredits = enrollments.reduce((sum, enr) => sum + (enr.course?.credits || 0), 0)
  const completedCourses = enrollments.filter(enr => enr.grade && enr.grade !== 'Pending')
  
  // Calculate average GPA (simple conversion for standard letters)
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D': 1.0, 'F': 0.0
  }
  let gpaSum = 0
  let gpaCount = 0
  completedCourses.forEach(enr => {
    const point = gradePoints[enr.grade.toUpperCase()]
    if (point !== undefined) {
      gpaSum += point
      gpaCount++
    }
  })
  const currentGPA = gpaCount > 0 ? (gpaSum / gpaCount).toFixed(2) : 'N/A'

  // Courses that the student is NOT enrolled in
  const enrolledCourseIds = enrollments.map(enr => enr.course?.id)
  const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id))

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header / Profile Greeting */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Welcome back, {student?.firstName || currentUser?.username}</h1>
          <p>Here is your academic profile, enrolled classes, and grade sheet.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div className="user-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {student?.profileImage ? (
                <img src={student.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  {(student?.firstName?.substring(0, 1) || currentUser?.username?.substring(0, 1) || 'S').toUpperCase()}
                  {(student?.lastName?.substring(0, 1) || '').toUpperCase()}
                </>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{student?.firstName} {student?.lastName}</h2>
            <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>Student</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Mail size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{student?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Phone size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)' }}>{student?.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Briefcase size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)' }}>{student?.department}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)' }}>DOB: {student?.dateOfBirth}</span>
            </div>
            {student?.gender && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <User size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>Gender: {student.gender}</span>
              </div>
            )}
            {student?.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>Address: {student.address}</span>
              </div>
            )}
            {student?.bio && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--primary)', wordBreak: 'break-word' }}>
                "{student.bio}"
              </div>
            )}
            <button
              className="btn btn-secondary"
              onClick={openEditModal}
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Academic Overview & Enrollments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metrics Grid */}
          <div className="metrics-grid" style={{ marginBottom: 0 }}>
            <div className="metric-card">
              <div className="metric-details">
                <h3>Enrolled Courses</h3>
                <div className="metric-value">{enrollments.length}</div>
              </div>
              <div className="metric-icon">
                <BookOpen size={24} />
              </div>
            </div>

            <div className="metric-card color-success">
              <div className="metric-details">
                <h3>Total Credits</h3>
                <div className="metric-value">{totalCredits}</div>
              </div>
              <div className="metric-icon">
                <GraduationCap size={24} />
              </div>
            </div>

            <div className="metric-card color-warning">
              <div className="metric-details">
                <h3>Current GPA</h3>
                <div className="metric-value">{currentGPA}</div>
              </div>
              <div className="metric-icon">
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Current Class Roll / Enrolled Classes */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h2 className="chart-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={20} className="brand-accent" />
              Your Registered Courses
            </h2>
            {enrollments.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Course Title</th>
                      <th>Instructor</th>
                      <th>Credits</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enr, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="course-code">{enr.course?.courseCode}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{enr.course?.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{enr.course?.instructor}</td>
                        <td>{enr.course?.credits} cr</td>
                        <td>
                          <span className={`badge ${
                            enr.grade?.toUpperCase() === 'PENDING'
                              ? 'badge-warning'
                              : ['A+', 'A', 'A-', 'B+', 'B', 'B-'].includes(enr.grade?.toUpperCase())
                              ? 'badge-success'
                              : 'badge-primary'
                          }`}>
                            {enr.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                You are not currently enrolled in any courses. Browse available courses below to enroll.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Course Catalog */}
      <div className="card">
        <h2 className="chart-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} className="brand-accent" />
          Explore Course Registration
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Register for new courses available in your department or other disciplines.
        </p>

        {enrollError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-glow)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            ⚠️ {enrollError}
          </div>
        )}

        {enrollSuccess && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--success-glow)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            ✓ {enrollSuccess}
          </div>
        )}

        {availableCourses.length > 0 ? (
          <div className="course-grid">
            {availableCourses.map((course, idx) => (
              <div className="course-card" key={idx} style={{ minHeight: '220px' }}>
                <div>
                  <div className="course-badge-row">
                    <span className="course-code">{course.courseCode}</span>
                    <span className="course-credits">{course.credits} Credits</span>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                </div>
                
                <div className="course-footer" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-muted)' }}>Instructor</span>
                    <span className="course-instructor">{course.instructor}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    onClick={() => handleEnroll(course.id)}
                  >
                    <Plus size={14} /> Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No new courses available. You are enrolled in all existing courses!
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <div className={`modal-overlay ${isEditModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} className="brand-accent" />
              Update Student Profile
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
                  'S'
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
                <label>Date of Birth <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  required
                  value={editFormData.dateOfBirth}
                  onChange={handleInputChange}
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
              <label>Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={editFormData.address}
                onChange={handleInputChange}
                placeholder="e.g. 123 University Drive, Cityville"
              />
            </div>

            <div className="form-group">
              <label>Short Bio</label>
              <textarea
                name="bio"
                className="form-control"
                rows="3"
                value={editFormData.bio}
                onChange={handleInputChange}
                placeholder="Tell us a bit about your academic interests..."
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

export default StudentDashboard
