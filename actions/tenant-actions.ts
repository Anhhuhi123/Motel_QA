'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerTenantSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  national_id: z.string().min(9, "National ID must be valid"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email().optional().or(z.literal('')),
  room_id: z.string().uuid("Please select a valid room"),
  start_date: z.string().min(1, "Start date is required"),
  deposit_amount: z.coerce.number().min(0, "Deposit cannot be negative"),
  deposit_status: z.enum(['Paid', 'Partial', 'Pending']),
})

export async function getTenants() {
  const supabase = await createClient()
  
  // We fetch tenants and their related contracts & room assignments
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      contracts (*),
      occupants (*, rooms(number, name))
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function registerTenant(formData: FormData) {
  const payload = {
    full_name: formData.get('full_name'),
    national_id: formData.get('national_id'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    room_id: formData.get('room_id'),
    start_date: formData.get('start_date'),
    deposit_amount: formData.get('deposit_amount'),
    deposit_status: formData.get('deposit_status'),
  }

  const validation = registerTenantSchema.safeParse(payload)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const data = validation.data
  const supabase = await createClient()

  // 1. Insert Tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      full_name: data.full_name,
      national_id: data.national_id,
      phone: data.phone,
      email: data.email || null,
    })
    .select('id')
    .single()

  if (tenantError) return { error: { form: [tenantError.message] } }

  // 2. Insert Contract
  const { error: contractError } = await supabase
    .from('contracts')
    .insert({
      tenant_id: tenant.id,
      room_id: data.room_id,
      start_date: data.start_date,
      deposit_amount: data.deposit_amount,
      deposit_status: data.deposit_status,
      status: 'Active'
    })

  if (contractError) return { error: { form: [contractError.message] } }

  // 3. Insert Occupant record
  const { error: occupantError } = await supabase
    .from('occupants')
    .insert({
      tenant_id: tenant.id,
      room_id: data.room_id,
      is_primary: true
    })
    
  if (occupantError) return { error: { form: [occupantError.message] } }

  // 4. Automatically update room status to Occupied and increment occupant count
  // First get current room
  const { data: roomData } = await supabase.from('rooms').select('current_occupants, max_occupants').eq('id', data.room_id).single()
  
  if (roomData) {
    await supabase.from('rooms').update({
      status: 'Occupied',
      current_occupants: Math.min(roomData.current_occupants + 1, roomData.max_occupants)
    }).eq('id', data.room_id)
  }

  revalidatePath('/tenants')
  revalidatePath('/rooms')
  
  redirect('/tenants')
}

export async function evictTenant(tenantId: string) {
  const supabase = await createClient()

  // This relies on ON DELETE CASCADE in the database to clear contracts and occupants.
  // Real-world scenarios might prefer soft-deletes (updating status to 'Terminated')
  // We'll update the contract status and occupant left_at
  
  await supabase.from('contracts').update({ status: 'Terminated' }).eq('tenant_id', tenantId)
  await supabase.from('occupants').update({ left_at: new Date().toISOString() }).eq('tenant_id', tenantId)

  // Re-calculate room occupants and status if needed could be done here or via DB triggers.

  revalidatePath('/tenants')
  return { success: true }
}
