'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface Notification {
  id: string
  title: string
  message: string
  send_at: string | null
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sendAt, setSendAt] = useState('')
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id,title,message,send_at')
        .order('created_at', { ascending: false })
      if (error) show(error.message)
      else setNotifs(data || [])
      setLoading(false)
    }
    load()
  }, [show])

  const createNotif = async () => {
    const payload: { title: string; message: string; send_at?: string } = {
      title,
      message,
    }
    if (sendAt) payload.send_at = sendAt
    const { error } = await supabase.from('notifications').insert(payload)
    if (error) show(error.message)
    else show('Notification scheduled')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Push Notifications</h1>
      <div className="space-y-2 border p-2 rounded">
        <input
          className="border p-1 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-1 w-full"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          className="border p-1 w-full"
          type="datetime-local"
          value={sendAt}
          onChange={(e) => setSendAt(e.target.value)}
        />
        <button className="bg-black text-white px-3 py-1 rounded" onClick={createNotif}>
          Send / Schedule
        </button>
      </div>
      {loading && <Spinner />}
      {!loading && (
        <ul className="list-disc list-inside">
          {notifs.map((n) => (
            <li key={n.id}>{n.title} – {n.send_at ?? 'instant'}</li>
          ))}
        </ul>
      )}
      <Toast />
    </div>
  )
}
