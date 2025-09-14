'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const AuthSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to RecipeGram!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully signed up. You can now log in to your account.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AuthSuccessPage
