'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { RoomStatus, CreateRoomInput } from '@/types'

const roomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  name: z.string().min(1, "Room name is required"),
  floor: z.coerce.number().min(1, "Floor must be at least 1"),
  wing: z.string().optional(),
  max_occupants: z.coerce.number().min(1, "Max occupants must be at least 1"),
  monthly_rent: z.coerce.number().min(0, "Rent cannot be negative"),
})

export async function getRooms() {
  const supabase = await createClient()
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .order('number', { ascending: true })

  if (error) throw new Error(error.message)
  return rooms
}

export async function createRoom(formData: FormData) {
  const payload = {
    number: formData.get('number'),
    name: formData.get('name'),
    floor: formData.get('floor'),
    wing: formData.get('wing'),
    max_occupants: formData.get('max_occupants'),
    monthly_rent: formData.get('monthly_rent'),
  }

  const validation = roomSchema.safeParse(payload)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .insert([validation.data])

  if (error) {
    return { error: { form: [error.message] } }
  }

  revalidatePath('/rooms')
  return { success: true }
}

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
  const supabase = await createClient()

  // Business logic: Clear occupants if status goes to Available or Maintenance
  const current_occupants = status === 'Occupied' ? undefined : 0;

  const updateData: any = { status }
  if (current_occupants !== undefined) {
    updateData.current_occupants = current_occupants
  }

  const { error } = await supabase
    .from('rooms')
    .update(updateData)
    .eq('id', roomId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/rooms')
  return { success: true }
}
