'use client'

import { useState } from 'react'
import { generateBills, markBillPaid } from '@/actions/billing-actions'

export default function BillClientView({ initialBills, settings }: { initialBills: any[], settings: any }) {
  const [bills, setBills] = useState(initialBills)
  const [isGenerating, setIsGenerating] = useState(false)

  // Example month format: YYYY-MM-01
  const currentMonthDate = new Date()
  const defaultMonth = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}-01`
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

  const handleGenerate = async () => {
    if (!settings) {
      alert("Settings not configured yet!")
      return
    }
    
    setIsGenerating(true)
    const res = await generateBills(selectedMonth)
    setIsGenerating(false)

    if (res.error) {
      alert(res.error)
    } else {
      alert(`Successfully generated ${res.count} new bills!`)
      window.location.reload() // Or router.refresh()
    }
  }

  const handleMarkPaid = async (billId: string) => {
    if (!confirm('Mark this bill as Paid?')) return
    
    // Optimistic UI
    setBills(bills.map(b => b.id === billId ? { ...b, status: 'Paid' } : b))
    
    const res = await markBillPaid(billId)
    if (res.error) {
      alert('Failed: ' + res.error)
      setBills(initialBills)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Generate Monthly Invoices</h2>
          <p className="text-sm text-gray-500">Automatically calculates utilities and rent for all occupied rooms.</p>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="date" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-2 rounded"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Bills'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Room {bill.room?.number}</div>
                  <div className="text-sm text-gray-500">{bill.room?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(bill.billing_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {bill.total_amount.toLocaleString()} VND
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                      bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {bill.status !== 'Paid' && (
                    <button 
                      onClick={() => handleMarkPaid(bill.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Mark Paid
                    </button>
                  )}
                  {bill.status === 'Paid' && (
                    <span className="text-gray-400">Settled</span>
                  )}
                </td>
              </tr>
            ))}
            
            {bills.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
