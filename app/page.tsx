import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href="/dashboard" className="text-blue-600 underline">
        Go to Admin Dashboard
      </Link>
    </div>
  )
}
