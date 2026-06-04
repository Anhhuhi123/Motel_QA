import { getDashboardStats, getRecentActivities } from '@/actions/dashboard-actions'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const activities = await getRecentActivities(10)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Occupancy Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.occupancyRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalTenants}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Pending Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">{stats.pendingRevenue.toLocaleString()} VND</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.monthlyRevenue.toLocaleString()} VND</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity Log</h2>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activities found.</p>
          ) : (
            activities.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg border-b last:border-0">
                <div className={`p-2 rounded-full 
                  ${log.type === 'payment' ? 'bg-green-100 text-green-600' : 
                    log.type === 'maintenance' ? 'bg-orange-100 text-orange-600' : 
                    log.type === 'tenant' ? 'bg-blue-100 text-blue-600' : 
                    'bg-gray-100 text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{log.user_name}</span> {log.action} <span className="font-semibold">{log.detail}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.created_at).toLocaleString()}
                    {log.amount && ` • Amount: ${log.amount.toLocaleString()} VND`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
