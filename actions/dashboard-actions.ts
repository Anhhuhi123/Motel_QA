'use server'

import { createClient } from '@/lib/supabase/server'
import { ActivityLog } from '@/types'

export async function getDashboardStats() {
  const supabase = await createClient()
  
  // Get all rooms to calculate occupancy
  const { data: rooms } = await supabase.from('rooms').select('status')
  const totalRooms = rooms?.length || 0
  const occupiedRooms = rooms?.filter(r => r.status === 'Occupied').length || 0
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // Get total tenants
  const { count: totalTenants } = await supabase.from('tenants').select('*', { count: 'exact', head: true })

  // Get pending bills total amount
  const { data: pendingBills } = await supabase.from('bills').select('total_amount').eq('status', 'Pending')
  const pendingRevenue = pendingBills?.reduce((sum, bill) => sum + Number(bill.total_amount), 0) || 0

  // Get paid bills total amount for the current month
  const currentMonthPrefix = new Date().toISOString().substring(0, 7) // YYYY-MM
  const { data: paidBills } = await supabase.from('bills')
    .select('total_amount')
    .eq('status', 'Paid')
    .like('billing_month', `${currentMonthPrefix}%`)
    
  const monthlyRevenue = paidBills?.reduce((sum, bill) => sum + Number(bill.total_amount), 0) || 0

  return {
    occupancyRate,
    totalTenants: totalTenants || 0,
    pendingRevenue,
    monthlyRevenue
  }
}

export async function getRecentActivities(limit: number = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data as ActivityLog[]
}

// Helper to be used internally by other actions to log events
export async function logActivity(user_name: string, action: string, detail: string, type: string, amount?: number) {
  const supabase = await createClient()
  await supabase.from('activities').insert({
    user_name,
    action,
    detail,
    type,
    amount
  })
}
