import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/export/[moduleId]
 * Generates a self-contained, offline .html teaching deck for one unit:
 * all content + images (base64-embedded) inline, brand-styled, with keyboard /
 * click navigation. No server, no link, no internet needed once downloaded —
 * the teacher owns the file. Mirrors the live deck design.
 */

export const maxDuration = 60

const DARK = '#2a1d12'

/* ── content parsers ───────────────────────────────────────── */
function parseVocab(content?: string | null) {
  if (!content) return [] as { en: string; ar: string }[]
  return content.split('\n').filter(l => l.trim().startsWith('|'))
    .map(l => l.split('|').map(s => s.trim()))
    .filter(p => p.length >= 4 && p[1] && p[1] !== 'English' && !/^-+$/.test(p[1]) && p[2])
    .map(p => ({ en: p[1], ar: p[2] }))
}
function parseConvo(reading?: string | null) {
  if (!reading) return [] as { who: string; text: string }[]
  return reading.split('\n').map(l => l.trim()).filter(l => l.startsWith('**'))
    .map(l => { const m = l.match(/^\*\*(.+?):\*\*\s*(.*)$/); return m ? { who: m[1], text: m[2].replace(/\*/g, '') } : null })
    .filter((x): x is { who: string; text: string } => !!x)
}
function parseExpr(content?: string | null) {
  if (!content) return [] as { pattern: string; example: string }[]
  return content.split('\n').map(l => l.trim()).filter(l => l.startsWith('- '))
    .map(l => { const [pat, ex] = l.replace(/^-\s*/, '').split(' — '); return { pattern: (pat || '').replace(/\*\*/g, ''), example: (ex || '').replace(/\*/g, '') } })
}

const VARIATIONS: { test: RegExp; label: string; ar: string; words: string[] }[] = [
  { test: /wake up|get up|go to bed|sleep|breakfast|lunch|dinner|take a shower|get dressed|brush|wash my face|comb|go to work|go to school/i, label: 'Add a time / how often', ar: 'أضف وقتاً', words: ['early', 'late', "at 7 o'clock", 'every morning', 'every day'] },
  { test: /can i have|i want the|i'?ll have|i'?d like|do you have/i, label: 'Change the order', ar: 'غيّر الطلب', words: ['a coffee', 'a tea', 'some water', 'a sandwich', 'a cake'] },
  { test: /how much is/i, label: 'Change the item', ar: 'غيّر العنصر', words: ['the ticket', 'the room', 'this jacket', 'the coffee'] },
  { test: /kilo|grams/i, label: 'Change the amount', ar: 'غيّر الكمية', words: ['half a kilo', 'one kilo', 'two kilos', '250 grams'] },
  { test: /too (big|small|tight|expensive)/i, label: 'Change the word', ar: 'غيّر الكلمة', words: ['big', 'small', 'tight', 'long', 'short'] },
  { test: /in size|in black|in red|the color/i, label: 'Change the size / color', ar: 'غيّر المقاس/اللون', words: ['black', 'white', 'blue', 'size M', 'size L'] },
  { test: /single room|double room|night/i, label: 'Change it', ar: 'غيّر', words: ['a single room', 'a double room', 'two nights', 'three nights'] },
  { test: /round trip|one way|morning flight|evening flight|window seat/i, label: 'Change it', ar: 'غيّر', words: ['one way', 'a round trip', 'a morning flight', 'a window seat'] },
  { test: /train station|bus stop|downtown|taxi/i, label: 'Change the place', ar: 'غيّر المكان', words: ['the airport', 'downtown', 'the market', 'the hotel'] },
  { test: /withdraw|deposit|transfer/i, label: 'Change the amount', ar: 'غيّر المبلغ', words: ['100 dirhams', '500 dirhams', '1000 dirhams'] },
]
function variationsFor(en: string) { for (const v of VARIATIONS) if (v.test.test(en)) return v; return null }

const STOP = new Set(['i','you','we','they','he','she','it','a','an','the','to','do','does','is','are','am','my','your','his','her','our','their','some','please','can','could','would','want','need','have','has','this','that','these','those','of','for','in','on','at','with','and','or','me','one','here','there','how','much','many','what','where','when','who','give','get','put','go','come','will','too','not','no','yes','okay','dont','don'])
const QMAP: Record<string, string> = {
  wake:'person waking up in bed',bed:'person making the bed',shower:'person in bathroom shower',teeth:'person brushing teeth bathroom mirror',face:'person washing face',hair:'person combing hair',dress:'person getting dressed',breakfast:'person eating breakfast',coffee:'cup of coffee',tea:'cup of mint tea',dishes:'person washing dishes kitchen',sweep:'person sweeping floor',floor:'person sweeping the floor',work:'person walking to work',school:'students going to school',tv:'family watching television',mirror:'person looking in mirror',towel:'person holding towel',soap:'washing hands with soap',razor:'man shaving',shave:'man shaving face',toothpaste:'toothbrush toothpaste',floss:'dental floss',deodorant:'person using deodorant',hairdryer:'person drying hair',fridge:'person opening refrigerator',water:'pouring a glass of water',boil:'boiling water in pot',eggs:'frying eggs in a pan',knife:'chopping food with knife',pan:'cooking in a frying pan',rice:'plate of rice and chicken',sandwich:'making a sandwich',blender:'using a kitchen blender',stove:'cooking on the stove',dishwasher:'loading a dishwasher',vegetables:'chopping vegetables',cafe:'people sitting in a cafe',menu:'reading a restaurant menu',cappuccino:'cappuccino cup',croissant:'fresh croissant',window:'person sitting by a window cafe',cake:'slice of cake',bill:'paying the restaurant bill',cash:'paying with cash',waiter:'waiter serving food',table:'set restaurant table',chicken:'grilled chicken plate',onions:'fresh onions',fish:'cooked fish plate',card:'paying with a credit card',apples:'red apples',oranges:'oranges',bananas:'bananas',grapes:'grapes',watermelon:'watermelon',milk:'bottle of milk',cheese:'cheese',butter:'butter',yogurt:'yogurt',bread:'fresh bread bakery',beef:'raw beef meat',pasta:'pasta',sugar:'sugar',flour:'flour baking',potatoes:'potatoes',tomatoes:'fresh tomatoes',carrots:'carrots',lettuce:'lettuce',peppers:'bell peppers',cookies:'cookies',groceries:'person grocery shopping',basket:'shopping basket supermarket',dairy:'dairy aisle supermarket',sale:'sale tag store',bakery:'bakery shop',baguette:'baguette bread',donut:'donuts',muffin:'muffin',clothes:'clothes shop',shoes:'pair of shoes',jacket:'person wearing a jacket',shirt:'folded shirt',jeans:'blue jeans',fitting:'clothing store fitting room',discount:'sale discount tag',laundry:'person doing laundry',iron:'person ironing clothes',blanket:'folded blanket',stain:'stain on a shirt',fold:'folding laundry',clinic:'doctor with a patient',doctor:'doctor examining patient',chest:'doctor checking patient chest',fever:'sick person with thermometer',throat:'person sore throat',stomach:'person with stomach ache',dizzy:'tired dizzy person',pharmacy:'pharmacy',pen:'hand writing with pen',book:'open book',library:'library books',teacher:'teacher in a classroom',class:'students in a classroom',market:'vegetable market stall',garlic:'garlic',cumin:'spices market',olives:'olives',ginger:'ginger root',pot:'cooking pot',spoon:'metal spoons',glass:'drinking glasses',kettle:'tea kettle',trash:'trash bin',broom:'broom',hanger:'clothes hangers',home:'cozy living room',balcony:'home balcony',flight:'airplane flying in sky',round:'airplane travel',passport:'passport in hand',economy:'airplane cabin seats',seat:'airplane window seat',boarding:'boarding pass',airport:'airport terminal',ticket:'airplane ticket',hotel:'hotel room bed',single:'hotel bedroom',wifi:'wifi symbol',key:'hotel key card',reception:'hotel reception desk',elevator:'elevator',bus:'city bus',taxi:'taxi car street',train:'train at the station',station:'train station',traffic:'city traffic cars',change:'coins in hand',bank:'bank counter',money:'cash money',atm:'person using an atm',withdraw:'atm cash withdraw',deposit:'bank deposit money',transfer:'money transfer phone',receipt:'paper receipt',balance:'bank statement',account:'opening a bank account',id:'id card',
}
function photoQuery(en: string): string {
  const low = en.toLowerCase(); const ws = low.replace(/[^a-z\s]/g, ' ').split(/\s+/)
  for (const w of ws) if (QMAP[w]) return QMAP[w]
  for (const k of Object.keys(QMAP)) if (low.includes(k)) return QMAP[k]
  return (ws.filter(w => w && !STOP.has(w)).slice(-2).join(' ') || 'daily life')
}
const EMOJI: Record<string, string> = { wake:'🌅',shower:'🚿',teeth:'🪥',breakfast:'🍳',coffee:'☕',tea:'🍵',fridge:'🧊',knife:'🔪',rice:'🍚',chicken:'🍗',cafe:'☕',menu:'📋',cake:'🍰',fish:'🐟',card:'💳',milk:'🥛',bread:'🍞',basket:'🧺',bakery:'🥖',clothes:'👕',shoes:'👟',jacket:'🧥',laundry:'🧺',doctor:'🩺',pharmacy:'💊',book:'📖',teacher:'🧑‍🏫',market:'🛒',pot:'🍲',home:'🏠',flight:'✈️',ticket:'🎫',passport:'🛂',airport:'🛫',hotel:'🏨',bus:'🚌',taxi:'🚕',train:'🚆',bank:'🏦',money:'💵',atm:'🏧' }
function emojiFor(en: string): string { const low = en.toLowerCase(); for (const k of Object.keys(EMOJI)) if (low.includes(k)) return EMOJI[k]; return '🗣️' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function imageDataUri(en: string, key?: string): Promise<string | null> {
  if (!key) return null
  try {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(photoQuery(en))}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } })
    if (!r.ok) return null
    const d = await r.json()
    const u = d?.results?.[0]?.urls?.small || d?.results?.[0]?.urls?.regular
    if (!u) return null
    const img = await fetch(u); if (!img.ok) return null
    const buf = Buffer.from(await img.arrayBuffer())
    return `data:${img.headers.get('content-type') || 'image/jpeg'};base64,${buf.toString('base64')}`
  } catch { return null }
}

function pic(uri: string | null, en: string) {
  return uri
    ? `<div class="pic"><img src="${uri}" alt="${esc(en)}"></div>`
    : `<div class="pic emoji">${emojiFor(en)}</div>`
}
function box(label: string, labelAr: string, inner: string, opts: { rtl?: boolean; accent?: boolean } = {}) {
  return `<div class="box${opts.accent ? ' accent' : ''}"><div class="lbl"><i></i><span>${label}</span>${labelAr ? `<span class="ar">· ${labelAr}</span>` : ''}</div><div class="${opts.rtl ? 'rtl' : ''}">${inner}</div></div>`
}
function changeBox(v: { label: string; ar: string; words: string[] }) {
  return box(v.label, v.ar, `<div class="chips">${v.words.map(w => `<span class="chip">${esc(w)}</span>`).join('')}</div>`, { accent: true })
}
function highlight(p: string) {
  return esc(p).replace(/\[([^\]]+)\]/g, '<b class="var">[$1]</b>')
}

export async function GET(_req: NextRequest, { params }: { params: { moduleId: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const uKey = process.env.UNSPLASH_ACCESS_KEY
  const db = createClient(url, svc, { auth: { persistSession: false } })

  const { data: mod } = await db.from('lms_modules').select('title, reading_text').eq('id', params.moduleId).single()
  const { data: ls } = await db.from('lms_lessons').select('title, content, lesson_order').eq('module_id', params.moduleId).order('lesson_order')
  if (!mod) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const title: string = mod.title || 'Unit'
  const [unitNo, unitName] = title.includes('—') ? [title.split('—')[0].trim(), title.split('—').slice(1).join('—').trim()] : ['', title]
  const vocab = parseVocab((ls || []).find(l => l.lesson_order === 1)?.content)
  const expr = parseExpr((ls || []).find(l => l.lesson_order === 2)?.content)
  const convo = parseConvo(mod.reading_text)

  // fetch + embed all images in parallel
  const uris = await Promise.all(vocab.map(v => imageDataUri(v.en, uKey)))
  const exprUris = await Promise.all(expr.map(e => imageDataUri(e.example || e.pattern, uKey)))

  const slides: { secEn: string; secAr: string; html: string }[] = []
  slides.push({ secEn: '', secAr: '', html: `<div class="center"><div class="kicker">REALLIFE ENGLISH · <span class="tj">الإنجليزية للمواقف اليومية</span></div><h1>${esc(unitName)}</h1>${unitNo ? `<div class="unitpill">${esc(unitNo)}</div>` : ''}</div>` })
  vocab.forEach((v, i) => {
    const vary = variationsFor(v.en)
    slides.push({ secEn: 'Vocabulary', secAr: 'المفردات', html:
      `<div class="two">${pic(uris[i], v.en)}<div class="col">${box('English', '', `<div class="big">${esc(v.en)}</div>`)}${box('Arabic', 'العربية', `<div class="big ar">${esc(v.ar)}</div>`, { rtl: true })}${vary ? changeBox(vary) : ''}</div></div>` })
  })
  if (convo.length) {
    slides.push({ secEn: 'Conversation', secAr: 'المحادثة', html:
      `<div class="convo">${convo.map((l, i) => `<div class="row ${i % 2 ? 'right' : 'left'}"><span class="av">${esc(l.who.charAt(0))}</span><div class="bub">${esc(l.text)}</div></div>`).join('')}</div>` })
  }
  expr.forEach((e, i) => {
    const vary = variationsFor(e.pattern + ' ' + e.example)
    slides.push({ secEn: 'Expressions', secAr: 'التعابير', html:
      `<div class="two">${pic(exprUris[i], e.example || e.pattern)}<div class="col">${box('Pattern', 'جملة قابلة للتغيير', `<div class="big">${highlight(e.pattern)}</div>`)}${e.example ? box('Example', 'مثال', `<div class="ex">${esc(e.example)}</div>`) : ''}${vary ? changeBox(vary) : ''}</div></div>` })
  })
  slides.push({ secEn: '', secAr: '', html: `<div class="center"><div class="emoji-big">🎉</div><h1 style="font-size:5vw">Great job!</h1><div class="tj end-ar">أحسنت — نهاية الدرس</div></div>` })

  const slidesHtml = slides.map((s, i) => `<section class="slide${i === 0 ? ' active' : ''}" data-en="${esc(s.secEn)}" data-ar="${esc(s.secAr)}">${s.html}</section>`).join('')
  const secData = JSON.stringify(slides.map(s => [s.secEn, s.secAr]))

  const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — RealLife English</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{font-family:'Outfit','DM Sans',sans-serif;background:${'#faf6ef'};color:${DARK};overflow:hidden;height:100vh}
.deck{position:fixed;inset:0;display:flex;flex-direction:column}
.hdr{display:flex;align-items:center;gap:8px;padding:2.6vh 3vw 0;font-size:.95vw;white-space:nowrap}
.hdr .p{padding:6px 14px;border-radius:12px;font-weight:800}
.hdr .no{background:${DARK};color:#fff}
.hdr .ti{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08);max-width:46vw;overflow:hidden;text-overflow:ellipsis}
.hdr .se{background:#facc15;color:${DARK}}
.hdr .ct{margin-left:auto;color:#a8a29e;font-weight:800}
.stage{flex:1;display:flex;align-items:center;justify-content:center;padding:2vh 5vw;min-height:0;position:relative}
.slide{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:2vh 5vw}
.slide.active{display:flex;animation:in .4s ease both}
@keyframes in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.center{text-align:center}
.kicker{display:inline-block;margin-bottom:24px;padding:10px 24px;border-radius:999px;background:${DARK};color:#facc15;font-weight:700;letter-spacing:.2em;font-size:1vw}
h1{font-size:5.2vw;font-weight:900;line-height:1.05;letter-spacing:-.02em}
.unitpill{display:inline-block;margin-top:18px;padding:6px 20px;border-radius:999px;background:#facc15;font-weight:800;font-size:1.4vw}
.two{display:grid;grid-template-columns:1.05fr 1fr;gap:3.5vw;align-items:center;width:100%;max-width:88vw}
.col{display:flex;flex-direction:column;gap:2.2vh}
.pic{position:relative;width:100%;aspect-ratio:4/3;max-height:58vh;border-radius:28px;overflow:hidden;background:#fff;box-shadow:0 24px 60px -22px rgba(42,29,18,.45);display:flex;align-items:center;justify-content:center}
.pic img{width:100%;height:100%;object-fit:cover;animation:fade .5s ease both}
@keyframes fade{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}
.pic.emoji{font-size:14vw;background:linear-gradient(135deg,#fef9c3,#fde68a)}
.box{border-radius:24px;padding:2vh 2.2vw;background:#fff;box-shadow:0 10px 30px -18px rgba(42,29,18,.3);border:1px solid rgba(0,0,0,.06)}
.box.accent{background:#fffbeb;border-color:#fde68a}
.lbl{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.lbl i{width:6px;height:6px;border-radius:999px;background:#facc15;display:inline-block}
.lbl span{font-size:.85vw;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#a8a29e}
.box.accent .lbl span{color:#a16207}
.lbl .ar{font-family:'Tajawal';font-size:1vw}
.big{font-size:2.6vw;font-weight:900;line-height:1.1}
.big.ar,.rtl{direction:rtl;font-family:'Tajawal'}
.big.ar{color:#5b4636;font-weight:800;font-size:2.3vw}
.ex{font-size:2vw;font-style:italic;color:#5b4636}
.var{background:#facc15;color:${DARK};padding:2px 10px;border-radius:8px}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.chip{padding:6px 14px;border-radius:12px;background:#fff;border:1px solid #fcd34d;font-weight:600;font-size:1.3vw;color:${DARK}}
.convo{width:100%;max-width:68vw;display:flex;flex-direction:column;gap:1.4vh}
.row{display:flex;align-items:flex-end;gap:12px}
.row.right{flex-direction:row-reverse}
.av{width:2.6vw;height:2.6vw;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1vw;background:#a8a29e;color:#fff}
.row.right .av{background:#facc15;color:${DARK}}
.bub{max-width:60%;border-radius:24px;padding:1.2vh 1.6vw;font-size:1.5vw;line-height:1.3;background:#fff;box-shadow:0 8px 24px -16px rgba(0,0,0,.4);border-bottom-left-radius:6px}
.row.right .bub{background:#facc15;color:${DARK};border-bottom-left-radius:24px;border-bottom-right-radius:6px}
.emoji-big{font-size:6vw}
.end-ar{color:#a8a29e;font-weight:800;font-size:1.7vw;margin-top:8px;direction:rtl}
.tj{font-family:'Tajawal'}
.dots{display:flex;gap:6px;align-items:center;justify-content:center;padding:1vh 0}
.dot{height:6px;width:6px;border-radius:999px;background:#d6d3d1;transition:.3s}
.dot.on{width:32px;background:#facc15}
.ftr{display:flex;align-items:center;justify-content:center;gap:1.6vw;padding:1.5vh 3vw;font-size:.9vw;font-weight:600;color:#78716c;border-top:1px solid #e7e5e4;background:rgba(255,255,255,.5)}
.ftr .tj{font-family:'Tajawal'}
.zone{position:absolute;top:0;height:100%;width:11%;z-index:5;cursor:pointer}
</style></head>
<body><div class="deck">
<div class="hdr">${unitNo ? `<span class="p no">${esc(unitNo)}</span>` : ''}<span class="p ti">${esc(unitName)}</span><span class="p se" id="sec"></span><span class="ct" id="ct"></span></div>
<div class="stage"><div class="zone" style="left:0" onclick="go(-1)"></div><div class="zone" style="right:0" onclick="go(1)"></div>${slidesHtml}</div>
<div class="dots" id="dots"></div>
<div class="ftr"><span class="tj">📞 واتساب 0764189311</span><span>·</span><span>🌐 inglizi.com</span><span>·</span><span>📸 @elqasraouihamza</span><span>·</span><span>▶ @hamzaelqasraoui</span><span>·</span><span class="tj">🎓 الأستاذ حمزة</span></div>
</div>
<script>
var S=${secData},i=0,el=document.querySelectorAll('.slide');
var dots=document.getElementById('dots');for(var k=0;k<el.length;k++){var d=document.createElement('span');d.className='dot';dots.appendChild(d)}
var D=dots.children;
function go(n){i=Math.max(0,Math.min(el.length-1,i+n));render()}
function render(){for(var k=0;k<el.length;k++){el[k].classList.toggle('active',k===i);D[k].classList.toggle('on',k===i)}
var se=document.getElementById('sec');se.style.display=S[i][0]?'inline-block':'none';se.innerHTML=S[i][0]?esc(S[i][0])+' · <span class=tj>'+esc(S[i][1])+'</span>':'';
document.getElementById('ct').textContent=(i+1<10?'0':'')+(i+1)+' / '+(el.length<10?'0':'')+el.length}
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();go(1)}if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}});
render();
</script></body></html>`

  const safe = (unitNo || unitName).replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return new NextResponse(doc, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="reallife-${safe}.html"`,
    },
  })
}
