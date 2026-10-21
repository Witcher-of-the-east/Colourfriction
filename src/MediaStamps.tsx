import { useEffect, useState, type ChangeEvent } from 'react'
import { ImagePlus, Pencil, RotateCcw, Save, X } from 'lucide-react'

type MediaKind = 'movies' | 'games' | 'music' | 'books'
type Props = { title: string; kind: MediaKind; compact?: boolean }
type StampOverride = { title?: string; image?: string; note?: string; rating?: number }
type StampOverrides = Record<string, StampOverride>
type ArtworkOption = { title: string; image: string; detail?: string }
const OVERRIDE_KEY = 'colourfriction-media-stamps-v1'
const imageCache = new Map<string, string | null>()

function stampKey(kind: MediaKind, title: string) { return `${kind}:${title.trim().toLowerCase()}` }
function readOverrides(): StampOverrides {
  try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}') as StampOverrides } catch { return {} }
}
function writeOverrides(value: StampOverrides) {
  try { localStorage.setItem(OVERRIDE_KEY, JSON.stringify(value)); return true } catch { return false }
}

export type MediaSearchResult = { title: string; image: string; detail?: string }

function rankCatalogueResults(options: MediaSearchResult[], query: string): MediaSearchResult[] {
  const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
  const target = normalize(query)
  const tokens = target.split(' ').filter(Boolean)
  const score = (item: MediaSearchResult) => {
    const title = normalize(item.title)
    if (title === target) return 100
    if (title.startsWith(target)) return 80
    if (title.includes(target)) return 65
    const titleTokens = title.split(' ')
    const matched = tokens.filter((token) => titleTokens.includes(token)).length
    return tokens.length ? (matched / tokens.length) * 50 : 0
  }
  const seen = new Set<string>()
  return options
    .filter((item) => item.title && item.image && !seen.has(item.image) && Boolean(seen.add(item.image)))
    .sort((a, b) => score(b) - score(a))
    .slice(0, 8)
}

export async function searchMediaCatalogue(title: string, kind: MediaKind): Promise<MediaSearchResult[]> {
  const query = encodeURIComponent(title.trim())
  if (!query) return []
  try {
    let options: MediaSearchResult[] = []
    if (kind === 'books') {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=8`)
      if (response.ok) {
        const data = await response.json()
        options = (data.items || []).map((item: any) => ({
          title: item.volumeInfo?.title || title,
          image: (item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail || '').replace('http://', 'https://').replace('&edge=curl', ''),
          detail: [item.volumeInfo?.authors?.[0], item.volumeInfo?.publishedDate?.slice(0, 4), item.volumeInfo?.publisher].filter(Boolean).join(' · ') || 'Google Books',
        })).filter((item: MediaSearchResult) => item.image)
      }
    } else if (kind === 'movies' || kind === 'music') {
      const entity = kind === 'movies' ? 'movie' : 'musicTrack'
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=${entity}&limit=8`)
      if (response.ok) {
        const data = await response.json()
        options = (data.results || []).map((item: any) => ({
          title: item.trackName || item.collectionName || title,
          image: (item.artworkUrl600 || item.artworkUrl100 || '').replace('100x100bb', '600x900bb'),
          detail: [item.artistName, item.releaseDate?.slice(0, 4), item.collectionName && item.collectionName !== item.trackName ? item.collectionName : ''].filter(Boolean).join(' · ') || 'Apple catalogue',
        })).filter((item: MediaSearchResult) => item.image)
      }
    } else {
      const response = await fetch(`https://store.steampowered.com/api/storesearch/?term=${query}&l=english&cc=us`)
      if (response.ok) {
        const data = await response.json()
        options = (data.items || []).slice(0, 12).map((item: any) => ({ title: item.name || title, image: item.tiny_image || '', detail: [item.price?.final ? `Steam · ${item.price.final / 100}` : 'Steam catalogue', item.id ? `App ID ${item.id}` : ''].filter(Boolean).join(' · ') })).filter((item: MediaSearchResult) => item.image)
      }
    }
    return rankCatalogueResults(options, title)
  } catch { return [] }
}

