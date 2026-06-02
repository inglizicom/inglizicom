'use client'

import { useRef, useState } from 'react'
import { X, Upload, CheckCircle2, AlertTriangle, Loader2, FileText } from 'lucide-react'
import { importLeadsFromRows } from '@/lib/leads-db'

interface ParsedRow {
  fullName: string
  phone:    string | undefined
  source:   string | undefined
  planId:   string | undefined
  amountMad?: number
  level:    string | undefined
  city:     string | undefined
  _error?:  string
}

const COLUMN_ALIASES: Record<string, keyof ParsedRow> = {
  name: 'fullName', full_name: 'fullName', fullname: 'fullName', nom: 'fullName',
  phone: 'phone', tel: 'phone', téléphone: 'phone', telephone: 'phone',
  source: 'source', origine: 'source',
  plan: 'planId', plan_id: 'planId', forfait: 'planId',
  amount: 'amountMad', amount_mad: 'amountMad', montant: 'amountMad', prix: 'amountMad',
  level: 'level', niveau: 'level',
  city: 'city', ville: 'city',
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return { headers: [], rows: [] }
  const sep  = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
  const rows = lines.slice(1).map(line => {
    const cells = line.split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = cells[i] ?? '' })
    return row
  })
  return { headers, rows }
}

function mapRow(raw: Record<string, string>): ParsedRow {
  const mapped: Partial<ParsedRow> = {}
  for (const [col, val] of Object.entries(raw)) {
    const field = COLUMN_ALIASES[col]
    if (field && val) (mapped as any)[field] = field === 'amountMad' ? Number(val) || undefined : val
  }
  const row: ParsedRow = {
    fullName:  mapped.fullName ?? '',
    phone:     mapped.phone,
    source:    mapped.source,
    planId:    mapped.planId ?? 'basic',
    amountMad: mapped.amountMad,
    level:     mapped.level,
    city:      mapped.city,
  }
  if (!row.fullName.trim()) row._error = 'Missing name'
  return row
}

type Step = 'upload' | 'preview' | 'done'

export default function LeadImportModal({
  onClose, onImported,
}: { onClose: () => void; onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step,      setStep]      = useState<Step>('upload')
  const [rows,      setRows]      = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [imported,  setImported]  = useState(0)
  const [error,     setError]     = useState<string | null>(null)

  function handleFile(f: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      try {
        const { rows: rawRows } = parseCSV(text)
        if (!rawRows.length) { setError('CSV appears empty — no data rows found.'); return }
        const parsed = rawRows.map(mapRow)
        setRows(parsed)
        setStep('preview')
      } catch { setError('Could not parse the CSV. Make sure it is comma or semicolon separated.') }
    }
    reader.readAsText(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleImport() {
    const valid = rows.filter(r => !r._error)
    if (!valid.length) return
    setImporting(true); setError(null)
    try {
      const validMapped = valid.map(r => ({ ...r, planId: r.planId ?? 'basic' }))
    const count = await importLeadsFromRows(validMapped)
      setImported(count)
      setStep('done')
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed') }
    finally { setImporting(false) }
  }

  const valid   = rows.filter(r => !r._error)
  const invalid = rows.filter(r => !!r._error)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Import leads from CSV</h2>
            <p className="text-xs text-gray-400 mt-0.5">Columns: name, phone, source, plan, amount, level, city</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1 — Upload */}
          {step === 'upload' && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Upload size={28} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-gray-700">Drop a CSV file here, or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Supports .csv (comma or semicolon separated)</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* Template hint */}
              <div className="mt-5 bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Expected CSV format</p>
                <code className="text-[11px] text-gray-700 block font-mono whitespace-nowrap overflow-x-auto">
                  name,phone,source,plan,amount,level,city<br />
                  Hassan Benjelloun,+212612345678,instagram,basic,750,A1,Casablanca<br />
                  Fatima Zahra,,tiktok,pro,1400,,Rabat
                </code>
              </div>
            </div>
          )}

          {/* Step 2 — Preview */}
          {step === 'preview' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 size={13} /> {valid.length} valid
                </div>
                {invalid.length > 0 && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                    <AlertTriangle size={13} /> {invalid.length} skipped (no name)
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        {['Name', 'Phone', 'Source', 'Plan', 'Amount', 'Level', 'City'].map(h => (
                          <th key={h} className="text-left px-3 py-2 font-bold uppercase tracking-wide text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.slice(0, 50).map((r, i) => (
                        <tr key={i} className={r._error ? 'bg-red-50 opacity-60' : ''}>
                          <td className="px-3 py-2 font-semibold text-gray-900">{r.fullName || <span className="text-red-500 italic">missing</span>}</td>
                          <td className="px-3 py-2 text-gray-600 font-mono">{r.phone ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{r.source ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{r.planId ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-600 tabular-nums">{r.amountMad ? `${r.amountMad} MAD` : '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{r.level ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{r.city ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 50 && (
                  <div className="px-3 py-2 text-[11px] text-gray-400 bg-gray-50 border-t border-gray-100">
                    Showing first 50 of {rows.length} rows
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 'done' && (
            <div className="py-8 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
              <h3 className="font-black text-gray-900 text-lg">Import complete</h3>
              <p className="text-gray-500 text-sm mt-1">{imported} lead{imported !== 1 ? 's' : ''} added to your pipeline.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          {step === 'upload' && (
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800">Cancel</button>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => { setStep('upload'); setRows([]) }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Back</button>
              <button onClick={handleImport} disabled={importing || !valid.length}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-yellow-400 font-bold text-sm hover:bg-gray-900 transition-colors disabled:opacity-40">
                {importing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                Import {valid.length} lead{valid.length !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {step === 'done' && (
            <button onClick={onImported}
              className="ml-auto px-5 py-2.5 rounded-xl bg-black text-yellow-400 font-bold text-sm hover:bg-gray-900 transition-colors">
              Done →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
