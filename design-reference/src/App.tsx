import { useState, useRef, useCallback } from 'react'
import monogramLogo from '@/imports/ChatGPT_Image_13_de_set._de_2026__14_27_22.png'

type Screen = 'welcome' | 'character' | 'avatar' | 'gallery' | 'add-photo'

interface Photo {
  id: string
  url: string
  caption: string
  author: string
  emoji: string
  avatarId?: string
  rotation: number
  isUserPhoto?: boolean
  likes: number
}

// Mixed orientations: landscape = w800h560, portrait = w560h800
const SEED_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=560&fit=crop&auto=format',
    caption: 'Para sempre juntos',
    author: 'Ana Lima',
    emoji: '🎉',
    avatarId: 'a3',
    rotation: -1,
    likes: 21,
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1596457221755-b96bc3a6df18?w=560&h=800&fit=crop&auto=format',
    caption: 'Um momento mágico ✨',
    author: 'Tia Rosa',
    emoji: '💐',
    avatarId: 'a5',
    rotation: 2,
    likes: 14,
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1544717304-14d94551b7dc?w=800&h=560&fit=crop&auto=format',
    caption: 'Memórias que ficam 🕊️',
    author: 'João R.',
    emoji: '👰',
    avatarId: 'a8',
    rotation: -2,
    likes: 17,
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1562859135-3c009b776595?w=560&h=800&fit=crop&auto=format',
    caption: 'Amor verdadeiro 💕',
    author: 'Carlos M.',
    emoji: '🥂',
    avatarId: 'a14',
    rotation: 1,
    likes: 9,
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1621621668101-d5c8329b3784?w=800&h=560&fit=crop&auto=format',
    caption: 'Eternamente apaixonados',
    author: 'Luisa B.',
    emoji: '💍',
    avatarId: 'a19',
    rotation: -1,
    likes: 33,
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1607357910286-1ff94ac13c24?w=560&h=800&fit=crop&auto=format',
    caption: 'Que lindo dia! 🌸',
    author: 'Pedro Souza',
    emoji: '👨‍👩‍👧‍👦',
    avatarId: 'a22',
    rotation: 2,
    likes: 5,
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=560&fit=crop&auto=format',
    caption: 'Dançando até o amanhecer 💃',
    author: 'Fernanda C.',
    emoji: '🎉',
    avatarId: 'a11',
    rotation: -1,
    likes: 27,
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=560&h=800&fit=crop&auto=format',
    caption: 'O vestido perfeito 👗',
    author: 'Carla M.',
    emoji: '💐',
    avatarId: 'a7',
    rotation: 1,
    likes: 41,
  },
]

