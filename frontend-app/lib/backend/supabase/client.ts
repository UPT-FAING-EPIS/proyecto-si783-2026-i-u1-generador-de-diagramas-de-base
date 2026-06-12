import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // MOCK PARA EVITAR CRASHEOS SI SUPABASE NO ESTÁ CONFIGURADO
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('qnkrdqxuhkkixksxghpv')) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) })
        })
      })
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
