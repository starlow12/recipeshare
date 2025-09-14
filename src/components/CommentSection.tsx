'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Send, MoreHorizontal, Trash2, Edit3, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  recipe_id: string
  profiles: {
    username: string
    avatar_url?: string
    full_name?: string
  }
}

interface CommentSectionProps {
  recipeId: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({ recipeId }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchComments()
  }, [recipeId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          recipe_id: recipeId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles!comments_user_id_fkey (
            username,
            avatar_url,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setComments(prev => [data, ...prev])
      setNewComment('')
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          profiles!comments_user_id_fkey (
            username,
            avatar_url,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? data : comment
        )
      )
      setEditingComment(null)
      setEditContent('')
      toast.success('Comment updated!')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(prev => prev.filter(comment => comment.id !== commentId))
      toast.success('Comment deleted!')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60))
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <MessageCircle className="w-5 h-5" />
        <span>Comments ({comments.length})</span>
      </h3>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              {user && (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
          <Link
            href="/auth/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <Link href={`/profile/${comment.profiles.username}`}>
                  {comment.profiles.avatar_url ? (
                    <Image
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </Link>
              </div>

              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/profile/${comment.profiles.username}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {comment.profiles.full_name || `@${comment.profiles.username}`}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                        {comment.created_at !== comment.updated_at && ' (edited)'}
                      </span>
                    </div>

                    {user && user.id === comment.user_id && (
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <button
                            onClick={() => startEdit(comment)}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 space-x-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
