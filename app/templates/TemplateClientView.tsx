'use client'

import { useState } from 'react'
import { uploadTemplate } from '@/actions/document-actions'
import { DocumentTemplate } from '@/types'

export default function TemplateClientView({ initialTemplates }: { initialTemplates: DocumentTemplate[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    setError(null)
    
    const res = await uploadTemplate(formData)
    
    setIsUploading(false)
    if (res.error) {
      setError(res.error)
    } else {
      setIsAdding(false)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isAdding ? 'Cancel' : 'Upload New Template'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Document Template (.docx)</h2>
          <form action={handleUpload} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <input name="name" required className="mt-1 w-full border p-2 rounded" placeholder="e.g. Standard Lease Agreement" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" required className="mt-1 w-full border p-2 rounded bg-white">
                <option value="Rental">Rental Agreement</option>
                <option value="Residence">Residence Registration</option>
                <option value="Handover">Asset Handover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File (.docx)</label>
              <input name="file" type="file" accept=".docx" required className="mt-1 w-full border p-2 rounded" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button 
              type="submit" 
              disabled={isUploading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Template'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialTemplates.map(template => (
          <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {template.category}
                </span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${template.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {template.status}
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t flex justify-between items-center">
              <a 
                href={template.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Download DOCX
              </a>
              <button 
                onClick={() => alert("Simulation: Document Generation triggered!")}
                className="text-gray-500 hover:text-gray-900 text-sm"
              >
                Test Generate
              </button>
            </div>
          </div>
        ))}

        {initialTemplates.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
            No document templates uploaded yet.
          </div>
        )}
      </div>
    </div>
  )
}
