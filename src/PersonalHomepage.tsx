import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Heart, Pencil, Sparkles } from 'lucide-react'

type Profile = {
  displayName: string; username: string; avatar: string; status: string; bio: string
  accent: string; paper: string; wallpaper: string; font: string; layout: string
  badges: string[]; movies: string; games: string; music: string; books: string
}
type Note = { name: string; message: string; date: string }
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
  const [decorations, setDecorations] = useState(['✦', '♡', '✿'])
  const [notes, setNotes] = useState<Note[]>(readNotes)
  const [name, setName] = useState('internet stranger')
  const [message, setMessage] = useState('your page feels like a good song')
  const [notice, setNotice] = useState('')
  const lists = [
    { key: 'movies', title: 'MOVIES I KEEP THINKING ABOUT', icon: '🎬', value: profile.movies },
    { key: 'games', title: 'GAMES I LIVE IN', icon: '🎮', value: profile.games },
    { key: 'music', title: 'SOUNDS LIKE ME', icon: '🎧', value: profile.music },
    { key: 'books', title: 'BOOKS WITH MY DNA IN THEM', icon: '📚', value: profile.books },
  ]
  const toggleDecoration = (decoration: string) => setDecorations((current) => current.includes(decoration) ? current.filter((item) => item !== decoration) : [...current, decoration])
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
    <article className={`personal-home-sheet wallpaper-${profile.wallpaper} personal-font-${profile.font} personal-layout-${profile.layout}`}>
      <div className="personal-home-browser"><span>● ● ●</span><span>colourfriction.net/~{profile.username || 'yourname'}</span><span>✳ 100% you</span></div>
      <div className="personal-home-banner"><span>WELCOME TO MY LITTLE CORNER OF THE INTERNET</span><span className="personal-banner-doodle">✿ ✧ ♡ ✧ ✿</span></div>
      <div className="personal-home-hero"><div className="personal-home-avatar">{profile.avatar || '✳'}</div><div className="personal-home-intro"><span className="personal-home-online"><i/> ONLINE-ISH · PROBABLY LISTENING TO SOMETHING</span><h1>{profile.displayName || 'Your name here'}<span>’s homepage</span></h1><p className="personal-home-handle">@{profile.username || 'yourname'}</p><p className="personal-home-status">✎ STATUS: {profile.status || 'currently buffering...'}</p></div><div className="personal-home-counter"><small>VISITORS</small><b>000428</b><span>thanks for stopping by ♡</span></div></div>
      <div className="personal-home-decoration-row"><span>DECORATE MY DESKTOP:</span>{['✦', '♡', '✿', '☾', '★', '🦋', '🍓', '🎧'].map((item) => <button key={item} className={decorations.includes(item) ? 'decoration-on' : ''} onClick={() => toggleDecoration(item)} aria-pressed={decorations.includes(item)}>{item}</button>)}<small>tap stickers to pin / unpin</small></div>
      <div className="personal-home-content"><aside className="personal-home-sidebar"><section className="personal-home-card about-card"><h2>✳ THE TINY LORE</h2><p>{profile.bio || 'Still writing my lore. Check back soon.'}</p><div className="personal-home-badges">{profile.badges.map((badge) => <span key={badge}>✦ {badge}</span>)}</div></section><section className="personal-home-card link-card"><h2>↗ LITTLE WEB BADGES</h2><div className="personal-badge-grid"><span>♥ NICHE<br/>INTERESTS</span><span>MADE WITH<br/>FEELING ✿</span><span>NO ALGO<br/>JUST VIBES</span><span>BEST VIEWED<br/>WITH CURIOSITY</span></div><p>if you like this page, make one of your own.</p></section><section className="personal-home-card currently-card"><h2>♫ CURRENTLY</h2><p>collecting small joys</p><div className="personal-equalizer">{Array.from({length: 18}, (_, index) => <i key={index} style={{ animationDelay: `${index * -0.13}s` }}/>)}</div><small>the soundtrack is imaginary (for now)</small></section></aside>
      <div className="personal-home-main"><section className="personal-home-welcome"><div className="personal-section-kicker">✳ YOU FOUND THE FRONT DOOR</div><h2>Stay a little. <em>Look around.</em></h2><p>This page is a work in progress, just like the person who made it. There are favourite things, tiny decorations, and a guestbook for your thoughts.</p><div className="personal-home-stickers">{decorations.map((item, index) => <span key={`${item}-${index}`} className={`floating-sticker sticker-position-${index % 5}`}>{item}</span>)}</div></section>
      <section className="personal-home-collections"><div className="personal-section-title"><span>THE THINGS CURRENTLY LIVING IN MY HEAD</span><span>✳ 04 SHELVES</span></div><div className="personal-home-shelf-grid">{lists.map((list) => { const items = list.value.split(',').map((item) => item.trim()).filter(Boolean); return <article className="personal-home-shelf" key={list.key}><h3><span>{list.icon}</span>{list.title}</h3>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="personal-empty-shelf">a shelf waiting for its first obsession...</p>}<span className="shelf-stamp">CURATED WITH FEELING</span></article> })}</div></section>
      <section className="personal-guestbook"><div className="personal-section-title"><span>THE GUESTBOOK</span><span>LEAVE A LITTLE PROOF YOU WERE HERE ♡</span></div><form onSubmit={leaveNote} className="personal-note-form"><label>YOUR INTERNET NAME<input value={name} onChange={(event) => setName(event.target.value)} maxLength={28} required/></label><label>YOUR LITTLE NOTE<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={160} rows={2} required/></label><button className="button-primary" type="submit">PIN MY NOTE <Heart size={14}/></button></form>{notice && <p className="personal-note-notice" role="status">{notice}</p>}<div className="personal-note-grid">{notes.length ? notes.map((note, index) => <article key={`${note.name}-${index}`} className={`personal-note-card personal-note-card-${index % 4}`}><span>✳ FROM {note.name}</span><p>{note.message}</p><small>{note.date || 'JUST NOW'} · THANKS FOR VISITING</small></article>) : <div className="personal-empty-guestbook">✎ The guestbook is quiet for now. Leave the first little hello.</div>}</div></section></div></div>
      <footer className="personal-home-footer"><span>✿ THANKS FOR VISITING {profile.displayName || 'MY PAGE'}’S CORNER ✿</span><span>MADE WITH FEELING, NOT AN ALGORITHM</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BACK TO TOP ↑</button></footer>
    </article><p className="personal-home-disclaimer">LOCAL PREVIEW · Your profile and guestbook are stored in this browser only. This page is not public or shared with other visitors yet.</p>
  </main>
}
