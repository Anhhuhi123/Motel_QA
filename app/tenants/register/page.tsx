import { getRooms } from '@/actions/room-actions'
import RegisterClientForm from './RegisterClientForm'

export default async function RegisterTenantPage() {
  // Fetch only Available rooms for new tenant assignment
  const allRooms = await getRooms()
  const availableRooms = allRooms.filter(r => r.status === 'Available')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Register New Tenant</h1>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
        <RegisterClientForm availableRooms={availableRooms} />
      </div>
    </div>
  )
}
