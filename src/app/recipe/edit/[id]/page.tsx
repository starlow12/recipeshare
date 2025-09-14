'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Plus, X, Upload } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import type { Recipe, Ingredient, Instruction } from '@/lib/types'

const RECIPE_CATEGORIES = [
  'Appetizers',
  'Main Courses', 
  'Desserts',
  'Beverages',
  'Salads',
  'Soups',
  'Snacks',
  'Breakfast',
  'Lunch',
  'Dinner'
]

const EditRecipePage = () => {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user } = useAuth()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [instructions, setInstructions] = useState<Instruction[]>([])
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null)

  useEffect(() => {
    if (recipeId && user) {
      fetchRecipe()
    }
  }, [recipeId, user])

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (error) throw error

      // Check if user owns this recipe
      if (data.created_by !== user!.id) {
        toast.error('You can only edit your own recipes')
        router.push('/')
        return
      }

      setRecipe(data)
      setFormData({
        title: data.title,
        description: data.description || '',
        category: data.category,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        servings: data.servings
      })
      
      setIngredients(data.ingredients as Ingredient[])
      setInstructions(data.instructions as Instruction[])
      setCurrentMediaUrl(data.image_url || data.video_url || null)
      
    } catch (error) {
      console.error('Error fetching recipe:', error)
      toast.error('Failed to load recipe')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or video file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setMediaFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ... (same ingredient and instruction handlers as CreateRecipePage)
  const addIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { id: uuidv4(), quantity: '', type: '', name: '' }
    ])
  }

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id))
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    )
  }

  const addInstruction = () => {
    setInstructions(prev => [
      ...prev,
      { id: uuidv4(), step: prev.length + 1, description: '' }
    ])
  }

  const removeInstruction = (id: string) => {
    setInstructions(prev => {
      const filtered = prev.filter(instruction => instruction.id !== id)
      return filtered.map((instruction, index) => ({
        ...instruction,
        step: index + 1
      }))
    })
  }

  const updateInstruction = (id: string, value: string) => {
    setInstructions(prev =>
      prev.map(instruction =>
        instruction.id === id ? { ...instruction, description: value } : instruction
      )
    )
  }

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile || !user) return null

    try {
      const fileExt = mediaFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('recipe-media')
        .upload(fileName, mediaFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading media:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Recipe title is required')
      return
    }

    if (!formData.category) {
      toast.error('Please select a category')
      return
    }

    const validIngredients = ingredients.filter(ing => 
      ing.quantity.trim() && ing.name.trim()
    )

    if (validIngredients.length === 0) {
      toast.error('At least one ingredient is required')
      return
    }

    const validInstructions = instructions.filter(inst => 
      inst.description.trim()
    )

    if (validInstructions.length === 0) {
      toast.error('At least one instruction is required')
      return
    }

    setUpdating(true)

    try {
      let mediaUrl = currentMediaUrl
      let mediaType = null

      // Upload new media if provided
      if (mediaFile) {
        mediaUrl = await uploadMedia()
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image'
      }

      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        prep_time: formData.prep_time,
        cook_time: formData.cook_time,
        servings: formData.servings,
        ingredients: validIngredients,
        instructions: validInstructions,
        updated_at: new Date().toISOString()
      }

      // Update media fields if new media was uploaded
      if (mediaFile && mediaUrl) {
        if (mediaType === 'video') {
          updateData.video_url = mediaUrl
          updateData.image_url = null
        } else {
          updateData.image_url = mediaUrl
          updateData.video_url = null
        }
      }

      const { error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', recipeId)

      if (error) throw error

      toast.success('Recipe updated successfully!')
      router.push(`/recipe/${recipeId}`)

    } catch (error) {
      console.error('Error updating recipe:', error)
      toast.error('Failed to update recipe')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe not found</h2>
            <p className="text-gray-600">The recipe you're trying to edit doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  // The form JSX is identical to CreateRecipePage, just with different button text
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Edit Recipe</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Same form structure as CreateRecipePage */}
          {/* ... (all form fields) ... */}
          
          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating Recipe...' : 'Update Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRecipePage
