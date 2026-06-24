import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Camera, Briefcase, User, Mail, Phone, MapPin } from 'lucide-react'

function ProfessorList() {
  const [professors, setProfessors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    gender: '',
    officeLocation: '',
    bio: '',
    profileImage: '',
    password: ''
  })
  const [formError, setFormError] = useState(null)

  // Custom Delete Modal State
  const [profToDelete, setProfToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    fetchProfessors()
  }, [search])

  const fetchProfessors = async () => {
    try {
      setLoading(true)
      const url = search ? `/api/professors?search=${encodeURIComponent(search)}` : '/api/professors'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProfessors(data)
        setError(null)
      } else {
        setError("Failed to fetch professors database.")
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
      if (file.size > 1024 * 1024) {
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
    setEditingProfessor(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Computer Science',
      gender: '',
      officeLocation: '',
      bio: '',
      profileImage: '',
      password: ''
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (prof) => {
    setEditingProfessor(prof)
    setFormData({
      firstName: prof.firstName || '',
      lastName: prof.lastName || '',
      email: prof.email || '',
      phone: prof.phone || '',
      department: prof.department || 'Computer Science',
      gender: prof.gender || '',
      officeLocation: prof.officeLocation || '',
      bio: prof.bio || '',
      profileImage: prof.profileImage || '',
      password: ''
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setFormError("All required fields (*) must be completed.")
      return
    }

    if (!editingProfessor && !formData.password) {
      setFormError("A login password is required for new professors.")
      return
    }

    try {
      const url = editingProfessor ? `/api/professors/${editingProfessor.id}` : '/api/professors'
      const method = editingProfessor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchProfessors()
      } else {
        const errData = await response.json()
        setFormError(errData.message || "Failed to submit professor record. Email may already be in use.")
      }
    } catch (err) {
      console.error(err)
      setFormError("Network error occurred. Please try again.")
    }
  }

  const confirmDelete = (prof) => {
    setProfToDelete(prof)
    setDeleteError(null)
  }

  const executeDelete = async () => {
    if (!profToDelete) return

    try {
      const response = await fetch(`/api/professors/${profToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProfToDelete(null)
        fetchProfessors()
      } else {
        setDeleteError("Failed to delete professor record.")
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
          <h1>Faculty Directory</h1>
          <p>Manage professor details, configure departments, and track workspace office details.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Register Faculty
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
            placeholder="Search professors by name, email, or department..."
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
      ) : professors.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Office Location</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {professors.map((prof) => (
                <tr key={prof.id}>
                  <td>#{prof.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {prof.profileImage ? (
                          <img src={prof.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          `${prof.firstName.substring(0, 1)}${prof.lastName.substring(0, 1)}`.toUpperCase()
                        )}
                      </div>
                      <span>Dr. {prof.firstName} {prof.lastName}</span>
                    </div>
                  </td>
                  <td>{prof.email}</td>
                  <td>
                    <span className="badge badge-success">{prof.department}</span>
                  </td>
                  <td>{prof.officeLocation || '--'}</td>
                  <td>{prof.phone || '--'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => openEditModal(prof)}
                        title="Edit Professor"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => confirmDelete(prof)}
                        title="Delete Professor"
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
          No professor records found. Click "Register Faculty" to get started.
        </div>
      )}

      {/* Register/Edit Professor Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title">{editingProfessor ? 'Edit Professor Details' : 'Register New Professor'}</h2>
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

            {!editingProfessor && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px dashed rgba(59, 130, 246, 0.4)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                lineHeight: '1.4'
              }}>
                💡 <strong>User Account Provisioning:</strong> Registering this professor automatically creates their login credentials. Please assign them a password below. The username will be generated as <strong>firstname_lastname</strong>.
              </div>
            )}

            {/* Profile Image Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <div className="user-avatar" style={{ width: '90px', height: '90px', fontSize: '2.5rem', overflow: 'hidden', border: '3px solid var(--border-color)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Edgar"
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
                  placeholder="e.g. Codd"
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
                placeholder="e.g. edgar.codd@university.edu"
              />
            </div>

            {!editingProfessor && (
              <div className="form-group">
                <label>Login Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Assign a login password for the professor"
                />
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1-555-0202"
                />
              </div>
              <div className="form-group">
                <label>Office Location</label>
                <input
                  type="text"
                  name="officeLocation"
                  className="form-control"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Turing Hall, Room 402"
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
              <label>Short Bio</label>
              <textarea
                name="bio"
                className="form-control"
                rows="3"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Write a brief overview of their academic background..."
                style={{ resize: 'none', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProfessor ? 'Save Changes' : 'Register Professor'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <div className={`modal-overlay ${profToDelete ? 'active' : ''}`}>
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
              Delete Professor Record?
            </h2>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1.5rem' }}>
              Are you sure you want to permanently delete the faculty record for <strong style={{ color: 'var(--text-primary)' }}>Dr. {profToDelete?.firstName} {profToDelete?.lastName}</strong>? This action will immediately deactivate their dashboard credentials.
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
                onClick={() => setProfToDelete(null)}
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

export default ProfessorList
