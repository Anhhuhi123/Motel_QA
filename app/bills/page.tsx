import { getBills, getSettings } from '@/actions/billing-actions'
import BillClientView from './BillClientView'

export default async function BillsPage() {
  const bills = await getBills()
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Utility & Rent Bills</h1>
      </div>
      
      <BillClientView initialBills={bills || []} settings={settings} />
    </div>
  )
}
