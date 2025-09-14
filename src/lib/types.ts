export interface Recipe {
  id: string
  title: string
  description?: string
  image_url?: string
  category: string
  created_at: string
  likes_count: number
}

export interface Profile {
  id: string
  username: string
  avatar_url?: string
  email: string
}
