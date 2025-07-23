'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'
import { v4 as uuid } from 'uuid'

interface Track {
  id: string
  title: string
  audio_url: string | null
  cover_url: string | null
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [title, setTitle] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id,title,audio_url,cover_url')
        .order('created_at', { ascending: false })
      if (error) show(error.message)
      else setTracks(data || [])
      setLoading(false)
    }
    load()
  }, [show])

  const upload = async () => {
    if (!audioFile) return
    const id = uuid()
    const { data: audioData, error: audioError } = await supabase.storage
      .from('audio-files')
      .upload(`track/${id}.mp3`, audioFile)
    if (audioError) return show(audioError.message)
    let coverUrl: string | null = null
    if (coverFile) {
      const { data: coverData, error: coverError } = await supabase.storage
        .from('images')
        .upload(`covers/${id}.${coverFile.name.split('.').pop()}`, coverFile)
      if (coverError) return show(coverError.message)
      coverUrl = supabase.storage.from('images').getPublicUrl(coverData.path).data.publicUrl
    }
    const audioUrl = supabase.storage.from('audio-files').getPublicUrl(audioData.path).data.publicUrl
    const { error } = await supabase.from('tracks').insert({ id, title, audio_url: audioUrl, cover_url: coverUrl })
    if (error) show(error.message)
    else {
      show('Track added')
      setTitle('')
      setAudioFile(null)
      setCoverFile(null)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Tracks</h1>
      <div className="space-y-2 border p-2 rounded">
        <input className="border p-1 w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" accept="audio/mpeg" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        <button className="bg-black text-white px-3 py-1 rounded" onClick={upload}>Upload</button>
      </div>
      {loading && <Spinner />}
      {!loading && (
        <ul className="list-disc list-inside">
          {tracks.map((t) => (
            <li key={t.id}>{t.title}</li>
          ))}
        </ul>
      )}
      <Toast />
    </div>
  )
}