const CHARACTERS = [
  { emoji: '💍', label: 'Noivo', sublabel: 'O grande dia!' },
  { emoji: '👰', label: 'Noiva', sublabel: 'A mais linda!' },
  { emoji: '🥂', label: 'Padrinho', sublabel: 'Celebrando juntos' },
  { emoji: '💐', label: 'Madrinha', sublabel: 'Com muito amor' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Família', sublabel: 'Laços eternos' },
  { emoji: '🎉', label: 'Convidado', sublabel: 'Feliz por estar aqui' },
]

const AVATARS = [
  { id: 'a1',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mia&backgroundColor=ffd5dc',        label: 'Mia' },
  { id: 'a2',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo&backgroundColor=d5e8d4',        label: 'Leo' },
  { id: 'a3',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&backgroundColor=dae8fc',       label: 'Luna' },
  { id: 'a4',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Max&backgroundColor=fff2cc',        label: 'Max' },
  { id: 'a5',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Bella&backgroundColor=f8d7da',      label: 'Bella' },
  { id: 'a6',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver&backgroundColor=d4edda',     label: 'Oliver' },
  { id: 'a7',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia&backgroundColor=cce5ff',      label: 'Sofia' },
  { id: 'a8',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Jack&backgroundColor=ffeeba',       label: 'Jack' },
  { id: 'a9',  src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Iris&backgroundColor=f5c6cb',       label: 'Iris' },
  { id: 'a10', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Noah&backgroundColor=b8daff',       label: 'Noah' },
  { id: 'a11', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Zara&backgroundColor=c3e6cb',       label: 'Zara' },
  { id: 'a12', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Finn&backgroundColor=ffd5dc',       label: 'Finn' },
  { id: 'a13', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Clara&backgroundColor=e8d5f5',      label: 'Clara' },
  { id: 'a14', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Bruno&backgroundColor=d5eaf5',      label: 'Bruno' },
  { id: 'a15', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ava&backgroundColor=fce4d6',        label: 'Ava' },
  { id: 'a16', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Luca&backgroundColor=d6f5e3',       label: 'Luca' },
  { id: 'a17', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Nina&backgroundColor=fdf3d0',       label: 'Nina' },
  { id: 'a18', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=d0e8fd',      label: 'Felix' },
  { id: 'a19', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sara&backgroundColor=fde8f0',       label: 'Sara' },
  { id: 'a20', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Diego&backgroundColor=e8fde8',      label: 'Diego' },
  { id: 'a21', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Layla&backgroundColor=f5e6d3',      label: 'Layla' },
  { id: 'a22', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Pedro&backgroundColor=d3e8f5',      label: 'Pedro' },
  { id: 'a23', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Elena&backgroundColor=f5d3e8',      label: 'Elena' },
  { id: 'a24', src: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mateo&backgroundColor=d3f5e8',      label: 'Mateo' },
]

// ──────────────────────────── Monogram SVG ────────────────────────────
function MonogramCircle({ size = 140 }: { size?: number }) {
  return (
    <img
      src={monogramLogo}
      alt="TJ monogram"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

// ──────────────────────────── Welcome ────────────────────────────
function WelcomeScreen({
  name,
  setName,
  onContinue,
}: {
  name: string
  setName: (v: string) => void
  onContinue: () => void
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 texture-overlay"
      style={{ background: '#F9F5EE' }}
    >
      {/* Top ornamental line */}
      <div className="w-px h-16 mb-8 animate-fade-in" style={{ background: 'linear-gradient(to bottom, transparent, #C4870C)' }} />

      <div className="animate-fade-in-up flex flex-col items-center">
        <MonogramCircle size={148} />
      </div>

      <div className="animate-fade-in-up delay-100 mt-6 text-center">
        <p
          className="text-xs tracking-[0.25em] uppercase mb-2"
          style={{ color: '#C4870C', fontFamily: 'Lora, serif' }}
        >
          Bem-vindo ao casamento de
        </p>
        <h1
          className="text-4xl leading-tight"
          style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}
        >
          Tailany <em style={{ color: '#C4870C' }}>&</em> Jeffson
        </h1>
        <p className="text-sm mt-2" style={{ color: '#7A6452', fontFamily: 'Lora, serif' }}>
          10 de outubro de 2026
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="animate-fade-in-up delay-200 my-8 flex items-center gap-3">
        <div style={{ width: 48, height: 1, background: '#C4870C', opacity: 0.5 }} />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" fill="#C4870C" opacity="0.7" />
        </svg>
        <div style={{ width: 48, height: 1, background: '#C4870C', opacity: 0.5 }} />
      </div>

      <div className="animate-fade-in-up delay-300 w-full max-w-xs">
        <label
          className="block text-xs tracking-widest uppercase mb-4 text-center"
          style={{ color: '#7A6452', fontFamily: 'Lora, serif' }}
        >
          Como você se chama?
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onContinue()}
          placeholder="Seu nome aqui..."
          className="input-elegant w-full text-center text-xl pb-3 placeholder-opacity-40"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#2C1810',
            fontSize: '1.25rem',
          }}
        />
      </div>

      <div className="animate-fade-in-up delay-400 mt-10 w-full max-w-xs">
        <button
          onClick={onContinue}
          disabled={!name.trim()}
          className="btn-gold w-full py-4 rounded-none text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{ fontFamily: 'Lora, serif', letterSpacing: '0.2em' }}
        >
          Continuar
        </button>
      </div>

      <div className="animate-fade-in-up delay-500 mt-8 text-center">
        <p className="text-xs" style={{ color: '#C4870C', fontFamily: 'Dancing Script, cursive', fontSize: '1rem' }}>
          "O amor é a única coisa que cresce quando compartilhado"
        </p>
      </div>

      {/* Bottom ornamental line */}
      <div className="w-px h-16 mt-10" style={{ background: 'linear-gradient(to top, transparent, #C4870C)', opacity: 0.4 }} />
    </div>
  )
}

// ──────────────────────────── Character ────────────────────────────
function CharacterScreen({
  character,
  setCharacter,
  onContinue,
  onBack,
}: {
  character: string
  setCharacter: (v: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col texture-overlay" style={{ background: '#F9F5EE' }}>
      {/* Header */}
      <div className="pt-14 pb-6 px-6 text-center animate-fade-in-up">
        <button onClick={onBack} className="absolute top-6 left-6 p-2" style={{ color: '#C4870C' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4 L6 10 L12 16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex justify-center mb-4">
          <MonogramCircle size={60} />
        </div>
        <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: '#C4870C', fontFamily: 'Lora, serif' }}>
          Passo 2 de 3
        </p>
        <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
          Quem é você<br />nesse dia especial?
        </h2>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div style={{ width: 32, height: 1, background: '#C4870C', opacity: 0.5 }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4870C', opacity: 0.7 }} />
          <div style={{ width: 32, height: 1, background: '#C4870C', opacity: 0.5 }} />
        </div>
      </div>

      {/* Character grid */}
      <div className="flex-1 px-5 pb-6 grid grid-cols-2 gap-4 content-start">
        {CHARACTERS.map((c, i) => {
          const selected = character === c.emoji
          return (
            <button
              key={c.emoji}
              onClick={() => setCharacter(c.emoji)}
              className="animate-fade-in-up flex flex-col items-center justify-center gap-2 py-6 px-3 transition-all duration-200"
              style={{
                animationDelay: `${i * 0.07}s`,
                background: selected ? '#FDF6E8' : '#FFFFFF',
                border: selected ? '1.5px solid #C4870C' : '1px solid rgba(196,135,12,0.2)',
                boxShadow: selected
                  ? '0 4px 20px rgba(196,135,12,0.18)'
                  : '0 2px 8px rgba(44,24,16,0.06)',
              }}
            >
              <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{c.emoji}</span>
              <span
                className="text-sm font-medium"
                style={{ fontFamily: 'Playfair Display, serif', color: selected ? '#C4870C' : '#2C1810' }}
              >
                {c.label}
              </span>
              <span className="text-xs" style={{ color: '#7A6452', fontFamily: 'Lora, serif' }}>
                {c.sublabel}
              </span>
              {selected && (
                <div
                  className="mt-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#C4870C' }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="px-5 pb-10">
        <button
          onClick={onContinue}
          disabled={!character}
          className="btn-gold w-full py-4 text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Ver a Galeria
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────── Avatar Screen ────────────────────────────
function AvatarScreen({
  avatar,
  setAvatar,
  onContinue,
  onBack,
}: {
  avatar: string
  setAvatar: (v: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  const visible = AVATARS

  return (
    <div className="min-h-screen flex flex-col texture-overlay" style={{ background: '#F9F5EE' }}>
      {/* Header */}
      <div className="pt-14 pb-4 px-6 text-center animate-fade-in-up" style={{ position: 'relative' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 14, left: 16, color: '#C4870C' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4L6 10l6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex justify-center mb-3">
          <MonogramCircle size={52} />
        </div>
        <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: '#C4870C', fontFamily: 'Lora, serif' }}>
          Passo 3 de 3
        </p>
        <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
          Escolha seu avatar
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div style={{ width: 28, height: 1, background: '#C4870C', opacity: 0.5 }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4870C', opacity: 0.7 }} />
          <div style={{ width: 28, height: 1, background: '#C4870C', opacity: 0.5 }} />
        </div>
      </div>

      {/* Avatar grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {visible.map((av, i) => {
            const selected = avatar === av.id
            return (
              <button
                key={av.id}
                onClick={() => setAvatar(av.id)}
                className="animate-fade-in-up flex flex-col items-center gap-1"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: selected ? '2.5px solid #C4870C' : '2px solid rgba(196,135,12,0.15)',
                    boxShadow: selected ? '0 0 0 3px rgba(196,135,12,0.2)' : 'none',
                    background: '#FFFFFF',
                    transition: 'all 0.18s',
                  }}
                >
                  <img src={av.src} alt={av.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{
                  fontFamily: 'Lora, serif',
                  fontSize: '0.6rem',
                  color: selected ? '#C4870C' : '#7A6452',
                  fontWeight: selected ? '600' : '400',
                }}>
                  {av.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview + CTA */}
      <div className="px-5 pb-10 pt-3" style={{ borderTop: '1px solid rgba(196,135,12,0.12)' }}>
        {avatar && (
          <div className="flex items-center justify-center gap-3 mb-4 animate-scale-in">
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid #C4870C', background: '#FFF' }}>
              <img src={AVATARS.find(a => a.id === avatar)?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.9rem', color: '#2C1810' }}>
              {AVATARS.find(a => a.id === avatar)?.label} escolhido!
            </p>
          </div>
        )}
        <button
          onClick={onContinue}
          disabled={!avatar}
          className="btn-gold w-full py-4 text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Ver a Galeria
        </button>
      </div>
    </div>
  )
}

// detect portrait from URL (w < h means portrait)
function isPortrait(url: string) {
  const m = url.match(/w=(\d+)&h=(\d+)/)
  if (!m) return false
  return parseInt(m[1]) < parseInt(m[2])
}

// ──────────────────────────── Grid Tile ────────────────────────────
function GridTile({
  photo,
  liked,
  onOpen,
}: {
  photo: Photo
  liked: boolean
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      style={{
        background: '#FFFFFF',
        padding: '5px 5px 20px',
        boxShadow: '0 2px 8px rgba(44,24,16,0.1)',
        transform: `rotate(${photo.rotation * 0.55}deg)`,
        position: 'relative',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'block',
      }}
    >
      <img
        src={photo.url}
        alt={photo.caption}
        draggable={false}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      <div style={{ marginTop: 4, paddingInline: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        {/* Author + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
          {photo.avatarId && (
            <div style={{ width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(196,135,12,0.3)', background: '#fff' }}>
              <img src={AVATARS.find(a => a.id === photo.avatarId)?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <p style={{ fontFamily: 'Lora, serif', fontSize: '0.55rem', color: '#7A6452', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {photo.emoji} {photo.author}
          </p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <svg width="9" height="9" viewBox="0 0 14 14" fill={liked ? '#C4870C' : 'none'} stroke={liked ? '#C4870C' : '#B0927A'} strokeWidth="1.8">
            <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
          </svg>
          <span style={{ fontFamily: 'Lora, serif', fontSize: '0.5rem', color: liked ? '#C4870C' : '#B0927A' }}>{photo.likes}</span>
        </span>
      </div>
    </button>
  )
}

// ──────────────────────────── Fullscreen Lightbox ────────────────────────────
function FullscreenLightbox({
  photos,
  initialIndex,
  likedIds,
  onLike,
  onClose,
}: {
  photos: Photo[]
  initialIndex: number
  likedIds: Set<string>
  onLike: (id: string) => void
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const [burst, setBurst] = useState(false)
  const lastTap = useRef(0)
  const touchStartX = useRef(0)
  const photo = photos[index]
  const liked = likedIds.has(photo.id)

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(photos.length - 1, i + 1))

  const triggerLike = useCallback(() => {
    onLike(photo.id)
    setBurst(true)
    setTimeout(() => setBurst(false), 700)
  }, [photo.id, onLike])

  const handleDoubleTap = useCallback(() => {
    if (!liked) triggerLike()
    else {
      setBurst(true)
      setTimeout(() => setBurst(false), 700)
    }
  }, [liked, triggerLike])

  const handleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTap.current < 300) handleDoubleTap()
    else lastTap.current = now
  }, [handleDoubleTap])

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev()
  }

  return (
    <div
      className="animate-fade-in"
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,12,8,0.96)', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 12px' }}>
        <button onClick={onClose} style={{ color: 'rgba(249,245,238,0.7)', background: 'none', border: 'none', padding: 4 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l20 20M21 1L1 21" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ fontFamily: 'Lora, serif', fontSize: '0.7rem', color: 'rgba(249,245,238,0.4)', letterSpacing: '0.1em' }}>
          {index + 1} / {photos.length}
        </span>
        {/* Like button */}
        <button
          onClick={() => onLike(photo.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 4 }}
        >
          <svg width="20" height="20" viewBox="0 0 14 14"
            fill={liked ? '#C4870C' : 'none'}
            stroke={liked ? '#C4870C' : 'rgba(249,245,238,0.6)'}
            strokeWidth="1.4"
            style={{ transition: 'transform 0.15s', transform: liked ? 'scale(1.2)' : 'scale(1)' }}>
            <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
          </svg>
          <span style={{ fontFamily: 'Lora, serif', fontSize: '0.72rem', color: liked ? '#C4870C' : 'rgba(249,245,238,0.5)' }}>
            {photo.likes}
          </span>
        </button>
      </div>

      {/* Photo — fills remaining space */}
      <div
        style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
        onDoubleClick={handleDoubleTap}
      >
        {/* Polaroid frame */}
        <div
          className="animate-scale-in"
          style={{
            background: '#FFFFFF',
            padding: '10px 10px 48px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxWidth: '90vw',
            width: '100%',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            draggable={false}
            style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }}
          />
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.1rem', color: '#2C1810' }}>{photo.caption}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              {photo.avatarId && (
                <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(196,135,12,0.4)', background: '#fff', flexShrink: 0 }}>
                  <img src={AVATARS.find(a => a.id === photo.avatarId)?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <p style={{ fontFamily: 'Lora, serif', fontSize: '0.65rem', color: '#7A6452' }}>{photo.emoji} {photo.author}</p>
            </div>
          </div>
        </div>

        {/* Heart burst */}
        {burst && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <svg width="80" height="80" viewBox="0 0 14 14" fill="#C4870C"
              style={{ animation: 'heartBurst 0.65s ease forwards', filter: 'drop-shadow(0 4px 12px rgba(196,135,12,0.7))' }}>
              <path d="M7 12.5S1 8.5 1 4.5A3 3 0 0 1 7 3.27 3 3 0 0 1 13 4.5c0 4-6 8-6 8Z" />
            </svg>
          </div>
        )}

        {/* Prev / Next arrows */}
        {index > 0 && (
          <button onClick={e => { e.stopPropagation(); prev() }}
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(249,245,238,0.1)', border: '1px solid rgba(249,245,238,0.15)', color: 'rgba(249,245,238,0.7)', padding: '10px 8px', borderRadius: 2 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {index < photos.length - 1 && (
          <button onClick={e => { e.stopPropagation(); next() }}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(249,245,238,0.1)', border: '1px solid rgba(249,245,238,0.15)', color: 'rgba(249,245,238,0.7)', padding: '10px 8px', borderRadius: 2 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px 0 40px' }}>
        {photos.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)}
            style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, background: i === index ? '#C4870C' : 'rgba(249,245,238,0.25)', border: 'none', padding: 0, transition: 'all 0.2s' }} />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────── User Ranking Card ────────────────────────────
interface UserStat {
  author: string
  emoji: string
  count: number
  lastPhoto: Photo
}

function UserRankingCard({ user, rank }: { user: UserStat; rank: number }) {
  const medals = ['🥇', '🥈', '🥉']
  const podiumColors = ['#C4870C', '#7A9BB5', '#A67C5B']

  return (
    <div
      className="animate-fade-in-up flex items-center gap-4"
      style={{
        background: '#FFFFFF',
        padding: '12px 14px',
        boxShadow: rank === 1 ? '0 4px 20px rgba(196,135,12,0.2)' : '0 2px 8px rgba(44,24,16,0.07)',
        border: rank === 1 ? '1px solid rgba(196,135,12,0.3)' : '1px solid rgba(196,135,12,0.1)',
        animationDelay: `${rank * 0.06}s`,
      }}
    >
      {/* Rank */}
      <div
        className="flex-shrink-0 flex items-center justify-center text-sm font-bold"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: rank <= 3 ? podiumColors[rank - 1] : '#EDE7D9',
          color: rank <= 3 ? '#FFFFFF' : '#7A6452',
          fontFamily: 'Playfair Display, serif',
          fontSize: rank <= 3 ? '1rem' : '0.8rem',
        }}
      >
        {rank <= 3 ? medals[rank - 1] : rank}
      </div>

      {/* Avatar or last photo thumbnail */}
      <div className="flex-shrink-0" style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(196,135,12,0.3)', background: '#fff' }}>
        {user.lastPhoto.avatarId ? (
          <img src={AVATARS.find(a => a.id === user.lastPhoto.avatarId)?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={user.lastPhoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* Name + emoji */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: '#2C1810' }}
        >
          {user.emoji} {user.author}
        </p>
        <p style={{ fontFamily: 'Lora, serif', fontSize: '0.65rem', color: '#7A6452' }}>
          {user.count} {user.count === 1 ? 'foto enviada' : 'fotos enviadas'}
        </p>
      </div>

      {/* Count badge */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: rank === 1 ? 'rgba(196,135,12,0.1)' : '#F9F5EE',
          border: rank === 1 ? '1px solid rgba(196,135,12,0.3)' : '1px solid rgba(196,135,12,0.15)',
        }}
      >
        <span
          style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: '700',
            fontSize: '0.9rem',
            color: rank === 1 ? '#C4870C' : '#7A6452',
          }}
        >
          {user.count}
        </span>
      </div>
    </div>
  )
}

// ──────────────────────────── Gallery ────────────────────────────
type GalleryTab = 'all' | 'mine' | 'ranking'

function GalleryScreen({
  name,
  character,
  avatar,
  photos,
  allPhotos,
  filter,
  setFilter,
  onAdd,
  onSelect,
  onLike,
  likedIds,
}: {
  name: string
  character: string
  avatar: string
  photos: Photo[]
  allPhotos: Photo[]
  filter: GalleryTab
  setFilter: (f: GalleryTab) => void
  onAdd: () => void
  onSelect: (index: number) => void
  onLike: (id: string) => void
  likedIds: Set<string>
}) {
  // Build user ranking: count photos per author, sorted descending
  const userMap = new Map<string, UserStat>()
  for (const p of allPhotos) {
    const existing = userMap.get(p.author)
    if (existing) {
      existing.count++
      existing.lastPhoto = p
    } else {
      userMap.set(p.author, { author: p.author, emoji: p.emoji, count: 1, lastPhoto: p })
    }
  }
  const userRanking = [...userMap.values()].sort((a, b) => b.count - a.count)

  const TABS: { key: GalleryTab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'mine', label: 'Minhas' },
    { key: 'ranking', label: '🏆 Ranking' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F5EE' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 pt-12 pb-0 texture-overlay"
        style={{
          background: 'rgba(249,245,238,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(196,135,12,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {avatar && (
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #C4870C', background: '#FFF', flexShrink: 0 }}>
                <img src={AVATARS.find(a => a.id === avatar)?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#C4870C', fontFamily: 'Lora, serif' }}>
                {character} Olá, {name}!
              </p>
              <h2 className="text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                Galeria do Casamento
              </h2>
            </div>
          </div>
          <MonogramCircle size={40} />
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(196,135,12,0.2)' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className="flex-1 py-2.5 text-xs tracking-wider uppercase relative"
              style={{
                fontFamily: 'Lora, serif',
                color: filter === t.key ? '#C4870C' : '#7A6452',
                fontWeight: filter === t.key ? '600' : '400',
              }}
            >
              {t.label}
              {filter === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#C4870C' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Ranking tab ── */}
        {filter === 'ranking' && (
          <div className="px-4 py-5 flex flex-col gap-3">
            {/* Podium top 3 */}
            {userRanking.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-5 animate-fade-in">
                {/* 2nd */}
                <div className="flex flex-col items-center gap-1">
                  <div style={{ width: 60, height: 60, overflow: 'hidden', border: '2px solid #7A9BB5', borderRadius: '50%' }}>
                    <img src={userRanking[1].lastPhoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '1.3rem' }}>🥈</span>
                  <p style={{ fontFamily: 'Lora, serif', fontSize: '0.6rem', color: '#7A6452', textAlign: 'center' }}>
                    {userRanking[1].author}
                  </p>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.7rem', color: '#7A9BB5', fontWeight: '700' }}>
                    {userRanking[1].count} 📷
                  </p>
                </div>
                {/* 1st */}
                <div className="flex flex-col items-center gap-1" style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      overflow: 'hidden',
                      border: '2.5px solid #C4870C',
                      borderRadius: '50%',
                      boxShadow: '0 4px 16px rgba(196,135,12,0.35)',
                    }}
                  >
                    <img src={userRanking[0].lastPhoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '1.7rem' }}>🥇</span>
                  <p style={{ fontFamily: 'Lora, serif', fontSize: '0.6rem', color: '#2C1810', textAlign: 'center', fontWeight: '500' }}>
                    {userRanking[0].author}
                  </p>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.75rem', color: '#C4870C', fontWeight: '700' }}>
                    {userRanking[0].count} 📷
                  </p>
                </div>
                {/* 3rd */}
                <div className="flex flex-col items-center gap-1">
                  <div style={{ width: 52, height: 52, overflow: 'hidden', border: '2px solid #A67C5B', borderRadius: '50%' }}>
                    <img src={userRanking[2].lastPhoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>🥉</span>
                  <p style={{ fontFamily: 'Lora, serif', fontSize: '0.6rem', color: '#7A6452', textAlign: 'center' }}>
                    {userRanking[2].author}
                  </p>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.7rem', color: '#A67C5B', fontWeight: '700' }}>
                    {userRanking[2].count} 📷
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-1">
              <div style={{ flex: 1, height: 1, background: '#C4870C', opacity: 0.3 }} />
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.72rem', color: '#C4870C', letterSpacing: '0.12em' }}>
                QUEM MAIS FOTOGRAFOU
              </span>
              <div style={{ flex: 1, height: 1, background: '#C4870C', opacity: 0.3 }} />
            </div>

            {userRanking.length === 0 ? (
              <div className="flex flex-col items-center py-16 animate-fade-in">
                <span style={{ fontSize: '2.5rem' }}>📷</span>
                <p className="mt-3 text-center" style={{ fontFamily: 'Playfair Display, serif', color: '#7A6452' }}>
                  Nenhuma foto ainda.<br />Seja o primeiro!
                </p>
              </div>
            ) : (
              userRanking.map((user, i) => (
                <UserRankingCard key={user.author} user={user} rank={i + 1} />
              ))
            )}
            <div className="h-24" />
          </div>
        )}

        {/* ── Vertical grid (all / mine) ── */}
        {filter !== 'ranking' && (
          <div style={{ padding: '12px 12px 100px' }}>
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <span style={{ fontSize: '3rem' }}>📷</span>
                <p className="mt-4 text-center" style={{ fontFamily: 'Playfair Display, serif', color: '#7A6452' }}>
                  Nenhuma foto ainda.<br />Seja a primeira!
                </p>
              </div>
            ) : (
              <div style={{ columns: 3, columnGap: 10 }}>
                {photos.map((photo, i) => (
                  <div key={photo.id} className="animate-fade-in-up" style={{ breakInside: 'avoid', marginBottom: 10, animationDelay: `${i * 0.05}s` }}>
                    <GridTile
                      photo={photo}
                      liked={likedIds.has(photo.id)}
                      onOpen={() => onSelect(i)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAdd}
        className="fixed bottom-8 right-6 z-20 flex items-center gap-2 px-5 py-3.5"
        style={{
          background: 'linear-gradient(135deg, #C4870C 0%, #E8B84B 100%)',
          boxShadow: '0 8px 32px rgba(196,135,12,0.4)',
          color: '#FFFFFF',
          fontFamily: 'Lora, serif',
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
        Adicionar Foto
      </button>
    </div>
  )
}

// ──────────────────────────── Add Photo ────────────────────────────
function AddPhotoScreen({
  name,
  character,
  caption,
  setCaption,
  previewUrl,
  fileInputRef,
  onFileChange,
  onSubmit,
  onBack,
}: {
  name: string
  character: string
  caption: string
  setCaption: (v: string) => void
  previewUrl: string | null
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col texture-overlay" style={{ background: '#F9F5EE' }}>
      {/* Header */}
      <div className="pt-12 pb-6 px-5 flex items-center gap-4 animate-fade-in">
        <button onClick={onBack} style={{ color: '#C4870C' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 4 L7 11 L14 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
            Adicionar Memória
          </h2>
          <p className="text-xs" style={{ color: '#7A6452', fontFamily: 'Lora, serif' }}>
            {character} {name}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto flex flex-col gap-6">
        {/* Polaroid preview */}
        <div className="animate-fade-in-up flex justify-center">
          <div
            style={{
              background: '#FFFFFF',
              padding: '12px 12px 52px',
              boxShadow: '0 8px 32px rgba(44,24,16,0.14)',
              width: 220,
              transform: 'rotate(-1.5deg)',
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 w-full"
                style={{
                  aspectRatio: '4/5',
                  background: '#F9F5EE',
                  border: '1.5px dashed rgba(196,135,12,0.4)',
                  color: '#C4870C',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="6" width="28" height="22" rx="3" />
                  <circle cx="16" cy="17" r="6" />
                  <circle cx="16" cy="17" r="3" />
                  <path d="M10 6 L12 2 L20 2 L22 6" />
                </svg>
                <span className="text-xs text-center" style={{ fontFamily: 'Lora, serif', color: '#7A6452' }}>
                  Toque para<br />escolher foto
                </span>
              </button>
            )}
            <p
              className="text-center mt-3"
              style={{
                fontFamily: 'Dancing Script, cursive',
                fontSize: '0.9rem',
                color: caption ? '#2C1810' : 'rgba(44,24,16,0.3)',
              }}
            >
              {caption || 'Legenda da foto...'}
            </p>
            <p className="text-center mt-1" style={{ fontFamily: 'Lora, serif', fontSize: '0.6rem', color: '#7A6452' }}>
              {character} {name}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="animate-fade-in-up delay-100 flex flex-col gap-5">
          {/* Upload button */}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 flex items-center justify-center gap-3 transition-all"
              style={{
                border: '1px solid rgba(196,135,12,0.35)',
                background: previewUrl ? 'rgba(196,135,12,0.05)' : 'transparent',
                color: '#C4870C',
                fontFamily: 'Lora, serif',
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12V4M5 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 14h14" strokeLinecap="round" />
              </svg>
              {previewUrl ? 'Trocar foto' : 'Escolher da galeria'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          {/* Caption input */}
          <div>
            <label
              className="block text-xs tracking-widest uppercase mb-3"
              style={{ color: '#7A6452', fontFamily: 'Lora, serif' }}
            >
              Legenda
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Escreva algo especial..."
              className="input-elegant w-full pb-3 text-base"
              style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.1rem', color: '#2C1810' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="animate-fade-in-up delay-200 mt-2">
          <button
            onClick={onSubmit}
            disabled={!previewUrl && !caption}
            className="btn-gold w-full py-4 text-white text-sm tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            style={{ fontFamily: 'Lora, serif' }}
          >
            Publicar Memória
          </button>
          <p className="text-center mt-3 text-xs" style={{ color: '#7A6452', fontFamily: 'Lora, serif' }}>
            Sua foto aparecerá na galeria para todos
          </p>
        </div>

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <div style={{ width: 40, height: 1, background: '#C4870C', opacity: 0.3 }} />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 0.5 L7.2 4.8 L11.5 6 L7.2 7.2 L6 11.5 L4.8 7.2 L0.5 6 L4.8 4.8 Z" fill="#C4870C" opacity="0.5" />
          </svg>
          <div style={{ width: 40, height: 1, background: '#C4870C', opacity: 0.3 }} />
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────── Root App ────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [name, setName] = useState('')
  const [character, setCharacter] = useState('')
  const [avatar, setAvatar] = useState('')
  const [photos, setPhotos] = useState<Photo[]>(SEED_PHOTOS)
  const [caption, setCaption] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [filter, setFilter] = useState<GalleryTab>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleAddPhoto = () => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url:
        previewUrl ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=520&fit=crop&auto=format',
      caption: caption || 'Momento especial 💛',
      author: name,
      emoji: character,
      avatarId: avatar,
      rotation: Math.floor(Math.random() * 7) - 3,
      isUserPhoto: true,
      likes: 0,
    }
    setPhotos(prev => [newPhoto, ...prev])
    setCaption('')
    setPreviewUrl(null)
    setScreen('gallery')
    setFilter('all')
  }

  const handleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setPhotos(ps => ps.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p))
      } else {
        next.add(id)
        setPhotos(ps => ps.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
      }
      return next
    })
  }

  const filteredPhotos = filter === 'mine' ? photos.filter(p => p.author === name) : photos

  return (
    <div className="max-w-md mx-auto relative" style={{ minHeight: '100vh' }}>
      {screen === 'welcome' && (
        <WelcomeScreen name={name} setName={setName} onContinue={() => name.trim() && setScreen('character')} />
      )}
      {screen === 'character' && (
        <CharacterScreen
          character={character}
          setCharacter={setCharacter}
          onContinue={() => character && setScreen('avatar')}
          onBack={() => setScreen('welcome')}
        />
      )}
      {screen === 'avatar' && (
        <AvatarScreen
          avatar={avatar}
          setAvatar={setAvatar}
          onContinue={() => avatar && setScreen('gallery')}
          onBack={() => setScreen('character')}
        />
      )}
      {screen === 'gallery' && (
        <GalleryScreen
          name={name}
          character={character}
          avatar={avatar}
          photos={filteredPhotos}
          allPhotos={photos}
          filter={filter}
          setFilter={setFilter}
          onAdd={() => setScreen('add-photo')}
          onSelect={i => setLightboxIndex(i)}
          onLike={handleLike}
          likedIds={likedIds}
        />
      )}
      {screen === 'add-photo' && (
        <AddPhotoScreen
          name={name}
          character={character}
          caption={caption}
          setCaption={setCaption}
          previewUrl={previewUrl}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onSubmit={handleAddPhoto}
          onBack={() => setScreen('gallery')}
        />
      )}
      {lightboxIndex !== null && (
        <FullscreenLightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          likedIds={likedIds}
          onLike={handleLike}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
