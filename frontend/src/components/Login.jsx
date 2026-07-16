import React, { useState } from 'react'
import { GraduationCap, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError("Please complete all credentials.")
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const userData = await response.json()
        onLoginSuccess(userData)
      } else {
        const errData = await response.json()
        setError(errData.message || "Invalid username or password.")
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
      background: 'radial-gradient(circle at top right, #fffbeb 0%, #fefdfa 85%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        width: '320px',
        height: '320px',
        background: 'rgba(253, 224, 71, 0.35)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '10%',
        right: '15%'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '280px',
        height: '280px',
        background: 'rgba(254, 240, 138, 0.25)',
        filter: 'blur(90px)',
        borderRadius: '50%',
        bottom: '10%',
        left: '10%'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.75rem 2.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px) saturate(190%)',
        border: '1px solid rgba(234, 179, 8, 0.25)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 60px rgba(202, 138, 4, 0.15)',
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

        <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Login</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome back.</p>
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
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
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
                placeholder="Enter password"
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', height: '44px', fontWeight: 600 }}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div style={{
          marginTop: '1.75rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Create New User?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Create account
          </button>
        </div>
        </div>
    </div>
  )
}

export default Login
