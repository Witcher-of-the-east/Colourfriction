import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Heart, Pencil, Sparkles } from 'lucide-react'
import { MediaStampGrid } from './MediaStamps'

type Profile = {
  displayName: string; username: string; avatar: string; status: string; bio: string
  accent: string; paper: string; wallpaper: string; font: string; layout: string
  badges: string[]; movies: string; games: string; music: string; books: string
}
type Note = { name: string; message: string; date: string }
type StickerPosition = { x: number; y: number; rotation?: number; scale?: number }
type StickerPositions = Record<string, StickerPosition>
type CustomSticker = { id: string; text: string }
type MediaKind = 'movies' | 'games' | 'music' | 'books'
type CustomShelf = { id: string; name: string; kind: MediaKind; items: string[]; description?: string; rating?: number; icon?: string; cover?: string }
const CUSTOM_STICKERS_KEY = 'colourfriction-custom-text-stickers-v1'
const CUSTOM_SHELVES_KEY = 'colourfriction-custom-shelves-v1'
function readCustomStickers(): CustomSticker[] { try { const value = JSON.parse(localStorage.getItem(CUSTOM_STICKERS_KEY) || '[]'); return Array.isArray(value) ? value.slice(0, 20) : [] } catch { return [] } }
function readCustomShelves(): CustomShelf[] { try { const value = JSON.parse(localStorage.getItem(CUSTOM_SHELVES_KEY) || '[]'); return Array.isArray(value) ? value.slice(0, 12) : [] } catch { return [] } }
const STICKER_POSITIONS_KEY = 'colourfriction-sticker-positions-v1'
const DECORATIONS_KEY = 'colourfriction-decorations-v1'
function readDecorations(): string[] {
  try { const saved = JSON.parse(localStorage.getItem(DECORATIONS_KEY) || 'null'); return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string').slice(0, 12) : ['✦', '♡', '✿'] } catch { return ['✦', '♡', '✿'] }
}
function readStickerPositions(): StickerPositions {
  try { return JSON.parse(localStorage.getItem(STICKER_POSITIONS_KEY) || '{}') as StickerPositions } catch { return {} }
}
const defaults: Profile = {
  displayName: 'Internet pal', username: 'yourname', avatar: '✳', status: 'currently collecting little joys',
  bio: 'A tiny corner of the web, made with feeling.', accent: '#8c5bd6', paper: '#fff4d9', wallpaper: 'stars', font: 'pixel', layout: 'scrapbook',
  badges: ['old web kid'], movies: '', games: '', music: '', books: '',
}
function getProfile(): Profile {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem('colourfriction-profile-v1') || '{}') } } catch { return defaults }
}
function readNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem('colourfriction:my-page-notes') || '[]') as Note[] } catch { return [] }
}
export default function PersonalHomepage({ onBack, onEdit }: { onBack: () => void; onEdit: () => void }) {
  const [profile] = useState(getProfile)
  const [decorations, setDecorations] = useState<string[]>(readDecorations)
  const [stickerPositions, setStickerPositions] = useState<StickerPositions>(readStickerPositions)
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null)
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [customStickerText, setCustomStickerText] = useState('')
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>(readCustomStickers)
  const [customShelves] = useState<CustomShelf[]>(readCustomShelves)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [notes, setNotes] = useState<Note[]>(readNotes)
  const [name, setName] = useState('internet stranger')
  const [message, setMessage] = useState('your page feels like a good song')
  const [notice, setNotice] = useState('')
  const [showPlacementGuides, setShowPlacementGuides] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const lists = [
    { key: 'movies', title: 'MOVIES I KEEP THINKING ABOUT', icon: '🎬', value: profile.movies },
    { key: 'games', title: 'GAMES I LIVE IN', icon: '🎮', value: profile.games },
    { key: 'music', title: 'SOUNDS LIKE ME', icon: '🎧', value: profile.music },
    { key: 'books', title: 'BOOKS WITH MY DNA IN THEM', icon: '📚', value: profile.books },
  ]
  const toggleDecoration = (decoration: string) => setDecorations((current) => current.includes(decoration) ? current.filter((item) => item !== decoration) : current.length >= 12 ? current : [...current, decoration])
  useEffect(() => { try { localStorage.setItem(STICKER_POSITIONS_KEY, JSON.stringify(stickerPositions)) } catch { /* storage may be full */ } }, [stickerPositions])
  useEffect(() => { try { localStorage.setItem(DECORATIONS_KEY, JSON.stringify(decorations)) } catch { /* storage may be full */ } }, [decorations])
  useEffect(() => { try { localStorage.setItem(CUSTOM_STICKERS_KEY, JSON.stringify(customStickers)) } catch { setNotice('Browser storage is full; the latest text sticker may not persist.') } }, [customStickers])
  const moveSticker = (event: React.PointerEvent<HTMLElement>) => {
    if (!draggingSticker) return
    const bounds = event.currentTarget.getBoundingClientRect()
    let x = Math.max(2, Math.min(98, ((event.clientX - bounds.left - dragOffset.current.x) / bounds.width) * 100))
    let y = Math.max(1, Math.min(99, ((event.clientY - bounds.top - dragOffset.current.y) / bounds.height) * 100))
    if (snapToGrid) { x = Math.max(2, Math.min(98, Math.round(x / 5) * 5)); y = Math.max(1, Math.min(99, Math.round(y / 5) * 5)) }
    setStickerPositions((current) => ({ ...current, [draggingSticker]: { ...(current[draggingSticker] || {}), x, y } }))
  }
  const resetStickerPositions = () => { setStickerPositions({}); setDraggingSticker(null); setSelectedSticker(null) }
  const addTextSticker = () => {
    const text = customStickerText.trim().slice(0, 70)
    if (!text) return
    if (customStickers.length >= 20) { setNotice('You can add up to 20 custom text stickers.'); return }
    const id = `text-${Date.now()}`
    setCustomStickers((items) => [...items, { id, text }])
    setStickerPositions((items) => ({ ...items, [id]: { x: 50, y: 35 + (customStickers.length % 5) * 7, rotation: (customStickers.length % 5 - 2) * 2, scale: 1 } }))
    setSelectedSticker(id)
    setCustomStickerText('')
  }
  const updateSelectedStickerForId = (id: string, changes: Partial<StickerPosition>) => { setStickerPositions((items) => ({ ...items, [id]: { x: items[id]?.x ?? 50, y: items[id]?.y ?? 40, rotation: items[id]?.rotation ?? 0, scale: items[id]?.scale ?? 1, ...changes } })) }
  const updateSelectedSticker = (changes: Partial<StickerPosition>) => {
    if (!selectedSticker) return
    setStickerPositions((items) => ({ ...items, [selectedSticker]: { x: items[selectedSticker]?.x ?? 50, y: items[selectedSticker]?.y ?? 35, rotation: items[selectedSticker]?.rotation ?? 0, scale: items[selectedSticker]?.scale ?? 1, ...changes } }))
  }
  const deleteSelectedSticker = () => {
    if (!selectedSticker) return
    setCustomStickers((items) => items.filter((item) => item.id !== selectedSticker))
    setDecorations((items) => items.filter((item, index) => `${item}-${index}` !== selectedSticker))
    setStickerPositions((items) => { const next = { ...items }; delete next[selectedSticker]; return next })
    setSelectedSticker(null)
  }
  const allStickerCount = decorations.length + customStickers.length
  const leaveNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !message.trim()) return
    const updated = [{ name: name.trim().slice(0, 28), message: message.trim().slice(0, 160), date: new Date().toLocaleDateString() }, ...notes].slice(0, 12)
    setNotes(updated)
    try { localStorage.setItem('colourfriction:my-page-notes', JSON.stringify(updated)); setNotice('Your note is pinned to this browser’s guestbook.') }
    catch { setNotice('Could not save in this browser. Your note is visible until you leave this page.') }
    setMessage('')
  }
  return <main className="personal-homepage" style={{ '--page-accent': profile.accent, '--page-paper': profile.paper } as React.CSSProperties}>
    <div className="personal-home-toolbar"><button className="profile-back-button" onClick={onBack}><ArrowLeft size={15}/> BACK TO COLOURFRICTION</button><span><Sparkles size={14}/> PERSONAL HOMEPAGE / YOUR LITTLE CORNER</span><button className="button-primary" onClick={onEdit}><Pencil size={14}/> EDIT MY PAGE</button></div>
    <section className="homepage-sticker-workbench" aria-label="Sticker editor"><form onSubmit={(event) => { event.preventDefault(); addTextSticker() }}><label htmlFor="custom-sticker-text">MAKE A TEXT STICKER</label><input id="custom-sticker-text" value={customStickerText} maxLength={70} onChange={(event) => setCustomStickerText(event.target.value)} placeholder="e.g. do not perceive me ✿"/><button type="submit" disabled={!customStickerText.trim() || customStickers.length >= 20}>+ PIN TEXT</button></form><div className="sticker-transform-controls"><span>{selectedSticker ? 'SELECTED STICKER' : 'CLICK A STICKER TO EDIT IT'}</span><label>LEFT / RIGHT <input aria-label="Sticker horizontal position" type="range" min="2" max="98" value={selectedSticker ? stickerPositions[selectedSticker]?.x ?? 50 : 50} disabled={!selectedSticker} onChange={(event) => updateSelectedSticker({ x: Number(event.target.value) })}/></label><label>UP / DOWN <input aria-label="Sticker vertical position" type="range" min="1" max="99" value={selectedSticker ? stickerPositions[selectedSticker]?.y ?? 40 : 40} disabled={!selectedSticker} onChange={(event) => updateSelectedSticker({ y: Number(event.target.value) })}/></label><label>ROTATE <input aria-label="Sticker rotation" type="range" min="-30" max="30" value={selectedSticker ? stickerPositions[selectedSticker]?.rotation ?? 0 : 0} disabled={!selectedSticker} onChange={(event) => updateSelectedSticker({ rotation: Number(event.target.value) })}/></label><label>SIZE <input aria-label="Sticker size" type="range" min="0.65" max="1.8" step="0.05" value={selectedSticker ? stickerPositions[selectedSticker]?.scale ?? 1 : 1} disabled={!selectedSticker} onChange={(event) => updateSelectedSticker({ scale: Number(event.target.value) })}/></label><button type="button" onClick={deleteSelectedSticker} disabled={!selectedSticker}>REMOVE SELECTED</button><label className="sticker-toggle-control"><input type="checkbox" checked={showPlacementGuides} onChange={(event) => setShowPlacementGuides(event.target.checked)}/> SHOW ALIGNMENT GUIDES</label><label className="sticker-toggle-control"><input type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)}/> SNAP TO 5% GRID</label><small>{allStickerCount}/32 stickers · drag, use sliders, or arrow keys for precise placement</small></div></section>
    <article className={`personal-home-sheet wallpaper-${profile.wallpaper} personal-font-${profile.font} personal-layout-${profile.layout}${showPlacementGuides ? ' show-sticker-guides' : ''}`} onPointerMove={moveSticker} onPointerUp={() => setDraggingSticker(null)} onPointerCancel={() => setDraggingSticker(null)}>
      {showPlacementGuides && <div className="sticker-placement-guides" aria-hidden="true"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>}
      <div className="personal-home-browser"><span>● ● ●</span><span>colourfriction.net/~{profile.username || 'yourname'}</span><span>✳ 100% you</span></div>
      <div className="personal-home-stickers" aria-label="Movable page decorations">
        {decorations.map((item, index) => { const id = `${item}-${index}`; const position = stickerPositions[id] || { x: 78 - (index % 4) * 9, y: 24 + (index % 5) * 13, rotation: (index % 5 - 2) * 3, scale: 1 }; return <button type="button" key={id} aria-label={`Select or drag ${item} sticker`} aria-pressed={selectedSticker === id} className={`floating-sticker sticker-position-${index % 5}${draggingSticker === id ? ' sticker-dragging' : ''}${selectedSticker === id ? ' sticker-selected' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translate(-50%,-50%) rotate(${position.rotation ?? 0}deg) scale(${position.scale ?? 1})` }} onClick={() => { setSelectedSticker(id); setStickerPositions((current) => current[id] ? current : { ...current, [id]: position }) }} onKeyDown={(event) => { if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return; event.preventDefault(); setSelectedSticker(id); const current = stickerPositions[id] || position; const step = event.shiftKey ? 5 : 1; updateSelectedStickerForId(id, { x: Math.max(2, Math.min(98, (current.x ?? 50) + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0))), y: Math.max(1, Math.min(99, (current.y ?? 40) + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0))) }) }} onPointerDown={(event) => { event.preventDefault(); setSelectedSticker(id); setStickerPositions((current) => current[id] ? current : { ...current, [id]: position }); const rect = event.currentTarget.getBoundingClientRect(); dragOffset.current = { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }; setDraggingSticker(id); event.currentTarget.setPointerCapture(event.pointerId) }}>{item}</button> })}
        {customStickers.map((item, index) => { const position = stickerPositions[item.id] || { x: 50, y: 40 + (index % 4) * 8, rotation: 0, scale: 1 }; return <button type="button" key={item.id} className={`custom-text-sticker${selectedSticker === item.id ? ' sticker-selected' : ''}${draggingSticker === item.id ? ' sticker-dragging' : ''}`} aria-label={`Select or drag text sticker: ${item.text}`} aria-pressed={selectedSticker === item.id} style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translate(-50%,-50%) rotate(${position.rotation ?? 0}deg) scale(${position.scale ?? 1})` }} onClick={() => { setSelectedSticker(item.id); setStickerPositions((current) => current[item.id] ? current : { ...current, [item.id]: position }) }} onKeyDown={(event) => { if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return; event.preventDefault(); setSelectedSticker(item.id); const current = stickerPositions[item.id] || position; const step = event.shiftKey ? 5 : 1; updateSelectedStickerForId(item.id, { x: Math.max(2, Math.min(98, (current.x ?? 50) + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0))), y: Math.max(1, Math.min(99, (current.y ?? 40) + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0))) }) }} onPointerDown={(event) => { event.preventDefault(); setSelectedSticker(item.id); setStickerPositions((current) => current[item.id] ? current : { ...current, [item.id]: position }); const rect = event.currentTarget.getBoundingClientRect(); dragOffset.current = { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }; setDraggingSticker(item.id); event.currentTarget.setPointerCapture(event.pointerId) }}>{item.text}</button> })}
      </div>
      <div className="personal-home-banner"><span>WELCOME TO MY LITTLE CORNER OF THE INTERNET</span><span className="personal-banner-doodle">✿ ✧ ♡ ✧ ✿</span></div>
      <div className="personal-home-hero"><div className="personal-home-avatar">{profile.avatar || '✳'}</div><div className="personal-home-intro"><span className="personal-home-online"><i/> ONLINE-ISH · PROBABLY LISTENING TO SOMETHING</span><h1>{profile.displayName || 'Your name here'}<span>’s homepage</span></h1><p className="personal-home-handle">@{profile.username || 'yourname'}</p><p className="personal-home-status">✎ STATUS: {profile.status || 'currently buffering...'}</p></div><div className="personal-home-counter"><small>VISITORS</small><b>000428</b><span>thanks for stopping by ♡</span></div></div>
      <div className="personal-home-decoration-row"><span>DECORATE MY DESKTOP:</span>{['✦', '♡', '✿', '☾', '★', '🦋', '🍓', '🎧', '🪼', '🐈', '🍄', '🪐'].map((item) => <button key={item} className={decorations.includes(item) ? 'decoration-on' : ''} onClick={() => toggleDecoration(item)} aria-pressed={decorations.includes(item)} disabled={!decorations.includes(item) && decorations.length >= 12}>{item}</button>)}<small>pin above, then drag stickers anywhere on the page</small><button type="button" className="reset-sticker-layout" onClick={resetStickerPositions}>RESET POSITIONS ↺</button></div>
      <div className="personal-home-content"><aside className="personal-home-sidebar"><section className="personal-home-card about-card"><h2>✳ THE TINY LORE</h2><p>{profile.bio || 'Still writing my lore. Check back soon.'}</p><div className="personal-home-badges">{profile.badges.map((badge) => <span key={badge}>✦ {badge}</span>)}</div></section><section className="personal-home-card link-card"><h2>↗ LITTLE WEB BADGES</h2><div className="personal-badge-grid"><span>♥ NICHE<br/>INTERESTS</span><span>MADE WITH<br/>FEELING ✿</span><span>NO ALGO<br/>JUST VIBES</span><span>BEST VIEWED<br/>WITH CURIOSITY</span></div><p>if you like this page, make one of your own.</p></section><section className="personal-home-card currently-card"><h2>♫ CURRENTLY</h2><p>collecting small joys</p><div className="personal-equalizer">{Array.from({length: 18}, (_, index) => <i key={index} style={{ animationDelay: `${index * -0.13}s` }}/>)}</div><small>the soundtrack is imaginary (for now)</small></section></aside>
      <div className="personal-home-main"><section className="personal-home-welcome"><div className="personal-section-kicker">✳ YOU FOUND THE FRONT DOOR</div><h2>Stay a little. <em>Look around.</em></h2><p>This page is a work in progress, just like the person who made it. There are favourite things, tiny decorations, and a guestbook for your thoughts.</p></section>
      <section className="personal-home-collections"><div className="personal-section-title"><span>THE THINGS CURRENTLY LIVING IN MY HEAD</span><span>✳ {4 + customShelves.length} SHELVES</span></div><div className="personal-home-shelf-grid">{lists.map((list) => <article className="personal-home-shelf" key={list.key}><h3><span>{list.icon}</span>{list.title}</h3><MediaStampGrid value={list.value} kind={list.key as 'movies' | 'games' | 'music' | 'books'} /><span className="shelf-stamp">CURATED WITH FEELING</span></article>)}{customShelves.map((shelf) => <article className="personal-home-shelf personal-home-custom-shelf" key={shelf.id}><h3><span>{shelf.icon || ({ movies: '🎬', games: '🎮', music: '🎧', books: '📚' } as Record<MediaKind, string>)[shelf.kind]}</span>{shelf.name}</h3>{shelf.cover && <img className="personal-custom-shelf-cover" src={shelf.cover} alt={`${shelf.name} shelf cover`} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }}/> }{shelf.description && <p className="personal-custom-shelf-description">{shelf.description}</p>}{(shelf.rating || 0) > 0 && <div className="personal-custom-shelf-rating" aria-label={`Personal vibe rating ${shelf.rating} out of 5`}>MY VIBE RATING · {'✦'.repeat(shelf.rating || 0)}{'✧'.repeat(5 - (shelf.rating || 0))}</div>}<MediaStampGrid value={shelf.items} kind={shelf.kind} /><span className="shelf-stamp">A LITTLE SHELF OF MY OWN</span></article>)}</div></section>
      <section className="personal-guestbook"><div className="personal-section-title"><span>THE GUESTBOOK</span><span>LEAVE A LITTLE PROOF YOU WERE HERE ♡</span></div><form onSubmit={leaveNote} className="personal-note-form"><label>YOUR INTERNET NAME<input value={name} onChange={(event) => setName(event.target.value)} maxLength={28} required/></label><label>YOUR LITTLE NOTE<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={160} rows={2} required/></label><button className="button-primary" type="submit">PIN MY NOTE <Heart size={14}/></button></form>{notice && <p className="personal-note-notice" role="status">{notice}</p>}<div className="personal-note-grid">{notes.length ? notes.map((note, index) => <article key={`${note.name}-${index}`} className={`personal-note-card personal-note-card-${index % 4}`}><span>✳ FROM {note.name}</span><p>{note.message}</p><small>{note.date || 'JUST NOW'} · THANKS FOR VISITING</small></article>) : <div className="personal-empty-guestbook">✎ The guestbook is quiet for now. Leave the first little hello.</div>}</div></section></div></div>
      <footer className="personal-home-footer"><span>✿ THANKS FOR VISITING {profile.displayName || 'MY PAGE'}’S CORNER ✿</span><span>MADE WITH FEELING, NOT AN ALGORITHM</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BACK TO TOP ↑</button></footer>
    </article><p className="personal-home-disclaimer">LOCAL PREVIEW · Your profile and guestbook are stored in this browser only. This page is not public or shared with other visitors yet.</p>
  </main>
}
