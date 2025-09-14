'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { Profile } from '@/lib/types'

export const useFollow = () => {
  const { user } = useAuth()

  const followUser = async (targetUserId: string) => {
    if (!user) {
      throw new Error('Must be logged in to follow users')
    }

    if (user.id === targetUserId) {
      throw new Error("You can't follow yourself")
    }

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error following user:', error)
      throw error
    }
  }

  const unfollowUser = async (targetUserId: string) => {
    if (!user) {
      throw new Error('Must be logged in to unfollow users')
    }

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  }

  const getFollowers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(follow => ({
        ...follow.profiles,
        is_following: false // We'll check this separately if needed
      })) || []
    } catch (error) {
      console.error('Error fetching followers:', error)
      throw error
    }
  }

  const getFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(follow => ({
        ...follow.profiles,
        is_following: true
      })) || []
    } catch (error) {
      console.error('Error fetching following:', error)
      throw error
    }
  }

  const isFollowing = async (targetUserId: string) => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  }

  const getFollowCounts = async (userId: string) => {
    try {
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', userId)
      ])

      return {
        followers: followersResult.count || 0,
        following: followingResult.count || 0
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error)
      return { followers: 0, following: 0 }
    }
  }

  return {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    getFollowCounts,
  }
}
