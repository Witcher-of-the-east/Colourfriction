import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, Check, Eye, RotateCcw, Save, Sparkles, ExternalLink, Download, Upload } from 'lucide-react'
import { MediaStampGrid, saveMediaArtwork, searchMediaCatalogue, type MediaSearchResult } from './MediaStamps'

type MediaKind = 'movies' | 'games' | 'music' | 'books'
type CustomShelf = { id: string; name: string; kind: MediaKind; items: string[]; description?: string; rating?: number; icon?: string; cover?: string }
const CUSTOM_SHELVES_KEY = 'colourfriction-custom-shelves-v1'
const BACKUP_KEYS = [
  'colourfriction-profile-v1', CUSTOM_SHELVES_KEY, 'colourfriction-media-stamps-v1',
  'colourfriction-sticker-positions-v1', 'colourfriction-decorations-v1',
  'colourfriction-custom-text-stickers-v1', 'colourfriction:my-page-notes',
  'colourfriction:theme', 'colourfriction:sparkle-cursor', 'colourfriction:favourites',
  'colourfriction:guestbook', 'colourfriction:tiny-quest',
]
function readCustomShelves(): CustomShelf[] { try { const value = JSON.parse(localStorage.getItem(CUSTOM_SHELVES_KEY) || '[]'); return Array.isArray(value) ? value.slice(0, 12) : [] } catch { return [] } }

async function compressShelfCover(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.');
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read that image.'));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('That image could not be opened.'));
    element.src = source;
  });
  const maxWidth = 1200, maxHeight = 500;
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not process that image.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

type Profile = {
  displayName: string
  username: string
  avatar: string
  status: string
  bio: string
  accent: string
  paper: string
  wallpaper: string
  font: string
  layout: string
  badges: string[]
  movies: string
  games: string
  music: string
  books: string
}

const starterProfile: Profile = {
  displayName: 'Abhi',
  username: 'moth.mp3',
  avatar: '🦋',
  status: 'currently collecting little joys',
  bio: 'I like stories that leave a little bruise on your heart. Usually listening to something dreamy and looking for my next fictional obsession.',
  accent: '#8c5bd6',
  paper: '#fff4d9',
  wallpaper: 'stars',
  font: 'pixel',
  layout: 'scrapbook',
  badges: ['niche interests', 'music hoarder', 'night owl'],
  movies: 'Perfect Blue, Everything Everywhere All at Once',
  games: 'Night in the Woods, Outer Wilds',
  music: 'Phoebe Bridgers, Beach House, Portishead',
  books: 'Convenience Store Woman, The Left Hand of Darkness',
}

const palettes = [
  { name: 'grape soda', accent: '#8c5bd6', paper: '#fff4d9' },
  { name: 'tomato jam', accent: '#d94d35', paper: '#fff0df' },
  { name: 'poolside', accent: '#267e8c', paper: '#edf5ef' },
  { name: 'blue raspberry', accent: '#3b5ccc', paper: '#f0f1ff' },
  { name: 'bubblegum', accent: '#d94d75', paper: '#fff0f5' },
]
const badgeOptions = ['niche interests', 'music hoarder', 'night owl', 'film feelings', 'lore goblin', 'book gremlin', 'old web kid', 'soft-hearted']
const avatars = ['🦋', '🐈', '🐸', '🦇', '🐌', '🍓', '👾', '🌙', '🪲', '🧃', '🎧', '🪼']

function loadProfile(): Profile {
  try {
    const saved = localStorage.getItem('colourfriction-profile-v1')
    return saved ? { ...starterProfile, ...JSON.parse(saved) } : starterProfile
  } catch {
    return starterProfile
  }
}