export function saveMediaArtwork(kind: MediaKind, title: string, image: string) {
  const next = readOverrides()
  const key = stampKey(kind, title)
  next[key] = { ...(next[key] || {}), image }
  writeOverrides(next)
  imageCache.set(key, image || null)
}

async function findArtwork(title: string, kind: MediaKind): Promise<string | null> {
  const key = stampKey(kind, title)
  if (imageCache.has(key)) return imageCache.get(key) ?? null
  const query = encodeURIComponent(title)
  try {
    let image: string | undefined
    if (kind === 'books') {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&maxResults=1`)
      if (response.ok) {
        const data = await response.json()
        image = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || data.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail
        if (image) image = image.replace('http://', 'https://').replace('&edge=curl', '')
      }
    } else if (kind === 'movies' || kind === 'music') {
      const entity = kind === 'movies' ? 'movie' : 'musicTrack'
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=${entity}&limit=1`)
      if (response.ok) {
        const data = await response.json()
        image = data.results?.[0]?.artworkUrl100?.replace('100x100bb', '600x900bb')
      }
    } else {
      const response = await fetch(`https://store.steampowered.com/api/storesearch/?term=${query}&l=english&cc=us`)
      if (response.ok) {
        const data = await response.json()
        image = data.items?.[0]?.tiny_image
      }
    }
    const result = image || null
    imageCache.set(key, result)
    return result
  } catch {
    imageCache.set(key, null)
    return null
  }
}


async function findArtworkOptions(title: string, kind: MediaKind): Promise<ArtworkOption[]> {
  return searchMediaCatalogue(title, kind)
}

const kindLabels: Record<MediaKind, string> = { movies: 'FILM', games: 'GAME', music: 'SOUND', books: 'BOOK' }
const kindGlyphs: Record<MediaKind, string> = { movies: '🎬', games: '🎮', music: '🎧', books: '📚' }

