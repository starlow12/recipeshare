'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { Story } from '@/lib/types'

export const useStories = (userId?: string) => {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchStories()
  }, [userId, user])

  const fetchStories = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error: storiesError } = await query

      if (storiesError) throw storiesError

      setStories(data || [])
    } catch (error) {
      console.error('Error fetching stories:', error)
      setError('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  const createStory = async (storyData: any) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select(`
          *,
          profiles!stories_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setStories(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)

      if (error) throw error

      setStories(prev => prev.filter(story => story.id !== storyId))
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const viewStory = async (storyId: string) => {
    try {
      const { error } = await supabase.rpc('increment_story_views', {
        story_id: storyId
      })

      if (error) throw error

      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, views_count: story.views_count + 1 }
            : story
        )
      )
    } catch (error) {
      console.error('Error viewing story:', error)
    }
  }

  return {
    stories,
    loading,
    error,
    refetch: fetchStories,
    createStory,
    deleteStory,
    viewStory,
  }
}
