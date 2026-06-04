import { getRooms } from '@/actions/room-actions'
import { Room } from '@/types'
import RoomClientView from './RoomClientView'

export default async function RoomsPage() {
  const rooms: Room[] = await getRooms()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
      </div>
      
      <RoomClientView initialRooms={rooms} />
    </div>
  )
}
