'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { Recipe } from '@/lib/types'

export const useRecipes = (userId?: string) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchRecipes()
  }, [userId, user])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('created_by', userId)
      }

      const { data: recipesData, error: recipesError } = await query

      if (recipesError) throw recipesError

      // Check which recipes are liked/saved by current user
      let recipesWithStatus = recipesData || []
      
      if (user && recipesData) {
        const recipeIds = recipesData.map(r => r.id)
        
        const [likesResult, savedResult] = await Promise.all([
          supabase
            .from('likes')
            .select('recipe_id')
            .eq('user_id', user.id)
            .in('recipe_id', recipeIds),
          supabase
            .from('saved_recipes')
            .select('recipe_id')
            .eq('user_id', user.id)
            .in('recipe_id', recipeIds)
        ])

        const likedRecipeIds = new Set(likesResult.data?.map(l => l.recipe_id) || [])
        const savedRecipeIds = new Set(savedResult.data?.map(s => s.recipe_id) || [])

        recipesWithStatus = recipesData.map(recipe => ({
          ...recipe,
          is_liked: likedRecipeIds.has(recipe.id),
          is_saved: savedRecipeIds.has(recipe.id)
        }))
      }

      setRecipes(recipesWithStatus)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setError('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const createRecipe = async (recipeData: any) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipeData)
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setRecipes(prev => [{ ...data, is_liked: false, is_saved: false }, ...prev])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateRecipe = async (recipeId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', recipeId)
        .select(`
          *,
          profiles!recipes_created_by_fkey (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...data, is_liked: recipe.is_liked, is_saved: recipe.is_saved }
            : recipe
        )
      )
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const deleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)

      if (error) throw error

      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  }
}
