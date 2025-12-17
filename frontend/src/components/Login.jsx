import { useState } from 'react'
import axios from 'axios'

function Login({ onLogin, apiBaseUrl }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
        email,
        password
      })

      const { token, user } = response.data
      onLogin(user, token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-500 to-primary-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <form className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-scale-in" onSubmit={handleSubmit}>
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Smart Attendance
          </h1>
          <p className="text-slate-500 text-sm mt-2">Manage attendance with ease</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6 flex items-center gap-3 animate-shake">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div className="form-group animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="email" className="form-label">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email Address
              </span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="password" className="form-label">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Password
              </span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mb-6 flex items-center justify-center gap-2 animate-slide-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </>
          )}
        </button>

        {/* Demo Credentials */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            Demo Credentials
          </p>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between items-center p-2 bg-white rounded hover:bg-slate-50 transition-colors">
              <span className="font-medium">Admin:</span>
              <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">admin@example.com</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded hover:bg-slate-50 transition-colors">
              <span className="font-medium">Employee:</span>
              <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">emp@example.com</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded hover:bg-slate-50 transition-colors">
              <span className="font-medium">Password:</span>
              <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">password</code>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
