'use client'

/**
 * The teaching board shared by every recording deck (/admin/present/*).
 * Lifted out of the writing deck so a second deck could not mean a second board:
 * one implementation, one storage format, one set of habits for the teacher.
 *
 * A deck passes a full `storeKey` (its own namespace + slide) and, optionally,
 * `cards` — pieces of the current slide the teacher can drop onto the board
 * instead of retyping them on camera.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, X, StickyNote, List, ListOrdered, Eraser, Trash2,
  Image as ImageIcon, Upload, Search, Type, Move, SendToBack, BookOpen,
  MousePointer2, Pencil, ArrowUpRight, Square, Circle, Highlighter, LayoutGrid,
  MoreHorizontal, Undo2, Redo2, Copy as CopyIcon, HelpCircle, Plus, Share2, Check,
  type LucideIcon,
} from 'lucide-react'

const INK = '#2a1d12'
const GOLD = '#facc15'
const AMBER = '#b45309'

/** A piece of the current slide the board can stamp — «من الدرس». */
export type DeckCard = { id: string; label: string; icon?: LucideIcon; make: () => string }

/** Does this slide already carry a board? (drives the gold dot on the button) */
export const readNote = (storeKey: string) => { try { return localStorage.getItem(storeKey) || '' } catch { return '' } }

/* ── Note board ───────────────────────────────────────────────────────────────
   The teaching board that opens OVER the current slide (N, or the لوح الشرح
   button) and closes back onto the very same slide (Esc / ✕).

   Deliberately small. An English teacher writes a sentence, recolours a word,
   circles or points at something, and sometimes shows a picture — so that is all
   this does. One toolbar row that never wraps; anything rarer lives behind ⋯.

   Nothing flows like a document: every text box, picture, stroke and shape is an
   object you place, drag, scale and stack. One board per lesson, in localStorage. */

type Pt = [number, number]
type ShapeKind = 'arrow' | 'rect' | 'ellipse'
type NoteItem = {
  id: string
  kind: 'text' | 'image' | 'draw' | 'shape'
  x: number; y: number
  w: number; h?: number
  z: number
  html?: string
  dir?: 'rtl' | 'ltr'
  words?: string[]                // present ⇒ the box is in word mode
  fs?: number                     // font size in px, used by word mode
  bg?: string; bd?: string        // card fill + border, for an emphasis box
  src?: string
  pts?: Pt[]                      // stroke points, normalised 0..1 inside w×h
  hl?: boolean                    // highlighter rather than pen
  shape?: ShapeKind
  a?: Pt; b?: Pt                  // normalised endpoints, for arrow direction
  color?: string; sw?: number
}
type Pattern = 'plain' | 'grid' | 'lines'
type Tool = 'select' | 'text' | 'pen' | 'mark' | 'arrow' | 'rect' | 'ellipse' | 'eraser'
type Page = { pattern: Pattern; paper: string; mark: boolean }

const uid = () => Math.random().toString(36).slice(2, 9)

const PAPER = [
  { v: '#ffffff', label: 'أبيض' },
  { v: '#fdfaf3', label: 'كريمي' },
  { v: '#f4f6f8', label: 'رمادي' },
  { v: '#fffbeb', label: 'عسلي' },
  { v: '#0f2a22', label: 'سبّورة' },
  { v: '#1c1917', label: 'أسود' },
]
const isDarkPaper = (p: string) => ['#0f2a22', '#1c1917'].includes(p)

/* v5 = {page, pages:[items,…]} — a lesson can hold several boards, so explaining
   something new never means wiping what is already drawn.
   v4/v3/v2 = a single {items}; anything else is a v1 HTML note. Every older shape
   loads as page 1 rather than being dropped. */
function loadBoard(key: string): { pages: NoteItem[][]; page: Page } {
  const dflt: Page = { pattern: 'plain', paper: '#ffffff', mark: true }
  const raw = readNote(key)
  if (!raw) return { pages: [[]], page: dflt }
  if (raw.trim().startsWith('{')) {
    try {
      const p = JSON.parse(raw)
      const page: Page = { ...dflt, ...(p.page ?? {}), ...(p.bg ? { pattern: p.bg } : {}) }
      if (Array.isArray(p?.pages) && p.pages.length) return { pages: p.pages as NoteItem[][], page }
      if (Array.isArray(p?.items)) return { pages: [p.items as NoteItem[]], page }
    } catch { /* fall through and treat it as v1 HTML */ }
  }
  return { pages: [[{ id: uid(), kind: 'text', x: 70, y: 60, w: 900, html: raw, dir: 'rtl', z: 1 }]], page: dflt }
}

/* Shrink a pasted/dropped/uploaded picture before it goes on the board.
   localStorage holds roughly 5 MB for the WHOLE deck and a raw phone screenshot is
   ~3 MB of base64 on its own, so we downscale and JPEG-compress. Pictures from the
   search panel keep their remote URL instead (a few dozen bytes). */
function shrinkToDataUrl(file: Blob, maxPx = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('read-failed'))
    fr.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('decode-failed'))
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d')
        if (!ctx) return reject(new Error('no-canvas'))
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        resolve(c.toDataURL('image/jpeg', quality))
      }
      img.src = String(fr.result)
    }
    fr.readAsDataURL(file)
  })
}

type SearchHit = { thumb: string; full: string; credit: string; link: string }

const INK_COLORS = ['#2a1d12', '#dc2626', '#059669', '#2563eb', '#b45309', '#ffffff']
const CARD_STYLES: { bg: string; bd: string; label: string }[] = [
  { bg: 'transparent', bd: 'transparent', label: 'بلا إطار' },
  { bg: '#fef3c7', bd: '#fcd34d', label: 'أصفر' },
  { bg: '#dcfce7', bd: '#86efac', label: 'أخضر' },
  { bg: '#dbeafe', bd: '#93c5fd', label: 'أزرق' },
  { bg: '#fee2e2', bd: '#fca5a5', label: 'أحمر' },
]
// Sized for video: a student watching on a phone has to read this comfortably.
const TEXT_SIZES: { label: string; px: string }[] = [
  { label: 'S', px: '28px' }, { label: 'M', px: '40px' }, { label: 'L', px: '56px' },
]
const STROKE_WIDTHS = [3, 6, 12]

const TOOLS: { id: Tool; icon: LucideIcon; title: string }[] = [
  { id: 'select', icon: MousePointer2, title: 'تحديد وتحريك (V)' },
  { id: 'text', icon: Type, title: 'اكتب جملة (T) — أو انقر نقرتين على اللوح' },
  { id: 'pen', icon: Pencil, title: 'قلم (P)' },
  { id: 'mark', icon: Highlighter, title: 'قلم تظليل (H)' },
  { id: 'arrow', icon: ArrowUpRight, title: 'سهم (A)' },
  { id: 'ellipse', icon: Circle, title: 'دائرة — ظلّل كلمة (O)' },
  { id: 'rect', icon: Square, title: 'مستطيل (R)' },
  { id: 'eraser', icon: Eraser, title: 'ممحاة (E)' },
]

