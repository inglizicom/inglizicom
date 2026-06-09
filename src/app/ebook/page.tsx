import { sentenceLessons, type SentenceLesson } from '@/data/sentence-builder'
import { grammarLessons } from '@/data/private-lessons/grammar'
import { read01 } from '@/data/private-lessons/reading/read01'
import { level01Units } from '@/data/private-lessons/level01'
import { businessUnits } from '@/data/private-lessons/business'
import { units } from '@/data/private-lessons'
import type { GrammarLesson, GrammarSection } from '@/data/private-lessons/grammar/types'
import type { Unit, Section } from '@/data/private-lessons/types'

const CREDIT = { name: 'Hamza El Qasraoui', nameAr: 'الأستاذ حمزة القصراوي', phone: '0764189311', site: 'inglizi.com' }

// ── Helpers ────────────────────────────────────────────────
const lightenColor = (hex: string): string => {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.12)`
}
const styleFor = (color: string) => ({
  '--ls-color': color,
  '--ls-soft': lightenColor(color),
} as React.CSSProperties)

const CreditStrip = () => (
  <div className="eb-credit-strip">
    <span><b>Inglizi.com</b></span>
    <span>·</span>
    <span dir="rtl">{CREDIT.nameAr}</span>
    <span>·</span>
    <span>{CREDIT.name}</span>
    <span>·</span>
    <span><i>WhatsApp {CREDIT.phone}</i></span>
  </div>
)

// ── Sentence Builder lesson card ─────────────────────────
function SBLessonCard({ lesson }: { lesson: SentenceLesson }) {
  return (
    <article className="eb-lesson" style={styleFor(lesson.themeColor)}>
      <header className="eb-lesson-head">
        <span className="eb-lesson-emoji">{lesson.emoji}</span>
        <div style={{ flex: 1 }}>
          <span className="eb-lesson-num">Lesson {String(lesson.id).padStart(2, '0')} · Sentence Builder</span>
          <h2 className="eb-lesson-title-en">{lesson.title.en}</h2>
          <p className="eb-lesson-title-ar">{lesson.title.ar}</p>
        </div>
      </header>

      <div className="eb-pattern">
        <span className="eb-pattern-label">Pattern</span>{lesson.pattern}
      </div>

      <ul className="eb-examples">
        {lesson.examples.map((ex, i) => <li key={i}>{ex}</li>)}
      </ul>

      <div className="eb-section-block">
        <div className="eb-block-title">1. Subject <span className="eb-block-title-ar">الفاعل</span></div>
        <div className="eb-chip-grid">
          {lesson.subjects.chips.map((c, i) => (
            <div className="eb-chip" key={i}><span className="eb-chip-en">{c.en}</span><span className="eb-chip-ar">{c.ar}</span></div>
          ))}
        </div>
      </div>

      <div className="eb-section-block">
        <div className="eb-block-title">2. {lesson.middle.title} <span className="eb-block-title-ar">{lesson.middle.titleAr}</span></div>
        {lesson.middle.groups.map((g, gi) => (
          <div className="eb-sub-group" key={gi}>
            {g.label && <div className="eb-sub-label">{g.label}{g.labelAr ? <> · <span className="eb-sub-label-ar">{g.labelAr}</span></> : null}</div>}
            <div className="eb-chip-grid">
              {g.chips.map((c, i) => (
                <div className="eb-chip" key={i}><span className="eb-chip-en">{c.en}</span><span className="eb-chip-ar">{c.ar}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {lesson.context && (
        <div className="eb-section-block">
          <div className="eb-block-title">3. {lesson.context.label || 'Context'} <span className="eb-block-title-ar">{lesson.context.labelAr || ''}</span></div>
          <div className="eb-chip-grid">
            {lesson.context.chips.map((c, i) => (
              <div className="eb-chip" key={i}><span className="eb-chip-en">{c.en}</span><span className="eb-chip-ar">{c.ar}</span></div>
            ))}
          </div>
        </div>
      )}

      <div className="eb-section-block">
        <div className="eb-block-title">4. {lesson.action.title} <span className="eb-block-title-ar">{lesson.action.titleAr}</span></div>
        {lesson.action.groups.map((g, gi) => (
          <div className="eb-sub-group" key={gi}>
            {g.label && <div className="eb-sub-label">{g.label}{g.labelAr ? <> · <span className="eb-sub-label-ar">{g.labelAr}</span></> : null}</div>}
            <div className="eb-chip-grid">
              {g.chips.map((c, i) => (
                <div className="eb-chip" key={i}><span className="eb-chip-en">{c.en}</span><span className="eb-chip-ar">{c.ar}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="eb-rules">
        <div className="eb-rules-title">Rules · قواعد</div>
        <ul>{lesson.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      <CreditStrip />
    </article>
  )
}

// ── Grammar lesson card ───────────────────────────────────
function GrammarSectionRender({ section, color }: { section: GrammarSection; color: string }) {
  switch (section.kind) {
    case 'cover':
      return null // we already render our own header
    case 'hook':
      return (
        <div className="eb-section-block">
          <div className="eb-hook">
            <div className="eb-hook-title">{section.titleAr}</div>
            <div>{section.bodyAr}</div>
            <div className="eb-hook-eg">{section.englishEx} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '9pt' }} dir="rtl">— {section.arabicEx}</span></div>
            {section.noteAr && <p style={{ marginTop: 8, fontSize: '9pt', color: '#92400e' }} dir="rtl">📌 {section.noteAr}</p>}
          </div>
        </div>
      )
    case 'patternTable':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          <table className="eb-pattern-table">
            <thead>
              <tr><th>Pronoun</th><th>الضمير</th><th>Verb</th><th>Example</th><th>الترجمة</th></tr>
            </thead>
            <tbody>
              {section.rows.map((r, i) => (
                <tr key={i}>
                  <td><b>{r.pronoun}</b></td>
                  <td dir="rtl">{r.pronounAr}</td>
                  <td className="verb">{r.verb}</td>
                  <td className="eg-en">{r.exampleEn}</td>
                  <td className="eg-ar" dir="rtl">{r.exampleAr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'sentences':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          {section.items.map((s, i) => (
            <div className="eb-grammar-sentence" key={i}>
              <span className="eb-grammar-sentence-tokens">{s.emoji ? <span style={{ marginRight: 6 }}>{s.emoji}</span> : null}{s.tokens.map((t) => t.text).join(' ')}</span>
              <span className="eb-grammar-sentence-ar" dir="rtl">{s.ar}</span>
            </div>
          ))}
        </div>
      )
    case 'negation':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          {section.bodyAr && <p dir="rtl" style={{ fontSize: '10pt', color: '#475569', marginBottom: 6 }}>{section.bodyAr}</p>}
          {section.items.map((s, i) => (
            <div className="eb-grammar-sentence" key={i}>
              <span className="eb-grammar-sentence-tokens">{s.emoji ? <span style={{ marginRight: 6 }}>{s.emoji}</span> : null}{s.tokens.map((t) => t.text).join(' ')}</span>
              <span className="eb-grammar-sentence-ar" dir="rtl">{s.ar}</span>
            </div>
          ))}
        </div>
      )
    case 'questions':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          {section.bodyAr && <p dir="rtl" style={{ fontSize: '10pt', color: '#475569', marginBottom: 6 }}>{section.bodyAr}</p>}
          {section.items.map((s, i) => (
            <div className="eb-grammar-sentence" key={i}>
              <span className="eb-grammar-sentence-tokens">{s.q.map((t) => t.text).join(' ')}</span>
              <span className="eb-grammar-sentence-ar" dir="rtl">{s.ar}</span>
            </div>
          ))}
        </div>
      )
    case 'notes':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          {section.items.map((it, i) => (
            <div key={i} style={{ padding: '6px 10px', margin: '4px 0', background: it.type === 'mistake' ? '#fee2e2' : it.type === 'tip' ? '#fef9c3' : '#dcfce7', borderRadius: 6, fontSize: '9pt' }}>
              <p dir="rtl" style={{ marginBottom: 4 }}>{it.type === 'mistake' ? '❌' : it.type === 'tip' ? '💡' : '✅'} {it.ar}</p>
              {it.wrong && <div style={{ fontFamily: 'DM Sans, sans-serif' }}><span style={{ color: '#b91c1c', textDecoration: 'line-through' }}>{it.wrong}</span>{it.right && <> → <span style={{ color: '#15803d', fontWeight: 700 }}>{it.right}</span></>}</div>}
            </div>
          ))}
        </div>
      )
    case 'dialogue':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          <div className="eb-dialog">
            {section.lines.map((ln, i) => (
              <div className="eb-dialog-line" key={i}>
                <span className="eb-dialog-speaker">{ln.speaker}:</span>
                <span className="eb-dialog-text">{ln.text}{ln.ar && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8, fontSize: '8pt' }} dir="rtl">— {ln.ar}</span>}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'practice':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          {section.exercises.map((ex, i) => (
            <div className="eb-quiz-q" key={i}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#0f172a', fontSize: '10pt' }}>
                {ex.before} <span style={{ borderBottom: `2px solid ${color}`, padding: '0 24px', color: color, fontWeight: 800 }}>{ex.answer}</span> {ex.after || ''}
              </p>
              <p className="eb-quiz-prompt" style={{ marginTop: 4 }}>{ex.ar}</p>
              <div className="eb-quiz-choices">
                {ex.choices.map((ch, ci) => (
                  <span key={ci} className={'eb-quiz-choice' + (ch === ex.answer ? ' correct' : '')}>{ch}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    case 'quiz':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          {section.questions.map((qq, i) => (
            <div className="eb-quiz-q" key={i}>
              <p className="eb-quiz-prompt">{qq.promptAr}</p>
              {qq.prompt && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10pt', marginBottom: 4 }}>{qq.prompt}</p>}
              <div className="eb-quiz-choices">
                {qq.choices.map((ch, ci) => (
                  <span key={ci} className={'eb-quiz-choice' + (ci === qq.correct ? ' correct' : '')}>{ch}</span>
                ))}
              </div>
              {qq.explanationAr && <p style={{ marginTop: 6, fontSize: '8pt', color: '#92400e' }} dir="rtl">💡 {qq.explanationAr}</p>}
            </div>
          ))}
        </div>
      )
    case 'summary':
      return (
        <div className="eb-section-block">
          <div className="eb-block-title" dir="rtl" style={{ textAlign: 'right' }}>{section.titleAr}</div>
          <div className="eb-rules">
            <ul>
              {section.rules.map((r, i) => (
                <li key={i}>
                  <b dir="rtl">{r.ar}</b> · {r.en}
                  {r.example && <div style={{ fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', color: '#64748b', marginTop: 2 }}>e.g. {r.example}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    default:
      return null
  }
}

function GrammarLessonCard({ lesson }: { lesson: GrammarLesson }) {
  const color = '#d97706'
  return (
    <article className="eb-lesson" style={styleFor(color)}>
      <header className="eb-lesson-head">
        <span className="eb-lesson-emoji">{lesson.emoji}</span>
        <div style={{ flex: 1 }}>
          <span className="eb-lesson-num">Grammar · {lesson.level || 'A0'}</span>
          <h2 className="eb-lesson-title-en">{lesson.title.en}</h2>
          <p className="eb-lesson-title-ar">{lesson.title.ar}</p>
        </div>
      </header>
      {lesson.description && <p style={{ color: '#64748b', fontSize: '10pt', marginBottom: 10 }} dir="rtl">{lesson.description.ar}</p>}
      {lesson.sections.map((s, i) => <GrammarSectionRender key={i} section={s} color={color} />)}
      <CreditStrip />
    </article>
  )
}

// ── Reading text card ─────────────────────────────────────
function ReadingCard({ unit }: { unit: Unit }) {
  const color = '#2563eb'
  const reading = unit.sections.find((s): s is Extract<Section, { kind: 'reading' }> => s.kind === 'reading')
  if (!reading) return null
  return (
    <article className="eb-lesson" style={styleFor(color)}>
      <header className="eb-lesson-head">
        <span className="eb-lesson-emoji">{unit.emoji}</span>
        <div style={{ flex: 1 }}>
          <span className="eb-lesson-num">Reading · {unit.level}</span>
          <h2 className="eb-lesson-title-en">{unit.title.en}</h2>
          <p className="eb-lesson-title-ar">{unit.title.ar}</p>
        </div>
      </header>
      <div className="eb-reading-body">
        {reading.text.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {reading.textAr && (
        <div className="eb-reading-ar">
          {reading.textAr.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
      {reading.vocab && reading.vocab.length > 0 && (
        <div className="eb-section-block" style={{ marginTop: 14 }}>
          <div className="eb-block-title">Key vocabulary <span className="eb-block-title-ar">المفردات الأساسية</span></div>
          <div className="eb-vocab-grid">
            {reading.vocab.slice(0, 20).map((v, i) => (
              <div className="eb-vocab-row" key={i}>
                <span className="eb-vocab-en">{v.word}</span>
                <span className="eb-vocab-ar">{v.ar}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <CreditStrip />
    </article>
  )
}

// ── Real Life English / Level 01 unit summary card ───────
function UnitSummaryCard({ unit, label, color }: { unit: Unit; label: string; color: string }) {
  const vocab = unit.sections
    .flatMap((s) => {
      if (s.kind === 'vocab') return s.items
      if (s.kind === 'vocabCategories') return s.categories.flatMap((c) => c.items)
      return []
    })
    .slice(0, 24)
  const dialog = unit.sections.find((s): s is Extract<Section, { kind: 'conversation' }> => s.kind === 'conversation')
  return (
    <article className="eb-lesson" style={styleFor(color)}>
      <header className="eb-lesson-head">
        <span className="eb-lesson-emoji">{unit.emoji}</span>
        <div style={{ flex: 1 }}>
          <span className="eb-lesson-num">{label} · {unit.level}</span>
          <h2 className="eb-lesson-title-en">{unit.title.en}</h2>
          <p className="eb-lesson-title-ar">{unit.title.ar}</p>
        </div>
      </header>

      {vocab.length > 0 && (
        <div className="eb-section-block">
          <div className="eb-block-title">Vocabulary <span className="eb-block-title-ar">المفردات</span></div>
          <div className="eb-unit-vocab">
            {vocab.map((v, i) => (
              <div className="eb-unit-vocab-item" key={i}>
                <div className="eb-unit-vocab-en">{v.en}</div>
                <div className="eb-unit-vocab-ar">{v.ar}</div>
                {v.examples && v.examples[0] && <div className="eb-unit-vocab-eg">e.g. {v.examples[0]}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {dialog && (
        <div className="eb-section-block">
          <div className="eb-block-title">Conversation: {dialog.title} <span className="eb-block-title-ar">حوار</span></div>
          <div className="eb-dialog">
            {dialog.lines.slice(0, 16).map((ln, i) => (
              <div className="eb-dialog-line" key={i}>
                <span className="eb-dialog-speaker">{ln.speaker}:</span>
                <span className="eb-dialog-text">{ln.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreditStrip />
    </article>
  )
}

// ── Section divider ───────────────────────────────────────
function SectionDivider({ num, emoji, en, ar, meta, bg, color }: { num: string; emoji: string; en: string; ar: string; meta: string; bg: string; color: string }) {
  return (
    <div className="eb-divider" style={{ ['--div-bg' as string]: bg, ['--div-color' as string]: color } as React.CSSProperties}>
      <div className="eb-div-emoji">{emoji}</div>
      <div className="eb-div-num">{num}</div>
      <h2 className="eb-div-title-en">{en}</h2>
      <p className="eb-div-title-ar">{ar}</p>
      <p className="eb-div-meta">{meta}</p>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────
export default function EbookPage() {
  const readingUnits: Unit[] = [read01] // expand with more reading units when available

  return (
    <main className="eb">
      <aside className="eb-toolbar">
        <b>📕 جاهز للحفظ كـ PDF</b>
        <span>اضغط <kbd>Cmd</kbd>+<kbd>P</kbd> ثم اختر <kbd>Save as PDF</kbd></span>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>هوامش: بلا · خلفية: مفعّلة</span>
      </aside>

      {/* ── COVER ── */}
      <section className="eb-cover">
        <div className="eb-cover-inner">
          <div>
            <div className="eb-brand">Inglizi.com</div>
            <div className="eb-cover-sub" dir="rtl">أكاديمية إنجليزي دوت كوم</div>
          </div>
          <div>
            <span className="eb-cover-tag">Private Edition · للأستاذ والطالب</span>
            <h1 className="eb-cover-title-ar">دورة الإنجليزية الشاملة</h1>
            <p className="eb-cover-title-en">The Complete English Course<br/>From Zero to Conversation</p>
            <div className="eb-cover-divider"></div>
            <p style={{ marginTop: 14, fontSize: '11pt', color: '#475569' }} dir="rtl">
              <b>{sentenceLessons.length}</b> درس بناء جمل · <b>{grammarLessons.length}</b> درس قواعد · <b>{readingUnits.length}</b> نص قراءة ·
              <b> {level01Units.length}</b> درس مستوى أول · <b>{units.length}</b> وحدة محادثة · <b>{businessUnits.length}</b> وحدة إنجليزية مهنية
            </p>
          </div>
        </div>
        <div className="eb-cover-footer">
          <div className="eb-cover-author" dir="rtl">{CREDIT.nameAr}</div>
          <div className="eb-cover-author-en">{CREDIT.name} · English Teacher & Founder</div>
          <div className="eb-cover-contact">
            <span>🌍 {CREDIT.site}</span>
            <span>📱 WhatsApp <b>{CREDIT.phone}</b></span>
          </div>
        </div>
      </section>

      {/* ── TOC ── */}
      <section className="eb-toc">
        <h2 className="eb-toc-title">Table of Contents</h2>
        <p className="eb-toc-title-ar">جدول المحتويات</p>

        <div className="eb-toc-section" style={{ ['--toc-color' as string]: '#e11d48' } as React.CSSProperties}>
          <span className="eb-toc-section-num">PART 01</span>
          <span className="eb-toc-section-title-en">Sentence Builder</span>
          <span className="eb-toc-section-title-ar">بناء الجمل خطوة بخطوة</span>
        </div>
        <ul className="eb-toc-list">
          {sentenceLessons.map((l) => (
            <li className="eb-toc-item" key={l.id}>
              <span className="eb-toc-item-emoji">{l.emoji}</span>
              <span className="eb-toc-item-en">{l.title.en}</span>
              <span className="eb-toc-item-ar">{l.title.ar}</span>
            </li>
          ))}
        </ul>

        <div className="eb-toc-section" style={{ ['--toc-color' as string]: '#d97706' } as React.CSSProperties}>
          <span className="eb-toc-section-num">PART 02</span>
          <span className="eb-toc-section-title-en">Grammar</span>
          <span className="eb-toc-section-title-ar">القواعد الإنجليزية</span>
        </div>
        <ul className="eb-toc-list">
          {grammarLessons.slice(0, 30).map((l) => (
            <li className="eb-toc-item" key={l.id}>
              <span className="eb-toc-item-emoji">{l.emoji}</span>
              <span className="eb-toc-item-en">{l.title.en}</span>
              <span className="eb-toc-item-ar">{l.title.ar}</span>
            </li>
          ))}
        </ul>

        <div className="eb-toc-section" style={{ ['--toc-color' as string]: '#2563eb' } as React.CSSProperties}>
          <span className="eb-toc-section-num">PART 03</span>
          <span className="eb-toc-section-title-en">Reading Texts</span>
          <span className="eb-toc-section-title-ar">نصوص القراءة</span>
        </div>
        <ul className="eb-toc-list">
          {readingUnits.map((u) => (
            <li className="eb-toc-item" key={u.id}>
              <span className="eb-toc-item-emoji">{u.emoji}</span>
              <span className="eb-toc-item-en">{u.title.en}</span>
              <span className="eb-toc-item-ar">{u.title.ar}</span>
            </li>
          ))}
        </ul>

        <div className="eb-toc-section" style={{ ['--toc-color' as string]: '#059669' } as React.CSSProperties}>
          <span className="eb-toc-section-num">PART 04</span>
          <span className="eb-toc-section-title-en">Level 01 — A0/A1</span>
          <span className="eb-toc-section-title-ar">المستوى الأول</span>
        </div>
        <ul className="eb-toc-list">
          {level01Units.map((u) => (
            <li className="eb-toc-item" key={u.id}>
              <span className="eb-toc-item-emoji">{u.emoji}</span>
              <span className="eb-toc-item-en">{u.title.en}</span>
              <span className="eb-toc-item-ar">{u.title.ar}</span>
            </li>
          ))}
        </ul>

        <div className="eb-toc-section" style={{ ['--toc-color' as string]: '#7c3aed' } as React.CSSProperties}>
          <span className="eb-toc-section-num">PART 05</span>
          <span className="eb-toc-section-title-en">Real Life English 1</span>
          <span className="eb-toc-section-title-ar">المواقف الحياتية</span>
        </div>
        <ul className="eb-toc-list">
          {units.map((u) => (
            <li className="eb-toc-item" key={u.id}>
              <span className="eb-toc-item-emoji">{u.emoji}</span>
              <span className="eb-toc-item-en">{u.title.en}</span>
              <span className="eb-toc-item-ar">{u.title.ar}</span>
            </li>
          ))}
        </ul>

        <div className="eb-toc-section" style={{ ['--toc-color' as string]: '#b45309' } as React.CSSProperties}>
          <span className="eb-toc-section-num">PART 06</span>
          <span className="eb-toc-section-title-en">Business English</span>
          <span className="eb-toc-section-title-ar">الإنجليزية المهنية</span>
        </div>
        <ul className="eb-toc-list">
          {businessUnits.map((u) => (
            <li className="eb-toc-item" key={u.id}>
              <span className="eb-toc-item-emoji">{u.emoji}</span>
              <span className="eb-toc-item-en">{u.title.en}</span>
              <span className="eb-toc-item-ar">{u.title.ar}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── PART 01: SENTENCE BUILDER ── */}
      <SectionDivider num="01" emoji="🧩" en="Sentence Builder" ar="بناء الجمل" meta={`${sentenceLessons.length} interactive lessons`} bg="#ffe4e6" color="#e11d48" />
      {sentenceLessons.map((l) => <SBLessonCard key={l.id} lesson={l} />)}

      {/* ── PART 02: GRAMMAR ── */}
      <SectionDivider num="02" emoji="⚡" en="Grammar" ar="القواعد" meta={`${grammarLessons.length} grammar lessons`} bg="#fef3c7" color="#d97706" />
      {grammarLessons.map((l) => <GrammarLessonCard key={l.id} lesson={l} />)}

      {/* ── PART 03: READING ── */}
      <SectionDivider num="03" emoji="📖" en="Reading Texts" ar="نصوص القراءة" meta={`${readingUnits.length} reading texts`} bg="#dbeafe" color="#2563eb" />
      {readingUnits.map((u) => <ReadingCard key={u.id} unit={u} />)}

      {/* ── PART 04: LEVEL 01 ── */}
      <SectionDivider num="04" emoji="📗" en="Level 01 — A0/A1" ar="المستوى الأول" meta={`${level01Units.length} foundational lessons`} bg="#d1fae5" color="#059669" />
      {level01Units.map((u) => <UnitSummaryCard key={u.id} unit={u} label="Level 01" color="#059669" />)}

      {/* ── PART 05: REAL LIFE ENGLISH ── */}
      <SectionDivider num="05" emoji="🏙️" en="Real Life English 1" ar="المواقف الحياتية" meta={`${units.length} life-situation units`} bg="#ede9fe" color="#7c3aed" />
      {units.map((u) => <UnitSummaryCard key={u.id} unit={u} label="Real Life English" color="#7c3aed" />)}

      {/* ── PART 06: BUSINESS ENGLISH ── */}
      <SectionDivider num="06" emoji="💼" en="Business English" ar="الإنجليزية المهنية" meta={`${businessUnits.length} professional units`} bg="#fef3c7" color="#b45309" />
      {businessUnits.map((u) => <UnitSummaryCard key={u.id} unit={u} label="Business English" color="#b45309" />)}

      {/* ── Closing ── */}
      <section className="eb-cover" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', color: '#f1f5f9' }}>
        <div className="eb-cover-inner" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '52pt' }}>🎓</div>
          <h2 style={{ color: '#fbbf24', fontFamily: 'DM Sans, sans-serif', fontSize: '32pt', fontWeight: 900 }}>Thank You</h2>
          <p dir="rtl" style={{ fontSize: '20pt', color: '#cbd5e1', fontWeight: 700 }}>شكراً لاختياركم أكاديمية إنجليزي.كوم</p>
          <p style={{ maxWidth: 560, fontSize: '11pt', color: '#94a3b8', marginTop: 14 }} dir="rtl">
            هذا الكتاب نتاج سنوات من تعليم الإنجليزية للناطقين بالعربية.
            تابعنا على inglizi.com للحصول على آخر الدروس والدورات.
          </p>
        </div>
        <div className="eb-cover-footer" style={{ borderTopColor: '#334155' }}>
          <div className="eb-cover-author" dir="rtl" style={{ color: '#fbbf24' }}>{CREDIT.nameAr}</div>
          <div className="eb-cover-author-en" style={{ color: '#cbd5e1' }}>{CREDIT.name}</div>
          <div className="eb-cover-contact" style={{ color: '#cbd5e1' }}>
            <span>🌍 {CREDIT.site}</span>
            <span>📱 WhatsApp <b style={{ color: '#34d399' }}>{CREDIT.phone}</b></span>
          </div>
        </div>
      </section>
    </main>
  )
}
