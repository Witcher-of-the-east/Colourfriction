import { useEffect, useMemo, useState } from 'react'
import ProfileEditor from './ProfileEditor'
import PersonalHomepage from './PersonalHomepage'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  Disc3, Gamepad2, Heart, Menu, Music2, Palette, Search,
  Sparkles, Tv, X, Film, Globe2,
} from 'lucide-react'

type Category = 'all' | 'movies' | 'games' | 'music' | 'series' | 'books'
type Pick = { title: string; kind: Exclude<Category, 'all'>; detail: string; image: string; tag: string }
type Neighbour = { handle: string; avatar: string; color: string; tagline: string; bio: string; likes: string[]; note: string }

const picks: Pick[] = [
  { title: 'Perfect Blue', kind: 'movies', detail: '1997 · Satoshi Kon', image: 'https://image.tmdb.org/t/p/w500/6e5g6w5b9qU7R7B2Y7Y0x6m4N4J.jpg', tag: 'brain-melter' },
  { title: 'Night in the Woods', kind: 'games', detail: '2017 · Infinite Fall', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg', tag: 'late-night comfort' },
  { title: 'Punisher', kind: 'music', detail: 'Phoebe Bridgers · 2020', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=85', tag: 'repeat forever' },
  { title: 'The Good Place', kind: 'series', detail: '2016 · comedy / philosophy', image: 'https://image.tmdb.org/t/p/w500/qIhsuhoIYR5yTnDta0IL4senbeN.jpg', tag: 'rewatch club' },
  { title: 'Convenience Store Woman', kind: 'books', detail: 'Sayaka Murata · 2016', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=85', tag: 'tiny but mighty' },
  { title: 'Everything Everywhere', kind: 'movies', detail: '2022 · Daniels', image: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', tag: 'feel everything' },
]

const categoryNames: Record<Category, string> = {
  all: 'everything', movies: 'movies', games: 'games', music: 'music', series: 'series', books: 'books',
}

const categoryIcons = {
  movies: Film, games: Gamepad2, music: Music2, series: Tv, books: BookOpen,
}

const neighbours: Neighbour[] = [
  { handle: 'moth.mp3', avatar: '🦋', color: 'pink', tagline: 'music for abandoned malls', bio: 'collects songs that sound like a memory you cannot quite place. usually online after midnight.', likes: ['Portishead', 'Cocteau Twins', 'Silent Hill 2', 'Perfect Blue'], note: 'leave a song recommendation' },
  { handle: 'pixel_goblin', avatar: '👾', color: 'yellow', tagline: '80 hours of lore, minimum', bio: 'will absolutely read every note, letter, and suspiciously placed book in your game.', likes: ['Disco Elysium', 'Outer Wilds', 'Night in the Woods', 'indie games'], note: 'tell me your favourite side quest' },
  { handle: 'libraryghost', avatar: '📚', color: 'blue', tagline: 'annotates books like crime scenes', bio: 'likes strange little novels, marginalia, and stories that leave a bruise on your brain.', likes: ['Dune', 'Ursula K. Le Guin', 'Convenience Store Woman', 'weird fiction'], note: 'swap a book rec' },
  { handle: 'starling.exe', avatar: '🌟', color: 'green', tagline: 'films with devastating endings', bio: 'keeps a watchlist longer than a grocery receipt. will defend animation as cinema forever.', likes: ['Satoshi Kon', 'The Good Place', 'Everything Everywhere', 'animation'], note: 'talk to me about endings' },
]

const tinyQuests = [
  'Replay a song that sounds like a specific memory.',
  'Tell someone why your favourite side character matters.',
  'Find a film poster with colours you want to live inside.',
  'Write down one tiny thing you loved this week.',
  'Recommend something niche to a willing internet pal.',
  'Take a 5-minute detour into somebody else’s favourite thing.',
]

const themes = [
  { name: 'grape soda', accent: '#8c5bd6', paper: '#f5f0e7', ink: '#26231f', soft: '#e8defa' },
  { name: 'tomato jam', accent: '#d94d35', paper: '#fff0df', ink: '#34251f', soft: '#ffd7c8' },
  { name: 'poolside', accent: '#267e8c', paper: '#edf5ef', ink: '#1f2b2b', soft: '#cce9e4' },
  { name: 'blue raspberry', accent: '#3b5ccc', paper: '#f0f1ff', ink: '#20233c', soft: '#dce2ff' },
]

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(`colourfriction:${key}`)
    return stored === null ? fallback : JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function getTasteMatchCount(person: Neighbour): number {
  try {
    const raw = window.localStorage.getItem('colourfriction-profile-v1')
    if (!raw) return 0
    const profile = JSON.parse(raw) as { movies?: string; games?: string; music?: string; books?: string }
    const interests = [profile.movies, profile.games, profile.music, profile.books]
      .flatMap((value) => (value || '').split(',').map((item) => item.trim().toLowerCase()))
      .filter((item) => item.length > 2)
    return person.likes.filter((like) => interests.some((interest) => interest.includes(like.toLowerCase()) || like.toLowerCase().includes(interest))).length
  } catch {
    return 0
  }
}

function App() {
  const [category, setCategory] = useState<Category>('all')
  const [profileMode, setProfileMode] = useState(false)
  const [personalPageMode, setPersonalPageMode] = useState(false)
  const [themeIndex, setThemeIndex] = useState(() => {
    const saved = readStored<number>('theme', 0)
    return Number.isInteger(saved) && saved >= 0 && saved < themes.length ? saved : 0
  })
  const [showThemes, setShowThemes] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [liked, setLiked] = useState<number[]>(() => readStored<number[]>('favourites', [2]).filter((item) => Number.isInteger(item) && item >= 0 && item < picks.length))
  const [guestbookOpen, setGuestbookOpen] = useState(false)
  const [activeNeighbour, setActiveNeighbour] = useState<Neighbour | null>(null)
  const [cursorMode, setCursorMode] = useState(() => readStored<boolean>('sparkle-cursor', false))
  const [tasteTwinMode, setTasteTwinMode] = useState(false)
  const [guestName, setGuestName] = useState('internet stranger')
  const [guestMessage, setGuestMessage] = useState('your site feels like a warm computer')
  const [guestEntries, setGuestEntries] = useState(() => readStored('guestbook', [{ name: 'moth.mp3', message: 'this place has excellent dust particles ✦' }, { name: 'pixel_goblin', message: 'signed the guestbook with my whole heart' }]))
  const [notice, setNotice] = useState('')
  const [questIndex, setQuestIndex] = useState(() => readStored<number>('tiny-quest', 0) % tinyQuests.length)
  const [questDone, setQuestDone] = useState(false)
  const theme = themes[themeIndex]
  const filteredPicks = useMemo(() => picks.filter((pick) => category === 'all' || pick.kind === category), [category])
  const searchResults = useMemo(() => picks.filter((pick) => `${pick.title} ${pick.detail} ${pick.kind}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])

  const toggleLike = (index: number) => setLiked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])

  useEffect(() => {
    try { window.localStorage.setItem('colourfriction:theme', JSON.stringify(themeIndex)) } catch { /* storage may be unavailable */ }
  }, [themeIndex])
  useEffect(() => {
    try { window.localStorage.setItem('colourfriction:sparkle-cursor', JSON.stringify(cursorMode)) } catch { /* storage may be unavailable */ }
  }, [cursorMode])
  useEffect(() => {
    try { window.localStorage.setItem('colourfriction:favourites', JSON.stringify(liked)) } catch { /* storage may be unavailable */ }
  }, [liked])
  useEffect(() => {
    try { window.localStorage.setItem('colourfriction:guestbook', JSON.stringify(guestEntries)) } catch { /* storage may be unavailable */ }
  }, [guestEntries])
  useEffect(() => {
    try { window.localStorage.setItem('colourfriction:tiny-quest', JSON.stringify(questIndex)) } catch { /* storage may be unavailable */ }
  }, [questIndex])
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setGuestbookOpen(false)
        setActiveNeighbour(null)
        setShowThemes(false)
        setMenuOpen(false)
        setNotice('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`site-shell ${cursorMode ? 'sparkle-cursor-mode' : ''}`} style={{ '--accent': theme.accent, '--paper': theme.paper, '--ink': theme.ink, '--soft': theme.soft } as React.CSSProperties}>
      <div className="topline"><span><span className="live-dot" /> YOUR PERSONAL INTERNET, IN PROGRESS</span><span className="topline-right">INDEPENDENT WEB CLUB <span className="pixel-heart">♥</span> EST. 2026</span></div>

      <header className="masthead">
        <a className="wordmark" href="#home" aria-label="Colourfriction home"><span className="wordmark-flower">✳</span>colour<span>friction</span><sup>®?</sup></a>
        <p className="masthead-note">a little corner for<br />the things that stick.</p>
        <div className="masthead-actions">
          <button className="icon-button search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search the archive"><Search size={17} /><span>SEARCH</span></button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
          <button className="theme-toggle" onClick={() => setShowThemes(!showThemes)}><Palette size={16} /> CHANGE THE VIBE <ChevronDown size={13} /></button><button className={`cursor-toggle ${cursorMode ? 'cursor-toggle-on' : ''}`} onClick={() => setCursorMode(!cursorMode)} aria-pressed={cursorMode} title="Toggle sparkle cursor">✧ {cursorMode ? 'SPARKLE ON' : 'SPARKLE CURSOR'}</button>
        </div>
        {showThemes && <div className="theme-popover"><div className="popover-title">PICK YOUR PIXEL JUICE <button onClick={() => setShowThemes(false)} aria-label="Close themes"><X size={14} /></button></div><div className="theme-options">{themes.map((item, index) => <button key={item.name} className={`theme-option ${themeIndex === index ? 'selected' : ''}`} onClick={() => setThemeIndex(index)}><span className="swatches"><i style={{ background: item.paper }} /><i style={{ background: item.accent }} /><i style={{ background: item.ink }} /></span><span>{item.name}</span>{themeIndex === index && <Check size={14} />}</button>)}</div><p>just a preview for now — more knobs coming soon.</p></div>}
      </header>

      <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
        <a className="nav-active" href="#home"><span>01</span> THE FRONT PAGE</a>
        <a href="#discover"><span>02</span> THE DISCOVERY DESK</a>
        <a href="#community"><span>03</span> PEOPLE-WATCHING</a>
        <a href="#about" onClick={() => setProfileMode(false)}><span>04</span> WHAT IS THIS?</a>
        <button className={`profile-nav-button ${profileMode ? 'profile-nav-active' : ''}`} onClick={() => { setProfileMode(true); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><span>05</span> MY PROFILE LAB ↗</button>
        <span className="nav-status"><span className="live-dot" /> ALL SYSTEMS A LITTLE SILLY</span>
      </nav>

      {personalPageMode ? <PersonalHomepage onBack={() => { setPersonalPageMode(false); setProfileMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onEdit={() => { setPersonalPageMode(false); setProfileMode(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} /> : profileMode ? <ProfileEditor onBack={() => { setProfileMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onVisit={() => { setProfileMode(false); setPersonalPageMode(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} /> : <div className="desktop-layout">
        <aside className="web-sidebar" aria-label="Personal web sidebar">
          <section className="sidebar-window profile-window"><div className="window-bar"><span>✳ ABOUT THIS PLACE</span><span>_ □ ×</span></div><div className="sidebar-inner"><div className="pixel-avatar">☺</div><h2>hi, internet pal!</h2><p>you have stumbled into my little corner of the web.</p><div className="status-pill"><span className="live-dot" /> SITE UNDER CONSTRUCTION</div><p className="handwritten">please wipe your shoes ♡</p></div></section>
          <section className="sidebar-window"><div className="window-bar"><span>NOW PLAYING</span><span>♫</span></div><div className="now-playing"><div className="cassette"><span>CF MIXTAPE 01</span><div className="cassette-reels"><i /><i /></div><small>side a · feelings</small></div><b>the internet is a mixtape</b><p>currently looping: imaginary soundtracks</p><div className="equalizer"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></section>
          <section className="sidebar-window"><div className="window-bar"><span>LINKS I LIKE</span><span>↗</span></div><div className="sidebar-link-list"><a href="#discover">✿ media scrapbook</a><a href="#community">☻ neighbour directory</a><a href="#about">✎ about this experiment</a><button onClick={() => setGuestbookOpen(true)}>♡ sign the guestbook</button></div></section>
          <section className="badge-window"><div className="window-bar"><span>MY WEB BADGES</span><span>★</span></div><div className="badge-grid"><span className="web-badge badge-pink">I ♥ NICHE<br/>INTERESTS</span><span className="web-badge badge-yellow">MADE WITH<br/>TOO MUCH<br/>FEELING</span><span className="web-badge badge-purple">BEST VIEWED<br/>WITH CURIOSITY</span><span className="web-badge badge-green">NO ALGO<br/>JUST VIBES</span></div><p className="badge-caption">88 × 31 PIXELS OF PERSONALITY</p></section>
          <div className="web-ring"><span>← PREV SITE</span><b>✿ THE TASTE WEBRING ✿</b><span>NEXT SITE →</span></div>
          <div className="visitor-counter"><span>YOU ARE VISITOR</span><b>000<span>4</span>28</b><small>since this morning-ish</small></div>
          <div className="sidebar-sticker">stay<br/>weird!<span>↘</span></div>
        </aside>
        <main id="home">
        <section className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-star">✳</span> A HOMEPAGE FOR YOUR HYPERFIXATIONS <span className="eyebrow-line" /></div>
            <h1>Your taste<br />is <em>your</em> <span className="outlined-word">business.</span></h1>
            <p className="hero-intro">A tiny internet neighbourhood for the movies you quote, the games you disappear into, the songs you play 47 times, and the books you lend (but secretly want back).</p>
            <div className="hero-buttons"><a className="button-primary" href="#discover">WANDER AROUND <ArrowUpRight size={16} /></a><a className="button-text" href="#about">WAIT, WHAT IS THIS? <ArrowRight size={15} /></a></div>
            <div className="hero-footnote"><span className="scribble-arrow">↳</span> NO ALGORITHM KNOWS YOU BETTER THAN YOU DO.</div>
          </div>
          <div className="hero-art" aria-label="Collage of entertainment interests">
            <div className="art-paper-grid" />
            <div className="sticker sticker-star">✳<small>VERY<br />IMPORTANT</small></div>
            <div className="sticker sticker-sparkle">✧</div>
            <div className="art-note note-top">THINGS I<br />CAN'T SHUT UP ABOUT</div>
            <div className="poster poster-purple"><span className="poster-kicker">A FILM BY YOUR BRAIN</span><strong>THE<br />FEELING<br /><i>IS MUTUAL</i></strong><span className="poster-bottom">DIRECTOR'S CUT · 2026</span></div>
            <div className="poster poster-orange"><span className="sun-shape">☼</span><strong>GOOD<br />TASTE<br /><i>CLUB</i></strong><span className="poster-bottom">MEMBERS WANTED</span></div>
            <div className="mini-disc"><Disc3 size={48} strokeWidth={1.2} /><span>side b</span></div>
            <div className="art-note note-bottom">CURRENTLY COLLECTING<br /><b>FEELINGS & MEDIA</b></div>
            <div className="tiny-doodle">✳<br />♡</div>
            <div className="tape tape-one" /><div className="tape tape-two" />
          </div>
        </section>

        <div className="ticker" aria-label="Site announcement"><div className="ticker-track"><span>WELCOME TO COLOURFRICTION</span><b>✳</b><span>YOUR TASTE IS A PERSONAL ARCHIVE</span><b>✳</b><span>LESS SCROLLING, MORE FEELING</span><b>✳</b><span>WELCOME TO COLOURFRICTION</span><b>✳</b><span>YOUR TASTE IS A PERSONAL ARCHIVE</span><b>✳</b><span>LESS SCROLLING, MORE FEELING</span><b>✳</b></div></div>

        <section className={`tiny-quest-strip ${questDone ? 'quest-complete' : ''}`} aria-label="Tiny internet side quest">
          <div className="quest-stamp">SIDE<br />QUEST<span>✳</span></div>
          <div className="quest-copy"><span className="tiny-label">A VERY SMALL ASSIGNMENT FOR YOUR BRAIN</span><p>{questDone ? 'QUEST COMPLETE. PLEASE ACCEPT THIS INVISIBLE GOLD STAR. ★' : tinyQuests[questIndex]}</p><small>{questDone ? 'you made the internet 0.2% more human' : 'no points, no streaks, no productivity guilt.'}</small></div>
          <div className="quest-actions"><button className="quest-done-button" onClick={() => setQuestDone(!questDone)}>{questDone ? 'UNDO THE MAGIC ↶' : 'I DID THE THING ✓'}</button><button className="quest-next-button" onClick={() => { setQuestIndex((current) => (current + 1 + Math.floor(Math.random() * (tinyQuests.length - 1))) % tinyQuests.length); setQuestDone(false) }}>ANOTHER QUEST ↻</button></div>
          <span className="quest-sparkle quest-sparkle-one">✧</span><span className="quest-sparkle quest-sparkle-two">✳</span>
        </section>

        <section className="intro-strip" id="about">
          <div className="section-stamp">HELLO, INTERNET!<span>★</span></div>
          <div className="intro-text"><h2>Remember when the web felt like <em>people?</em></h2><p>Colourfriction is a place to make a little home for the stuff you love. Build a page that feels like you, find people with suspiciously similar taste, and leave the endless recommendation machine behind for a bit.</p></div>
          <div className="intro-aside"><span className="tiny-label">OUR VERY SERIOUS MISSION</span><span className="mission-doodle">☻</span><p>MAKE THE INTERNET<br />PERSONAL AGAIN.</p><span className="aside-underline" /></div>
        </section>

        <section className="discover-section" id="discover">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-star">✳</span> THE COMMUNITY SCRAPBOOK</div><h2>Fresh from the <em>brain shelf.</em></h2></div><div className="discover-actions"><button className="small-link surprise-link" onClick={() => { const pick = picks[Math.floor(Math.random() * picks.length)]; setCategory(pick.kind); setNotice(`THE ORACLE HAS CHOSEN: ${pick.title.toUpperCase()} — go investigate.`); window.setTimeout(() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0) }}>SURPRISE ME ✷ <Sparkles size={14} /></button><a href="#community" className="small-link">SEE WHAT PEOPLE LOVE <ArrowUpRight size={14} /></a></div></div>
          <div className="filter-row" role="group" aria-label="Filter media by category">{(['all', 'movies', 'games', 'music', 'series', 'books'] as Category[]).map((item) => <button key={item} onClick={() => setCategory(item)} className={`filter-chip ${category === item ? 'filter-active' : ''}`}>{item === 'all' ? <Sparkles size={13} /> : (() => { const Icon = categoryIcons[item]; return <Icon size={13} /> })()}{categoryNames[item]}</button>)}<span className="filter-count">{filteredPicks.length.toString().padStart(2, '0')} THINGS ON THE TABLE</span></div>
          <div className="media-grid">{filteredPicks.map((pick) => { const originalIndex = picks.indexOf(pick); const Icon = categoryIcons[pick.kind]; return <article className={`media-item media-${pick.kind}`} key={pick.title}><div className="media-art"><img src={pick.image} alt={`${pick.title} artwork`} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /><span className="media-kind"><Icon size={12} /> {pick.kind}</span><button className={`heart-button ${liked.includes(originalIndex) ? 'is-liked' : ''}`} onClick={() => toggleLike(originalIndex)} aria-label={liked.includes(originalIndex) ? `Unlike ${pick.title}` : `Like ${pick.title}`}><Heart size={15} fill={liked.includes(originalIndex) ? 'currentColor' : 'none'} /></button><span className="art-index">CF / 00{originalIndex + 1}</span></div><div className="media-meta"><div><h3>{pick.title}</h3><p>{pick.detail}</p></div><ArrowUpRight size={15} className="meta-arrow" /></div><span className="media-tag">✳ {pick.tag}</span></article> })}</div>
          <div className="shelf-bottom"><span>THESE ARE DEMO PICKS. YOUR OBSESSIONS GO HERE.</span><a href="#community">BROWSE THE NEIGHBOURHOOD <ArrowRight size={14} /></a></div>
        </section>

        <section className="community-section" id="community">
          <div className="community-copy"><div className="eyebrow"><span className="eyebrow-star">✳</span> OTHER HUMANS, APPARENTLY</div><h2>Find your<br /><em>kind of weird.</em></h2><p>There are people out there who also think that one side character deserved better. Let's find them.</p><a className="button-primary button-dark" href="#join">MEET THE NEIGHBOURS <ArrowUpRight size={16} /></a><div className="community-counter"><span className="counter-icon"><Globe2 size={18} /></span><span><b>001,337</b><small>PROBABLY THINKING ABOUT A MOVIE</small></span></div></div>
          <div className="people-board"><div className="board-label">PINNED TO THE COMMUNITY BOARD <span>✳</span></div><div className="person-note note-pink"><div className="avatar avatar-pink">m</div><div><b>moth.mp3</b><p>“music that sounds like a haunted house”</p><span>LIKES: PORTISHEAD · SILVER SOUL</span></div><button className="visit-neighbour" onClick={() => setActiveNeighbour(neighbours[0])}>OPEN PAGE ↗</button><span className="pin-dot" /></div><div className="person-note note-yellow"><div className="avatar avatar-yellow">☆</div><div><b>pixel_goblin</b><p>“here for games with 80 hours of lore”</p><span>LIKES: DISCO ELYSIUM · OUTER WILDS</span></div><button className="visit-neighbour" onClick={() => setActiveNeighbour(neighbours[1])}>OPEN PAGE ↗</button><span className="pin-dot" /></div><div className="person-note note-blue"><div className="avatar avatar-blue">☻</div><div><b>libraryghost</b><p>“I annotate books like they're crime scenes”</p><span>LIKES: DUNE · URSULA K. LE GUIN</span></div><button className="visit-neighbour" onClick={() => setActiveNeighbour(neighbours[2])}>OPEN PAGE ↗</button><span className="pin-dot" /></div><div className="board-doodle">YOU<br />MIGHT<br />FIT HERE <span>↙</span></div><div className="board-footer"><span>NO COOL KIDS TABLE.</span><span>EVERYONE'S A LITTLE NICHE.</span></div></div>
        </section>

        <section className="neighbour-directory" aria-labelledby="directory-title">
          <div className="directory-heading"><div><span className="tiny-label">THE NEIGHBOURHOOD DIRECTORY · DEMO PROFILES</span><h2 id="directory-title">Knock on a <em>little internet door.</em></h2><button className={`taste-twin-toggle ${tasteTwinMode ? 'taste-twin-active' : ''}`} onClick={() => setTasteTwinMode(!tasteTwinMode)}>{tasteTwinMode ? 'SHOW EVERYONE ↶' : 'FIND MY TASTE TWINS ✳'}</button></div><span className="directory-stamp">NO<br/>ALGORITHM<br/>JUST PEOPLE</span></div>
          <div className="neighbour-grid">{(tasteTwinMode ? [...neighbours].sort((a, b) => getTasteMatchCount(b) - getTasteMatchCount(a)) : neighbours).map((person) => <article className={`neighbour-card neighbour-${person.color}`} key={person.handle}><div className="neighbour-card-top"><span className="neighbour-avatar">{person.avatar}</span><span className="neighbour-online"><i/> HERE-ISH</span></div><h3>{person.handle}</h3><p className="neighbour-tagline">“{person.tagline}”</p><div className="neighbour-likes">{person.likes.slice(0, 3).map((like) => <span key={like}>{like}</span>)}</div>{tasteTwinMode && <div className="taste-match-count">✳ {getTasteMatchCount(person)} POSSIBLE SHARED INTEREST{getTasteMatchCount(person) === 1 ? '' : 'S'}</div>}<button className="neighbour-visit" onClick={() => setActiveNeighbour(person)}>VISIT THEIR PAGE ↗</button></article>)}</div>
          <p className="directory-footnote">These are fictional demo neighbours for now. Real accounts and public profiles will need a backend.</p>
        </section>

        <section className="guestbook-wall" aria-labelledby="guestbook-wall-title"><div className="guestbook-wall-heading"><div><span className="tiny-label">A LITTLE WALL OF HUMAN NOISE</span><h2 id="guestbook-wall-title">Notes left on the <em>fridge.</em></h2></div><button className="button-primary" onClick={() => setGuestbookOpen(true)}>LEAVE A NOTE <ArrowUpRight size={15}/></button></div><div className="guestbook-wall-notes">{guestEntries.slice(0, 4).map((entry, index) => <article className={`wall-note wall-note-${index % 4}`} key={`${entry.name}-${index}`}><span>✳ FROM {entry.name}</span><p>{entry.message}</p><small>PINNED WITH INTERNET MAGIC</small></article>)}</div><p className="guestbook-wall-foot">YOUR NOTES SAVE IN THIS BROWSER ONLY · PLEASE BE KIND TO THE NEXT STRANGER.</p></section>

        <section className="join-strip" id="join"><div className="join-star">✳</div><div><span className="tiny-label">THE WEB IS BETTER WITH YOU IN IT</span><h2>Make yourself <em>at home.</em></h2></div><button className="button-primary join-button" onClick={() => setNotice('Account creation is planned for Phase 4. For now, explore the scrapbook and make yourself at home!')}>I'M IN, LET ME IN <ArrowUpRight size={16} /></button><span className="join-sparkle">✧</span></section>
        {notice && <div className="phase-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15} /></button></div>}
        </main>
      </div>}

      <footer className="footer"><a className="footer-logo" href="#home">colourfriction<span>✳</span></a><p>MADE OF MANY LITTLE OBSESSIONS. <br />BUILT ON THE INTERNET, NOT THE ALGORITHM.</p><div className="footer-links"><a href="#about">ABOUT</a><a href="#discover">SCRAPBOOK</a><a href="#community">COMMUNITY</a><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BACK TO TOP ↑</button></div><span className="footer-copy">© 2026 COLOURFRICTION · A WORK IN PROGRESS</span></footer>

      {activeNeighbour && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveNeighbour(null) }}><section className={`neighbour-profile-modal neighbour-${activeNeighbour.color}`} role="dialog" aria-modal="true" aria-label={`${activeNeighbour.handle} profile`}><div className="neighbour-modal-top"><span>PERSONAL PAGE · CF DIRECTORY</span><button className="icon-button" onClick={() => setActiveNeighbour(null)} aria-label="Close profile"><X/></button></div><div className="neighbour-modal-hero"><span className="neighbour-modal-avatar">{activeNeighbour.avatar}</span><div><span className="neighbour-online"><i/> HERE-ISH</span><h2>{activeNeighbour.handle}</h2><p>“{activeNeighbour.tagline}”</p></div></div><div className="neighbour-modal-bio"><span className="tiny-label">A NOTE FROM THE OWNER</span><p>{activeNeighbour.bio}</p></div><span className="tiny-label">CURRENTLY ROTATING IN THEIR BRAIN</span><div className="neighbour-modal-likes">{activeNeighbour.likes.map((like) => <span key={like}>✳ {like}</span>)}</div><button className="button-primary neighbour-hello" onClick={() => { setGuestName('internet stranger'); setGuestMessage(`hi ${activeNeighbour.handle}! ${activeNeighbour.note} ♡`); setActiveNeighbour(null); setGuestbookOpen(true) }}>LEAVE A LITTLE HELLO ↗</button><p className="neighbour-modal-foot">DEMO PROFILE · MESSAGES ARE NOT SENT TO A REAL PERSON.</p></section></div>}

      {guestbookOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuestbookOpen(false) }}><section className="search-modal guestbook-modal" role="dialog" aria-modal="true" aria-label="Guestbook"><div className="search-modal-head"><div><span className="tiny-label">THE DIGITAL GUESTBOOK</span><h2>Leave a little <em>hello.</em></h2></div><button className="icon-button" onClick={() => setGuestbookOpen(false)} aria-label="Close guestbook"><X /></button></div><form className="guestbook-form" onSubmit={(event) => { event.preventDefault(); if (guestName.trim() && guestMessage.trim()) { setGuestEntries((entries) => [{ name: guestName.trim(), message: guestMessage.trim() }, ...entries]); setGuestMessage(''); } }}><label>YOUR INTERNET NAME<input value={guestName} onChange={(event) => setGuestName(event.target.value)} maxLength={28} required /></label><label>LEAVE A NOTE<textarea value={guestMessage} onChange={(event) => setGuestMessage(event.target.value)} maxLength={120} required /></label><button className="button-primary" type="submit">PIN MY NOTE <ArrowUpRight size={15} /></button></form><div className="guestbook-entries">{guestEntries.map((entry, index) => <article key={`${entry.name}-${index}`}><span>✳ {entry.name}</span><p>{entry.message}</p></article>)}</div><div className="search-modal-foot"><span>SAVED IN THIS BROWSER · LOCAL DEMO</span><span>BE NICE OUT THERE ♡</span></div></section></div>}
      {searchOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false) }}><section className="search-modal" role="dialog" aria-modal="true" aria-label="Search the archive"><div className="search-modal-head"><div><span className="tiny-label">THE ARCHIVE FINDER</span><h2>Looking for <em>something?</em></h2></div><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button></div><label className="search-field"><Search size={18} /><input autoFocus placeholder="a film, a song, a feeling..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /><kbd>ESC</kbd></label><div className="search-results">{searchResults.length ? searchResults.map((pick) => <button key={pick.title} className="search-result" onClick={() => { setCategory(pick.kind); setSearchOpen(false); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }) }}><span className="result-type">{pick.kind}</span><span>{pick.title}<small>{pick.detail}</small></span><ArrowUpRight size={15} /></button>) : <p className="no-results">Nothing in this tiny archive yet. Try another search.</p>}</div><div className="search-modal-foot"><span>MOCK ARCHIVE · REAL SEARCH INTERACTION</span><span>✳ BE CURIOUS</span></div></section></div>}
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowDownRight size={18} /></button>
    </div>
  )
}

export default App
