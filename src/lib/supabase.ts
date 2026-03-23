import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getOrCreateUser(email: string) {
  // In a real application, you might use Supabase Admin API or standard auth
  // This is a placeholder for the mock call in the route
  return { id: 'mock-user-id', email };
}

export async function logScanExecution(userId: string, sector: string, location: string) {
  // Replace with actual Supabase insert if needed
  return { success: true, userId, sector, location };
}
