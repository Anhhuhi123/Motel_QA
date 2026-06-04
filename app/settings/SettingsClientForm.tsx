'use client'

import { useState } from 'react'
import { updateSettings } from '@/actions/billing-actions'

export default function SettingsClientForm({ initialSettings }: { initialSettings: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setMessage('')
    
    const res = await updateSettings(formData)
    
    setIsSubmitting(false)
    if (res.error) {
      setMessage(`Error: ${res.error}`)
    } else {
      setMessage('Settings updated successfully!')
    }
  }

  // Default values in case table is empty initially
  const defaultSettings = initialSettings || {
    electricity_price: 3500,
    water_price: 15000,
    internet_fee: 100000,
    garbage_fee: 50000,
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Electricity Price (VND/kWh)</label>
          <input 
            name="electricity_price" 
            type="number" 
            required 
            defaultValue={defaultSettings.electricity_price}
            className="mt-1 w-full border p-2 rounded" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Water Price (VND/m3)</label>
          <input 
            name="water_price" 
            type="number" 
            required 
            defaultValue={defaultSettings.water_price}
            className="mt-1 w-full border p-2 rounded" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Internet Fee (VND/month)</label>
          <input 
            name="internet_fee" 
            type="number" 
            required 
            defaultValue={defaultSettings.internet_fee}
            className="mt-1 w-full border p-2 rounded" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Garbage Fee (VND/month)</label>
          <input 
            name="garbage_fee" 
            type="number" 
            required 
            defaultValue={defaultSettings.garbage_fee}
            className="mt-1 w-full border p-2 rounded" 
          />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
