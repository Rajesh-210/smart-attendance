import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ user, apiBaseUrl }) {
  const [activeTab, setActiveTab] = useState('attendance')
  const [attendanceData, setAttendanceData] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [leaveForm, setLeaveForm] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [showLeaveForm, setShowLeaveForm] = useState(false)

  useEffect(() => {
    fetchAttendanceData()
    fetchLeaveRequests()
    fetchAttendanceHistory()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/api/attendance/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAttendanceData(response.data)
    } catch (err) {
      console.error('Error fetching attendance data:', err)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/api/leaves/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeaveRequests(response.data)
    } catch (err) {
      console.error('Error fetching leave requests:', err)
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/api/attendance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userHistory = response.data.filter(record => record.user_id === user.id)
      setAttendanceHistory(userHistory)
    } catch (err) {
      console.error('Error fetching attendance history:', err)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/api/attendance/check-in`,
        { user_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Checked in successfully!' })
      fetchAttendanceData()
      fetchAttendanceHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Check-in failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/api/attendance/check-out`,
        { user_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Checked out successfully!' })
      fetchAttendanceData()
      fetchAttendanceHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Check-out failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/api/leaves/request`,
        {
          user_id: user.id,
          ...leaveForm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' })
      setLeaveForm({ start_date: '', end_date: '', reason: '' })
      fetchLeaveRequests()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Leave request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Message Alerts */}
        {message && (
          <div className={`alert alert-${message.type} mb-6 animate-slide-in-down`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b-2 border-slate-200 animate-fade-in">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 ${
              activeTab === 'attendance'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Attendance
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 ${
              activeTab === 'leaves'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Leave Requests
            </span>
          </button>
        </div>

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Attendance Card */}
              <div className="card animate-slide-in-left">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Today's Attendance</h3>
                  <div className="p-3 bg-primary-100 rounded-full">
                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V9.5m-11-4h6m-6 4h6m-6 4h6m4.5-13v6m3-3h-6" />
                    </svg>
                  </div>
                </div>

                {attendanceData ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-shadow">
                        <p className="text-sm font-medium text-green-700 mb-2">Check-in Time</p>
                        <p className="text-2xl font-bold text-green-900">
                          {attendanceData.check_in ? new Date(attendanceData.check_in).toLocaleTimeString() : '—'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-shadow">
                        <p className="text-sm font-medium text-blue-700 mb-2">Check-out Time</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {attendanceData.check_out ? new Date(attendanceData.check_out).toLocaleTimeString() : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCheckIn}
                        disabled={loading || attendanceData.check_in}
                        className="flex-1 btn-success flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Check In
                      </button>
                      <button
                        onClick={handleCheckOut}
                        disabled={loading || !attendanceData.check_in || attendanceData.check_out}
                        className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Check Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>

              {/* Attendance Summary Card */}
              <div className="card animate-slide-in-right">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Summary</h3>
                  <div className="p-3 bg-secondary-100 rounded-full">
                    <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-sm font-medium text-green-700">Present Days</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">
                        {attendanceHistory.filter(record => record.check_in && record.check_out).length}
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-sm font-medium text-red-700">Absent Days</p>
                      <p className="text-3xl font-bold text-red-900 mt-1">
                        {attendanceHistory.filter(record => !record.check_in).length}
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests Tab */}
        {activeTab === 'leaves' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leave Request Form */}
              <div className="lg:col-span-1 card animate-slide-in-left">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request Leave
                </h3>

                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="start_date" className="form-label">Start Date</label>
                    <input
                      id="start_date"
                      type="date"
                      value={leaveForm.start_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_date" className="form-label">End Date</label>
                    <input
                      id="end_date"
                      type="date"
                      value={leaveForm.end_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason" className="form-label">Reason</label>
                    <textarea
                      id="reason"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      required
                      placeholder="Enter reason for leave..."
                      className="form-input resize-none min-h-24"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Leave Requests List */}
              <div className="lg:col-span-2 card animate-slide-in-right">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Leave Requests
                </h3>

                {leaveRequests.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {leaveRequests.map((leave, index) => (
                      <div key={leave.id} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{leave.reason}</p>
                          </div>
                          <span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'pending'}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-500 font-medium">No leave requests yet</p>
                    <p className="text-slate-400 text-sm mt-1">Submit your first leave request above</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
