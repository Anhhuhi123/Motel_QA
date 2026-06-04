import { getSettings } from '@/actions/billing-actions'
import SettingsClientForm from './SettingsClientForm'

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Utility Settings</h1>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
        <SettingsClientForm initialSettings={settings} />
      </div>
    </div>
  )
}
