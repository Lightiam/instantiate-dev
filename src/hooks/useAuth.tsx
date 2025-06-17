
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Setting up auth state listener...")
    
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log("Development mode: auto-authenticating user")
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@example.com',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: { full_name: 'Development User' },
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      }
      
      setUser(mockUser as any)
      setSession({
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser as any
      } as any)
      setLoading(false)
      return
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      console.log("Cleaning up auth subscription")
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("SignIn called for:", email)
    
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log("Development mode: bypassing authentication")
      const mockUser = {
        id: 'dev-user-123',
        email: email,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: { full_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      }
      
      setUser(mockUser as any)
      setSession({
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser as any
      } as any)
      setLoading(false)
      
      console.log("SignIn result: Success (Development Mode)")
      return { error: null }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log("SignIn result:", error ? "Error" : "Success")
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log("SignUp called for:", email)
    const redirectUrl = `${window.location.origin}/`
    
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log("Development mode: bypassing email confirmation")
      const mockUser = {
        id: 'dev-user-123',
        email: email,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: { full_name: fullName || 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      }
      
      setUser(mockUser as any)
      setSession({
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser as any
      } as any)
      setLoading(false)
      
      return { error: null }
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined
      }
    })
    console.log("SignUp result:", error ? "Error" : "Success")
    return { error }
  }

  const signOut = async () => {
    console.log("SignOut called")
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
