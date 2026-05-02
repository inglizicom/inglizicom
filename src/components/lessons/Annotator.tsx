'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pencil, Highlighter, Eraser, Trash2, Undo2, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawTool = 'pen' | 'highlighter' | 'eraser'
type Point    = { x: number; y: number }
type Stroke   = { tool: DrawTool; color: string; width: number; points: Point[] }
type HistItem = { kind: 'stroke' } | { kind: 'mark'; el: HTMLElement; parent: Node; next: ChildNode | null }

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  { hex: '#ef4444', label: 'Red'     },
  { hex: '#f59e0b', label: 'Amber'   },
  { hex: '#84cc16', label: 'Lime'    },
  { hex: '#10b981', label: 'Green'   },
  { hex: '#06b6d4', label: 'Cyan'    },
  { hex: '#3b82f6', label: 'Blue'    },
  { hex: '#8b5cf6', label: 'Violet'  },
  { hex: '#ec4899', label: 'Pink'    },
  { hex: '#0f172a', label: 'Black'   },
]

const WIDTHS = [2, 5, 10]

// ─── Main component ────────────────────────────────────────────────────────────

export default function Annotator({ resetKey }: { resetKey: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const strokesRef   = useRef<Stroke[]>([])
  const currentRef   = useRef<Stroke | null>(null)
  const drawingRef   = useRef(false)
  const historyRef   = useRef<HistItem[]>([])
  // last saved selection range (preserved across toolbar mousedowns)
  const savedRange   = useRef<Range | null>(null)

  const [enabled,   setEnabled]   = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [tool,      setTool]      = useState<DrawTool>('pen')
  const [color,     setColor]     = useState(COLORS[0].hex)
  const [width,     setWidth]     = useState(WIDTHS[1])
  const [histLen,   setHistLen]   = useState(0)

  // ── Canvas sizing + redraw ──────────────────────────────────────────────────
  const redraw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h)
    for (const s of strokesRef.current) drawStroke(ctx, s, w, h)
  }, [])

  const fullRedraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    redraw(ctx, rect.width, rect.height)
  }, [redraw])

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const fit = () => {
      const dpr  = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      canvas.style.width  = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw(ctx, rect.width, rect.height)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [redraw])

  // ── Clear canvas + highlights when section changes ──────────────────────────
  useEffect(() => {
    strokesRef.current = []
    historyRef.current = []
    setHistLen(0)
    document.querySelectorAll<HTMLElement>('[data-ann]').forEach(unmarkEl)
    fullRedraw()
  }, [resetKey, fullRedraw])

  // ── Save selection before toolbar steals focus ──────────────────────────────
  // Every time the user selects text we cache the range here.
  useEffect(() => {
    const save = () => {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        savedRange.current = sel.getRangeAt(0).cloneRange()
      }
    }
    document.addEventListener('selectionchange', save)
    return () => document.removeEventListener('selectionchange', save)
  }, [])

  // ── Canvas pointer handlers ─────────────────────────────────────────────────
  function getPoint(e: React.PointerEvent): Point {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!enabled) return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    drawingRef.current = true
    currentRef.current = { tool, color, width, points: [getPoint(e)] }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!enabled || !drawingRef.current || !currentRef.current) return
    e.preventDefault()
    currentRef.current.points.push(getPoint(e))
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const rect   = canvas.getBoundingClientRect()
    drawStroke(ctx, currentRef.current, rect.width, rect.height)
  }

  function onPointerUp() {
    if (!enabled || !drawingRef.current || !currentRef.current) return
    if (currentRef.current.points.length > 1) {
      strokesRef.current.push(currentRef.current)
      historyRef.current.push({ kind: 'stroke' })
      setHistLen(h => h + 1)
    }
    currentRef.current = null
    drawingRef.current = false
  }

  // ── Text highlight ──────────────────────────────────────────────────────────
  function applyHighlight(hex: string) {
    const range = savedRange.current
    if (!range || range.collapsed) return
    // restore selection so the user sees what was highlighted
    try {
      const mark = document.createElement('mark')
      mark.dataset.ann = '1'
      mark.style.backgroundColor = hex + '55'   // ~33% opacity
      mark.style.color            = 'inherit'
      mark.style.borderRadius     = '2px'
      // store position for undo
      const parent = range.startContainer.parentNode!
      const next   = mark.nextSibling  // will be null before insert — fixed below
      range.surroundContents(mark)
      historyRef.current.push({ kind: 'mark', el: mark, parent, next: mark.nextSibling })
      setHistLen(h => h + 1)
      window.getSelection()?.removeAllRanges()
      savedRange.current = null
    } catch {
      // cross-element selections — silently skip
    }
  }

  // ── Color button click ──────────────────────────────────────────────────────
  // When drawing is OFF → try to highlight selection.
  // When drawing is ON  → just change draw color.
  function handleColorClick(hex: string) {
    setColor(hex)
    if (!enabled) applyHighlight(hex)
  }

  // ── Undo ────────────────────────────────────────────────────────────────────
  function undo() {
    const last = historyRef.current.pop()
    if (!last) return
    if (last.kind === 'stroke') {
      strokesRef.current.pop()
      fullRedraw()
    } else {
      unmarkEl(last.el)
    }
    setHistLen(h => h - 1)
  }

  // ── Clear ───────────────────────────────────────────────────────────────────
  function clear() {
    strokesRef.current = []
    historyRef.current = []
    setHistLen(0)
    document.querySelectorAll<HTMLElement>('[data-ann]').forEach(unmarkEl)
    fullRedraw()
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="absolute inset-0 z-30 pointer-events-none">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={enabled ? 'pointer-events-auto cursor-crosshair touch-none' : ''}
      />

      <div className="pointer-events-auto">
        {collapsed ? (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => setCollapsed(false)}
            title="Show tools"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur rounded-l-2xl shadow-lg border border-r-0 border-slate-200 hover:bg-white transition"
          >
            <Pencil className="w-4 h-4 text-slate-700" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200 p-2 flex flex-col items-center gap-1.5 max-h-[85vh] overflow-y-auto">

            {/* ON / OFF toggle */}
            <Btn
              label={enabled ? 'Drawing ON — click to switch to highlight mode' : 'Highlight mode — click to switch to drawing mode'}
              active={enabled}
              onClick={() => setEnabled(v => !v)}
            >
              <span className="text-[11px] font-bold">{enabled ? 'DRAW' : 'TEXT'}</span>
            </Btn>

            <Sep />

            {/* Draw tools — only shown in draw mode */}
            {enabled && (
              <>
                <Btn label="Pen"         active={tool === 'pen'}         onClick={() => setTool('pen')}>         <Pencil      className="w-4 h-4" /></Btn>
                <Btn label="Highlighter" active={tool === 'highlighter'} onClick={() => setTool('highlighter')}><Highlighter className="w-4 h-4" /></Btn>
                <Btn label="Eraser"      active={tool === 'eraser'}      onClick={() => setTool('eraser')}>      <Eraser      className="w-4 h-4" /></Btn>
                <Sep />
              </>
            )}

            {/* Colors */}
            <div className="grid grid-cols-2 gap-1 px-0.5">
              {COLORS.map(c => (
                <button
                  key={c.hex}
                  title={c.label}
                  // ← This is the critical fix: prevent blur of text selection
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleColorClick(c.hex)}
                  className={`w-5 h-5 rounded-full transition hover:scale-110 ${
                    color === c.hex ? 'ring-2 ring-offset-1 ring-slate-900 scale-110' : ''
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>

            {/* Stroke widths — draw mode only */}
            {enabled && (
              <>
                <Sep />
                {WIDTHS.map(w => (
                  <button
                    key={w}
                    title={`Width ${w}`}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setWidth(w)}
                    className={`w-9 h-7 rounded-lg flex items-center justify-center transition ${
                      width === w ? 'bg-slate-900' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="rounded-full"
                      style={{ width: w * 1.6, height: w * 1.6, background: width === w ? '#fff' : '#0f172a' }}
                    />
                  </button>
                ))}
              </>
            )}

            <Sep />

            <Btn label="Undo" disabled={histLen === 0} onClick={undo}>
              <Undo2 className="w-4 h-4" />
            </Btn>
            <Btn label="Clear all" disabled={histLen === 0} danger onClick={clear}>
              <Trash2 className="w-4 h-4" />
            </Btn>

            <Sep />

            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => setCollapsed(true)}
              title="Hide toolbar"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unmarkEl(el: HTMLElement) {
  const parent = el.parentNode
  if (!parent) return
  // Replace the <mark> with its text content
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
  // Merge adjacent text nodes
  parent.normalize()
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, w: number, h: number) {
  if (s.points.length < 2) return
  ctx.save()
  if (s.tool === 'highlighter') {
    ctx.globalAlpha = 0.32
    ctx.lineWidth   = s.width * 5
    ctx.lineCap     = 'butt'
  } else if (s.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = s.width * 5
    ctx.lineCap   = 'round'
  } else {
    ctx.lineWidth   = s.width
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
  }
  ctx.strokeStyle = s.color
  ctx.beginPath()
  ctx.moveTo(s.points[0].x * w, s.points[0].y * h)
  for (let i = 1; i < s.points.length; i++) {
    ctx.lineTo(s.points[i].x * w, s.points[i].y * h)
  }
  ctx.stroke()
  ctx.restore()
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────

function Sep() {
  return <div className="h-px w-7 bg-slate-200 my-0.5" />
}

function Btn({
  children, label, active, onClick, disabled, danger,
}: {
  children: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      title={label}
      disabled={disabled}
      // prevent text-selection blur on every toolbar button
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
        disabled  ? 'opacity-30 cursor-not-allowed' :
        active    ? 'bg-slate-900 text-white shadow' :
        danger    ? 'text-rose-600 hover:bg-rose-50' :
                    'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
