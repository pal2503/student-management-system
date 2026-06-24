import React, { useState } from 'react'
import { GraduationCap, Lock, User, Mail, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'

function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!username || !email || !password || !confirmPassword) {
      setError("Please complete all fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const errData = await response.json()
        setError(errData.message || "Registration failed. Username or email may already be in use.")
      }
    } catch (err) {
      console.error(err)
      setError("Could not connect to auth service. Make sure Spring Boot is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at top right, #1e2942 0%, #0b0f19 70%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(59, 130, 246, 0.15)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        top: '10%',
        right: '15%'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        background: 'rgba(139, 92, 246, 0.12)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        bottom: '10%',
        left: '10%'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        backgroundColor: 'rgba(21, 29, 48, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center'
      }}>
        {/* Brand/Logo */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '2rem'
        }}>
          <GraduationCap className="brand-accent" size={32} />
          <span>Pal<span className="brand-accent">Academy</span></span>
        </div>

        {success ? (
          <div style={{ padding: '1rem 0' }}>
            <CheckCircle size={56} className="text-success" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Registration Complete!</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              Your {role === 'STUDENT' ? 'student' : 'administrator'} account was created successfully. You can now sign in using your credentials.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', fontWeight: 600 }}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Account</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sign up to configure your operational credentials.</p>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--danger-glow)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                textAlign: 'left'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                    placeholder="e.g. system_admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                    placeholder="e.g. admin@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Register As</label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={18} style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} />
                  <select
                    className="form-control"
                    style={{
                      paddingLeft: '2.5rem',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem',
                      cursor: 'pointer'
                    }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="ADMIN" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Administrator</option>
                    <option value="STUDENT" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Student</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      required
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', height: '44px', fontWeight: 600, marginTop: '0.5rem' }}
              >
                {loading ? 'Processing...' : 'Register'}
              </button>
            </form>

            <div style={{
              marginTop: '1.75rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.25rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Register
