import { getDocumentTemplates } from '@/actions/document-actions'
import TemplateClientView from './TemplateClientView'

export default async function TemplatesPage() {
  const templates = await getDocumentTemplates()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
      </div>
      
      <TemplateClientView initialTemplates={templates || []} />
    </div>
  )
}
