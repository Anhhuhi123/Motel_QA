'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getDocumentTemplates() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('document_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function uploadTemplate(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const file = formData.get('file') as File

  if (!file) return { error: "File is required" }

  // 1. Upload file to Supabase Storage bucket 'templates'
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError, data: uploadData } = await supabase
    .storage
    .from('templates')
    .upload(filePath, file)

  if (uploadError) return { error: uploadError.message }

  // Get public URL
  const { data: publicUrlData } = supabase
    .storage
    .from('templates')
    .getPublicUrl(filePath)

  // 2. Insert record into database
  const { error: dbError } = await supabase
    .from('document_templates')
    .insert({
      name,
      category,
      file_url: publicUrlData.publicUrl,
      status: 'Active'
    })

  if (dbError) return { error: dbError.message }

  revalidatePath('/templates')
  return { success: true }
}

export async function generateDocument(templateId: string, tenantId: string, roomId: string) {
  // Stub for docxtemplater & PDF generation logic.
  // In a real implementation:
  // 1. Fetch template from Storage
  // 2. Fetch tenant & room details from Database
  // 3. Process DOCX with docxtemplater to replace placeholders like {{tenant_name}}
  // 4. (Optional) Convert DOCX to PDF using Gotenberg or Puppeteer API
  // 5. Upload generated file to 'contract-files' storage bucket
  // 6. Save reference to 'documents' table.

  // To simulate generation success:
  const supabase = await createClient()

  // Verify the template exists
  const { data: template } = await supabase.from('document_templates').select('*').eq('id', templateId).single()
  if (!template) return { error: 'Template not found' }

  // Fake generation delay and DB insertion
  await new Promise(r => setTimeout(r, 1000))

  const fakeGeneratedUrl = `https://generated-pdf-simulator.com/${tenantId}-${roomId}.pdf`

  const { error } = await supabase
    .from('documents')
    .insert({
      tenant_id: tenantId,
      room_id: roomId,
      template_id: templateId,
      name: `Generated: ${template.name}`,
      file_url: fakeGeneratedUrl,
      document_type: 'Generated PDF'
    })

  if (error) return { error: error.message }
  
  // Note: We don't have a view for /documents yet, but if we did, we'd revalidate it.
  return { success: true, url: fakeGeneratedUrl }
}
