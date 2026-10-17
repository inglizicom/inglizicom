'use client'

import type { ReactNode } from 'react'
import type { Note, Screen, ScreenItem } from '@/data/viiza-book'
import { Ar, C, EN, HAND, Ico, MONO_FACE } from './_kit'

/**
 * "In real life": the screens, papers and signs a traveller meets, drawn
 * (not screenshots, so no brand's interface is copied and the pages never go
 * out of date when an app changes its look). Each has numbered markers, and
 * the notes beside it explain each number in English and Arabic.
 */

/** A numbered marker. */
export function Dot({ n, size = 20 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.55, background: C.red, boxShadow: '0 0 0 2px #fff', fontFamily: EN }}>{n}</span>
  )
}

function Notes({ notes, cols = 1, size = 12.5 }: { notes: Note[]; cols?: number; size?: number }) {
  return (
    <div className="grid gap-x-5 gap-y-2" dir="ltr" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {notes.map(([n, en, ar]) => (
        <div key={n} className="flex items-start gap-2" dir="ltr">
          <Dot n={n} />
          <div className="min-w-0 leading-snug">
            <div className="text-[13px] font-extrabold">{en}</div>
            <Ar className="text-left font-semibold" style={{ fontSize: size, color: C.grey }}>{ar}</Ar>
          </div>
        </div>
      ))}
    </div>
  )
}

/** A marker on the edge of an element. */
const Mark = ({ n }: { n?: number }) => (n ? <span className="absolute -right-[13px] top-1/2 -translate-y-1/2"><Dot n={n} size={19} /></span> : null)

function Item({ it }: { it: ScreenItem }) {
  switch (it.t) {
    case 'field': return (
      <div className="relative rounded-lg border px-2.5 py-1.5" style={{ borderColor: '#D9DCE5' }}>
        <div className="text-[8.5px] font-bold uppercase tracking-[0.06em]" style={{ color: C.grey }}>{it.label}</div>
        <div className="text-[12px] font-extrabold leading-tight">{it.value}</div>
        <Mark n={it.n} />
      </div>
    )
    case 'fields': return (
      <div className="relative grid gap-1.5" style={{ gridTemplateColumns: `repeat(${it.items.length}, minmax(0,1fr))` }}>
        {it.items.map(f => (
          <div key={f.label} className="rounded-lg border px-2 py-1.5" style={{ borderColor: '#D9DCE5' }}>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.04em]" style={{ color: C.grey }}>{f.label}</div>
            <div className="text-[11.5px] font-extrabold leading-tight">{f.value}</div>
          </div>
        ))}
        <Mark n={it.n} />
      </div>
    )
    case 'chips': return (
      <div className="relative flex flex-wrap gap-1">
        {it.items.map((c, i) => (
          <span key={c} className="rounded-full border px-2 py-[3px] text-[10px] font-bold"
            style={i === it.on ? { background: C.navy, color: '#fff', borderColor: C.navy } : { borderColor: '#D9DCE5', color: C.ink }}>{c}</span>
        ))}
        <Mark n={it.n} />
      </div>
    )
    case 'card': return (
      <div className="relative rounded-xl border p-2" style={{ borderColor: '#D9DCE5', boxShadow: '0 1px 3px rgba(14,18,64,0.08)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11.5px] font-extrabold leading-tight">{it.title}</div>
            {it.sub && <div className="text-[9.5px] font-semibold leading-snug" style={{ color: C.grey }}>{it.sub}</div>}
          </div>
          {it.right && <div className="shrink-0 text-[12.5px] font-extrabold" style={{ color: C.navy }}>{it.right}</div>}
        </div>
        {it.tag && <span className="mt-1 inline-block rounded px-1.5 py-[1px] text-[8.5px] font-extrabold" style={{ background: C.saffS, color: C.saffD }}>{it.tag}</span>}
        <Mark n={it.n} />
      </div>
    )
    case 'button': return (
      <div className="relative rounded-lg py-2 text-center text-[12px] font-extrabold"
        style={it.ghost ? { border: `1.5px solid ${C.navy}`, color: C.navy } : { background: C.navy, color: '#fff' }}>
        {it.label}<Mark n={it.n} />
      </div>
    )
    case 'text': return <div className={`relative leading-snug ${it.small ? 'text-[9.5px]' : 'text-[11px]'} font-semibold`} style={{ color: it.small ? C.grey : C.ink }}>{it.text}<Mark n={it.n} /></div>
    case 'alert': return (
      <div className="relative flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold leading-snug" style={{ background: C.saffS, color: '#5C4300' }}>
        <Ico name="Info" size={12} color={C.saffD} /> <span>{it.text}</span><Mark n={it.n} />
      </div>
    )
  }
}

/** A phone, a kiosk or a card machine, with the screen's items. */
function Device({ frame = 'phone', app, title, items }: { frame?: 'phone' | 'kiosk' | 'terminal'; app: string; title: string; items: ScreenItem[] }) {
  const screen = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pb-1.5 pt-2" style={{ background: C.navyS }}>
        <div className="leading-tight">
          <div className="text-[8.5px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.grey }}>{app}</div>
          <div className="text-[13px] font-extrabold">{title}</div>
        </div>
        <Ico name={frame === 'terminal' ? 'Nfc' : 'Menu'} size={15} color={C.grey} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-2">{items.map((it, i) => <Item key={i} it={it} />)}</div>
    </div>
  )
  if (frame === 'kiosk') return (
    <div className="w-[300px] rounded-[18px] p-[10px]" style={{ background: '#2B2F45' }}>
      <div className="overflow-visible rounded-[8px] bg-white" style={{ minHeight: 300 }}>{screen}</div>
      <div className="mx-auto mt-2 h-[10px] w-[90px] rounded-full" style={{ background: '#4A4F69' }} />
    </div>
  )
  if (frame === 'terminal') return (
    <div className="w-[230px] rounded-[26px] p-[12px] pb-[14px]" style={{ background: '#33374D' }}>
      <div className="rounded-[10px] bg-white" style={{ minHeight: 230 }}>{screen}</div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5 px-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '✕', '0', '✓'].map(k => (
          <span key={k} className="flex h-[16px] items-center justify-center rounded text-[9px] font-extrabold"
            style={{ background: k === '✕' ? '#C0392B' : k === '✓' ? '#1E8E5A' : '#4A4F69', color: '#fff' }}>{k}</span>
        ))}
      </div>
    </div>
  )
  return (
    <div className="w-[236px] rounded-[34px] p-[8px]" style={{ background: C.navy }}>
      <div className="relative rounded-[27px] bg-white pt-4" style={{ minHeight: 420 }}>
        <span className="absolute left-1/2 top-[6px] h-[5px] w-[54px] -translate-x-1/2 rounded-full" style={{ background: '#D6D9E3' }} />
        <div className="overflow-visible rounded-b-[27px]">{screen}</div>
      </div>
    </div>
  )
}

