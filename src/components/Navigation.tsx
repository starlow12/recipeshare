'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Home, Plus } from 'lucide-react'

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            RecipeGram
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
              <Home className="w-6 h-6" />
            </Link>
            <Link href="/auth/login" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