export function MediaStamp({ title, kind, compact = false }: Props) {
  const key = stampKey(kind, title)
  const [overrides, setOverrides] = useState<StampOverrides>(readOverrides)
  const override = overrides[key] || {}
  const [catalogueArtwork, setCatalogueArtwork] = useState<string | null>(() => imageCache.get(key) ?? null)
  const [loaded, setLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(override.title || title)
  const [draftImage, setDraftImage] = useState(override.image || '')
  const [draftNote, setDraftNote] = useState(override.note || '')
  const [draftRating, setDraftRating] = useState(override.rating || 0)
  const [message, setMessage] = useState('Paste an image URL or upload your own cover.')
  const [artworkOptions, setArtworkOptions] = useState<ArtworkOption[]>([])
  const [searchingArtwork, setSearchingArtwork] = useState(false)
  const shownTitle = override.title || title
  const artwork = override.image || catalogueArtwork

  useEffect(() => {
    let active = true
    setOverrides(readOverrides())
    setCatalogueArtwork(imageCache.get(key) ?? null)
    setLoaded(false)
    setImageFailed(false)
    const delay = window.setTimeout(() => {
      findArtwork(title, kind).then((image) => {
        if (active) { setCatalogueArtwork(image); setLoaded(true) }
      })
    }, 180)
    return () => { active = false; window.clearTimeout(delay) }
  }, [title, kind, key])

  const openEditor = () => {
    const current = readOverrides()[key] || {}
    setOverrides(readOverrides())
    setDraftTitle(current.title || title)
    setDraftImage(current.image || '')
    setDraftNote(current.note || '')
    setDraftRating(current.rating || 0)
    setMessage('Paste an image URL or upload your own cover.')
    setArtworkOptions([])
    setEditing(true)
  }
  const searchArtwork = async () => {
    setSearchingArtwork(true)
    setArtworkOptions([])
    const options = await findArtworkOptions(draftTitle || title, kind)
    setArtworkOptions(options)
    setSearchingArtwork(false)
    setMessage(options.length ? `Found ${options.length} cover option${options.length === 1 ? '' : 's'}. Choose one below.` : 'No catalogue options found. Try a more specific title or paste/upload a cover.')
  }
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setMessage('Please choose an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setMessage('That file is over 5 MB. Choose a smaller image.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') { setMessage('Could not read that file. Try another image.'); return }
      const image = new Image()
      image.onload = () => {
        const maxWidth = 720, maxHeight = 1000
        const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) { setMessage('Could not process this image. Try a different file.'); return }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.78)
        setDraftImage(compressed)
        setMessage(`${file.name} is ready. The image was resized for browser storage.`)
      }
      image.onerror = () => setMessage('That image could not be opened. Try another file.')
      image.src = reader.result
    }
    reader.onerror = () => setMessage('Could not read that file. Try another image.')
    reader.readAsDataURL(file)
  }
  const saveStamp = () => {
    const next = { ...readOverrides() }
    const cleanedTitle = draftTitle.trim().slice(0, 100)
    const cleanedImage = draftImage.trim()
    const cleanedNote = draftNote.trim().slice(0, 180)
    const cleanedRating = Math.max(0, Math.min(5, Math.round(draftRating)))
    if (cleanedTitle === title && !cleanedImage && !cleanedNote && cleanedRating === 0) delete next[key]
    else next[key] = {
      ...(cleanedTitle && cleanedTitle !== title ? { title: cleanedTitle } : {}),
      ...(cleanedImage ? { image: cleanedImage } : {}),
      ...(cleanedNote ? { note: cleanedNote } : {}),
      ...(cleanedRating ? { rating: cleanedRating } : {}),
    }
    if (!writeOverrides(next)) { setMessage('Browser storage is full. Try a smaller image.'); return }
    setOverrides(next)
    setImageFailed(false)
    setEditing(false)
  }
  const resetStamp = () => {
    const next = { ...readOverrides() }
    delete next[key]
    writeOverrides(next)
    setOverrides(next)
    setImageFailed(false)
    setDraftTitle(title)
    setDraftImage('')
    setDraftNote('')
    setDraftRating(0)
    setEditing(false)
  }

  return <>
    <article className={`media-stamp media-stamp-${kind}${compact ? ' media-stamp-compact' : ''}`} title={`${shownTitle} — click to edit stamp`}>
      <button type="button" className="media-stamp-edit-trigger" onClick={openEditor} aria-label={`Edit ${shownTitle} stamp`}>
        <div className={`media-stamp-art${artwork ? ' has-artwork' : ''}`}>
          {artwork && !imageFailed && <img src={artwork} alt={`${shownTitle} cover artwork`} loading="lazy" onError={() => { setImageFailed(true); if (!override.image) { setCatalogueArtwork(null); imageCache.set(key, null) } }} />}
          {(!artwork || imageFailed) && <div className="media-stamp-fallback"><span>{kindGlyphs[kind]}</span><b>{shownTitle}</b><small>{loaded ? 'ADD YOUR OWN COVER' : 'LOOKING FOR ART…'}</small></div>}
          <span className="media-stamp-kind">{kindLabels[kind]}</span><span className="media-stamp-corner">✳</span>
          <span className="media-stamp-edit-hint"><Pencil size={12} /> EDIT STAMP</span>
        </div>
        <div className="media-stamp-caption"><span>{shownTitle}</span>{(override.rating || 0) > 0 && <small className="media-stamp-rating" aria-label={`Personal rating ${override.rating} out of 5`}>{'★'.repeat(override.rating || 0)}{'☆'.repeat(5 - (override.rating || 0))}</small>}{override.note && <small className="media-stamp-personal-note">“{override.note}”</small>}<small>{override.image ? 'CUSTOM COVER ✿' : 'IN MY COLLECTION'}</small></div>
      </button>
    </article>
    {editing && <div className="stamp-editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false) }}>
      <section className="stamp-editor-window" role="dialog" aria-modal="true" aria-label={`Edit ${title} stamp`}>
        <div className="stamp-editor-titlebar"><span>✳ STAMP WORKSHOP</span><button type="button" onClick={() => setEditing(false)} aria-label="Close stamp editor"><X size={16} /></button></div>
        <div className="stamp-editor-content">
          <div className="stamp-editor-preview"><div className="stamp-editor-cover">{draftImage ? <img src={draftImage} alt="Selected cover preview" /> : <><span>{kindGlyphs[kind]}</span><b>{draftTitle || title}</b></>}</div><small>{kindLabels[kind]} / COVER PREVIEW</small></div>
          <div className="stamp-editor-fields">
            <label>STAMP TITLE<input value={draftTitle} maxLength={100} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Title shown under the stamp" /></label>
            <label>COVER IMAGE URL<input value={draftImage.startsWith('data:') ? '' : draftImage} onChange={(event) => setDraftImage(event.target.value)} placeholder="https://…" /></label>
            <label>MY LITTLE REVIEW <textarea value={draftNote} maxLength={180} rows={3} onChange={(event) => setDraftNote(event.target.value)} placeholder="Why does this one live in your head? (optional)" /></label>
            <label className="stamp-personal-rating">PERSONAL RATING <span>{draftRating ? `${draftRating}/5 stars` : 'not rated yet'}</span><input type="range" min="0" max="5" step="1" value={draftRating} onChange={(event) => setDraftRating(Number(event.target.value))} /></label>
            <button type="button" className="stamp-find-art-button" onClick={searchArtwork} disabled={searchingArtwork || !draftTitle.trim()}>{searchingArtwork ? 'SEARCHING CATALOGUES…' : '↻ FIND COVER OPTIONS'}</button>
            {artworkOptions.length > 0 && <div className="stamp-artwork-options" aria-label="Cover choices">{artworkOptions.map((option, index) => <button type="button" key={`${option.image}-${index}`} className={draftImage === option.image ? 'chosen' : ''} onClick={() => { setDraftImage(option.image); setMessage(`Selected artwork: ${option.title}`) }} title={`${option.title}${option.detail ? ` — ${option.detail}` : ''}`}><img src={option.image} alt={option.title} loading="lazy"/><span>{option.title}</span><small>{option.detail}</small></button>)}</div>}
            <label className="stamp-upload-button"><ImagePlus size={15} /> UPLOAD YOUR OWN IMAGE<input type="file" accept="image/*" onChange={uploadImage} /></label>
            <p className="stamp-editor-message" aria-live="polite">{message}</p>
            <p className="stamp-editor-storage-note">Your custom cover is saved only in this browser. Images are resized before saving. Choose files under 5 MB.</p>
            <div className="stamp-editor-actions"><button type="button" className="stamp-reset-button" onClick={resetStamp}><RotateCcw size={13} /> USE CATALOGUE ART</button><button type="button" className="stamp-save-button" onClick={saveStamp}><Save size={13} /> SAVE STAMP</button></div>
          </div>
        </div>
      </section>
    </div>}
  </>
}

export function MediaStampGrid({ value, kind, compact = false }: { value: string | string[]; kind: MediaKind; compact?: boolean }) {
  const items = (Array.isArray(value) ? value : value.split(',')).map((item) => item.trim()).filter(Boolean).slice(0, 12)
  if (!items.length) return <p className="media-stamp-empty">nothing pinned here yet... add titles in Profile Lab ♡</p>
  return <div className={`media-stamp-grid${compact ? ' media-stamp-grid-compact' : ''}`}>
    {items.map((item) => <MediaStamp key={`${kind}-${item}`} title={item} kind={kind} compact={compact} />)}
  </div>
}
