'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface Artist {
  id: string
  name: string
  is_verified: boolean
  bio: string | null
  twitter_url: string | null
  instagram_url: string | null
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('id,name,is_verified,bio,twitter_url,instagram_url')
      if (error) show(error.message)
      else setArtists(data || [])
      setLoading(false)
    }
    load()
  }, [show])

  const updateArtist = async (id: string, payload: Partial<Artist>) => {
    setLoading(true)
    const { error } = await supabase.from('artists').update(payload).eq('id', id)
    if (error) show(error.message)
    else show('Artist updated')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Artist Verification</h1>
      {loading && <Spinner />}
      {!loading && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Verified</th>
              <th className="p-2">Bio</th>
              <th className="p-2">Twitter</th>
              <th className="p-2">Instagram</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.name}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={a.is_verified}
                    onChange={(e) =>
                      updateArtist(a.id, { is_verified: e.target.checked })
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    className="border p-1 w-40"
                    value={a.bio || ''}
                    onChange={(e) => updateArtist(a.id, { bio: e.target.value })}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="border p-1 w-40"
                    value={a.twitter_url || ''}
                    onChange={(e) =>
                      updateArtist(a.id, { twitter_url: e.target.value })
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    className="border p-1 w-40"
                    value={a.instagram_url || ''}
                    onChange={(e) =>
                      updateArtist(a.id, { instagram_url: e.target.value })
                    }
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
