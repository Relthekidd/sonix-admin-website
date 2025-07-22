'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface User {
  id: string
  email: string
  role: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('users').select('id,email,role')
      if (error) {
        show(error.message)
      } else {
        setUsers(data || [])
      }
      setLoading(false)
    }
    load()
  }, [show])

  const updateRole = async (id: string, role: string) => {
    setLoading(true)
    const { error } = await supabase.from('users').update({ role }).eq('id', id)
    if (error) show(error.message)
    else show('Role updated')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">User Management</h1>
      {loading && <Spinner />}
      {!loading && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    className="border p-1"
                    value={u.role || ''}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="">user</option>
                    <option value="admin">admin</option>
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
