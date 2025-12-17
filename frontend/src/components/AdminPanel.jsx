import { useState, useEffect } from 'react'
import axios from 'axios'

function AdminPanel({ user, apiBaseUrl }) {
  const [activeTab, setActiveTab] = useState('leaves')
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchLeaveRequests()
    fetchAttendanceRecords()
    fetchUsers()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/api/leaves/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Leave requests fetched:', response.data)
      setLeaveRequests(response.data || [])
    } catch (err) {
      console.error('Error fetching leave requests:', err)
      setMessage({ type: 'error', text: `Failed to fetch leave requests: ${err.message}` })
      setLeaveRequests([])
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/api/attendance/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Attendance records fetched:', response.data)
      setAttendanceRecords(response.data || [])
    } catch (err) {
      console.error('Error fetching attendance records:', err)
      setAttendanceRecords([])
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Users fetched:', response.data)
      setUsers(response.data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([])
    }
  }

  const handleApproveLeave = async (leaveId) => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/api/leaves/approve/${leaveId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Leave approved successfully!' })
      fetchLeaveRequests()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Approval failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleRejectLeave = async (leaveId) => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/api/leaves/reject/${leaveId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Leave rejected successfully!' })
      fetchLeaveRequests()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Rejection failed' })
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
        <div className="flex gap-4 mb-8 border-b-2 border-slate-200 animate-fade-in overflow-x-auto">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
              activeTab === 'leaves'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Leave Approvals
            </span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Attendance Records
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </span>
          </button>
        </div>

        {/* Leave Approvals Tab */}
        {activeTab === 'leaves' && (
          <div className="animate-fade-in">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Pending Leave Requests</h3>
                <div className="px-4 py-2 bg-primary-100 rounded-full">
                  <span className="text-primary-700 font-semibold">{leaveRequests.length} pending</span>
                </div>
              </div>

              {leaveRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Start Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">End Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reason</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map((leave, index) => (
                        <tr key={leave.id} className="table-row hover:bg-primary-50 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{leave.user_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(leave.start_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(leave.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason}</td>
                          <td className="px-6 py-4 text-sm space-x-2 flex">
                            <button
                              onClick={() => handleApproveLeave(leave.id)}
                              disabled={loading}
                              className="btn-success px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectLeave(leave.id)}
                              disabled={loading}
                              className="btn-danger px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 font-medium">No pending leave requests</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Records Tab */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Attendance Records</h3>
                <div className="px-4 py-2 bg-secondary-100 rounded-full">
                  <span className="text-secondary-700 font-semibold">{attendanceRecords.length} records</span>
                </div>
              </div>

              {attendanceRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check-in</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check-out</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record, index) => (
                        <tr key={record.id} className="table-row hover:bg-secondary-50 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.user_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{record.check_in ? new Date(record.check_in).toLocaleTimeString() : '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{record.check_out ? new Date(record.check_out).toLocaleTimeString() : '—'}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`badge badge-${record.check_in && record.check_out ? 'success' : record.check_in ? 'warning' : 'danger'}`}>
                              {record.check_in && record.check_out ? 'Present' : record.check_in ? 'Checked In' : 'Absent'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-slate-500 font-medium">No attendance records</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">All Users</h3>
                <div className="px-4 py-2 bg-green-100 rounded-full">
                  <span className="text-green-700 font-semibold">{users.length} users</span>
                </div>
              </div>

              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, index) => (
                        <tr key={u.id} className="table-row hover:bg-green-50 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`badge badge-${u.role === 'admin' ? 'danger' : 'info'}`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-slate-500 font-medium">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
