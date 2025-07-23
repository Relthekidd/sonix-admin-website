'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id,user_id,plan,status')
      if (error) show(error.message)
      else setSubs(data || [])
      setLoading(false)
    }
    load()
  }, [show])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', id)
    if (error) show(error.message)
    else show('Status updated')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Subscriptions</h1>
      {loading && <Spinner />}
      {!loading && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">User</th>
              <th className="p-2">Plan</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.user_id}</td>
                <td className="p-2">{s.plan}</td>
                <td className="p-2">
                  <select
                    className="border p-1"
                    value={s.status}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="canceled">canceled</option>
                  </select>
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