export function NotePad({ storeKey, label, cards, onClose, onDirty }: {
  storeKey: string; label: string; cards?: DeckCard[]
  onClose: () => void; onDirty: (has: boolean) => void
}) {
  const boardRef = useRef<HTMLDivElement>(null)
  const textEls = useRef<Record<string, HTMLDivElement | null>>({})
  const [items, setItems] = useState<NoteItem[]>([])
  const itemsRef = useRef(items); itemsRef.current = items
  const [page, setPage] = useState<Page>({ pattern: 'plain', paper: '#ffffff', mark: true })
  // `items` is always the CURRENT page; `pages` keeps the rest.
  const [pages, setPages] = useState<NoteItem[][]>([[]])
  const pagesRef = useRef(pages); pagesRef.current = pages
  const [pageIdx, setPageIdx] = useState(0)
  const pageIdxRef = useRef(pageIdx); pageIdxRef.current = pageIdx
  const [rev, setRev] = useState(0)
  const [sel, setSel] = useState<string | null>(null)
  const selRef = useRef(sel); selRef.current = sel
  const [tool, setTool] = useState<Tool>('select')
  const toolRef = useRef(tool); toolRef.current = tool
  const [color, setColor] = useState(INK_COLORS[1])
  const [sw, setSw] = useState(6)
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'full'>('idle')
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const dragDepth = useRef(0)
  const wordDrag = useRef<{ id: string; i: number } | null>(null)   // declared before isFileDrag reads it
  const isFileDrag = (e: React.DragEvent) =>
    !wordDrag.current && Array.from(e.dataTransfer?.types ?? []).some(t => t === 'Files' || t === 'text/uri-list')
  const endDrag = useCallback(() => { dragDepth.current = 0; setDragOver(false) }, [])
  const [menu, setMenu] = useState<null | 'page' | 'more' | 'lesson' | 'help'>(null)
  /* Share view: strips every piece of chrome and frames the board to a social
     ratio so an OS screenshot is already the finished picture. Deliberately not a
     rasteriser — rendering rich contentEditable text to canvas by hand would
     silently drop the colours and sizes that make the board worth sharing. */
  const [share, setShare] = useState<null | '1:1' | '4:5' | '9:16'>(null)
  const shareRatio = share === '1:1' ? 1 : share === '4:5' ? 4 / 5 : 9 / 16
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const lastPoint = useRef({ x: 90, y: 90 })
  const focusNext = useRef<string | null>(null)
  const [editWord, setEditWord] = useState<{ id: string; i: number } | null>(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [provider, setProvider] = useState('')
  const [term, setTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const dark = isDarkPaper(page.paper)
  const topZ = () => itemsRef.current.reduce((m, i) => Math.max(m, i.z), 0)

  /* ── persistence ──────────────────────────────────────────────────────────
     Text lives in the DOM while you type — writing it into React state on every
     keystroke re-renders the box and throws the caret to the start — so a snapshot
     reads the boxes back out at save time. */
  const snapshot = useCallback((): NoteItem[] => itemsRef.current.map(it =>
    it.kind === 'text' ? { ...it, html: textEls.current[it.id]?.innerHTML ?? it.html ?? '' } : it), [])
  const isBlank = (it: NoteItem) => it.kind === 'text' && (it.html || '').replace(/<br>|&nbsp;|\s/g, '') === ''

  const persist = useCallback(() => {
    const all = [...pagesRef.current]
    all[pageIdxRef.current] = snapshot().filter(it => !isBlank(it))
    const anything = all.some(pg => pg.length)
    try {
      if (anything) { localStorage.setItem(storeKey, JSON.stringify({ v: 5, page, pages: all })); onDirty(true) }
      else { localStorage.removeItem(storeKey); onDirty(false) }
      setSaved('saved')
    } catch {
      // Almost always the 5 MB localStorage quota, blown by pasted pictures. What is
      // on screen is intact — say so plainly instead of pretending it saved.
      setSaved('full')
    }
  }, [storeKey, onDirty, snapshot, page])

  const touch = useCallback(() => {
    setSaved('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(persist, 400)
  }, [persist])

  /* ── undo / redo ──────────────────────────────────────────────────────────
     Covers the SHAPE of the board. Typing inside a box keeps the browser's own
     undo, which is what your fingers expect mid-sentence. */
  const past = useRef<NoteItem[][]>([])
  const future = useRef<NoteItem[][]>([])
  const mark = useCallback(() => {
    past.current.push(snapshot())
    if (past.current.length > 60) past.current.shift()
    future.current = []
  }, [snapshot])
  const mutate = useCallback((fn: (list: NoteItem[]) => NoteItem[]) => {
    mark(); setItems(fn(snapshot())); touch()
  }, [mark, snapshot, touch])
  const undo = useCallback(() => {
    if (!past.current.length) return
    future.current.push(snapshot())
    setItems(past.current.pop()!); setRev(r => r + 1); setSel(null); touch()
  }, [snapshot, touch])
  const redo = useCallback(() => {
    if (!future.current.length) return
    past.current.push(snapshot())
    setItems(future.current.pop()!); setRev(r => r + 1); setSel(null); touch()
  }, [snapshot, touch])

  useEffect(() => {
    textEls.current = {}
    const b = loadBoard(storeKey)
    setPages(b.pages); pagesRef.current = b.pages
    setPageIdx(0); pageIdxRef.current = 0
    setItems(b.pages[0] ?? []); setPage(b.page); setSel(null); setRev(r => r + 1)
    past.current = []; future.current = []
    try { document.execCommand('styleWithCSS', false, 'true') } catch { /* older engines */ }
  }, [storeKey])
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); persist() }, [persist])
  useEffect(() => {
    window.addEventListener('dragend', endDrag)
    window.addEventListener('drop', endDrag)
    return () => { window.removeEventListener('dragend', endDrag); window.removeEventListener('drop', endDrag) }
  }, [endDrag])
  useEffect(() => {
    const id = focusNext.current; if (!id) return
    const el = textEls.current[id]
    if (el) { focusNext.current = null; el.focus() }
  })

  const pointIn = (e: { clientX: number; clientY: number }) => {
    const el = boardRef.current
    if (!el) return { x: 90, y: 90 }
    const r = el.getBoundingClientRect()
    return { x: Math.max(0, e.clientX - r.left + el.scrollLeft), y: Math.max(0, e.clientY - r.top + el.scrollTop) }
  }
  const boardBottom = items.reduce((m, i) => Math.max(m, i.y + (i.h ?? 160)), 0)

  /* ── creating things ──────────────────────────────────────────────────── */
  const addText = (x: number, y: number, opts?: Partial<NoteItem>) => {
    const id = uid()
    // English lesson board → English sentences. LTR is the right default; ⋯ flips it.
    // Empty boxes left behind by a stray click are dropped here, so writing wherever you
    // click never litters the board with invisible frames.
    mutate(list => [...list.filter(it => !isBlank(it)), { id, kind: 'text', x, y, w: 620, html: '', dir: 'ltr', z: topZ() + 1, ...opts }])
    setSel(id); focusNext.current = id; setTool('select')
  }

  const addImage = (src: string, at?: { x: number; y: number }) => {
    const pt = at ?? lastPoint.current
    const probe = new Image()
    const place = (w: number, h: number) =>
      mutate(list => [...list, { id: uid(), kind: 'image', x: pt.x, y: pt.y, w, h, src, z: topZ() + 1 }])
    probe.onload = () => {
      const w = Math.min(460, probe.naturalWidth || 460)
      place(w, Math.round(w * ((probe.naturalHeight || 300) / (probe.naturalWidth || 460))))
    }
    probe.onerror = () => place(420, 280)
    probe.src = src
  }

  const insertFiles = async (files: (File | Blob)[], at?: { x: number; y: number }) => {
    const pics = files.filter(f => f.type.startsWith('image/'))
    if (!pics.length) return
    setBusy(true)
    let i = 0
    for (const f of pics) {
      try { const pt = at ?? lastPoint.current; addImage(await shrinkToDataUrl(f), { x: pt.x + i * 28, y: pt.y + i * 28 }); i++ }
      catch { /* skip a picture we cannot decode */ }
    }
    setBusy(false)
  }

  const remove = (id: string) => { mutate(list => list.filter(i => i.id !== id)); delete textEls.current[id]; setSel(null); setMenu(null) }
  const duplicate = (id: string) => {
    const src = snapshot().find(i => i.id === id); if (!src) return
    const copy = { ...src, id: uid(), x: src.x + 28, y: src.y + 28, z: topZ() + 1 }
    mutate(list => [...list, copy]); setSel(copy.id); setRev(r => r + 1); setMenu(null)
  }
  const bringFront = (id: string) => setItems(list => list.map(i => i.id === id ? { ...i, z: topZ() + 1 } : i))
  const sendBack = (id: string) => {
    const min = itemsRef.current.reduce((m, i) => Math.min(m, i.z), 0)
    mutate(list => list.map(i => i.id === id ? { ...i, z: min - 1 } : i)); setMenu(null)
  }
  const patch = (id: string, p: Partial<NoteItem>) => mutate(list => list.map(i => i.id === id ? { ...i, ...p } : i))

  /* ── pages ────────────────────────────────────────────────────────────────
     Explaining something new should not mean erasing what is already on the
     board. Each lesson holds as many pages as it needs; switching commits the
     visible one first so nothing is lost, and history resets per page because
     an undo that reached across pages would be surprising. */
  const goPage = (i: number) => {
    const snap = snapshot().filter(it => !isBlank(it))
    const all = [...pagesRef.current]
    all[pageIdxRef.current] = snap
    if (i < 0 || i >= all.length) return
    pagesRef.current = all; setPages(all)
    textEls.current = {}
    setItems(all[i] ?? []); setPageIdx(i); pageIdxRef.current = i
    setSel(null); setEditWord(null); setRev(r => r + 1)
    past.current = []; future.current = []
    touch()
  }
  const addPage = () => {
    const snap = snapshot().filter(it => !isBlank(it))
    const all = [...pagesRef.current]
    all[pageIdxRef.current] = snap
    all.splice(pageIdxRef.current + 1, 0, [])
    pagesRef.current = all; setPages(all)
    textEls.current = {}
    const next = pageIdxRef.current + 1
    setItems([]); setPageIdx(next); pageIdxRef.current = next
    setSel(null); setEditWord(null); setRev(r => r + 1)
    past.current = []; future.current = []
    touch()
  }
  const removePage = () => {
    if (pagesRef.current.length <= 1) {   // last page: clear it instead of removing it
      mark(); setItems([]); textEls.current = {}; setSel(null); touch(); return
    }
    if (!confirm('احذف هذه الصفحة؟')) return
    const all = [...pagesRef.current]
    all.splice(pageIdxRef.current, 1)
    const next = Math.max(0, pageIdxRef.current - 1)
    pagesRef.current = all; setPages(all)
    textEls.current = {}
    setItems(all[next] ?? []); setPageIdx(next); pageIdxRef.current = next
    setSel(null); setEditWord(null); setRev(r => r + 1)
    past.current = []; future.current = []
    touch()
  }

  /* ── word mode ────────────────────────────────────────────────────────────
     Turn a finished sentence into draggable word chips. The point is teaching a
     transformation without retyping: "You are happy." → swap two chips and edit
     one → "Are you happy?". Click a chip to replace it, drag it to reorder,
     clear it to delete it. Plain text by design — chips carry no inline styling,
     so the box keeps one size (fs) while it is in word mode. */
  const splitWords = (t: string) => t.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const withWords = (it: NoteItem, words: string[]): NoteItem => ({ ...it, words, html: words.join(' ') })

  const toWords = (id: string) => {
    const txt = (textEls.current[id]?.innerText ?? '').trim()
    const words = splitWords(txt)
    mutate(list => list.map(i => i.id === id ? { ...withWords(i, words.length ? words : ['']), fs: i.fs ?? 40 } : i))
    setRev(r => r + 1); setEditWord(null)
  }
  const toText = (id: string) => {
    mutate(list => list.map(i => i.id === id ? { ...i, html: (i.words ?? []).join(' '), words: undefined } : i))
    setRev(r => r + 1); setEditWord(null)
  }
  const setWord = (id: string, i: number, val: string) => {
    mutate(list => list.map(it => {
      if (it.id !== id || !it.words) return it
      const w = [...it.words]
      const v = val.replace(/\s+/g, ' ').trim()
      if (!v) w.splice(i, 1)
      else { const parts = v.split(' '); w.splice(i, 1, ...parts) }   // typing two words splits into two chips
      return withWords(it, w)
    }))
    setRev(r => r + 1)
  }
  const moveWord = (id: string, from: number, to: number) => {
    if (from === to) return
    mutate(list => list.map(it => {
      if (it.id !== id || !it.words) return it
      const w = [...it.words]
      const [m] = w.splice(from, 1)
      w.splice(to > from ? to - 1 : to, 0, m)
      return withWords(it, w)
    }))
    setRev(r => r + 1)
  }
  const addWord = (id: string) => {
    const it = itemsRef.current.find(i => i.id === id); if (!it?.words) return
    mutate(list => list.map(i => i.id === id ? withWords(i, [...(i.words ?? []), 'word']) : i))
    setRev(r => r + 1)
    setEditWord({ id, i: it.words.length })
  }

  /* Drop a piece of the current slide onto the board — no retyping on camera.
     The deck decides what a "piece" is; the board only places the card it is given. */
  const stamp = (card: DeckCard) => {
    const html = card.make()
    if (!html) return
    const id = uid()
    mutate(list => [...list, {
      id, kind: 'text', x: 110, y: (boardRef.current?.scrollTop ?? 0) + 110, w: 820, html,
      dir: 'ltr', bg: '#fef3c7', bd: '#fcd34d', z: topZ() + 1,
    }])
    setSel(id); setRev(r => r + 1); setMenu(null)
  }

  /* ── dragging & scaling ───────────────────────────────────────────────── */
  const dragRef = useRef<{
    id: string; mode: 'move' | 'resize'; sx: number; sy: number
    ox: number; oy: number; ow: number; ratio: number
    before: NoteItem[]; moved: boolean
  } | null>(null)
  const [dragging, setDragging] = useState(false)
  // Selecting a shape or picture must take the caret out of whatever text box had
  // it. startDrag preventDefaults, so the browser will not move focus by itself —
  // and while a contentEditable stays focused the Delete key is treated as typing
  // and never reaches the "remove the selected item" branch.
  const blurEditor = () => {
    const ae = document.activeElement as HTMLElement | null
    if (ae?.isContentEditable) ae.blur()
  }

  const startDrag = (e: React.PointerEvent, it: NoteItem, mode: 'move' | 'resize') => {
    e.preventDefault(); e.stopPropagation()
    if (it.kind !== 'text') blurEditor()
    setSel(it.id); bringFront(it.id)
    dragRef.current = {
      id: it.id, mode, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, ow: it.w,
      ratio: it.kind !== 'text' && it.h ? it.h / it.w : 0,
      before: snapshot(), moved: false,
    }
    setDragging(true)
  }
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current; if (!d) return
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 3) return    // a click, not a drag
      d.moved = true
      const maxX = (boardRef.current?.clientWidth ?? 1200) - 60
      setItems(list => list.map(it => {
        if (it.id !== d.id) return it
        if (d.mode === 'move') return { ...it, x: Math.min(maxX, Math.max(0, d.ox + dx)), y: Math.max(0, d.oy + dy) }
        const w = Math.max(40, d.ow + dx)
        return d.ratio ? { ...it, w, h: Math.round(w * d.ratio) } : { ...it, w }
      }))
    }
    const up = () => {
      const d = dragRef.current; if (!d) return
      dragRef.current = null; setDragging(false)
      if (!d.moved) return                                        // nothing changed, nothing to undo
      past.current.push(d.before)
      if (past.current.length > 60) past.current.shift()
      future.current = []
      touch()
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  }, [touch])

  /* ── drawing ──────────────────────────────────────────────────────────── */
  const [draft, setDraft] = useState<{ tool: Tool; pts: Pt[] } | null>(null)
  const draftRef = useRef(draft); draftRef.current = draft

  // Erasing is a drag, so history is marked once when the gesture starts — marking
  // per pointermove would push dozens of entries and flush the real undo stack.
  const eraseAt = (x: number, y: number) => {
    const hit = itemsRef.current.filter(i => (i.kind === 'draw' || i.kind === 'shape')
      && x >= i.x - 6 && x <= i.x + i.w + 6 && y >= i.y - 6 && y <= i.y + (i.h ?? 0) + 6)
    if (!hit.length) return
    const ids = new Set(hit.map(i => i.id))
    setItems(list => list.filter(i => !ids.has(i.id)))
    touch()
  }

  /* ── click to write ────────────────────────────────────────────────────────
     One tap on empty paper opens a box and puts the caret in it — the board is for
     writing, and asking for two taps before every sentence taxes the whole lesson.
     A tap that DISMISSES something (an open menu, or a picture/shape you had selected)
     only dismisses; there the double-tap still writes, so arranging a picture never
     scatters text boxes around it. */
  const clickStart = useRef<{ x: number; y: number; consumed: boolean } | null>(null)
  const lastCreate = useRef(0)

  const onBoardPointerDown = (e: React.PointerEvent) => {
    const t = toolRef.current
    const onCanvas = e.target === e.currentTarget || !!(e.target as HTMLElement).dataset.canvas
    const menuWasOpen = !!menu
    setMenu(null)
    if (t === 'select') {
      clickStart.current = null
      if (onCanvas) {
        const held = itemsRef.current.find(i => i.id === selRef.current)
        clickStart.current = { x: e.clientX, y: e.clientY, consumed: menuWasOpen || (!!held && held.kind !== 'text') }
        setSel(null); lastPoint.current = pointIn(e)
      }
      return
    }
    const p = pointIn(e); lastPoint.current = p
    if (t === 'text') { addText(p.x, p.y); return }
    if (t === 'eraser') { mark(); setDraft({ tool: 'eraser', pts: [[p.x, p.y]] }); eraseAt(p.x, p.y); return }
    e.preventDefault()
    setDraft({ tool: t, pts: [[p.x, p.y], [p.x, p.y]] })
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = draftRef.current; if (!d) return
      const el = boardRef.current; if (!el) return
      const r = el.getBoundingClientRect()
      const p: Pt = [Math.max(0, e.clientX - r.left + el.scrollLeft), Math.max(0, e.clientY - r.top + el.scrollTop)]
      if (d.tool === 'eraser') { eraseAt(p[0], p[1]); setDraft({ ...d, pts: [p] }); return }
      if (d.tool === 'pen' || d.tool === 'mark') setDraft({ ...d, pts: [...d.pts, p] })
      else setDraft({ ...d, pts: [d.pts[0], p] })
    }
    const up = () => {
      const d = draftRef.current; if (!d) return
      setDraft(null)
      if (d.tool === 'eraser') return
      const freehand = d.tool === 'pen' || d.tool === 'mark'
      const weight = d.tool === 'mark' ? sw * 3.5 : sw
      const xs = d.pts.map(p => p[0]), ys = d.pts.map(p => p[1])
      const pad = Math.max(6, weight)
      const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad
      const w = Math.max(12, Math.max(...xs) - Math.min(...xs) + pad * 2)
      const h = Math.max(12, Math.max(...ys) - Math.min(...ys) + pad * 2)
      const norm = (p: Pt): Pt => [(p[0] - minX) / w, (p[1] - minY) / h]
      const base = { id: uid(), x: minX, y: minY, w, h, z: topZ() + 1, color, sw }
      if (freehand) {
        if (d.pts.length < 2) return
        mutate(list => [...list, { ...base, kind: 'draw', pts: d.pts.map(norm), hl: d.tool === 'mark' }])
      } else {
        mutate(list => [...list, { ...base, kind: 'shape', shape: d.tool as ShapeKind, a: norm(d.pts[0]), b: norm(d.pts[1]) }])
        setTool('select')
      }
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, sw, mutate])

  /* ── keyboard ─────────────────────────────────────────────────────────────
     Capture phase, so Escape is consumed here before the deck's own handler
     closes the board. Escape steps out: caret → selection → tool → close. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null
      const typing = !!ae?.isContentEditable || ae instanceof HTMLInputElement
      const meta = e.ctrlKey || e.metaKey
      if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); e.stopPropagation(); e.shiftKey ? redo() : undo(); return }
      if (meta && e.key.toLowerCase() === 'd' && selRef.current) { e.preventDefault(); e.stopPropagation(); duplicate(selRef.current); return }
      if (e.key === 'Escape') {
        if (share) { e.stopPropagation(); e.preventDefault(); setShare(null); return }
        if (menu) { e.stopPropagation(); e.preventDefault(); setMenu(null); return }
        if (typing) { e.stopPropagation(); e.preventDefault(); ae!.blur(); return }
        if (selRef.current) { e.stopPropagation(); e.preventDefault(); setSel(null); return }
        if (toolRef.current !== 'select') { e.stopPropagation(); e.preventDefault(); setTool('select'); return }
        return
      }
      if (typing || meta) return
      const keyTool: Record<string, Tool> = { v: 'select', t: 'text', p: 'pen', h: 'mark', a: 'arrow', o: 'ellipse', r: 'rect', e: 'eraser' }
      const kt = keyTool[e.key.toLowerCase()]
      if (kt) { e.preventDefault(); e.stopPropagation(); setTool(kt); return }
      if (!selRef.current) return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selRef.current); return }
      const n = e.shiftKey ? 20 : 2
      const d: Record<string, Pt> = { ArrowLeft: [-n, 0], ArrowRight: [n, 0], ArrowUp: [0, -n], ArrowDown: [0, n] }
      const mv = d[e.key]
      if (mv) {
        e.preventDefault(); e.stopPropagation()
        setItems(list => list.map(i => i.id === selRef.current ? { ...i, x: Math.max(0, i.x + mv[0]), y: Math.max(0, i.y + mv[1]) } : i))
        touch()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touch, undo, redo, menu, share])

  const onPaste = (e: React.ClipboardEvent) => {
    const pics = Array.from(e.clipboardData?.items ?? [])
      .filter(i => i.kind === 'file' && i.type.startsWith('image/'))
      .map(i => i.getAsFile()).filter(Boolean) as File[]
    if (pics.length) { e.preventDefault(); void insertFiles(pics); return }
    const text = e.clipboardData?.getData('text/plain')
    const ae = document.activeElement as HTMLElement | null
    if (text && ae?.isContentEditable) { e.preventDefault(); document.execCommand('insertText', false, text); touch() }
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); endDrag()
    const at = pointIn(e); lastPoint.current = at
    const files = Array.from(e.dataTransfer?.files ?? [])
    if (files.length) { void insertFiles(files, at); return }
    const url = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain')
    if (url && /^https?:\/\//i.test(url)) addImage(url, at)
  }

  /* ── text formatting ──────────────────────────────────────────────────── */
  const hold = (e: React.MouseEvent) => e.preventDefault()
  const cmd = (c: string, v?: string) => {
    const ae = document.activeElement as HTMLElement | null
    if (!ae?.isContentEditable) { const el = sel ? textEls.current[sel] : null; el?.focus() }
    try { document.execCommand(c, false, v) } catch { /* noop */ }
    touch()
  }
  const setSize = (px: string) => {
    // execCommand('fontSize') only speaks 1-7, so tag the selection with size 7 and swap
    // that tag for the real pixel size. styleWithCSS must be OFF for this one call — with
    // it on the browser emits font-size:xx-large and every button looks identical.
    const ae = document.activeElement as HTMLElement | null
    const box = ae?.isContentEditable ? ae : (sel ? textEls.current[sel] : null)
    if (!box) return
    if (box !== ae) box.focus()
    try { document.execCommand('styleWithCSS', false, 'false') } catch { /* noop */ }
    try { document.execCommand('fontSize', false, '7') } catch { /* noop */ }
    try { document.execCommand('styleWithCSS', false, 'true') } catch { /* noop */ }
    box.querySelectorAll('font[size="7"]').forEach(f => {
      const span = document.createElement('span')
      span.style.fontSize = px
      span.innerHTML = (f as HTMLElement).innerHTML
      f.replaceWith(span)
    })
    touch()
  }

  const runSearch = async () => {
    const q = query.trim(); if (q.length < 2) return
    setSearching(true); setSearched(true)
    try {
      const r = await fetch(`/api/img/search?q=${encodeURIComponent(q)}`)
      const d = await r.json()
      setHits(d?.results ?? []); setProvider(d?.provider ?? 'none'); setTerm(d?.term ?? '')
    } catch { setHits([]); setProvider('none'); setTerm('') }
    setSearching(false)
  }

  const selItem = items.find(i => i.id === sel) || null
  const drawTool = tool !== 'select' && tool !== 'text'

  const Btn = ({ onClick, title, children, active, wide }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean; wide?: boolean }) => (
    <button onMouseDown={hold} onClick={onClick} title={title}
      className={`${wide ? 'px-2.5' : 'px-1.5'} py-1 rounded-lg font-black transition text-[13px] shrink-0 ${active ? 'text-[#2a1d12]' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
      style={active ? { background: GOLD } : undefined}>{children}</button>
  )
  const Sep = () => <span className="w-px h-5 bg-white/15 mx-[3px] shrink-0" />

  /* Pen stroke or shape, drawn in the item's own pixel box so the stroke keeps its
     weight and arrowheads never skew when you scale it. */
  const Vector = ({ it }: { it: NoteItem }) => {
    const w = it.w, h = it.h ?? 1
    const c = it.color || INK
    const s = it.hl ? (it.sw || 6) * 3.5 : (it.sw || 6)
    const common = { fill: 'none', stroke: c, strokeWidth: s, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, opacity: it.hl ? 0.35 : 1 }
    let body: React.ReactNode = null
    if (it.kind === 'draw' && it.pts) {
      body = <polyline {...common} points={it.pts.map(p => `${p[0] * w},${p[1] * h}`).join(' ')} />
    } else if (it.shape === 'rect') {
      body = <rect {...common} x={s / 2} y={s / 2} width={Math.max(1, w - s)} height={Math.max(1, h - s)} rx={8} />
    } else if (it.shape === 'ellipse') {
      body = <ellipse {...common} cx={w / 2} cy={h / 2} rx={Math.max(1, w / 2 - s / 2)} ry={Math.max(1, h / 2 - s / 2)} />
    } else if (it.a && it.b) {
      const x1 = it.a[0] * w, y1 = it.a[1] * h, x2 = it.b[0] * w, y2 = it.b[1] * h
      const ang = Math.atan2(y2 - y1, x2 - x1), len = Math.max(12, s * 3.2), spread = 0.42
      body = <>
        <line {...common} x1={x1} y1={y1} x2={x2} y2={y2} />
        <polygon fill={c} stroke="none" points={[[x2, y2],
          [x2 - len * Math.cos(ang - spread), y2 - len * Math.sin(ang - spread)],
          [x2 - len * Math.cos(ang + spread), y2 - len * Math.sin(ang + spread)]].map(p => p.join(',')).join(' ')} />
      </>
    }
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>{body}</svg>
  }

  const rule = dark ? 'rgba(255,255,255,0.10)' : '#eef2f7'
  const paperStyle: React.CSSProperties =
    page.pattern === 'grid' ? { background: page.paper, backgroundImage: `linear-gradient(${rule} 1px, transparent 1px), linear-gradient(90deg, ${rule} 1px, transparent 1px)`, backgroundSize: '36px 36px' }
    : page.pattern === 'lines' ? { background: page.paper, backgroundImage: `linear-gradient(${rule} 1px, transparent 1px)`, backgroundSize: '100% 44px' }
    : { background: page.paper }

  const Pop = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
    <div dir="rtl" onMouseDown={e => e.stopPropagation()}
      className={`absolute top-full mt-1 z-[220] rounded-xl bg-white shadow-2xl ring-1 ring-stone-200 p-2 ${align === 'right' ? 'right-0' : 'left-0'}`}>
      {children}
    </div>
  )

  return (
    <div className="absolute inset-0 z-[200] flex flex-col" style={{ background: 'rgba(28,20,12,0.55)' }}>
      <div className={`relative m-[1.2vh] mx-[1.4vw] flex-1 min-h-0 flex flex-col rounded-[22px] overflow-hidden ${share ? '' : 'shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] bg-white'}`}
        style={share ? { background: 'transparent', padding: '7vh 2vw 2vh' } : undefined}>

        {!share && (<>
        {/* ── one toolbar row, never wraps ──
            The scrolling row and the popovers must be SIBLINGS. A box with
            overflow-x:auto cannot keep overflow-y:visible — CSS promotes the
            visible axis to auto — so a popover rendered inside the row gets
            clipped and looks like a dead button. */}
        <div className="shrink-0 relative" style={{ background: INK }}>
        <div className="nb-tools flex items-center gap-[3px] flex-nowrap overflow-x-auto px-[0.8vw] py-[0.8vh]">
          <span className="font-black text-white shrink-0 whitespace-nowrap ml-1" style={{ fontSize: 12.5 }}>{label}</span>
          <Sep />

          {TOOLS.map(t => <Btn key={t.id} title={t.title} active={tool === t.id} onClick={() => setTool(t.id)}><t.icon size={16} /></Btn>)}
          <Sep />

          {INK_COLORS.map(c => (
            <button key={c} onMouseDown={hold}
              onClick={() => {
                setColor(c)
                if (selItem && (selItem.kind === 'draw' || selItem.kind === 'shape')) patch(selItem.id, { color: c })
                else if (!drawTool) cmd('foreColor', c)
              }}
              title="اللون"
              className="w-[17px] h-[17px] rounded-full transition shrink-0"
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${GOLD}` : '0 0 0 1.5px rgba(255,255,255,0.3)' }} />
          ))}
          {STROKE_WIDTHS.map(v => (
            <button key={v} onMouseDown={hold}
              onClick={() => { setSw(v); if (selItem && (selItem.kind === 'draw' || selItem.kind === 'shape')) patch(selItem.id, { sw: v }) }}
              title="سماكة القلم"
              className="w-[19px] h-[19px] rounded-md grid place-items-center shrink-0 transition"
              style={{ background: sw === v ? GOLD : 'rgba(255,255,255,0.08)' }}>
              <span style={{ display: 'block', width: 12, height: Math.min(6, v), borderRadius: 9, background: sw === v ? INK : '#fff' }} />
            </button>
          ))}
          <Sep />

          {TEXT_SIZES.map(t => (
            <Btn key={t.px} title={`حجم النص ${t.label}`}
              onClick={() => selItem?.words ? patch(selItem.id, { fs: parseInt(t.px, 10) }) : setSize(t.px)}>{t.label}</Btn>
          ))}
          <Btn title="عريض" onClick={() => cmd('bold')}><b>B</b></Btn>
          <Btn title="تحته خط" onClick={() => cmd('underline')}><u>U</u></Btn>
          <Sep />

          <Btn wide title="ابحث عن صورة" active={searchOpen} onClick={() => { setSearchOpen(o => !o); setMenu(null) }}>
            <span className="flex items-center gap-1"><ImageIcon size={15} /> صور</span>
          </Btn>
          <Btn title="صورة من جهازك" onClick={() => fileInput.current?.click()}><Upload size={15} /></Btn>
          {!!cards?.length && <Btn title="أدرج من الشريحة" active={menu === 'lesson'} onClick={() => setMenu(m => m === 'lesson' ? null : 'lesson')}><BookOpen size={15} /></Btn>}
          <Sep />

          <Btn title="تراجع (Ctrl+Z)" onClick={undo}><Undo2 size={15} /></Btn>
          <Btn title="إعادة (Ctrl+Shift+Z)" onClick={redo}><Redo2 size={15} /></Btn>
          <Btn title="شكل الصفحة ولونها" active={menu === 'page'} onClick={() => setMenu(m => m === 'page' ? null : 'page')}><LayoutGrid size={15} /></Btn>
          {selItem?.kind === 'text' && (
            <Btn wide title="وضع الكلمات — استبدل أو رتّب كلمة كلمة" active={!!selItem.words}
              onClick={() => selItem.words ? toText(selItem.id) : toWords(selItem.id)}>كلمات</Btn>
          )}
          {selItem && <Btn title="خيارات العنصر المحدّد" active={menu === 'more'} onClick={() => setMenu(m => m === 'more' ? null : 'more')}><MoreHorizontal size={15} /></Btn>}
          {selItem && (
            <button onMouseDown={hold} onClick={() => remove(selItem.id)} title="حذف المحدّد (Del)"
              className="px-2 py-1 rounded-lg font-black transition shrink-0 text-white hover:brightness-110"
              style={{ background: '#dc2626' }}><Trash2 size={15} /></button>
          )}

          <span className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
            <span className="font-bold whitespace-nowrap" style={{ fontSize: 10.5, color: saved === 'full' ? '#fca5a5' : 'rgba(255,255,255,0.3)' }}>
              {busy ? '…' : saved === 'full' ? 'المساحة ممتلئة' : saved === 'saving' ? '…' : saved === 'saved' ? '✓' : ''}
            </span>
            <Btn title="عرض للمشاركة — لقطة نظيفة للنشر" onClick={() => { setSel(null); setMenu(null); setShare('1:1') }}><Share2 size={15} /></Btn>
            <Btn title="الاختصارات" active={menu === 'help'} onClick={() => setMenu(m => m === 'help' ? null : 'help')}><HelpCircle size={15} /></Btn>
            <button onMouseDown={hold} onClick={() => { if (confirm('امسح كل ما في هذا اللوح؟')) { mark(); setItems([]); textEls.current = {}; setSel(null); touch() } }}
              title="امسح اللوح" className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition shrink-0"><Trash2 size={14} /></button>
            <button onClick={onClose} title="إغلاق (Esc)" className="px-2.5 py-1 rounded-lg font-black text-[#2a1d12] hover:brightness-105 transition flex items-center gap-1 shrink-0" style={{ background: GOLD, fontSize: 12.5 }}>
              <X size={13} /> إغلاق
            </button>
          </span>

        </div>

          {/* ── popovers: siblings of the scroll row, never inside it ── */}
          {menu === 'page' && (
            <Pop align="right">
              <div className="flex gap-1 mb-2">
                {([['plain', 'سادة'], ['grid', 'مربّعات'], ['lines', 'أسطر']] as [Pattern, string][]).map(([v, t]) => (
                  <button key={v} onClick={() => { setPage(p => ({ ...p, pattern: v })); touch() }}
                    className="px-3 py-1.5 rounded-lg font-black transition"
                    style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, background: page.pattern === v ? GOLD : '#f5f5f4', color: INK }}>{t}</button>
                ))}
              </div>
              <div className="flex gap-1.5 mb-2">
                {PAPER.map(p => (
                  <button key={p.v} onClick={() => { setPage(s => ({ ...s, paper: p.v })); touch() }} title={p.label}
                    className="w-[26px] h-[26px] rounded-lg transition"
                    style={{ background: p.v, boxShadow: page.paper === p.v ? `0 0 0 2.5px ${GOLD}` : '0 0 0 1.5px #d6d3d1' }} />
                ))}
              </div>
              <button onClick={() => { setPage(p => ({ ...p, mark: !p.mark })); touch() }}
                className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold flex items-center gap-2"
                style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>
                <span className="w-4 h-4 rounded grid place-items-center shrink-0" style={{ background: page.mark ? GOLD : '#e7e5e4' }}>{page.mark && <Check size={11} strokeWidth={4} />}</span>
                توقيع inglizi.com على اللوح
              </button>
            </Pop>
          )}

          {menu === 'more' && selItem && (
            <Pop align="right">
              {selItem.kind === 'text' && (
                <>
                  <div className="flex gap-1.5 mb-2">
                    {CARD_STYLES.map(c => (
                      <button key={c.label} onClick={() => patch(selItem.id, { bg: c.bg, bd: c.bd })} title={c.label}
                        className="w-[26px] h-[26px] rounded-lg transition"
                        style={{ background: c.bg === 'transparent' ? '#fff' : c.bg, boxShadow: `inset 0 0 0 2px ${c.bd === 'transparent' ? '#d6d3d1' : c.bd}` }} />
                    ))}
                  </div>
                  <button onClick={() => patch(selItem.id, { dir: selItem.dir === 'rtl' ? 'ltr' : 'rtl' })}
                    className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>
                    اتجاه الكتابة: {selItem.dir === 'rtl' ? 'عربي ←' : 'إنجليزي →'}
                  </button>
                </>
              )}
              <button onClick={() => duplicate(selItem.id)} className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>تكرار (Ctrl+D)</button>
              <button onClick={() => sendBack(selItem.id)} className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>إلى الخلف</button>
            </Pop>
          )}

          {menu === 'lesson' && !!cards?.length && (
            <Pop align="right">
              {cards.map(c => (
                <button key={c.id} onClick={() => stamp(c)} className="w-full flex items-center gap-2 text-right px-3 py-1.5 rounded-lg hover:bg-amber-50 font-bold"
                  style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12.5, color: INK, minWidth: 150 }}>
                  {c.icon && <c.icon size={13} style={{ color: AMBER }} />}{c.label}
                </button>
              ))}
            </Pop>
          )}

          {menu === 'help' && (
            <Pop align="right">
              {[['V T P H', 'تحديد · نص · قلم · تظليل'], ['A O R', 'سهم · دائرة · مستطيل'], ['E', 'ممحاة'],
                ['نقرة واحدة', 'اكتب في مكان النقر مباشرة'],
                ['نقرة مزدوجة', 'للكتابة بعد تحديد صورة أو شكل (النقرة الأولى تلغي التحديد)'],
                ['Ctrl+Z', 'تراجع'], ['Ctrl+D', 'تكرار'],
                ['Delete', 'حذف'], ['الأسهم', 'تحريك دقيق'], ['Ctrl+V', 'لصق صورة'],
                ['كلمات', 'حوّل الجملة إلى كلمات: اضغط كلمة لتغييرها، اسحبها لتبديل مكانها'],
                ['Esc', 'خروج ثم إغلاق']].map(([k, t]) => (
                <div key={k} className="flex items-center gap-3 py-[2px]" style={{ minWidth: 260 }}>
                  <span dir="ltr" className="font-mono font-bold rounded px-1.5 shrink-0" style={{ background: '#f5f5f4', color: INK, fontSize: 10.5 }}>{k}</span>
                  <span className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 11.5 }}>{t}</span>
                </div>
              ))}
            </Pop>
          )}
        </div>

        {/* picture search */}
        {searchOpen && (
          <div className="shrink-0 border-b border-stone-200 bg-stone-50 px-[1vw] py-[1vh]">
            <div className="flex items-center gap-2">
              <Search size={15} className="text-stone-400 shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void runSearch() } e.stopPropagation() }}
                placeholder="ابحث عن صورة… بالعربية أو بالإنجليزية" dir="auto"
                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-stone-300 bg-white outline-none focus:border-yellow-400 font-bold"
                style={{ fontSize: 14, color: INK }} />
              <button onClick={() => void runSearch()} className="px-3 py-1.5 rounded-lg font-black text-[#2a1d12] shrink-0" style={{ background: GOLD, fontSize: 13 }}>بحث</button>
              <button onClick={() => setSearchOpen(false)} className="text-stone-400 hover:text-stone-700 shrink-0" aria-label="Close search"><X size={16} /></button>
            </div>
            <div className="mt-[0.8vh] max-h-[24vh] overflow-y-auto">
              {searching && <div className="py-3 text-center font-bold text-stone-400" style={{ fontSize: 13 }}>…جاري البحث</div>}
              {!searching && searched && !hits.length && (
                <div className="py-3 text-center font-bold text-stone-400" style={{ fontSize: 13 }}>لا نتائج. جرّب كلمة أخرى — أو انسخ صورة من Google والصقها هنا (Ctrl+V).</div>
              )}
              {!!hits.length && (<>
                <div className="grid grid-cols-8 gap-2">
                  {hits.map((h, i) => (
                    <button key={i} onMouseDown={hold} onClick={() => addImage(h.full)} title={`${h.credit} — اضغط لوضعها، أو اسحبها إلى المكان الذي تريد`}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-stone-200 hover:ring-2 hover:ring-yellow-400 transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.thumb} alt="" draggable
                        onDragStart={e => { e.dataTransfer.setData('text/uri-list', h.full); e.dataTransfer.setData('text/plain', h.full) }}
                        className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {provider && (
                  <div className="mt-[0.6vh] flex items-center gap-2 flex-wrap font-bold text-stone-400" style={{ fontSize: 10.5 }}>
                    <span>المصدر: {provider === 'unsplash' ? 'Unsplash — مرخّصة للاستعمال التجاري' : provider === 'google' ? 'Google Images — تحقّق من الحقوق' : provider}</span>
                    {term && <span dir="ltr" className="rounded px-1.5 py-0.5" style={{ background: '#fef3c7', color: AMBER }}>searched: {term}</span>}
                  </div>
                )}
              </>)}
            </div>
          </div>
        )}

        </>)}

        <input ref={fileInput} type="file" accept="image/*" multiple hidden
          onChange={e => { const f = Array.from(e.target.files ?? []); e.target.value = ''; void insertFiles(f) }} />

        {/* ── the board ── */}
        <div ref={boardRef} onPointerDown={onBoardPointerDown}
          onClick={e => {
            if (tool !== 'select') return
            const cs = clickStart.current; clickStart.current = null
            if (!cs || cs.consumed || e.detail > 1) return           // dismissal, or the 2nd click of a double
            if (!(e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas)) return
            if (Math.hypot(e.clientX - cs.x, e.clientY - cs.y) > 4) return   // that was a drag, not a tap
            const p = pointIn(e); lastCreate.current = Date.now(); addText(p.x, p.y)
          }}
          onDoubleClick={e => {
            if (tool !== 'select' || Date.now() - lastCreate.current < 600) return   // the single click already wrote
            if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas) { const p = pointIn(e); addText(p.x, p.y) }
          }}
          onPaste={onPaste} onDrop={onDrop}
          onDragEnter={e => { dragDepth.current++; if (isFileDrag(e)) setDragOver(true) }}
          onDragOver={e => { e.preventDefault(); if (isFileDrag(e)) setDragOver(true) }}
          onDragLeave={() => { dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragOver(false) }}
          className={share ? 'relative overflow-hidden' : 'relative flex-1 min-h-0 overflow-auto'}
          style={share
            ? { ...paperStyle, aspectRatio: String(shareRatio), maxHeight: '100%', maxWidth: '100%', margin: 'auto', boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45)' }
            : { ...paperStyle, cursor: dragging ? 'grabbing' : drawTool ? 'crosshair' : tool === 'text' ? 'text' : 'default' }}>

          <div data-canvas="1" className="relative w-full min-h-full"
            style={boardBottom ? { height: boardBottom + 140 } : undefined}>
            {!items.length && !draft && (
              <div data-canvas="1" className="absolute inset-0 grid place-items-center pointer-events-none">
                <div dir="rtl" className="text-center font-bold leading-[1.9]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw', color: dark ? 'rgba(255,255,255,0.28)' : '#d6d3d1' }}>
                  انقر في أي مكان لتكتب هناك
                </div>
              </div>
            )}

            {items.map(it => {
              const on = sel === it.id
              const chrome = on ? { outline: `2px solid ${GOLD}`, outlineOffset: 3 } : undefined
              return (
                <div key={`${it.id}:${rev}`} className="absolute"
                  style={{ left: it.x, top: it.y, width: it.w, zIndex: it.z, pointerEvents: drawTool ? 'none' : 'auto' }}>
                  {on && !drawTool && !share && (
                    <div className="absolute -top-[25px] left-0 flex items-center gap-[3px] select-none">
                      <div onPointerDown={e => startDrag(e, it, 'move')}
                        className="flex items-center gap-1 px-2 py-[2px] rounded-t-lg cursor-grab active:cursor-grabbing"
                        style={{ background: GOLD, color: INK }}>
                        <Move size={11} /><span className="font-black" style={{ fontSize: 9.5 }}>اسحب</span>
                      </div>
                      {/* A visible delete. The Delete key only reaches the board when no
                          text box holds the caret, so a button is the reliable way out. */}
                      <button onPointerDown={e => { e.preventDefault(); e.stopPropagation() }}
                        onClick={() => remove(it.id)} title="حذف هذا العنصر"
                        className="grid place-items-center rounded-t-lg px-[6px] py-[3px] hover:brightness-110 transition"
                        style={{ background: '#dc2626', color: '#fff' }}>
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  )}

                  {it.kind === 'text' && it.words ? (
                    /* word mode — chips you can replace and reorder */
                    <div onPointerDown={() => { setSel(it.id); bringFront(it.id); setMenu(null) }}
                      className="flex flex-wrap items-center gap-[8px]"
                      style={{
                        ...chrome, minHeight: 48,
                        padding: it.bg && it.bg !== 'transparent' ? '16px 20px' : '6px 10px',
                        borderRadius: 12,
                        background: it.bg && it.bg !== 'transparent' ? it.bg : undefined,
                        boxShadow: it.bd && it.bd !== 'transparent' ? `inset 0 0 0 2px ${it.bd}` : undefined,
                        direction: (it.dir || 'ltr') as 'rtl' | 'ltr',
                        fontSize: it.fs ?? 40, lineHeight: 1.4,
                        fontFamily: (it.dir || 'ltr') === 'rtl' ? "'Tajawal', 'Outfit', sans-serif" : "'Outfit', 'DM Sans', sans-serif",
                      }}>
                      {it.words.map((w, wi) => {
                        const editing = editWord?.id === it.id && editWord.i === wi
                        return editing ? (
                          <input key={wi} autoFocus defaultValue={w}
                            onFocus={e => e.currentTarget.select()}
                            onKeyDown={e => {
                              e.stopPropagation()
                              if (e.key === 'Enter') { setWord(it.id, wi, e.currentTarget.value); setEditWord(null) }
                            }}
                            onBlur={e => { setWord(it.id, wi, e.currentTarget.value); setEditWord(null) }}
                            className="outline-none rounded-lg px-2 font-bold"
                            style={{ fontSize: 'inherit', fontFamily: 'inherit', width: `${Math.max(3, w.length + 2)}ch`, color: INK, background: '#fff', boxShadow: `0 0 0 2.5px ${GOLD}` }} />
                        ) : (
                          <span key={wi} draggable
                            onDragStart={e => { wordDrag.current = { id: it.id, i: wi }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'w') }}
                            onDragEnd={() => { wordDrag.current = null; endDrag() }}
                            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                            onDrop={e => {
                              e.preventDefault(); e.stopPropagation()
                              const d = wordDrag.current
                              if (d && d.id === it.id) moveWord(it.id, d.i, wi)
                              wordDrag.current = null; endDrag()
                            }}
                            onClick={() => setEditWord({ id: it.id, i: wi })}
                            title="اضغط لتغيير الكلمة · اسحب لتبديل مكانها"
                            className="cursor-pointer rounded-lg px-2 font-bold transition hover:brightness-95"
                            style={{
                              color: (it.bg && it.bg !== 'transparent') ? INK : (dark ? '#fff' : INK),
                              background: dark ? 'rgba(255,255,255,0.09)' : 'rgba(42,29,18,0.055)',
                              boxShadow: `inset 0 0 0 1.5px ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(42,29,18,0.10)'}`,
                            }}>{w}</span>
                        )
                      })}
                      <button onClick={() => addWord(it.id)} title="أضف كلمة"
                        className="rounded-lg px-2 font-black opacity-45 hover:opacity-100 transition"
                        style={{ fontSize: 'inherit', color: AMBER, background: '#fef3c7' }}>+</button>
                    </div>
                  ) : it.kind === 'text' ? (
                    <div
                      ref={el => { textEls.current[it.id] = el; if (el && !el.dataset.init) { el.innerHTML = it.html || ''; el.dataset.init = '1' } }}
                      contentEditable suppressContentEditableWarning spellCheck={false}
                      dir={it.dir || 'ltr'}
                      onPointerDown={() => { setSel(it.id); bringFront(it.id); setMenu(null) }}
                      onInput={touch}
                      onBlur={() => {
                        // A box you opened but never typed into would linger as an invisible
                        // outline. Toolbar buttons preventDefault on mousedown and so never
                        // blur the box — clicking one cannot delete your work.
                        const el = textEls.current[it.id]
                        if (!el || el.innerHTML.replace(/<br>|&nbsp;|\s/g, '') === '') {
                          setItems(list => list.filter(i => i.id !== it.id))
                          delete textEls.current[it.id]
                          setSel(s => (s === it.id ? null : s))
                        }
                        persist()
                      }}
                      className="note-box outline-none"
                      style={{
                        ...chrome, minHeight: 48,
                        padding: it.bg && it.bg !== 'transparent' ? '16px 20px' : '6px 10px',
                        borderRadius: 12,
                        background: it.bg && it.bg !== 'transparent' ? it.bg : undefined,
                        boxShadow: it.bd && it.bd !== 'transparent' ? `inset 0 0 0 2px ${it.bd}` : undefined,
                        color: (it.bg && it.bg !== 'transparent') ? INK : (dark ? '#ffffff' : INK),
                        fontSize: it.fs ?? 40, lineHeight: 1.5,
                        fontFamily: (it.dir || 'ltr') === 'rtl' ? "'Tajawal', 'Outfit', sans-serif" : "'Outfit', 'DM Sans', sans-serif",
                        textAlign: (it.dir || 'ltr') === 'rtl' ? 'right' : 'left',
                      }}
                    />
                  ) : it.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.src} alt="" draggable={false} onPointerDown={e => startDrag(e, it, 'move')}
                      style={{ ...chrome, width: '100%', height: it.h ?? 'auto', borderRadius: 12, display: 'block', cursor: 'grab' }} />
                  ) : (
                    <div onPointerDown={e => startDrag(e, it, 'move')} style={{ ...chrome, borderRadius: 8, cursor: 'grab' }}>
                      <Vector it={it} />
                    </div>
                  )}

                  {on && !drawTool && !share && (
                    <div onPointerDown={e => startDrag(e, it, 'resize')} title="اسحب لتغيير الحجم"
                      className="absolute -bottom-[9px] -right-[9px] w-[18px] h-[18px] rounded-full cursor-nwse-resize"
                      style={{ background: GOLD, boxShadow: '0 0 0 2px #fff' }} />
                  )}
                </div>
              )
            })}

            {/* live preview while drawing */}
            {draft && draft.tool !== 'eraser' && (
              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" style={{ overflow: 'visible' }}>
                {(draft.tool === 'pen' || draft.tool === 'mark')
                  ? <polyline fill="none" stroke={color} strokeWidth={draft.tool === 'mark' ? sw * 3.5 : sw} opacity={draft.tool === 'mark' ? 0.35 : 1}
                      strokeLinecap="round" strokeLinejoin="round" points={draft.pts.map(p => `${p[0]},${p[1]}`).join(' ')} />
                  : draft.tool === 'rect'
                    ? <rect fill="none" stroke={color} strokeWidth={sw} rx={8}
                        x={Math.min(draft.pts[0][0], draft.pts[1][0])} y={Math.min(draft.pts[0][1], draft.pts[1][1])}
                        width={Math.abs(draft.pts[1][0] - draft.pts[0][0])} height={Math.abs(draft.pts[1][1] - draft.pts[0][1])} />
                    : draft.tool === 'ellipse'
                      ? <ellipse fill="none" stroke={color} strokeWidth={sw}
                          cx={(draft.pts[0][0] + draft.pts[1][0]) / 2} cy={(draft.pts[0][1] + draft.pts[1][1]) / 2}
                          rx={Math.abs(draft.pts[1][0] - draft.pts[0][0]) / 2} ry={Math.abs(draft.pts[1][1] - draft.pts[0][1]) / 2} />
                      : <line stroke={color} strokeWidth={sw} strokeLinecap="round"
                          x1={draft.pts[0][0]} y1={draft.pts[0][1]} x2={draft.pts[1][0]} y2={draft.pts[1][1]} />}
              </svg>
            )}

            {/* quiet signature — a screenshot that spreads still carries the brand */}
            {page.mark && (
              <div className="absolute bottom-3 left-4 pointer-events-none select-none font-black"
                style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.20)' : 'rgba(42,29,18,0.16)' }}>
                inglizi.com
              </div>
            )}
          </div>

          {dragOver && (
            <div className="pointer-events-none fixed inset-0 grid place-items-center z-[210]">
              <span className="px-6 py-3 rounded-2xl font-black" style={{ background: GOLD, color: INK, fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>أفلت الصورة في المكان الذي تريد</span>
            </div>
          )}
        </div>

        {/* pages — floated at the bottom so the toolbar stays one clean line */}
        {!share && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 rounded-full px-1.5 py-1"
          style={{ background: '#ffffff', boxShadow: '0 8px 28px -10px rgba(42,29,18,0.45), inset 0 0 0 1.5px #e7e5e4' }}>
          <button onClick={() => goPage(pageIdx - 1)} disabled={pageIdx === 0} title="الصفحة السابقة"
            className="p-1.5 rounded-full text-stone-500 hover:bg-stone-100 disabled:opacity-25 transition"><ChevronRight size={15} /></button>
          <span className="font-black tabular-nums px-1 select-none" style={{ color: INK, fontSize: 12.5 }}>{pageIdx + 1} / {pages.length}</span>
          <button onClick={() => goPage(pageIdx + 1)} disabled={pageIdx >= pages.length - 1} title="الصفحة التالية"
            className="p-1.5 rounded-full text-stone-500 hover:bg-stone-100 disabled:opacity-25 transition"><ChevronLeft size={15} /></button>
          <span className="w-px h-4 bg-stone-200 mx-0.5" />
          <button onClick={addPage} title="صفحة جديدة — ما كتبته هنا يبقى محفوظًا"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[#2a1d12] hover:brightness-95 transition"
            style={{ background: GOLD, fontSize: 12 }}><Plus size={13} strokeWidth={3} /> صفحة</button>
          <button onClick={removePage} title={pages.length > 1 ? 'احذف هذه الصفحة' : 'امسح هذه الصفحة'}
            className="p-1.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"><Trash2 size={14} /></button>
        </div>}

        {/* share controls — outside the framed area so they never appear in the shot */}
        {share && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1 rounded-full px-2 py-1.5"
            style={{ background: INK, boxShadow: '0 10px 30px -12px rgba(0,0,0,0.6)' }}>
            {(['1:1', '4:5', '9:16'] as const).map(r => (
              <button key={r} onClick={() => setShare(r)} className="px-2.5 py-1 rounded-full font-black transition"
                style={{ fontSize: 12, background: share === r ? GOLD : 'transparent', color: share === r ? INK : 'rgba(255,255,255,0.7)' }}>{r}</button>
            ))}
            <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span dir="rtl" className="font-bold px-1" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: "'Tajawal', sans-serif" }}>خذ لقطة شاشة الآن</span>
            <button onClick={() => setShare(null)} className="px-2.5 py-1 rounded-full font-black" style={{ background: GOLD, color: INK, fontSize: 12 }}>إغلاق</button>
          </div>
        )}
      </div>

      <style>{`
        .nb-tools { scrollbar-width: none; -ms-overflow-style: none; }
        .nb-tools::-webkit-scrollbar { display: none; }
        .note-box b, .note-box strong { font-weight: 800; }
        .note-box img { max-width: 100%; border-radius: 10px; }
      `}</style>
    </div>
  )
}
