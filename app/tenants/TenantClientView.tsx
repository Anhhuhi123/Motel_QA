'use client'

import { useState } from 'react'
import Link from 'next/link'
import { evictTenant } from '@/actions/tenant-actions'

export default function TenantClientView({ initialTenants }: { initialTenants: any[] }) {
  const [tenants, setTenants] = useState(initialTenants)
  const [searchQuery, setSearchQuery] = useState('')

  const handleEvict = async (tenantId: string) => {
    if (!confirm('Are you sure you want to terminate this tenant contract?')) return

    // Optimistic update
    setTenants(tenants.filter(t => t.id !== tenantId))
    const res = await evictTenant(tenantId)
    
    if (res.error) {
      alert("Failed to evict: " + res.error)
      setTenants(initialTenants)
    }
  }

  const filteredTenants = tenants.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.national_id.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <input 
          type="text" 
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-1 max-w-md"
        />
        <Link 
          href="/tenants/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
        >
          Register New Tenant
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTenants.map((tenant) => {
              // Extract primary occupant room info and latest contract info
              const primaryOccupant = tenant.occupants?.find((o: any) => o.is_primary && !o.left_at)
              const roomAssignment = primaryOccupant?.rooms?.number || 'Unassigned'
              const activeContract = tenant.contracts?.find((c: any) => c.status === 'Active')

              return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {tenant.full_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.full_name}</div>
                        <div className="text-sm text-gray-500">{tenant.national_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.phone}</div>
                    <div className="text-sm text-gray-500">{tenant.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      Room {roomAssignment}
                    </span>
                    {activeContract && (
                      <div className="text-xs text-gray-500 mt-1">
                        Since: {new Date(activeContract.start_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeContract ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${activeContract.deposit_status === 'Paid' ? 'bg-green-100 text-green-800' : 
                          activeContract.deposit_status === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {activeContract.deposit_status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No active contract</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEvict(tenant.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Evict / Terminate
                    </button>
                  </td>
                </tr>
              )
            })}
            
            {filteredTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
