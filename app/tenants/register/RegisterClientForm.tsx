'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerTenant } from '@/actions/tenant-actions'
import { Room } from '@/types'

export default function RegisterClientForm({ availableRooms }: { availableRooms: Room[] }) {
  const router = useRouter()
  const [error, setError] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    const result = await registerTenant(formData)
    setIsSubmitting(false)

    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="full_name" required className="mt-1 w-full border p-2 rounded" />
            {error?.full_name && <p className="text-red-500 text-sm mt-1">{error.full_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">National ID (CCCD)</label>
            <input name="national_id" required className="mt-1 w-full border p-2 rounded" />
            {error?.national_id && <p className="text-red-500 text-sm mt-1">{error.national_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input name="phone" required className="mt-1 w-full border p-2 rounded" />
            {error?.phone && <p className="text-red-500 text-sm mt-1">{error.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
            <input name="email" type="email" className="mt-1 w-full border p-2 rounded" />
            {error?.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
          </div>
        </div>

        {/* Contract Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Contract Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Assignment</label>
            <select name="room_id" required className="mt-1 w-full border p-2 rounded bg-white">
              <option value="">Select an available room</option>
              {availableRooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.number} ({r.monthly_rent.toLocaleString()} VND)
                </option>
              ))}
            </select>
            {error?.room_id && <p className="text-red-500 text-sm mt-1">{error.room_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contract Start Date</label>
            <input name="start_date" type="date" required className="mt-1 w-full border p-2 rounded" defaultValue={new Date().toISOString().split('T')[0]} />
            {error?.start_date && <p className="text-red-500 text-sm mt-1">{error.start_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deposit Amount (VND)</label>
            <input name="deposit_amount" type="number" required className="mt-1 w-full border p-2 rounded" />
            {error?.deposit_amount && <p className="text-red-500 text-sm mt-1">{error.deposit_amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deposit Status</label>
            <select name="deposit_status" required className="mt-1 w-full border p-2 rounded bg-white">
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
            {error?.deposit_status && <p className="text-red-500 text-sm mt-1">{error.deposit_status}</p>}
          </div>
        </div>
      </div>

      {error?.form && <div className="text-red-500 bg-red-50 p-3 rounded">{error.form}</div>}

      <div className="flex justify-end gap-4 border-t pt-6">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting || availableRooms.length === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : 'Register & Generate Contract'}
        </button>
      </div>
      
      {availableRooms.length === 0 && (
        <p className="text-orange-500 text-sm text-right mt-2">
          Note: No available rooms to assign. Please free up a room or create a new one first.
        </p>
      )}
    </form>
  )
}
