import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Eye, RotateCcw, Save, Sparkles, ExternalLink } from 'lucide-react'

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

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setSaved(false)
    setNotice('Your changes preview live. Save them to keep your page in this browser.')
    setProfile((current) => ({ ...current, [key]: value }))
  }
  const activePalette = useMemo(() => palettes.find((palette) => palette.accent === profile.accent) ?? palettes[0], [profile.accent])

  const saveProfile = () => {
    try {
      localStorage.setItem('colourfriction-profile-v1', JSON.stringify(profile))
      setSaved(true)
      setNotice('Saved in this browser! Your profile will be here when you come back on this device.')
    } catch {
      setNotice('This browser blocked local storage. Your preview still works, but could not be saved.')
    }
  }

  const resetProfile = () => {
    setSaved(false)
    setProfile({ ...starterProfile })
    try { localStorage.removeItem('colourfriction-profile-v1') } catch { /* storage may be unavailable */ }
    setNotice('Starter profile restored. Save if you want to keep these defaults.')
  }

  const toggleBadge = (badge: string) => {
    update('badges', profile.badges.includes(badge) ? profile.badges.filter((item) => item !== badge) : [...profile.badges, badge].slice(0, 4))
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
            <div className="form-section-title"><span>04 / BACKGROUND TEXTURE</span><small>SET THE SCENE</small></div>
            <div className="wallpaper-picker">{[{ id: 'stars', name: 'starry desktop', glyph: '✦ ✧ ✦' }, { id: 'graph', name: 'graph paper', glyph: '▦ ▦ ▦' }, { id: 'dots', name: 'polka party', glyph: '•• •• ••' }, { id: 'plain', name: 'plain-ish', glyph: '—  —  —' }].map((item) => <button key={item.id} className={profile.wallpaper === item.id ? 'selected' : ''} onClick={() => update('wallpaper', item.id)}><span className={`wallpaper-swatch wallpaper-${item.id}`}>{item.glyph}</span><span>{item.name}</span></button>)}</div>
            <div className="form-section-title"><span>05 / LETTER PERSONALITY</span><small>THE FONT MATTERS</small></div>
            <div className="font-picker">{[{ id: 'pixel', name: 'PIXEL PAL', sample: 'hello, web!' }, { id: 'scribble', name: 'DOODLE KID', sample: 'hello, web!' }, { id: 'bookish', name: 'LIBRARY GHOST', sample: 'hello, web!' }].map((item) => <button key={item.id} className={`font-choice font-${item.id} ${profile.font === item.id ? 'selected' : ''}`} onClick={() => update('font', item.id)}><span>{item.sample}</span><small>{item.name}</small></button>)}</div>
            <div className="form-section-title"><span>06 / YOUR LAYOUT</span><small>HOW IT LIVES</small></div>
            <div className="layout-picker"><button className={profile.layout === 'scrapbook' ? 'selected' : ''} onClick={() => update('layout', 'scrapbook')}><span className="layout-mini layout-mini-scrap"><i /><i /><i /></span><b>SCRAPBOOK</b><small>layers & little mess</small></button><button className={profile.layout === 'shelf' ? 'selected' : ''} onClick={() => update('layout', 'shelf')}><span className="layout-mini layout-mini-shelf"><i /><i /><i /><i /></span><b>COLLECTION SHELF</b><small>tidy little grid</small></button></div>
          </div>}

          {activeTab === 'collections' && <div className="profile-form-panel">
            <div className="form-section-title"><span>07 / YOUR TASTE COLLECTIONS</span><small>COMMA-SEPARATED FOR NOW</small></div>
            <p className="collection-editor-note">These are editable profile lists for Phase 2. Real catalog search and artwork will arrive in the media API phase.</p>
            {collections.map((collection) => <label className="profile-field collection-field" key={collection.key}><span className="collection-field-title"><b>{collection.icon}</b> {collection.label}</span><textarea rows={3} value={collection.value} onChange={(event) => update(collection.key, event.target.value)} placeholder="Add a few favourites, separated by commas" /><span className="field-hint">Separate each title with a comma.</span></label>)}
          </div>}

          <div className="profile-save-row"><p className={saved ? 'save-notice success' : 'save-notice'} aria-live="polite">{notice}</p><div><button className="profile-reset-button" onClick={resetProfile}><RotateCcw size={14} /> RESET</button><button className="button-primary" onClick={saveProfile}><Save size={14} /> {saved ? 'SAVED!' : 'SAVE MY PAGE'}</button></div></div>
        </section>

        <section className="profile-preview-column" aria-label="Live profile preview">
          <div className="preview-label"><Eye size={14} /> LIVE PREVIEW <span>CHANGES AS YOU TYPE</span></div>
          <article className={`personal-profile-preview wallpaper-${profile.wallpaper} profile-font-${profile.font} profile-layout-${profile.layout}`} style={{ '--profile-accent': profile.accent, '--profile-paper': profile.paper } as React.CSSProperties}>
            <div className="preview-browser-bar"><span className="browser-dots"><i /><i /><i /></span><span>colourfriction.net/~{profile.username || 'yourname'}</span><span>✳</span></div>
            <div className="preview-profile-header"><div className="preview-avatar">{profile.avatar || '✳'}</div><div className="preview-identity"><span className="preview-online"><i /> ONLINE-ISH</span><h2>{profile.displayName || 'Your name here'}</h2><p>@{profile.username || 'yourname'}</p></div><span className="preview-sticker">WEB<br />PERSON<br />✿</span></div>
            <div className="preview-status"><span>✎ STATUS:</span> {profile.status || 'thinking up a status...'}</div>
            <div className="preview-bio"><span className="preview-section-label">✳ A LITTLE LORE ABOUT ME</span><p>{profile.bio || 'Your bio will show up here. Tell the internet a little about yourself.'}</p></div>
            {profile.badges.length > 0 && <div className="preview-badges">{profile.badges.map((badge, index) => <span key={badge} className={`preview-badge badge-color-${index % 4}`}>✦ {badge}</span>)}</div>}
            <div className="preview-collection-head"><span>✳ MY CURRENT OBSESSIONS</span><small>THE GOOD STUFF</small></div>
            <div className="preview-collections">
              {collections.map((collection) => {
                const items = collection.value.split(',').map((item) => item.trim()).filter(Boolean)
                return <section className="preview-collection" key={collection.key}><h3><span>{collection.icon}</span> {collection.label}</h3>{items.length ? <ul>{items.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul> : <p className="empty-collection">nothing pinned here yet...</p>}</section>
              })}
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