/** The boarding pass. */
function Pass({ pass: p }: { pass: Extract<Screen, { kind: 'pass' }>['pass'] }) {
  const F = ({ label, value, n, big }: { label: string; value: string; n?: number; big?: boolean }) => (
    <div className="relative leading-tight">
      <div className="text-[8.5px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.grey }}>{label}</div>
      <div className={`${big ? 'text-[22px]' : 'text-[14px]'} font-extrabold`}>{value}</div>
      {n && <span className="absolute -left-[24px] top-[2px]"><Dot n={n} size={18} /></span>}
    </div>
  )
  return (
    <div className="flex overflow-hidden rounded-2xl" dir="ltr" style={{ border: `1.5px solid ${C.navy}`, boxShadow: '0 4px 14px rgba(14,18,64,0.12)' }}>
      <div className="flex-1">
        <div className="flex items-center justify-between px-5 py-2 text-white" style={{ background: C.navy }}>
          <span className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.14em]"><Ico name="Plane" size={15} color={C.saff} /> BOARDING PASS</span>
          <span className="text-[10px] font-bold opacity-80">ECONOMY</span>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-x-4 gap-y-2.5 py-3 pl-9 pr-4">
          <div className="col-span-2"><F label="Passenger name" value={p.name} n={1} /></div>
          <F label="Flight" value={p.flight} n={2} />
          <F label="Date" value={p.date} />
          <div className="col-span-2 flex items-end gap-3">
            <F label={p.from[1]} value={p.from[0]} big n={3} />
            <Ico name="Plane" size={18} color={C.red} />
            <F label={p.to[1]} value={p.to[0]} big />
          </div>
          <F label="Gate" value={p.gate} n={4} />
          <F label="Boarding time" value={p.boarding} n={5} />
          <F label="Seat" value={p.seat} n={6} />
          <F label="Group / Zone" value={p.group} n={7} />
          <F label="Seq." value={p.seq} />
          <div className="flex items-end"><div className="h-[26px] w-full" style={{ background: 'repeating-linear-gradient(90deg,#0E1240 0 2px,transparent 2px 4px,#0E1240 4px 5px,transparent 5px 8px)' }} /></div>
        </div>
      </div>
      <div className="w-[150px] border-l-2 border-dashed px-3 py-2" style={{ borderColor: '#C9CEDB', background: C.cream }}>
        <div className="text-[9px] font-extrabold tracking-[0.12em]" style={{ color: C.grey }}>PASSENGER COPY</div>
        <div className="mt-1 text-[12px] font-extrabold">{p.name}</div>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px] font-bold">
          <span>{p.flight}</span><span>{p.date}</span>
          <span>{p.from[0]} → {p.to[0]}</span><span>Seat {p.seat}</span>
          <span>Gate {p.gate}</span><span>{p.boarding}</span>
        </div>
        <div className="mt-2.5 grid h-[52px] w-[52px] grid-cols-6 gap-[2px]">
          {Array.from({ length: 36 }, (_, i) => <span key={i} style={{ background: (i * 7 + (i % 5)) % 3 ? C.navy : 'transparent' }} />)}
        </div>
      </div>
    </div>
  )
}

