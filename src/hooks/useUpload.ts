'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export const useUpload = () => {
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  const uploadFile = async (file: File, bucket: string = 'recipe-media') => {
    if (!user) {
      throw new Error('Must be logged in to upload files')
    }

    if (!file) {
      throw new Error('No file provided')
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return { url: data.publicUrl, fileName, error: null }
    } catch (error) {
      console.error('Error uploading file:', error)
      return { url: null, fileName: null, error }
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (fileName: string, bucket: string = 'recipe-media') => {
    if (!user) {
      throw new Error('Must be logged in to delete files')
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Error deleting file:', error)
      return { success: false, error }
    }
  }

  return {
    uploadFile,
    deleteFile,
    uploading,
  }
}
