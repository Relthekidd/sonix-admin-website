'use client'
import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

function Input({label, ...props}:{label:string} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input className="border rounded p-2" {...props} />
    </label>
  )
}

export default function UploadPage() {
  return (
    <div className="p-4 flex flex-col gap-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Upload Content</h1>
      <SingleUploadForm />
      <AlbumUploadForm />
    </div>
  )
}

function SingleUploadForm() {
  const [title,setTitle]=useState('')
  const [artist,setArtist]=useState('')
  const [lyrics,setLyrics]=useState('')
  const [genres,setGenres]=useState('')
  const [duration,setDuration]=useState('')
  const [cover,setCover]=useState<File|null>(null)
  const [audio,setAudio]=useState<File|null>(null)
  const [publishAt,setPublishAt]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const handleSubmit=async(e:FormEvent)=>{
    e.preventDefault()
    if(!title||!artist||!cover||!audio){
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setLoading(true)
    const id=uuidv4()
    const audioExt=audio.name.split('.').pop()
    const coverExt=cover.name.split('.').pop()
    const audioPath=`audio-files/track/${id}.${audioExt}`
    const coverPath=`images/covers/${id}.${coverExt}`

    const { error: audioError } = await supabase.storage.from('public').upload(audioPath, audio)
    if(audioError){ setError(audioError.message); setLoading(false); return }

    const { error: coverError } = await supabase.storage.from('public').upload(coverPath, cover)
    if(coverError){ setError(coverError.message); setLoading(false); return }

    const audioUrl=supabase.storage.from('public').getPublicUrl(audioPath).data.publicUrl
    const coverUrl=supabase.storage.from('public').getPublicUrl(coverPath).data.publicUrl

    // upsert artist if missing
    const { data: artistData } = await supabase.from('artists').select('id').eq('name', artist).single()
    let artistId=artistData?.id
    if(!artistId){
      artistId=uuidv4()
      await supabase.from('artists').insert({id:artistId,name:artist})
    }

    const publishDate=publishAt? new Date(publishAt):null
    const isPublished=!publishDate || publishDate<=new Date()

    const { error: insertError } = await supabase.from('tracks').insert({
      id,
      title,
      artist_id: artistId,
      cover_url: coverUrl,
      audio_url: audioUrl,
      lyrics,
      genres,
      duration: duration? Number(duration): null,
      play_count:0,
      like_count:0,
      is_published: isPublished,
      scheduled_publish_at: !isPublished && publishDate? publishDate.toISOString(): null
    })

    if(insertError){ setError(insertError.message); setLoading(false); return }

    setLoading(false)
    setTitle('');setArtist('');setLyrics('');setGenres('');setDuration('');setCover(null);setAudio(null);setPublishAt('')
    alert('Track uploaded successfully')
  }

  return(
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Upload Single</h2>
      {error && <p className="text-red-600">{error}</p>}
      <Input label="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <Input label="Artist" value={artist} onChange={e=>setArtist(e.target.value)} required />
      <label className="flex flex-col gap-1 text-sm">
        <span>Cover</span>
        <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Audio</span>
        <input type="file" accept="audio/*" onChange={e=>setAudio(e.target.files?.[0]||null)} required />
      </label>
      <Input label="Duration (seconds)" type="number" value={duration} onChange={e=>setDuration(e.target.value)} />
      <label className="flex flex-col gap-1 text-sm">
        <span>Genres (comma separated)</span>
        <input className="border rounded p-2" value={genres} onChange={e=>setGenres(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Lyrics</span>
        <textarea className="border rounded p-2" value={lyrics} onChange={e=>setLyrics(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Schedule Publish At</span>
        <input type="datetime-local" className="border rounded p-2" value={publishAt} onChange={e=>setPublishAt(e.target.value)} />
      </label>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded disabled:opacity-50">
        {loading? 'Uploading...' : 'Upload Single'}
      </button>
    </form>
  )
}

function AlbumUploadForm(){
  const [title,setTitle]=useState('')
  const [artist,setArtist]=useState('')
  const [releaseDate,setReleaseDate]=useState('')
  const [cover,setCover]=useState<File|null>(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const handleSubmit=async(e:FormEvent)=>{
    e.preventDefault()
    if(!title||!artist||!cover||!releaseDate){
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setLoading(true)
    const id=uuidv4()
    const coverExt=cover.name.split('.').pop()
    const coverPath=`images/covers/${id}.${coverExt}`
    const { error: coverError } = await supabase.storage.from('public').upload(coverPath, cover)
    if(coverError){ setError(coverError.message); setLoading(false); return }
    const coverUrl=supabase.storage.from('public').getPublicUrl(coverPath).data.publicUrl

    const { data: artistData } = await supabase.from('artists').select('id').eq('name', artist).single()
    let artistId=artistData?.id
    if(!artistId){
      artistId=uuidv4()
      await supabase.from('artists').insert({id:artistId,name:artist})
    }

    const { error: insertError } = await supabase.from('albums').insert({
      id,
      title,
      artist_id: artistId,
      cover_url: coverUrl,
      release_date: releaseDate,
      is_published: true
    })
    if(insertError){ setError(insertError.message); setLoading(false); return }

    setLoading(false)
    setTitle('');setArtist('');setCover(null);setReleaseDate('')
    alert('Album uploaded successfully')
  }

  return(
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Upload Album</h2>
      {error && <p className="text-red-600">{error}</p>}
      <Input label="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <Input label="Artist" value={artist} onChange={e=>setArtist(e.target.value)} required />
      <Input label="Release Date" type="date" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} required />
      <label className="flex flex-col gap-1 text-sm">
        <span>Cover</span>
        <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)} required />
      </label>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded disabled:opacity-50">
        {loading? 'Uploading...' : 'Upload Album'}
      </button>
    </form>
  )
}