/** A departures board. */
function Board({ title, rows }: { title: string; rows: [string, string, string, string, string][] }) {
  const tone = (s: string) => (/cancel/i.test(s) ? '#FF6B6B' : /delay|change|final|closing|last/i.test(s) ? C.saff : /boarding|go to gate/i.test(s) ? '#5BE49B' : '#E7E9F3')
  return (
    <div className="overflow-hidden rounded-xl" dir="ltr" style={{ background: '#101330', fontFamily: MONO_FACE }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: C.saff, color: '#101330' }}>
        <span className="flex items-center gap-2 text-[13px] font-bold tracking-[0.12em]" style={{ fontFamily: EN }}><Ico name="PlaneTakeoff" size={16} /> {title}</span>
        <span className="text-[12px] font-bold">10:42</span>
      </div>
      <div className="grid grid-cols-[62px_1fr_76px_52px_1.1fr] gap-x-3 py-1.5 pl-10 pr-4 text-[9.5px] font-bold tracking-[0.1em]" style={{ color: '#8E95B8', fontFamily: EN }}>
        <span>TIME</span><span>DESTINATION</span><span>FLIGHT</span><span>GATE</span><span>REMARKS</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="relative grid grid-cols-[62px_1fr_76px_52px_1.1fr] gap-x-3 border-t py-[5px] pl-10 pr-4 text-[12.5px] font-bold" style={{ borderColor: '#23284A', color: '#E7E9F3' }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><Dot n={i + 1} size={17} /></span>
          <span style={{ color: C.saff }}>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span><span style={{ color: tone(r[4]) }}>{r[4]}</span>
        </div>
      ))}
    </div>
  )
}

/** Airport-style signs: black, saffron pictogram, white words; the Arabic under each. */
function Signs({ items }: { items: [string, string, string][] }) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {items.map(([icon, en, ar]) => (
        <div key={en} className="overflow-hidden rounded-lg" style={{ border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 px-2.5 py-2" dir="ltr" style={{ background: '#16181F' }}>
            <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded" style={{ background: C.saff }}><Ico name={icon} size={15} color="#16181F" stroke={2.4} /></span>
            <span className="text-[11.5px] font-extrabold leading-tight text-white">{en}</span>
          </div>
          <Ar className="px-2 py-[3px] text-center text-[11.5px] font-bold" style={{ color: C.grey, background: C.cream }}>{ar}</Ar>
        </div>
      ))}
    </div>
  )
}

