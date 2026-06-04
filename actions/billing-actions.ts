'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { BillStatus } from '@/types'

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getBills() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bills')
    .select(`
      *,
      room:rooms(number, name, monthly_rent),
      items:bill_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Generate bills for a specific month for all occupied rooms
export async function generateBills(billingMonth: string) {
  const supabase = await createClient()
  
  // 1. Get settings
  const { data: settings } = await supabase.from('settings').select('*').single()
  if (!settings) return { error: "Settings not found. Please configure utility prices." }

  // 2. Get all occupied rooms
  const { data: rooms } = await supabase.from('rooms').select('*').eq('status', 'Occupied')
  if (!rooms || rooms.length === 0) return { error: "No occupied rooms to bill." }

  let generatedCount = 0;

  // 3. Generate bills
  for (const room of rooms) {
    // Check if bill already exists for this month
    const { data: existingBill } = await supabase
      .from('bills')
      .select('id')
      .eq('room_id', room.id)
      .eq('billing_month', billingMonth)
      .single()

    if (existingBill) continue; // Skip if already billed

    // For demonstration, we simulate electricity and water consumption 
    // since meter_readings UI is complex. In production, this would query meter_readings table.
    const elecUsage = Math.floor(100 + Math.random() * 150)
    const waterUsage = Math.floor(5 + Math.random() * 10)
    
    const elecCost = elecUsage * settings.electricity_price
    const waterCost = waterUsage * settings.water_price
    const totalAmount = room.monthly_rent + elecCost + waterCost + settings.internet_fee + settings.garbage_fee

    // Create bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        room_id: room.id,
        billing_month: billingMonth,
        total_amount: totalAmount,
        status: 'Pending'
      })
      .select('id')
      .single()

    if (billError || !bill) continue;

    // Create line items
    const items = [
      { bill_id: bill.id, item_type: 'Rent', amount: room.monthly_rent },
      { bill_id: bill.id, item_type: 'Electricity', amount: elecCost, description: `${elecUsage} kWh` },
      { bill_id: bill.id, item_type: 'Water', amount: waterCost, description: `${waterUsage} m3` },
      { bill_id: bill.id, item_type: 'Internet', amount: settings.internet_fee },
      { bill_id: bill.id, item_type: 'Garbage', amount: settings.garbage_fee },
    ]

    await supabase.from('bill_items').insert(items)
    generatedCount++;
  }

  revalidatePath('/bills')
  return { success: true, count: generatedCount }
}

export async function markBillPaid(billId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bills')
    .update({ 
      status: 'Paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', billId)

  if (error) return { error: error.message }
  
  revalidatePath('/bills')
  return { success: true }
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  
  const payload = {
    electricity_price: formData.get('electricity_price'),
    water_price: formData.get('water_price'),
    internet_fee: formData.get('internet_fee'),
    garbage_fee: formData.get('garbage_fee'),
  }

  // Update first row
  const { data: existing } = await supabase.from('settings').select('id').limit(1).single()
  
  if (existing) {
    await supabase.from('settings').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('settings').insert(payload)
  }

  revalidatePath('/settings')
  return { success: true }
}
