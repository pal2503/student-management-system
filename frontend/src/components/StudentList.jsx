import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Camera } from 'lucide-react'

function StudentList() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    department: 'Computer Science',
    gender: '',
    address: '',
    bio: '',
    profileImage: ''
  })
  const [formError, setFormError] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [search])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const url = search ? `/api/students?search=${encodeURIComponent(search)}` : '/api/students'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        setError(null)
      } else {
        setError("Failed to fetch students database.")
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
      [name]: value
    }))
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
        setFormData(prev => ({ ...prev, profileImage: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const openAddModal = () => {
    setEditingStudent(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      department: 'Computer Science',
      gender: '',
      address: '',
      bio: '',
      profileImage: ''
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      department: student.department || 'Computer Science',
      gender: student.gender || '',
      address: student.address || '',
      bio: student.bio || '',
      profileImage: student.profileImage || ''
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Quick client-side check
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.department) {
      setFormError("All required fields must be completed.")
      return
    }

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students'
      const method = editingStudent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchStudents()
      } else {
        const errData = await response.json()
        setFormError(errData.message || "Failed to submit student record. Check if email is already in use.")
      }
    } catch (err) {
      console.error(err)
      setFormError("Network error occurred. Please try again.")
    }
  }

  const confirmDelete = (student) => {
    setStudentToDelete(student)
    setDeleteError(null)
  }

  const executeDelete = async () => {
    if (!studentToDelete) return

    try {
      const response = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStudentToDelete(null)
        fetchStudents()
      } else {
        setDeleteError("Failed to delete student. Make sure you have administrator privileges.")
      }
    } catch (err) {
      console.error(err)
      setDeleteError("Network error: Could not complete delete request.")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Student Directory</h1>
          <p>Manage student registration details, update information, and track records.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Register Student
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
            placeholder="Search students by name, email, or department..."
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

      {/* Table Section */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : students.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Date of Birth</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {student.profileImage ? (
                          <img src={student.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          `${student.firstName.substring(0, 1)}${student.lastName.substring(0, 1)}`.toUpperCase()
                        )}
                      </div>
                      <span>{student.firstName} {student.lastName}</span>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <span className="badge badge-primary">{student.department}</span>
                  </td>
                  <td>{student.dateOfBirth}</td>
                  <td>{student.phone || '--'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => openEditModal(student)}
                        title="Edit Student"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => confirmDelete(student)}
                        title="Delete Student"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
          No student records found. Click "Register Student" to get started.
        </div>
      )}

      {/* Register/Edit Student Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title">{editingStudent ? 'Edit Student Details' : 'Register New Student'}</h2>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
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

            {/* Profile Image Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <div className="user-avatar" style={{ width: '90px', height: '90px', fontSize: '2.5rem', overflow: 'hidden', border: '3px solid var(--border-color)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alice"
                />
              </div>
              <div className="form-group">
                <label>Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Smith"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address <span className="text-danger">*</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. alice.smith@university.edu"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Date of Birth <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1-555-0101"
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
                  value={formData.department}
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
                  value={formData.gender}
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
                value={formData.address}
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
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us a bit about their academic interests..."
                style={{ resize: 'none', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingStudent ? 'Save Changes' : 'Register Student'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <div className={`modal-overlay ${studentToDelete ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger)',
              marginBottom: '0.5rem'
            }}>
              <Trash2 size={28} />
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Delete Student Record?
            </h2>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1.5rem' }}>
              Are you sure you want to permanently delete the student record for <strong style={{ color: 'var(--text-primary)' }}>{studentToDelete?.firstName} {studentToDelete?.lastName}</strong>? This action will immediately remove all course enrollments and academic grades associated with this student.
            </p>

            {deleteError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--danger-glow)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                width: '100%',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStudentToDelete(null)}
                style={{ flex: 1, height: '42px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={executeDelete}
                style={{ flex: 1, height: '42px', fontWeight: 600, backgroundColor: 'var(--danger)', border: 'none' }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentList
