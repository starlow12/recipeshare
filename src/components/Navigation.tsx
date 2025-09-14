'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, Home, Plus, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export const Navigation = () => {
  const { user, profile } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            RecipeGram
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Home"
            >
              <Home className="w-6 h-6" />
            </Link>
            
            <Link 
              href="/recipe/create" 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Create Recipe"
            >
              <Plus className="w-6 h-6" />
            </Link>
            
            <Link 
              href="/liked" 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Liked Recipes"
            >
              <Heart className="w-6 h-6" />
            </Link>

            {/* Profile Picture */}
            {profile && (
              <div className="relative group">
                <Link href={`/profile/${profile.username}`}>
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.username}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href={`/profile/${profile.username}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/story/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Create Story
                    </Link>
                    <Link
                      href="/highlight/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Create Highlight
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
