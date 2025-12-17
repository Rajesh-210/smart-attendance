import { useState, useEffect } from 'react'
import axios from 'axios'

function AdvancedDashboard({ user, apiBaseUrl }) {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [performance, setPerformance] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, chartRes, perfRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/dashboard/stats`, { headers }),
        axios.get(`${apiBaseUrl}/api/dashboard/attendance-chart?days=7`, { headers }),
        axios.get(`${apiBaseUrl}/api/dashboard/employee-performance`, { headers })
      ])

      setStats(statsRes.data)
      setChartData(chartRes.data)
      setPerformance(perfRes.data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600">Welcome back, {user.name}! Here's your attendance overview.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b-2 border-slate-200 animate-slide-in-down overflow-x-auto">
          {['overview', 'charts', 'performance', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="animate-fade-in space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="card animate-slide-in-left hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-primary-600 transition-colors">Total Users</h3>
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.total_users}</p>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded">{stats.total_employees} Employees</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">{stats.total_admins} Admins</span>
                </div>
              </div>

              {/* Present Today */}
              <div className="card animate-slide-in-up hover:shadow-2xl transition-all duration-300 group" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-green-600 transition-colors">Present Today</h3>
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.today.present}</p>
                <p className="text-xs text-green-600 font-medium">
                  {Math.round((stats.today.present / stats.total_employees) * 100)}% attendance rate
                </p>
              </div>

              {/* Absent Today */}
              <div className="card animate-slide-in-down hover:shadow-2xl transition-all duration-300 group" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-red-600 transition-colors">Absent Today</h3>
                  <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.today.absent}</p>
                <p className="text-xs text-red-600 font-medium">
                  {Math.round((stats.today.absent / stats.total_employees) * 100)}% absence rate
                </p>
              </div>

              {/* Pending Leaves */}
              <div className="card animate-slide-in-right hover:shadow-2xl transition-all duration-300 group" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 group-hover:text-yellow-600 transition-colors">Pending Leaves</h3>
                  <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000-2H6a6 6 0 016 6v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.leaves.pending}</p>
                <p className="text-xs text-yellow-600 font-medium">Awaiting approval</p>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="card animate-slide-in-up">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Department Attendance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.departments).map(([dept, data], idx) => (
                  <div
                    key={dept}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <p className="text-sm font-semibold text-slate-700 mb-3">{dept}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{data.present}</p>
                        <p className="text-xs text-slate-500">of {data.total} present</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {Math.round((data.present / data.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="animate-fade-in">
            <div className="card">
              <h3 className="text-xl font-bold text-slate-800 mb-6">7-Day Attendance Trend</h3>
              <div className="space-y-4">
                {chartData.map((day, idx) => (
                  <div key={day.date} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{new Date(day.date).toLocaleDateString()}</span>
                      <span className="text-xs text-slate-500">{day.present} Present • {day.absent} Absent</span>
                    </div>
                    <div className="flex gap-2 h-8">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all duration-300 hover:shadow-lg"
                        style={{ width: `${(day.present / 20) * 100}%` }}
                        title={`Present: ${day.present}`}
                      ></div>
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg transition-all duration-300 hover:shadow-lg"
                        style={{ width: `${(day.absent / 20) * 100}%` }}
                        title={`Absent: ${day.absent}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="animate-fade-in">
            <div className="card">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Employee Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Attendance Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Present Days</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Leaves</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.map((emp, idx) => (
                      <tr key={emp.user_id} className="table-row hover:bg-primary-50 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{emp.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{emp.department}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                                style={{ width: `${emp.attendance_rate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{emp.attendance_rate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{emp.present_days}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="badge badge-info">{emp.approved_leaves} Approved</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Leave Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-900">Pending Approvals</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.leaves.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-green-900">Approved</span>
                    <span className="text-2xl font-bold text-green-600">{stats.leaves.approved}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-medium text-red-900">Rejected</span>
                    <span className="text-2xl font-bold text-red-600">{stats.leaves.rejected}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-slate-800 mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-sm font-medium text-purple-900">Total Records</span>
                    <span className="text-2xl font-bold text-purple-600">{stats.this_month.total_records}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <span className="text-sm font-medium text-indigo-900">Unique Employees</span>
                    <span className="text-2xl font-bold text-indigo-600">{stats.this_month.unique_employees}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedDashboard
