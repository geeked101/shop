import { createClient } from '@/lib/supabase'

const BUCKET = 'vendor-assets'

export type UploadResult = {
  success: boolean
  path?: string
  url?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage under the vendor's user ID folder.
 * Returns a signed URL valid for 1 year.
 *
 * Usage:
 *   const result = await uploadVendorFile(file, userId, 'logo')
 *   if (result.success) saveToDb(result.url)
 */
export async function uploadVendorFile(
  file: File,
  userId: string,
  type: 'logo' | 'cert' | 'kra' | 'licence'
): Promise<UploadResult> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${type}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { success: false, error: uploadError.message }

  // Create signed URL valid for 1 year (for admin review)
  const { data, error: urlError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 365 * 24 * 60 * 60)

  if (urlError) return { success: false, error: urlError.message }

  return { success: true, path, url: data.signedUrl }
}

/**
 * Get a fresh signed URL for an existing vendor asset.
 */
export async function getVendorFileUrl(
  userId: string,
  type: 'logo' | 'cert' | 'kra' | 'licence',
  ext = 'jpg'
): Promise<string | null> {
  const supabase = createClient()
  const path = `${userId}/${type}.${ext}`
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600) // 1 hour
  return data?.signedUrl ?? null
}

/**
 * Delete a vendor asset.
 */
export async function deleteVendorFile(userId: string, type: string, ext = 'jpg') {
  const supabase = createClient()
  await supabase.storage.from(BUCKET).remove([`${userId}/${type}.${ext}`])
}
