'use client'

import { useState } from 'react'
import { Room, RoomStatus } from '@/types'
import { createRoom, updateRoomStatus } from '@/actions/room-actions'

export default function RoomClientView({ initialRooms }: { initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    // Optimistic update
    setRooms(rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r))
    const res = await updateRoomStatus(roomId, newStatus)
    if (res.error) {
      alert("Failed to update status: " + res.error)
      // Revert if error
      setRooms(initialRooms)
    }
  }

  const handleAddSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    const result = await createRoom(formData)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsAdding(false)
      window.location.reload() // Or rely on router.refresh() if hooked up
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isAdding ? 'Cancel' : 'Add New Room'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow border mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Room</h2>
          <form action={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Room Number</label>
                <input name="number" required className="w-full border p-2 rounded" />
                {error?.number && <p className="text-red-500 text-sm">{error.number}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600">Room Name</label>
                <input name="name" required className="w-full border p-2 rounded" placeholder="e.g. Standard Studio" />
                {error?.name && <p className="text-red-500 text-sm">{error.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600">Floor</label>
                <input name="floor" type="number" required className="w-full border p-2 rounded" />
                {error?.floor && <p className="text-red-500 text-sm">{error.floor}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600">Wing</label>
                <input name="wing" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Max Occupants</label>
                <input name="max_occupants" type="number" required className="w-full border p-2 rounded" />
                {error?.max_occupants && <p className="text-red-500 text-sm">{error.max_occupants}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600">Monthly Rent (VND)</label>
                <input name="monthly_rent" type="number" required className="w-full border p-2 rounded" />
                {error?.monthly_rent && <p className="text-red-500 text-sm">{error.monthly_rent}</p>}
              </div>
            </div>
            
            {error?.form && <p className="text-red-500 text-sm">{error.form}</p>}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Room'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Room {room.number}</h3>
                <p className="text-gray-500">{room.name} • Floor {room.floor}</p>
              </div>
              <select 
                value={room.status}
                onChange={(e) => handleStatusChange(room.id, e.target.value as RoomStatus)}
                className={`text-sm rounded-full px-3 py-1 border outline-none cursor-pointer
                  ${room.status === 'Occupied' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    room.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 
                    'bg-orange-50 text-orange-700 border-orange-200'}`}
              >
                <option value="Occupied">Occupied</option>
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Occupants:</span>
                <span className="font-medium">{room.current_occupants} / {room.max_occupants}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rent:</span>
                <span className="font-medium text-blue-600">{room.monthly_rent.toLocaleString()} VND</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
