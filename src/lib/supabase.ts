export function getSupabaseConfig() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const supabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim()

  const looksLikePlaceholder = (value: string) => {
    const normalized = value.toLowerCase()
    return (
      normalized.length === 0 ||
      normalized.includes('your-project-ref') ||
      normalized.includes('your-anon-key') ||
      normalized.includes('your-service-role-key') ||
      normalized.includes('example.supabase.co') ||
      normalized.includes('replace-me') ||
      normalized.includes('changeme') ||
      normalized.includes('placeholder')
    )
  }

  const isConfigured = Boolean(supabaseUrl && supabaseKey && !looksLikePlaceholder(supabaseUrl) && !looksLikePlaceholder(supabaseKey))

  return {
    supabaseUrl,
    supabaseKey,
    isConfigured,
  }
}

export function createNoopSupabaseClient() {
  const emptyResult = { data: null, error: null }

  const chain = () => ({
    ...emptyResult,
    select() {
      return this
    },
    eq() {
      return this
    },
    order() {
      return this
    },
    limit() {
      return this
    },
    single() {
      return { data: null, error: null }
    },
    maybeSingle() {
      return { data: null, error: null }
    },
  })

  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null }
      },
      async getUser() {
        return { data: { user: null }, error: null }
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        }
      },
      async signInWithPassword() {
        return {
          data: { user: null, session: null },
          error: { message: 'Supabase is not configured yet.' },
        }
      },
      async signUp() {
        return {
          data: { user: null, session: null },
          error: { message: 'Supabase is not configured yet.' },
        }
      },
      async resetPasswordForEmail() {
        return { error: { message: 'Supabase is not configured yet.' } }
      },
      async updateUser() {
        return { error: { message: 'Supabase is not configured yet.' } }
      },
      async signInWithOAuth() {
        return { error: { message: 'Supabase is not configured yet.' } }
      },
      async signOut() {
        return { error: null }
      },
    },
    from() {
      return {
        data: [],
        error: null,
        select() {
          return this
        },
        eq() {
          return this
        },
        order() {
          return this
        },
        limit() {
          return this
        },
        single() {
          return { data: null, error: null }
        },
        maybeSingle() {
          return { data: null, error: null }
        },
      }
    },
    rpc() {
      return Promise.resolve({ data: null, error: null })
    },
    channel() {
      return {
        on() {
          return this
        },
        subscribe() {
          return { unsubscribe() {} }
        },
      }
    },
    removeChannel() {
      return undefined
    },
  } as any
}
