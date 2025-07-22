'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface Item {
  id: string
  title: string
  scheduled_publish_at: string | null
}

export default function PublishingPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id,title,scheduled_publish_at')
      if (error) show(error.message)
      else setItems(data || [])
      setLoading(false)
    }
    load()
  }, [show])

  const update = async (id: string, date: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('tracks')
      .update({ scheduled_publish_at: date || null })
      .eq('id', id)
    if (error) show(error.message)
    else show('Updated')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Timed Publishing</h1>
      {loading && <Spinner />}
      {!loading && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Title</th>
              <th className="p-2">Publish at</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.title}</td>
                <td className="p-2">
                  <input
                    type="datetime-local"
                    className="border p-1"
                    value={i.scheduled_publish_at?.slice(0,16) || ''}
                    onChange={(e) => update(i.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Toast />
    </div>
  )
}