export default function ProfileEditor({ onBack, onVisit }: { onBack: () => void; onVisit: () => void }) {
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'identity' | 'style' | 'collections'>('identity')
  const [notice, setNotice] = useState('Your changes preview live. Save them to keep your page in this browser.')
  const [collectionDrafts, setCollectionDrafts] = useState<Record<string, string>>({})
  const [catalogueResults, setCatalogueResults] = useState<Record<string, MediaSearchResult[]>>({})
  const [searchingCollection, setSearchingCollection] = useState<string | null>(null)
  const [customShelves, setCustomShelves] = useState<CustomShelf[]>(readCustomShelves)
  const [newShelfName, setNewShelfName] = useState('')
  const [newShelfKind, setNewShelfKind] = useState<MediaKind>('movies')
  const [customShelfDrafts, setCustomShelfDrafts] = useState<Record<string, string>>({})
  const [customShelfSearchResults, setCustomShelfSearchResults] = useState<Record<string, MediaSearchResult[]>>({})
  const [searchingShelf, setSearchingShelf] = useState<string | null>(null)
  const [draggedShelfItem, setDraggedShelfItem] = useState<{ shelfId: string; index: number } | null>(null)
  const [stampRefresh, setStampRefresh] = useState(0)
  const backupInput = useRef<HTMLInputElement>(null)
  const shelfImportInput = useRef<HTMLInputElement>(null)

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setSaved(false)
    setNotice('Your changes preview live. Save them to keep your page in this browser.')
    setProfile((current) => ({ ...current, [key]: value }))
  }
  const activePalette = useMemo(() => palettes.find((palette) => palette.accent === profile.accent) ?? palettes[0], [profile.accent])

  const saveProfile = () => {
    try {
      localStorage.setItem('colourfriction-profile-v1', JSON.stringify(profile))
      localStorage.setItem(CUSTOM_SHELVES_KEY, JSON.stringify(customShelves))
      setSaved(true)
      setNotice('Saved in this browser! Your profile will be here when you come back on this device.')
    } catch {
      setNotice('This browser blocked local storage. Your preview still works, but could not be saved.')
    }
  }

  const resetProfile = () => {
    setSaved(false)
    setProfile({ ...starterProfile })
    try { localStorage.removeItem('colourfriction-profile-v1'); localStorage.removeItem(CUSTOM_SHELVES_KEY) } catch { /* storage may be unavailable */ }
    setCustomShelves([])
    setNotice('Starter profile restored. Save if you want to keep these defaults.')
  }

  const exportBackup = () => {
    try {
      const data: Record<string, string> = {}
      BACKUP_KEYS.forEach((key) => {
        const value = localStorage.getItem(key)
        if (value !== null) data[key] = value
      })
      // Include the current editor state, even if the user has not pressed Save yet.
      data['colourfriction-profile-v1'] = JSON.stringify(profile)
      data[CUSTOM_SHELVES_KEY] = JSON.stringify(customShelves)
      const backup = { app: 'colourfriction', formatVersion: 1, exportedAt: new Date().toISOString(), data }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `colourfriction-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Backup downloaded. Keep that JSON file somewhere safe; it can restore your local page later.')
    } catch {
      setNotice('Could not create a backup in this browser. Try saving your profile first.')
    }
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 25 * 1024 * 1024) { setNotice('That backup is larger than 25 MB. Choose a smaller backup file.'); return }
    try {
      const parsed = JSON.parse(await file.text()) as { app?: unknown; formatVersion?: unknown; data?: unknown }
      if (parsed.app !== 'colourfriction' || parsed.formatVersion !== 1 || !parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
        setNotice('This does not look like a supported Colourfriction backup. Nothing was changed.')
        return
      }
      const source = parsed.data as Record<string, unknown>
      const entries: [string, string][] = Object.entries(source).filter((entry): entry is [string, string] => BACKUP_KEYS.includes(entry[0]) && typeof entry[1] === 'string')
      if (!entries.some(([key]) => key === 'colourfriction-profile-v1')) {
        setNotice('This backup has no profile data. Nothing was changed.')
        return
      }
      // Validate the core records before touching existing browser data.
      const importedProfile = JSON.parse(source['colourfriction-profile-v1'] as string)
      if (!importedProfile || typeof importedProfile !== 'object' || Array.isArray(importedProfile)) {
        setNotice('The profile data in this backup is invalid. Nothing was changed.')
        return
      }
      const shelvesRaw = source[CUSTOM_SHELVES_KEY]
      const importedShelves = typeof shelvesRaw === 'string' ? JSON.parse(shelvesRaw) : []
      if (!Array.isArray(importedShelves)) { setNotice('The shelf data in this backup is invalid. Nothing was changed.'); return }
      const incoming = new Map(entries)
      const previous = new Map<string, string | null>()
      try {
        BACKUP_KEYS.forEach((key) => previous.set(key, localStorage.getItem(key)))
        // Restore is a replacement, not a merge: remove stale app keys omitted by this backup.
        BACKUP_KEYS.forEach((key) => {
          const value = incoming.get(key)
          if (value === undefined) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        })
      } catch (error) {
        previous.forEach((value, key) => { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value) } catch { /* best-effort rollback */ } })
        throw error
      }
      setProfile({ ...starterProfile, ...importedProfile })
      setCustomShelves(importedShelves.slice(0, 12))
      setStampRefresh((value) => value + 1)
      setSaved(true)
      setNotice(`Restored ${entries.length} saved Colourfriction records from ${file.name}. Check your page, then save if you make changes.`)
    } catch {
      setNotice('Could not read that backup. It may be damaged or browser storage may be full; existing data was preserved where possible.')
    }
  }

  const toggleBadge = (badge: string) => {
    update('badges', profile.badges.includes(badge) ? profile.badges.filter((item) => item !== badge) : [...profile.badges, badge].slice(0, 4))
  }

  const getTitles = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)
  const saveTitles = (key: 'movies' | 'games' | 'music' | 'books', titles: string[]) => update(key, titles.join(', '))
  const addTitle = (key: 'movies' | 'games' | 'music' | 'books') => {
    const title = (collectionDrafts[key] || '').trim()
    const current = getTitles(profile[key])
    if (!title) return
    if (current.some((item) => item.toLowerCase() === title.toLowerCase())) { setNotice('That title is already on this shelf.'); return }
    if (current.length >= 12) { setNotice('This shelf is full (12 stamps). Remove one before adding another.'); return }
    saveTitles(key, [...current, title.slice(0, 100)])
    setCollectionDrafts((items) => ({ ...items, [key]: '' }))
    setNotice(`Added “${title}” to your shelf. Save your page to keep it.`)
  }
  const moveTitle = (key: 'movies' | 'games' | 'music' | 'books', index: number, direction: -1 | 1) => {
    const titles = getTitles(profile[key])
    const target = index + direction
    if (target < 0 || target >= titles.length) return
    const item = titles[index]; titles[index] = titles[target]; titles[target] = item
    saveTitles(key, titles)
  }
  const searchCollection = async (key: MediaKind) => {
    const query = (collectionDrafts[key] || '').trim()
    if (!query) { setNotice('Type a title first, then search the catalogue.'); return }
    setSearchingCollection(key)
    setCatalogueResults((current) => ({ ...current, [key]: [] }))
    const results = await searchMediaCatalogue(query, key)
    setCatalogueResults((current) => ({ ...current, [key]: results }))
    setSearchingCollection(null)
    setNotice(results.length ? `Found ${results.length} catalogue matches for “${query}”. Choose the exact edition/artwork to pin it.` : 'No catalogue matches found. You can still add the title and customise its stamp manually.')
  }
  const addCatalogueResult = (key: MediaKind, result: MediaSearchResult) => {
    const current = getTitles(profile[key])
    if (current.some((item) => item.toLowerCase() === result.title.toLowerCase())) { setNotice('That title is already on this shelf.'); return }
    if (current.length >= 12) { setNotice('This shelf is full (12 stamps). Remove one before adding another.'); return }
    saveTitles(key, [...current, result.title.slice(0, 100)])
    saveMediaArtwork(key, result.title, result.image)
    setCollectionDrafts((items) => ({ ...items, [key]: '' }))
    setCatalogueResults((items) => ({ ...items, [key]: [] }))
    setNotice(`Pinned “${result.title}” with the selected catalogue artwork. Save your page to keep the collection.`)
  }
  const createCustomShelf = () => {
    setSaved(false)
    const name = newShelfName.trim().slice(0, 42)
    if (!name) return
    if (customShelves.length >= 12) { setNotice('You can make up to 12 custom shelves.'); return }
    if (customShelves.some((shelf) => shelf.name.toLowerCase() === name.toLowerCase())) { setNotice('A shelf with that name already exists.'); return }
    setCustomShelves((items) => [...items, { id: `shelf-${Date.now()}`, name, kind: newShelfKind, items: [], description: '', rating: 0, icon: ({ movies: '🎬', games: '🎮', music: '🎧', books: '📚' } as Record<MediaKind, string>)[newShelfKind] }])
    setNewShelfName('')
    setNotice(`Created the “${name}” shelf. Add titles below, then save your page.`)
  }
  const updateCustomShelf = (id: string, changes: Partial<CustomShelf>) => {
    setSaved(false)
    setCustomShelves((items) => items.map((shelf) => shelf.id === id ? { ...shelf, ...changes } : shelf))
  }
  const uploadShelfCover = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const cover = await compressShelfCover(file)
      updateCustomShelf(id, { cover })
      setNotice(`Shelf cover added from ${file.name}. Save your page to keep it.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not process that cover.')
    }
  }
  const importShelf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setNotice('That shelf file is larger than 10 MB. Choose a smaller JSON file.'); return }
    try {
      const parsed = JSON.parse(await file.text()) as { app?: unknown; formatVersion?: unknown; shelf?: unknown; stampOverrides?: unknown }
      if (parsed.app !== 'colourfriction-shelf' || parsed.formatVersion !== 1 || !parsed.shelf || typeof parsed.shelf !== 'object' || Array.isArray(parsed.shelf)) {
        setNotice('This is not a supported Colourfriction shelf file. Nothing was changed.')
        return
      }
      const raw = parsed.shelf as Record<string, unknown>
      const kinds: MediaKind[] = ['movies', 'games', 'music', 'books']
      if (typeof raw.name !== 'string' || !raw.name.trim() || !kinds.includes(raw.kind as MediaKind) || !Array.isArray(raw.items)) {
        setNotice('The shelf file is missing a valid name, media type, or item list. Nothing was changed.')
        return
      }
      const name = raw.name.trim().slice(0, 42)
      const items = raw.items.filter((item): item is string => typeof item === 'string' && !!item.trim()).map((item) => item.trim().slice(0, 100)).filter((item, index, all) => all.findIndex((other) => other.toLowerCase() === item.toLowerCase()) === index).slice(0, 12)
      if (customShelves.length >= 12) { setNotice('You already have 12 custom shelves. Delete one before importing another.'); return }
      let importedName = name
      let suffix = 1
      while (customShelves.some((item) => item.name.toLowerCase() === importedName.toLowerCase())) {
        suffix += 1
        const label = suffix === 2 ? ' (imported)' : ` (imported ${suffix - 1})`
        importedName = `${name.slice(0, Math.max(1, 42 - label.length))}${label}`
      }
      const shelf: CustomShelf = {
        id: `shelf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: importedName,
        kind: raw.kind as MediaKind,
        items,
        description: typeof raw.description === 'string' ? raw.description.slice(0, 120) : '',
        rating: typeof raw.rating === 'number' && Number.isFinite(raw.rating) ? Math.max(0, Math.min(5, Math.round(raw.rating))) : 0,
        icon: typeof raw.icon === 'string' ? raw.icon.slice(0, 12) : undefined,
        cover: typeof raw.cover === 'string' && (raw.cover.startsWith('https://') || raw.cover.startsWith('http://') || raw.cover.startsWith('data:image/')) ? raw.cover : '',
      }
      const overrides = parsed.stampOverrides && typeof parsed.stampOverrides === 'object' && !Array.isArray(parsed.stampOverrides) ? parsed.stampOverrides as Record<string, unknown> : {}
      const oldOverridesRaw = localStorage.getItem('colourfriction-media-stamps-v1') || '{}'
      const oldOverrides = JSON.parse(oldOverridesRaw) as Record<string, unknown>
      const mergedOverrides = { ...oldOverrides }
      Object.entries(overrides).forEach(([key, value]) => {
        if (key.length < 220 && value && typeof value === 'object' && !Array.isArray(value)) mergedOverrides[key] = value
      })
      let overridesSaved = true
      try {
        localStorage.setItem('colourfriction-media-stamps-v1', JSON.stringify(mergedOverrides))
      } catch {
        overridesSaved = false
      }
      setCustomShelves((current) => [...current, shelf].slice(0, 12))
      setSaved(false)
      setStampRefresh((value) => value + 1)
      setNotice(overridesSaved
        ? `Imported “${shelf.name}” with ${items.length} item${items.length === 1 ? '' : 's'}. Press SAVE MY PAGE to keep the shelf in this browser.`
        : `Imported “${shelf.name}”, but artwork overrides could not fit in browser storage. Remove large covers and try again if you need them.`)
    } catch {
      setNotice('Could not read that shelf file. It may be damaged or browser storage may be full; your shelf list was not changed.')
    }
  }

  const exportShelf = (shelf: CustomShelf) => {
    try {
      const allOverrides = JSON.parse(localStorage.getItem('colourfriction-media-stamps-v1') || '{}') as Record<string, unknown>
      const stampOverrides: Record<string, unknown> = {}
      shelf.items.forEach((title) => {
        const key = `${shelf.kind}:${title.trim().toLowerCase()}`
        if (allOverrides[key]) stampOverrides[key] = allOverrides[key]
      })
      const payload = { app: 'colourfriction-shelf', formatVersion: 1, exportedAt: new Date().toISOString(), shelf, stampOverrides }
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `colourfriction-shelf-${shelf.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'collection'}.json`
      document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(`Exported “${shelf.name}” as a shelf backup. Keep the JSON file somewhere safe.`)
    } catch { setNotice('Could not export this shelf in the current browser.') }
  }
  const moveCustomShelf = (id: string, direction: -1 | 1) => {
    setSaved(false)
    setCustomShelves((items) => {
      const index = items.findIndex((shelf) => shelf.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= items.length) return items
      const next = [...items]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }
  const reorderCustomShelfItem = (shelfId: string, from: number, to: number) => {
    if (from === to) return
    setSaved(false)
    setCustomShelves((items) => items.map((shelf) => {
      if (shelf.id !== shelfId || from < 0 || to < 0 || from >= shelf.items.length || to >= shelf.items.length) return shelf
      const next = [...shelf.items]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { ...shelf, items: next }
    }))
  }
  const moveCustomShelfItem = (id: string, index: number, direction: -1 | 1) => {
    setSaved(false)
    setCustomShelves((items) => items.map((shelf) => {
      if (shelf.id !== id) return shelf
      const target = index + direction
      if (target < 0 || target >= shelf.items.length) return shelf
      const next = [...shelf.items]
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...shelf, items: next }
    }))
  }
  const searchCustomShelf = async (shelf: CustomShelf) => {
    const query = (customShelfDrafts[shelf.id] || '').trim()
    if (!query) return
    setSearchingShelf(shelf.id)
    setCustomShelfSearchResults((current) => ({ ...current, [shelf.id]: [] }))
    const results = await searchMediaCatalogue(query, shelf.kind)
    setCustomShelfSearchResults((current) => ({ ...current, [shelf.id]: results }))
    setSearchingShelf(null)
    setNotice(results.length ? `Found ${results.length} matches for “${query}”. Choose the right edition for this shelf.` : 'No matches found. You can still add the title manually and edit its stamp later.')
  }
  const addCustomShelfCatalogueResult = (shelf: CustomShelf, result: MediaSearchResult) => {
    if (shelf.items.some((item) => item.toLowerCase() === result.title.toLowerCase())) { setNotice('That title is already on this shelf.'); return }
    if (shelf.items.length >= 12) { setNotice('This shelf is full (12 stamps). Remove one before adding another.'); return }
    updateCustomShelf(shelf.id, { items: [...shelf.items, result.title] })
    saveMediaArtwork(shelf.kind, result.title, result.image)
    setCustomShelfDrafts((items) => ({ ...items, [shelf.id]: '' }))
    setCustomShelfSearchResults((items) => ({ ...items, [shelf.id]: [] }))
    setNotice(`Pinned “${result.title}” with the selected artwork. Save your page to keep it.`)
  }
  const addCustomShelfItem = (id: string) => {
    setSaved(false)
    const title = (customShelfDrafts[id] || '').trim().slice(0, 100)
    if (!title) return
    setCustomShelves((items) => items.map((shelf) => shelf.id !== id ? shelf : shelf.items.length >= 12 || shelf.items.some((item) => item.toLowerCase() === title.toLowerCase()) ? shelf : { ...shelf, items: [...shelf.items, title] }))
    setCustomShelfDrafts((items) => ({ ...items, [id]: '' }))
  }

  const collections = [
    { label: 'MOVIES I KEEP THINKING ABOUT', key: 'movies' as const, icon: '🎬', value: profile.movies },
    { label: 'GAMES I LIVE IN', key: 'games' as const, icon: '🎮', value: profile.games },
    { label: 'SOUNDS LIKE ME', key: 'music' as const, icon: '🎧', value: profile.music },
    { label: 'BOOKS WITH MY DNA IN THEM', key: 'books' as const, icon: '📚', value: profile.books },
  ]

  return (
    <main className="profile-editor-page" style={{ '--profile-accent': profile.accent, '--profile-paper': profile.paper } as React.CSSProperties}>
      <div className="profile-editor-topbar">
        <button className="profile-back-button" onClick={onBack}><ArrowLeft size={15} /> BACK TO THE FRONT PAGE</button>
        <div className="profile-editor-label"><Sparkles size={14} /> PROFILE LAB / PHASE 02</div>
      </div>
      <div className="profile-editor-heading">
        <div><span className="tiny-label">YOUR PAGE, YOUR RULES</span><h1>Make it feel like <em>you.</em></h1><p>Build a little corner of the internet. Change things on the left; your profile updates on the right.</p></div>
        <div className="profile-heading-sticker">UNDER<br />YOUR<br />CONTROL ✳</div>
      </div>

      <div className="profile-workbench">
        <section className="profile-controls-window">
          <div className="window-bar"><span>✳ PROFILE CUSTOMIZER</span><span>_ □ ×</span></div>
          <div className="profile-tabs" role="tablist" aria-label="Profile settings">
            <button role="tab" aria-selected={activeTab === 'identity'} className={activeTab === 'identity' ? 'active' : ''} onClick={() => setActiveTab('identity')}>01 IDENTITY</button>
            <button role="tab" aria-selected={activeTab === 'style'} className={activeTab === 'style' ? 'active' : ''} onClick={() => setActiveTab('style')}>02 THE VIBE</button>
            <button role="tab" aria-selected={activeTab === 'collections'} className={activeTab === 'collections' ? 'active' : ''} onClick={() => setActiveTab('collections')}>03 MY STUFF</button>
          </div>

          {activeTab === 'identity' && <div className="profile-form-panel">
            <div className="form-section-title"><span>01 / WHO ARE YOU ON HERE?</span><small>ALL THE GOOD BITS</small></div>
            <label className="profile-field">DISPLAY NAME<input value={profile.displayName} maxLength={32} onChange={(event) => update('displayName', event.target.value)} placeholder="what people call you" /></label>
            <label className="profile-field">USERNAME <span className="field-hint">your tiny internet handle</span><div className="username-input"><span>@</span><input value={profile.username} maxLength={24} onChange={(event) => update('username', event.target.value.replace(/\s/g, '').replace(/[^a-zA-Z0-9._-]/g, ''))} /></div></label>
            <div className="profile-field"><span className="field-label">PICK YOUR LITTLE INTERNET FACE</span><div className="avatar-picker">{avatars.map((avatar) => <button key={avatar} className={profile.avatar === avatar ? 'selected' : ''} onClick={() => update('avatar', avatar)} aria-label={`Choose avatar ${avatar}`}>{avatar}</button>)}</div></div>
            <label className="profile-field">CURRENT STATUS <input value={profile.status} maxLength={70} onChange={(event) => update('status', event.target.value)} placeholder="what's the current vibe?" /></label>
            <label className="profile-field">A LITTLE ABOUT ME <textarea value={profile.bio} maxLength={360} onChange={(event) => update('bio', event.target.value)} rows={4} placeholder="write the tiny lore..." /><span className="field-hint char-count">{profile.bio.length}/360</span></label>
            <div className="form-section-title"><span>02 / YOUR WEB BADGES</span><small>CHOOSE UP TO 4</small></div>
            <div className="badge-picker">{badgeOptions.map((badge) => <button key={badge} className={profile.badges.includes(badge) ? 'selected' : ''} onClick={() => toggleBadge(badge)} disabled={!profile.badges.includes(badge) && profile.badges.length >= 4}>{profile.badges.includes(badge) && <Check size={12} />}{badge}</button>)}</div>
          </div>}

          {activeTab === 'style' && <div className="profile-form-panel">
            <div className="form-section-title"><span>03 / PICK YOUR COLOUR STORY</span><small>NO WRONG ANSWERS</small></div>
            <div className="palette-picker">{palettes.map((palette) => <button key={palette.name} className={profile.accent === palette.accent ? 'selected' : ''} onClick={() => { update('accent', palette.accent); update('paper', palette.paper) }}><span className="palette-preview" style={{ background: palette.paper, borderColor: palette.accent }}><i style={{ background: palette.accent }} /><i style={{ background: '#ffdf70' }} /><i style={{ background: '#211b2d' }} /></span><span>{palette.name}</span>{profile.accent === palette.accent && <Check size={14} />}</button>)}</div>
            <div className="custom-colour-row"><label>MAKE YOUR OWN ACCENT<input aria-label="Custom accent colour" type="color" value={profile.accent} onChange={(event) => update('accent', event.target.value)} /><span>{profile.accent.toUpperCase()}</span></label><label>MAKE YOUR OWN PAPER<input aria-label="Custom paper colour" type="color" value={profile.paper} onChange={(event) => update('paper', event.target.value)} /><span>{profile.paper.toUpperCase()}</span></label></div>
            <div className="form-section-title"><span>04 / BACKGROUND TEXTURE</span><small>SET THE SCENE</small></div>
            <div className="wallpaper-picker">{[{ id: 'stars', name: 'starry desktop', glyph: '✦ ✧ ✦' }, { id: 'graph', name: 'graph paper', glyph: '▦ ▦ ▦' }, { id: 'dots', name: 'polka party', glyph: '•• •• ••' }, { id: 'plain', name: 'plain-ish', glyph: '—  —  —' }].map((item) => <button key={item.id} className={profile.wallpaper === item.id ? 'selected' : ''} onClick={() => update('wallpaper', item.id)}><span className={`wallpaper-swatch wallpaper-${item.id}`}>{item.glyph}</span><span>{item.name}</span></button>)}</div>
            <div className="form-section-title"><span>05 / LETTER PERSONALITY</span><small>THE FONT MATTERS</small></div>
            <div className="font-picker">{[{ id: 'pixel', name: 'PIXEL PAL', sample: 'hello, web!' }, { id: 'scribble', name: 'DOODLE KID', sample: 'hello, web!' }, { id: 'bookish', name: 'LIBRARY GHOST', sample: 'hello, web!' }].map((item) => <button key={item.id} className={`font-choice font-${item.id} ${profile.font === item.id ? 'selected' : ''}`} onClick={() => update('font', item.id)}><span>{item.sample}</span><small>{item.name}</small></button>)}</div>
            <div className="form-section-title"><span>06 / YOUR LAYOUT</span><small>HOW IT LIVES</small></div>
            <div className="layout-picker"><button className={profile.layout === 'scrapbook' ? 'selected' : ''} onClick={() => update('layout', 'scrapbook')}><span className="layout-mini layout-mini-scrap"><i /><i /><i /></span><b>SCRAPBOOK</b><small>layers & little mess</small></button><button className={profile.layout === 'shelf' ? 'selected' : ''} onClick={() => update('layout', 'shelf')}><span className="layout-mini layout-mini-shelf"><i /><i /><i /><i /></span><b>COLLECTION SHELF</b><small>tidy little grid</small></button></div>
          </div>}

          {activeTab === 'collections' && <div className="profile-form-panel">
            <div className="form-section-title"><span>07 / YOUR TASTE COLLECTIONS</span><small>ONE STAMP AT A TIME</small></div>
            <p className="collection-editor-note">Add individual titles, remove ones that no longer belong, and reorder your shelves. Click any stamp in the preview to edit its cover. Up to 12 stamps per shelf.</p>
            {collections.map((collection) => {
              const key = collection.key as 'movies' | 'games' | 'music' | 'books'
              const titles = getTitles(collection.value)
              return <section className="profile-field collection-field" key={collection.key}>
                <span className="collection-field-title"><b>{collection.icon}</b> {collection.label}<small>{titles.length}/12 STAMPS</small></span>
                <div className="collection-title-list">{titles.map((title, index) => <div className="collection-title-chip" key={`${title}-${index}`}><span className="collection-title-number">{String(index + 1).padStart(2, '0')}</span><span className="collection-title-text">{title}</span><button type="button" onClick={() => moveTitle(key, index, -1)} disabled={index === 0} aria-label={`Move ${title} earlier`}>↑</button><button type="button" onClick={() => moveTitle(key, index, 1)} disabled={index === titles.length - 1} aria-label={`Move ${title} later`}>↓</button><button type="button" className="collection-remove" onClick={() => saveTitles(key, titles.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${title}`}>×</button></div>)}</div>
                <div className="collection-add-row"><input value={collectionDrafts[key] || ''} maxLength={100} onChange={(event) => setCollectionDrafts((items) => ({ ...items, [key]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTitle(key) } }} placeholder={`Search or add a ${key === 'movies' ? 'film' : key === 'games' ? 'game' : key === 'music' ? 'song or artist' : 'book'}...`} /><button type="button" onClick={() => addTitle(key)} disabled={!((collectionDrafts[key] || '').trim()) || titles.length >= 12}>+ ADD TEXT</button></div>
                <button type="button" className="catalogue-search-button" onClick={() => searchCollection(key)} disabled={searchingCollection === key || !((collectionDrafts[key] || '').trim())}>{searchingCollection === key ? 'SEARCHING CATALOGUES…' : '⌕ SEARCH CATALOGUE BEFORE ADDING'}</button>
                {(catalogueResults[key] || []).length > 0 && <div className="profile-catalogue-results" aria-label={`${key} catalogue matches`}>{catalogueResults[key].map((result, resultIndex) => <article key={`${result.image}-${resultIndex}`}><img src={result.image} alt={`${result.title} artwork`} loading="lazy"/><div><b>{result.title}</b><small>{result.detail || 'Catalogue result'}</small><button type="button" onClick={() => addCatalogueResult(key, result)}>+ PIN THIS EDITION</button></div></article>)}</div>}
                {titles.length === 0 && <p className="field-hint">Search the catalogue to choose a cover, or add a title manually.</p>}
              </section>
            })}
            <section className="custom-shelf-builder">
              <div className="form-section-title"><span>08 / MAKE YOUR OWN SHELVES</span><small>NAME YOUR LITTLE CORNER</small></div>
              <p className="collection-editor-note">Create shelves with names like “comfort films”, “games that broke me”, or “books for rainy days”. Each shelf can hold up to 12 stamps.</p>
              <div className="custom-shelf-create-row"><input value={newShelfName} maxLength={42} onChange={(event) => setNewShelfName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); createCustomShelf() } }} placeholder="e.g. films that live rent-free"/><select value={newShelfKind} onChange={(event) => setNewShelfKind(event.target.value as MediaKind)} aria-label="Media type for new shelf"><option value="movies">Movies</option><option value="games">Games</option><option value="music">Music</option><option value="books">Books</option></select><button type="button" onClick={createCustomShelf} disabled={!newShelfName.trim() || customShelves.length >= 12}>+ CREATE SHELF</button></div>
              {customShelves.map((shelf) => <section className="custom-shelf-edit-card" key={shelf.id}>
                <header><span>{shelf.icon || ({ movies: '🎬', games: '🎮', music: '🎧', books: '📚' } as Record<MediaKind, string>)[shelf.kind]} {shelf.name}</span><div className="custom-shelf-header-actions"><button type="button" onClick={() => moveCustomShelf(shelf.id, -1)} disabled={customShelves[0]?.id === shelf.id} aria-label={`Move ${shelf.name} shelf earlier`}>↑</button><button type="button" onClick={() => moveCustomShelf(shelf.id, 1)} disabled={customShelves[customShelves.length - 1]?.id === shelf.id} aria-label={`Move ${shelf.name} shelf later`}>↓</button><button type="button" onClick={() => exportShelf(shelf)} aria-label={`Export ${shelf.name} shelf`} title="Export this shelf as JSON">⇩</button><button type="button" onClick={() => shelfImportInput.current?.click()} aria-label="Import a shelf backup" title="Import a shelf JSON backup">⇧</button><button type="button" onClick={() => { setSaved(false); setCustomShelves((items) => items.filter((item) => item.id !== shelf.id)) }} aria-label={`Delete ${shelf.name} shelf`}>×</button></div></header>
                <small>{shelf.items.length}/12 · {shelf.kind.toUpperCase()} · CUSTOMISE THIS SHELF</small>
                <div className="custom-shelf-meta-grid"><label>SHELF NAME<input value={shelf.name} maxLength={42} onChange={(event) => updateCustomShelf(shelf.id, { name: event.target.value.slice(0, 42) })}/></label><label>ICON<select value={shelf.icon || ({ movies: '🎬', games: '🎮', music: '🎧', books: '📚' } as Record<MediaKind, string>)[shelf.kind]} onChange={(event) => updateCustomShelf(shelf.id, { icon: event.target.value })}>{['🎬','🎮','🎧','📚','🍓','🌙','🪼','🦋','💿','🌱','🧸','🪐'].map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label></div>
                <label className="custom-shelf-description">SHELF DESCRIPTION<textarea value={shelf.description || ''} maxLength={120} rows={2} onChange={(event) => updateCustomShelf(shelf.id, { description: event.target.value })} placeholder="Why do these titles belong together?"/></label>
                <label className="custom-shelf-cover-field">SHELF COVER IMAGE URL<input type="url" value={(shelf.cover || '').startsWith('data:') ? '' : shelf.cover || ''} maxLength={600} onChange={(event) => updateCustomShelf(shelf.id, { cover: event.target.value })} placeholder="https://… (optional)"/><small>Use a direct image link or upload a cover below. Images are compressed for browser storage.</small></label><label className="custom-shelf-upload-field">UPLOAD A SHELF COVER<input type="file" accept="image/*" onChange={(event) => uploadShelfCover(shelf.id, event)}/></label>{shelf.cover && <div className="custom-shelf-cover-preview"><img src={shelf.cover} alt={`Preview of ${shelf.name} cover`} onError={(event) => { event.currentTarget.style.display = 'none' }}/><button type="button" onClick={() => updateCustomShelf(shelf.id, { cover: '' })}>REMOVE COVER</button></div>}
                <label className="custom-shelf-rating">PERSONAL VIBE RATING <span>{shelf.rating || 0}/5 ✦</span><input type="range" min="0" max="5" step="1" value={shelf.rating || 0} onChange={(event) => updateCustomShelf(shelf.id, { rating: Number(event.target.value) })}/><small>Optional, just your own rating of this collection.</small></label>
                <div className="custom-shelf-items" aria-label={`Reorder items in ${shelf.name}`}>{shelf.items.map((item, index) => <span key={`${item}-${index}`} draggable onDragStart={(event) => { setDraggedShelfItem({ shelfId: shelf.id, index }); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item) }} onDragOver={(event) => { if (draggedShelfItem?.shelfId === shelf.id) event.preventDefault() }} onDrop={(event) => { event.preventDefault(); if (draggedShelfItem?.shelfId === shelf.id) reorderCustomShelfItem(shelf.id, draggedShelfItem.index, index); setDraggedShelfItem(null) }} onDragEnd={() => setDraggedShelfItem(null)} className={draggedShelfItem?.shelfId === shelf.id && draggedShelfItem.index === index ? 'shelf-item-dragging' : ''}><b>{String(index + 1).padStart(2, '0')}</b><span className="custom-shelf-item-title">{item}</span><button type="button" disabled={index === 0} onClick={() => moveCustomShelfItem(shelf.id, index, -1)} aria-label={`Move ${item} earlier`}>↑</button><button type="button" disabled={index === shelf.items.length - 1} onClick={() => moveCustomShelfItem(shelf.id, index, 1)} aria-label={`Move ${item} later`}>↓</button><button type="button" onClick={() => { setSaved(false); updateCustomShelf(shelf.id, { items: shelf.items.filter((_, itemIndex) => itemIndex !== index) }) }} aria-label={`Remove ${item} from ${shelf.name}`}>×</button></span>)}</div>
                <div className="collection-add-row"><input value={customShelfDrafts[shelf.id] || ''} maxLength={100} onChange={(event) => setCustomShelfDrafts((items) => ({ ...items, [shelf.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomShelfItem(shelf.id) } }} placeholder="Add a title to this shelf"/><button type="button" onClick={() => addCustomShelfItem(shelf.id)} disabled={!((customShelfDrafts[shelf.id] || '').trim()) || shelf.items.length >= 12}>+ ADD TEXT</button></div>
                <button type="button" className="catalogue-search-button" onClick={() => searchCustomShelf(shelf)} disabled={searchingShelf === shelf.id || !((customShelfDrafts[shelf.id] || '').trim()) || shelf.items.length >= 12}>{searchingShelf === shelf.id ? 'SEARCHING…' : '⌕ FIND ARTWORK & ADD'}</button>
                {(customShelfSearchResults[shelf.id] || []).length > 0 && <div className="profile-catalogue-results" aria-label={`${shelf.name} search results`}>{customShelfSearchResults[shelf.id].map((result, index) => <article key={`${result.image}-${index}`}><img src={result.image} alt={`${result.title} artwork`} loading="lazy"/><div><b>{result.title}</b><small>{result.detail || 'Catalogue result'}</small><button type="button" onClick={() => addCustomShelfCatalogueResult(shelf, result)}>+ PIN THIS EDITION</button></div></article>)}</div>}
              </section>)}
            </section>
          </div>}

          <div className="profile-save-row"><p className={saved ? 'save-notice success' : 'save-notice'} aria-live="polite">{notice}</p><div className="profile-save-actions"><button type="button" className="profile-backup-button" onClick={exportBackup} title="Download a backup of your local profile and customisations"><Download size={14} /> BACK UP</button><button type="button" className="profile-backup-button" onClick={() => backupInput.current?.click()} title="Restore a Colourfriction JSON backup"><Upload size={14} /> RESTORE</button><input ref={backupInput} className="profile-backup-file-input" type="file" accept="application/json,.json" onChange={importBackup} aria-label="Choose a Colourfriction backup file"/><input ref={shelfImportInput} className="profile-backup-file-input" type="file" accept="application/json,.json" onChange={importShelf} aria-label="Choose a Colourfriction shelf backup"/><button className="profile-reset-button" onClick={resetProfile}><RotateCcw size={14} /> RESET</button><button className="button-primary" onClick={saveProfile}><Save size={14} /> {saved ? 'SAVED!' : 'SAVE MY PAGE'}</button></div></div>
        </section>

        <section className="profile-preview-column" aria-label="Live profile preview">
          <div className="preview-label"><Eye size={14} /> LIVE PREVIEW <span>CHANGES AS YOU TYPE</span></div>
          <article key={stampRefresh} className={`personal-profile-preview wallpaper-${profile.wallpaper} profile-font-${profile.font} profile-layout-${profile.layout}`} style={{ '--profile-accent': profile.accent, '--profile-paper': profile.paper } as React.CSSProperties}>
            <div className="preview-browser-bar"><span className="browser-dots"><i /><i /><i /></span><span>colourfriction.net/~{profile.username || 'yourname'}</span><span>✳</span></div>
            <div className="preview-profile-header"><div className="preview-avatar">{profile.avatar || '✳'}</div><div className="preview-identity"><span className="preview-online"><i /> ONLINE-ISH</span><h2>{profile.displayName || 'Your name here'}</h2><p>@{profile.username || 'yourname'}</p></div><span className="preview-sticker">WEB<br />PERSON<br />✿</span></div>
            <div className="preview-status"><span>✎ STATUS:</span> {profile.status || 'thinking up a status...'}</div>
            <div className="preview-bio"><span className="preview-section-label">✳ A LITTLE LORE ABOUT ME</span><p>{profile.bio || 'Your bio will show up here. Tell the internet a little about yourself.'}</p></div>
            {profile.badges.length > 0 && <div className="preview-badges">{profile.badges.map((badge, index) => <span key={badge} className={`preview-badge badge-color-${index % 4}`}>✦ {badge}</span>)}</div>}
            <div className="preview-collection-head"><span>✳ MY CURRENT OBSESSIONS</span><small>THE GOOD STUFF</small></div>
            <div className="preview-collections">
              {collections.map((collection) => {
                return <section className="preview-collection" key={collection.key}><h3><span>{collection.icon}</span> {collection.label}</h3><MediaStampGrid value={collection.value} kind={collection.key} compact /></section>
              })}
              {customShelves.map((shelf) => <section className="preview-collection preview-custom-collection" key={shelf.id}><h3><span>{shelf.icon || ({ movies: '🎬', games: '🎮', music: '🎧', books: '📚' } as Record<MediaKind, string>)[shelf.kind]}</span> {shelf.name}</h3>{shelf.cover && <img className="preview-custom-shelf-cover" src={shelf.cover} alt={`${shelf.name} shelf cover`} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }}/> }{shelf.description && <p className="preview-custom-shelf-description">{shelf.description}</p>}{(shelf.rating || 0) > 0 && <small className="preview-custom-shelf-rating">MY VIBE RATING · {'✦'.repeat(shelf.rating || 0)}{'✧'.repeat(5 - (shelf.rating || 0))}</small>}<MediaStampGrid value={shelf.items} kind={shelf.kind} compact /></section>)}
            </div>
            <div className="preview-profile-footer"><span>✿ THANKS FOR VISITING ✿</span><span>MADE WITH FEELING</span></div>
          </article>
          <div className="preview-footnote"><span>✎</span> This is a local preview. Saving stores your choices in this browser only—not on a public account yet.</div><button className="visit-own-page-button" onClick={() => { saveProfile(); onVisit() }}><ExternalLink size={15}/> VISIT MY ACTUAL HOMEPAGE ↗</button>
          <div className="preview-checklist"><b>PROFILE CHECKLIST</b><span className={profile.displayName.trim() && profile.username.trim() ? 'done' : ''}><Check size={13} /> add your identity</span><span className={profile.bio.trim() ? 'done' : ''}><Check size={13} /> write a little lore</span><span className={profile.badges.length ? 'done' : ''}><Check size={13} /> pick your badges</span><span className={collections.some((item) => item.value.trim()) ? 'done' : ''}><Check size={13} /> pin some favourites</span></div>
          <div className="active-palette-note"><span style={{ background: activePalette.accent }} /> CURRENT PALETTE: {activePalette.name.toUpperCase()}</div>
        </section>
      </div>
    </main>
  )
}
