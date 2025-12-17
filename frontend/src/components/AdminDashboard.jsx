import { useState } from 'react'
import AdvancedDashboard from './AdvancedDashboard'
import AdminPanel from './AdminPanel'
import UserManagement from './UserManagement'

function AdminDashboard({ user, apiBaseUrl }) {
  const [activeSection, setActiveSection] = useState('management')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Admin Section Navigation */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveSection('management')}
              className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
                activeSection === 'management'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Leave Management
              </span>
            </button>
            <button
              onClick={() => setActiveSection('users')}
              className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
                activeSection === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Management
              </span>
            </button>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`pb-4 px-4 font-semibold text-lg transition-all duration-300 border-b-4 -mb-2 whitespace-nowrap ${
                activeSection === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics & Reports
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeSection === 'management' ? (
        <AdminPanel user={user} apiBaseUrl={apiBaseUrl} />
      ) : activeSection === 'users' ? (
        <UserManagement user={user} apiBaseUrl={apiBaseUrl} />
      ) : (
        <AdvancedDashboard user={user} apiBaseUrl={apiBaseUrl} />
      )}
    </div>
  )
}

export default AdminDashboard
