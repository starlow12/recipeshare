import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types'

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
