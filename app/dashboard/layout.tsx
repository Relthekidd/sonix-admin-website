'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

export default function DashboardLayout({children}:{children:React.ReactNode}){
  const router = useRouter()
  const { user, loading } = useAuth()

  if (!loading && !user) {
    router.replace('/login')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen md:flex">
      <nav className="bg-gray-100 p-safe flex gap-4 md:flex-col md:w-48">
        <Link href="/dashboard/upload" className="hover:underline">Upload Music</Link>
        <Link href="/dashboard/artists" className="hover:underline">Artists</Link>
        <Link href="/dashboard/analytics" className="hover:underline">Analytics</Link>
        <Link href="/dashboard/notifications" className="hover:underline">Notifications</Link>
        <Link href="/dashboard/subscriptions" className="hover:underline">Subscriptions</Link>
        <Link href="/dashboard/publishing" className="hover:underline">Releases</Link>
        <Link href="/dashboard/users" className="hover:underline">Users</Link>
        <Link href="/dashboard/merch" className="hover:underline">Merch</Link>
        <button onClick={signOut} className="text-left hover:underline">Sign out</button>
      </nav>
      <main className="flex-1 p-safe">{children}</main>
    </div>
  )
}
