import { getTenants } from '@/actions/tenant-actions'
import TenantClientView from './TenantClientView'

export default async function TenantsPage() {
  const tenants = await getTenants()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tenants Management</h1>
      </div>
      
      <TenantClientView initialTenants={tenants || []} />
    </div>
  )
}
