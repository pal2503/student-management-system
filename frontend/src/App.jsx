import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Users, BookOpen, GraduationCap, LogOut, Briefcase } from 'lucide-react'
import Dashboard from './components/Dashboard'
import StudentList from './components/StudentList'
import CourseList from './components/CourseList'
import EnrollmentManager from './components/EnrollmentManager'
import Login from './components/Login'
import Register from './components/Register'
import StudentDashboard from './components/StudentDashboard'
import ProfessorDashboard from './components/ProfessorDashboard'
import ProfessorList from './components/ProfessorList'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authState, setAuthState] = useState('login') // 'login', 'register', 'authenticated'
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [studentProfile, setStudentProfile] = useState(null)

  const handleStudentProfileUpdate = (updatedProfile) => {
    setStudentProfile(updatedProfile)
  }

  // Fetch student or professor profile details to display in sidebar
  useEffect(() => {
    if (currentUser && currentUser.role === 'STUDENT') {
      fetch(`/api/students/email/${encodeURIComponent(currentUser.email)}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then(data => {
          setStudentProfile(data);
        })
        .catch(err => console.error("Could not fetch student profile for sidebar", err));
    } else if (currentUser && currentUser.role === 'PROFESSOR') {
      fetch(`/api/professors/email/${encodeURIComponent(currentUser.email)}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then(data => {
          setStudentProfile(data);
        })
        .catch(err => console.error("Could not fetch professor profile for sidebar", err));
    } else {
      setStudentProfile(null);
    }
  }, [currentUser])

  // Check if user session already exists in localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setCurrentUser(parsed)
        setAuthState('authenticated')
      } catch (err) {
        localStorage.removeItem('nexus_user')
      }
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    setAuthState('authenticated')
    setCurrentTab('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('nexus_user')
    setCurrentUser(null)
    setAuthState('login')
  }

  const renderContent = () => {
    if (currentUser?.role === 'STUDENT') {
      return <StudentDashboard currentUser={currentUser} onProfileUpdate={handleStudentProfileUpdate} />
    }
    if (currentUser?.role === 'PROFESSOR') {
      return <ProfessorDashboard currentUser={currentUser} onProfileUpdate={handleStudentProfileUpdate} />
    }

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onViewChange={(tab) => setCurrentTab(tab)} />
      case 'students':
        return <StudentList />
      case 'professors':
        return <ProfessorList />
      case 'courses':
        return <CourseList />
      case 'enrollments':
        return <EnrollmentManager />
      default:
        return <Dashboard onViewChange={(tab) => setCurrentTab(tab)} />
    }
  }

  // Auth flow screens
  if (authState === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthState('register')}
      />
    )
  }

  if (authState === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setAuthState('login')}
      />
    )
  }

  // Authenticated View
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <GraduationCap className="brand-accent" size={28} />
          <span>Pal<span className="brand-accent">Academy</span></span>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button
                className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentTab('dashboard')}
                style={{ width: '100%', border: 'none', textAlign: 'left', background: 'none' }}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            {currentUser?.role === 'ADMIN' && (
              <>
                <li>
                  <button
                    className={`nav-item ${currentTab === 'students' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('students')}
                    style={{ width: '100%', border: 'none', textAlign: 'left', background: 'none' }}
                  >
                    <Users size={20} />
                    <span>Students</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-item ${currentTab === 'professors' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('professors')}
                    style={{ width: '100%', border: 'none', textAlign: 'left', background: 'none' }}
                  >
                    <Briefcase size={20} />
                    <span>Professors</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-item ${currentTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('courses')}
                    style={{ width: '100%', border: 'none', textAlign: 'left', background: 'none' }}
                  >
                    <BookOpen size={20} />
                    <span>Courses</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-item ${currentTab === 'enrollments' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('enrollments')}
                    style={{ width: '100%', border: 'none', textAlign: 'left', background: 'none' }}
                  >
                    <GraduationCap size={20} />
                    <span>Enrollments</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {studentProfile?.profileImage ? (
                <img src={studentProfile.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser?.username?.substring(0, 2).toUpperCase() || 'AD'
              )}
            </div>
            <div className="user-info">
              <span className="user-name" style={{ textTransform: 'capitalize' }}>
                {currentUser?.username || 'Admin'}
              </span>
              <span className="user-role">
                {currentUser?.role === 'ADMIN' ? 'Administrator' : currentUser?.role === 'STUDENT' ? 'Student' : currentUser?.role === 'PROFESSOR' ? 'Professor' : currentUser?.role || 'Staff'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
