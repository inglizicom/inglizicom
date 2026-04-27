'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Pencil,
  Highlighter,
  Eraser,
  Trash2,
  Undo2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type Tool = 'pen' | 'highlighter' | 'eraser'

const COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#0f172a', // slate
]

const WIDTHS = [2, 5, 10]

type Point = { x: number; y: number }
type Stroke = { tool: Tool; color: string; width: number; points: Point[] }

export default function Annotator({ resetKey }: { resetKey: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentRef = useRef<Stroke | null>(null)
  const drawingRef = useRef(false)

  const [enabled, setEnabled] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState(COLORS[0])
  const [width, setWidth] = useState(WIDTHS[1])

  // Sizing + redraw
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw(ctx, rect.width, rect.height)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Clear when section changes
  useEffect(() => {
    strokesRef.current = []
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
  }, [resetKey])

  function redraw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h)
    for (const s of strokesRef.current) drawStroke(ctx, s, w, h)
  }

  function fullRedraw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    redraw(ctx, rect.width, rect.height)
  }

  function getPoint(e: React.PointerEvent): Point {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  function pointerDown(e: React.PointerEvent) {
    if (!enabled) return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    drawingRef.current = true
    currentRef.current = { tool, color, width, points: [getPoint(e)] }
  }

  function pointerMove(e: React.PointerEvent) {
    if (!enabled || !drawingRef.current || !currentRef.current) return
    e.preventDefault()
    currentRef.current.points.push(getPoint(e))
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    drawStroke(ctx, currentRef.current, rect.width, rect.height)
  }

  function pointerUp() {
    if (!enabled || !drawingRef.current || !currentRef.current) return
    if (currentRef.current.points.length > 1) {
      strokesRef.current.push(currentRef.current)
    }
    currentRef.current = null
    drawingRef.current = false
  }

  function clear() {
    strokesRef.current = []
    fullRedraw()
  }

  function undo() {
    strokesRef.current.pop()
    fullRedraw()
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-30 pointer-events-none">
      <canvas
        ref={canvasRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        className={enabled ? 'pointer-events-auto cursor-crosshair touch-none' : ''}
      />

      {/* Toolbar — always interactive */}
      <div className="pointer-events-auto">
        <Toolbar
          enabled={enabled}
          setEnabled={setEnabled}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          width={width}
          setWidth={setWidth}
          clear={clear}
          undo={undo}
          hasStrokes={strokesRef.current.length > 0}
        />
      </div>
    </div>
  )
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, w: number, h: number) {
  if (s.points.length === 0) return
  ctx.save()
  if (s.tool === 'highlighter') {
    ctx.globalAlpha = 0.32
    ctx.lineWidth = s.width * 5
    ctx.lineCap = 'butt'
  } else if (s.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = s.width * 5
    ctx.lineCap = 'round'
  } else {
    ctx.lineWidth = s.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
  ctx.strokeStyle = s.color
  ctx.beginPath()
  const first = s.points[0]
  ctx.moveTo(first.x * w, first.y * h)
  for (let i = 1; i < s.points.length; i++) {
    const p = s.points[i]
    ctx.lineTo(p.x * w, p.y * h)
  }
  ctx.stroke()
  ctx.restore()
}

function Toolbar(props: {
  enabled: boolean
  setEnabled: (v: boolean) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  tool: Tool
  setTool: (t: Tool) => void
  color: string
  setColor: (c: string) => void
  width: number
  setWidth: (w: number) => void
  clear: () => void
  undo: () => void
  hasStrokes: boolean
}) {
  const {
    enabled,
    setEnabled,
    collapsed,
    setCollapsed,
    tool,
    setTool,
    color,
    setColor,
    width,
    setWidth,
    clear,
    undo,
    hasStrokes,
  } = props

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Show drawing tools"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur rounded-l-2xl shadow-lg border border-r-0 border-slate-200 hover:bg-white transition"
      >
        <Pencil className="w-4 h-4 text-slate-700" />
      </button>
    )
  }

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200 p-2 flex flex-col items-center gap-1.5 max-h-[80vh] overflow-y-auto">
      {/* Master toggle */}
      <button
        onClick={() => setEnabled(!enabled)}
        title={enabled ? 'Drawing on (click to disable)' : 'Drawing off (click to enable)'}
        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
          enabled
            ? 'bg-amber-500 text-white shadow-md'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
        }`}
      >
        {enabled ? 'ON' : 'OFF'}
      </button>

      <div className="h-px w-7 bg-slate-200 my-0.5" />

      {/* Tools */}
      <ToolBtn label="Pen" active={tool === 'pen'} onClick={() => setTool('pen')}>
        <Pencil className="w-4 h-4" />
      </ToolBtn>
      <ToolBtn label="Highlighter" active={tool === 'highlighter'} onClick={() => setTool('highlighter')}>
        <Highlighter className="w-4 h-4" />
      </ToolBtn>
      <ToolBtn label="Eraser" active={tool === 'eraser'} onClick={() => setTool('eraser')}>
        <Eraser className="w-4 h-4" />
      </ToolBtn>

      <div className="h-px w-7 bg-slate-200 my-0.5" />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-1 px-0.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            title={c}
            className={`w-5 h-5 rounded-full transition ${
              color === c ? 'ring-2 ring-offset-1 ring-slate-900 scale-110' : 'hover:scale-110'
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="h-px w-7 bg-slate-200 my-0.5" />

      {/* Widths */}
      {WIDTHS.map((w) => (
        <button
          key={w}
          onClick={() => setWidth(w)}
          title={`Width ${w}`}
          className={`w-9 h-7 rounded-lg flex items-center justify-center transition ${
            width === w ? 'bg-slate-900' : 'hover:bg-slate-100'
          }`}
        >
          <div
            className="rounded-full"
            style={{
              width: w * 1.6,
              height: w * 1.6,
              background: width === w ? '#fff' : '#0f172a',
            }}
          />
        </button>
      ))}

      <div className="h-px w-7 bg-slate-200 my-0.5" />

      {/* Actions */}
      <ToolBtn label="Undo" onClick={undo} disabled={!hasStrokes}>
        <Undo2 className="w-4 h-4" />
      </ToolBtn>
      <ToolBtn label="Clear all" onClick={clear} disabled={!hasStrokes} danger>
        <Trash2 className="w-4 h-4" />
      </ToolBtn>

      <div className="h-px w-7 bg-slate-200 my-0.5" />

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(true)}
        title="Hide toolbar"
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function ToolBtn({
  children,
  label,
  active,
  onClick,
  disabled,
  danger,
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
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : active
          ? 'bg-slate-900 text-white shadow'
          : danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