/** A paper form filled in by hand. */
function Form({ title, fields, printed }: { title: string; fields: Extract<Screen, { kind: 'form' }>['fields']; printed?: boolean }) {
  return (
    <div className="rounded-lg p-4 pb-3" dir="ltr" style={{ background: '#FFFEFA', border: `1.5px solid ${C.navy}`, boxShadow: '4px 4px 0 rgba(14,18,64,0.10)' }}>
      <div className="mb-2.5 flex items-center justify-between border-b-2 pb-1.5" style={{ borderColor: C.navy }}>
        <span className="text-[13px] font-extrabold tracking-[0.16em]">{title}</span>
        {!printed && <span className="text-[9px] font-bold tracking-[0.1em]" style={{ color: C.grey }}>PLEASE WRITE IN CAPITAL LETTERS</span>}
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {fields.map(f => (
          <div key={f.label} className={`relative ${f.wide ? 'col-span-3' : ''}`}>
            <div className="text-[8.5px] font-extrabold uppercase tracking-[0.06em]" style={{ color: C.grey }}>{f.label}</div>
            <div className="border-b leading-none" style={printed ? { borderColor: '#D9DCE5', fontSize: 13.5, fontWeight: 800, paddingTop: 2, paddingBottom: 3 } : { borderColor: '#9AA1B4', fontFamily: HAND, fontSize: 19, color: '#1D3A8A', paddingTop: 2 }}>{f.value}</div>
            {f.n && <span className="absolute -left-[22px] top-[6px]"><Dot n={f.n} size={17} /></span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/** A receipt. */
function Receipt({ title, lines }: { title: string; lines: [string, string, number?][] }) {
  return (
    <div className="w-[270px] px-4 py-3" dir="ltr" style={{ background: '#FFFEFA', fontFamily: MONO_FACE, boxShadow: '0 3px 12px rgba(14,18,64,0.14)', border: `1px solid ${C.line}` }}>
      <div className="text-center text-[12px] font-bold tracking-[0.1em]">{title}</div>
      <div className="my-1.5 border-t border-dashed" style={{ borderColor: '#9AA1B4' }} />
      {lines.map(([item, price, n], i) => (
        item === '---'
          ? <div key={i} className="my-1.5 border-t border-dashed" style={{ borderColor: '#9AA1B4' }} />
          : <div key={i} className="relative flex justify-between py-[2px] text-[11px] font-bold"><span>{item}</span><span>{price}</span>{n && <span className="absolute -left-[30px] top-[1px]"><Dot n={n} size={17} /></span>}</div>
      ))}
    </div>
  )
}

function Table({ rows }: { rows: string[][] }) {
  const [head, ...body] = rows
  return (
    <div className="overflow-hidden rounded-lg" dir="ltr" style={{ border: `1.5px solid ${C.navy}` }}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${head.length}, minmax(0,1fr))`, background: C.navy }}>
        {head.map((h, i) => <Cell key={i} s={h} head />)}
      </div>
      {body.map((r, k) => (
        <div key={k} className="grid border-t" style={{ gridTemplateColumns: `repeat(${head.length}, minmax(0,1fr))`, borderColor: C.line, background: k % 2 ? C.cream : '#fff' }}>
          {r.map((c, i) => <Cell key={i} s={c} first={i === 0} />)}
        </div>
      ))}
    </div>
  )
}
function Cell({ s, head, first }: { s: string; head?: boolean; first?: boolean }) {
  const ar = /[؀-ۿ]/.test(s) && !/[A-Za-z]/.test(s.replace(/[؀-ۿ].*/, ''))
  const style = { color: head ? '#fff' : C.ink }
  // ✓ and ✗ at the start of a cell print as a green tick and a red cross.
  const mark = !head && /^[✓✗]/.test(s) ? s[0] : null
  const rest = mark ? s.slice(1).trim() : s
  return (
    <div className={`flex items-center gap-1.5 px-3 py-[5px] ${head ? 'text-[11px] font-extrabold uppercase tracking-[0.06em]' : first ? 'text-[12.5px] font-extrabold' : 'text-[12.5px] font-semibold'}`}>
      {mark && <Ico name={mark === '✓' ? 'Check' : 'X'} size={15} color={mark === '✓' ? '#1E8E5A' : C.red} stroke={3} />}
      {ar ? <Ar className="flex-1" style={{ ...style, fontSize: head ? 12.5 : 13 }}>{rest}</Ar> : rest && <span style={style}>{rest}</span>}
    </div>
  )
}

/** One screen with its notes, laid out for the space it gets. */
export function ScreenView({ s }: { s: Screen }) {
  let body: ReactNode
  switch (s.kind) {
    case 'app':
      body = (
        <div className="flex items-start gap-8" dir="ltr">
          <div className="shrink-0 pl-1"><Device frame={s.frame} app={s.app} title={s.title} items={s.items} /></div>
          <div className="min-w-0 flex-1 pt-1"><Notes notes={s.notes} /></div>
        </div>
      )
      break
    case 'pass': body = <div className="space-y-3"><Pass pass={s.pass} /><Notes notes={s.notes} cols={2} /></div>; break
    case 'board': body = <div className="space-y-3"><Board title={s.title} rows={s.rows} /><Notes notes={s.notes} cols={2} /></div>; break
    case 'signs': body = <Signs items={s.items} />; break
    case 'form': body = <div className="space-y-3 pl-6"><Form title={s.title} fields={s.fields} printed={s.printed} /><Notes notes={s.notes} cols={2} /></div>; break
    case 'receipt': body = (
      <div className="flex items-start gap-8 pl-8" dir="ltr">
        <Receipt title={s.title} lines={s.lines} />
        <div className="min-w-0 flex-1 pt-1"><Notes notes={s.notes} /></div>
      </div>
    ); break
    case 'table': body = <Table rows={s.rows} />; break
  }
  return body
}
