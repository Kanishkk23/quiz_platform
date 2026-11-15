import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseConfig } from '@/lib/supabase'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig()

  if (!isConfigured) {
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname

  // Protected routes that strictly require authentication
  const isProtectedRoute = pathname.startsWith('/profile')

  // Fast path: Only query Supabase remote auth if the route strictly requires protection
  if (!isProtectedRoute) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Middleware session error:', error)
  }

  return supabaseResponse
}
