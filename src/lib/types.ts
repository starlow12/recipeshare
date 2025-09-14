export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          email: string
          full_name: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          email: string
          full_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          email?: string
          full_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          video_url: string | null
          category: string
          prep_time: number
          cook_time: number
          servings: number
          ingredients: Json
          instructions: Json
          created_by: string
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          category: string
          prep_time: number
          cook_time: number
          servings: number
          ingredients: Json
          instructions: Json
          created_by: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          category?: string
          prep_time?: number
          cook_time?: number
          servings?: number
          ingredients?: Json
          instructions?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string
          media_url: string
          media_type: 'image' | 'video'
          text_overlay: string | null
          recipe_id: string | null
          created_at: string
          expires_at: string
          views_count: number
        }
        Insert: {
          id?: string
          user_id: string
          media_url: string
          media_type: 'image' | 'video'
          text_overlay?: string | null
          recipe_id?: string | null
          created_at?: string
          expires_at?: string
          views_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          media_url?: string
          media_type?: 'image' | 'video'
          text_overlay?: string | null
          recipe_id?: string | null
          created_at?: string
          expires_at?: string
          views_count?: number
        }
      }
      highlights: {
        Row: {
          id: string
          user_id: string
          title: string
          cover_image: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          cover_image: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          cover_image?: string
          created_at?: string
          updated_at?: string
        }
      }
      highlight_stories: {
        Row: {
          id: string
          highlight_id: string
          story_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          highlight_id: string
          story_id: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          highlight_id?: string
          story_id?: string
          order_index?: number
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Recipe types
export interface Recipe {
  id: string
  title: string
  description?: string
  image_url?: string
  video_url?: string
  category: string
  prep_time: number
  cook_time: number
  servings: number
  ingredients: Ingredient[]
  instructions: Instruction[]
  created_by: string
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  profiles?: {
    username: string
    avatar_url?: string
  }
  is_liked?: boolean
  is_saved?: boolean
}

export interface Ingredient {
  id: string
  quantity: string
  type: string
  name: string
}

export interface Instruction {
  id: string
  step: number
  description: string
}

export interface Profile {
  id: string
  username: string
  avatar_url?: string
  email: string
  full_name?: string
  bio?: string
  created_at: string
  updated_at: string
  followers_count?: number
  following_count?: number
  is_following?: boolean
}

export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  text_overlay?: string
  recipe_id?: string
  created_at: string
  expires_at: string
  views_count: number
  profiles?: {
    username: string
    avatar_url?: string
  }
}

export interface Highlight {
  id: string
  user_id: string
  title: string
  cover_image: string
  created_at: string
  updated_at: string
  stories?: Story[]
}
