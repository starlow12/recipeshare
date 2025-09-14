'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Plus, X, Upload } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import type { Ingredient, Instruction } from '@/lib/types'

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

const CreateRecipePage = () => {
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uuidv4(), quantity: '', type: '', name: '' }
  ])

  const [instructions, setInstructions] = useState<Instruction[]>([
    { id: uuidv4(), step: 1, description: '' }
  ])

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or video file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setMediaFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

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
      // Reorder steps
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

    if (!user) {
      toast.error('Please sign in to create recipes')
      return
    }

    // Validation
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

    setUploading(true)

    try {
      // Upload media if present
      let mediaUrl = null
      let mediaType = null

      if (mediaFile) {
        mediaUrl = await uploadMedia()
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image'
      }

      // Create recipe
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        prep_time: formData.prep_time,
        cook_time: formData.cook_time,
        servings: formData.servings,
        ingredients: validIngredients,
        instructions: validInstructions,
        created_by: user.id,
        [mediaType === 'video' ? 'video_url' : 'image_url']: mediaUrl
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert(recipeData)
        .select()
        .single()

      if (error) throw error

      toast.success('Recipe created successfully!')
      router.push(`/recipe/${data.id}`)

    } catch (error) {
      console.error('Error creating recipe:', error)
      toast.error('Failed to create recipe')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Create Recipe</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipe Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter recipe title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image/Video
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {mediaPreview ? (
                <div className="relative">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video
                      src={mediaPreview}
                      className="max-h-64 mx-auto rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Recipe preview"
                      className="max-h-64 mx-auto rounded-lg object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null)
                      setMediaPreview(null)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload image or video</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your recipe..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {RECIPE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Time and Servings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.prep_time}
                onChange={(e) => handleInputChange('prep_time', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cook_time}
                onChange={(e) => handleInputChange('cook_time', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Ingredients *
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Unit/Type"
                    value={ingredient.type}
                    onChange={(e) => updateIngredient(ingredient.id, 'type', e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Instructions *
              </label>
              <button
                type="button"
                onClick={addInstruction}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={instruction.id} className="flex space-x-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                    {instruction.step}
                  </div>
                  <textarea
                    placeholder={`Step ${instruction.step} instructions...`}
                    value={instruction.description}
                    onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(instruction.id)}
                      className="text-red-500 hover:text-red-700 px-2 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Creating Recipe...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRecipePage
