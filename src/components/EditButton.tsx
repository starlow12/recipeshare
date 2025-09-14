'use client'

import React from 'react'
import Link from 'next/link'
import { Edit3 } from 'lucide-react'

interface EditButtonProps {
  recipeId: string
  size?: 'sm' | 'md' | 'lg'
}

export const EditButton: React.FC<EditButtonProps> = ({ recipeId, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const buttonClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  }

  return (
    <Link
      href={`/recipe/edit/${recipeId}`}
      className={`${buttonClasses[size]} rounded-full bg-gray-100 hover:bg-gray-200 transition-colors inline-flex items-center justify-center`}
      title="Edit recipe"
    >
      <Edit3 className={`${sizeClasses[size]} text-gray-600`} />
    </Link>
  )
}
