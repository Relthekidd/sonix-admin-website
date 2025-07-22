'use client'
import Link from 'next/link'

export default function DashboardLayout({children}:{children:React.ReactNode}){
  return (
    <div className="min-h-screen md:flex">
      <nav className="bg-gray-100 p-safe flex gap-4 md:flex-col md:w-48">
        <Link href="/dashboard/users" className="hover:underline">Users</Link>
        <Link href="/dashboard/artists" className="hover:underline">Artists</Link>
        <Link href="/dashboard/analytics" className="hover:underline">Analytics</Link>
        <Link href="/dashboard/notifications" className="hover:underline">Notifications</Link>
        <Link href="/dashboard/publishing" className="hover:underline">Publishing</Link>
        <Link href="/dashboard/merch" className="hover:underline">Merch</Link>
      </nav>
      <main className="flex-1 p-safe">{children}</main>
    </div>
  )
}
