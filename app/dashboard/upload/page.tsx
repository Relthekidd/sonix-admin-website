'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuid } from 'uuid'
import { useToast } from '@/lib/useToast'

interface Artist { id: string; name: string }
interface Album { id: string; title: string }

export default function UploadPage() {
  const [mode, setMode] = useState<'single' | 'album'>('single')
  const [title, setTitle] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [duration, setDuration] = useState('')
  const [explicit, setExplicit] = useState(false)
  const [releaseDate, setReleaseDate] = useState('')
  const [artistId, setArtistId] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [albumId, setAlbumId] = useState('')
  const [newAlbum, setNewAlbum] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [genres, setGenres] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [trackNumber, setTrackNumber] = useState(1)
  const [schedule, setSchedule] = useState(false)
  const [publishAt, setPublishAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data: arts } = await supabase.from('artists').select('id,name')
      setArtists(arts || [])
      const { data: albs } = await supabase.from('albums').select('id,title')
      setAlbums(albs || [])
    }
    load()
  }, [])

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const submit = async () => {
    if (!audioFile || !title) return
    setLoading(true)
    try {
      let artId = artistId
      if (newArtist) {
        const { data, error } = await supabase
          .from('artists')
          .insert({ id: uuid(), name: newArtist })
          .select('id')
          .single()
        if (error) throw error
        artId = data!.id
      }
      let albId = albumId
      if (mode === 'album' && newAlbum) {
        const { data, error } = await supabase
          .from('albums')
          .insert({ id: uuid(), title: newAlbum, artist_id: artId })
          .select('id')
          .single()
        if (error) throw error
        albId = data!.id
      }
      const id = uuid()
      const { data: audioData, error: audioError } = await supabase.storage
        .from('audio-files')
        .upload(`tracks/${id}.mp3`, audioFile)
      if (audioError) throw audioError
      const { data: coverData, error: coverError } = coverFile
        ? await supabase.storage
            .from('images')
            .upload(`covers/${id}.${coverFile.name.split('.').pop()}`, coverFile)
        : { data: null, error: null }
      if (coverError) throw coverError
      const audioUrl = supabase.storage.from('audio-files').getPublicUrl(audioData!.path).data.publicUrl
      const coverUrl = coverData
        ? supabase.storage.from('images').getPublicUrl(coverData.path).data.publicUrl
        : null
      const payload = {
        id,
        title,
        lyrics,
        duration,
        explicit,
        release_date: releaseDate || null,
        artist_id: artId || null,
        album_id: mode === 'album' ? albId || null : null,
        cover_url: coverUrl,
        audio_url: audioUrl,
        genres,
        description,
        track_number: mode === 'album' ? trackNumber : null,
        scheduled_publish_at: schedule ? publishAt || null : null,
      }
      const { error } = await supabase.from('tracks').insert(payload)
      if (error) throw error
      show('Track uploaded')
      setTitle('')
      setLyrics('')
      setDuration('')
      setExplicit(false)
      setReleaseDate('')
      setArtistId('')
      setNewArtist('')
      setAlbumId('')
      setNewAlbum('')
      setCoverFile(null)
      setAudioFile(null)
      setGenres([])
      setDescription('')
      setTrackNumber(1)
      setSchedule(false)
      setPublishAt('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      show(message)
    } finally {
      setLoading(false)
    }
  }

  const genreOptions = ['hip-hop', 'pop', 'rock', 'electronic', 'jazz']

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-lg font-bold">Upload Music</h1>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${mode === 'single' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('single')}
        >
          Single
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'album' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('album')}
        >
          Album
        </button>
      </div>
      <div className="space-y-2 border p-4 rounded">
        <input className="border p-2 w-full" placeholder="Track Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Lyrics" value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={explicit} onChange={(e) => setExplicit(e.target.checked)} /> Explicit
        </label>
        <input className="border p-2 w-full" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
        <div>
          <select className="border p-2 w-full" value={artistId} onChange={(e) => setArtistId(e.target.value)}>
            <option value="">Select artist</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            className="border p-2 w-full mt-2"
            placeholder="Or create artist"
            value={newArtist}
            onChange={(e) => setNewArtist(e.target.value)}
          />
        </div>
        {mode === 'album' && (
          <>
            <select className="border p-2 w-full" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
              <option value="">Select album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            <input
              className="border p-2 w-full mt-2"
              placeholder="Or create album"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
            />
            <input
              className="border p-2 w-full"
              type="number"
              placeholder="Track Number"
              value={trackNumber}
              onChange={(e) => setTrackNumber(parseInt(e.target.value))}
            />
          </>
        )}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((g) => (
            <button
              key={g}
              type="button"
              className={`px-2 py-1 rounded border ${genres.includes(g) ? 'bg-black text-white' : ''}`}
              onClick={() => toggleGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} /> Schedule publish
        </label>
        {schedule && (
          <input className="border p-2 w-full" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
        )}
        <button
          className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-50"
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </div>
      <Toast />
    </div>
  )
}
