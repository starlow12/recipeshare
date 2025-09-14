import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/types'

export const supabase = createClientComponentClient<Database>()
