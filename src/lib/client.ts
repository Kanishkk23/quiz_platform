import { createBrowserClient } from '@supabase/ssr'
import { createNoopSupabaseClient, getSupabaseConfig } from '@/lib/supabase'

export function createClient() {
  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig()

  if (!isConfigured) {
    return createNoopSupabaseClient()
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
