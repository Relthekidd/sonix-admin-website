'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface Track {
  id: string
  title: string
  play_count: number
}

export default function AnalyticsPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [totalPlays, setTotalPlays] = useState(0)
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id,title,play_count')
        .order('play_count', { ascending: false })
        .limit(10)
      if (error) show(error.message)
      else {
        setTracks(data || [])
        setTotalPlays((data || []).reduce((sum, t) => sum + (t.play_count || 0), 0))
      }
      setLoading(false)
    }
    load()
  }, [show])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Analytics</h1>
      {loading && <Spinner />}
      {!loading && (
        <div className="space-y-2">
          <div>Total plays: {totalPlays}</div>
          <h2 className="font-semibold">Top Tracks</h2>
          <ol className="list-decimal list-inside">
            {tracks.map((t) => (
              <li key={t.id}>{t.title} – {t.play_count}</li>
            ))}
          </ol>
        </div>
      )}
      <Toast />
    </div>
  )
}
