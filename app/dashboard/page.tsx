import Link from 'next/link'

const links = [
  { href: '/dashboard/upload', label: 'Upload Music' },
  { href: '/dashboard/artists', label: 'Manage Artists' },
  { href: '/dashboard/analytics', label: 'View Analytics' },
  { href: '/dashboard/notifications', label: 'Push Notifications' },
  { href: '/dashboard/subscriptions', label: 'Manage Subscriptions' },
  { href: '/dashboard/publishing', label: 'Schedule Releases' },
  { href: '/dashboard/users', label: 'Manage Users' },
  { href: '/dashboard/merch', label: 'Merch Store Manager' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="p-6 rounded-lg shadow hover:shadow-md bg-white flex items-center justify-center text-center"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
