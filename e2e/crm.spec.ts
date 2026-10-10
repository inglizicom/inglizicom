import { test, expect, type Page } from '@playwright/test'
import { mockSupabase, collectErrors, IDS, LEADS, STUDENTS, CLASS_ID, SESSION_ID, INTAKE_STUDENT } from './mock'

/*
 * The CRM (/sales, /admin) against the fake Supabase in ./mock.ts.
 *
 *   1. Every main screen opens for the founder without a crash, shows the
 *      frame (header title), and on a phone does not scroll sideways.
 *   2. The flows staff use all day: search, payroll, adding a team member.
 *   3. Who may go where: assistants, blocked accounts, signed-out visitors.
 */

const FOUNDER_PAGES = [
  '/sales/dashboard',
  '/sales/workspace',
  '/sales/workspace?tab=students',
  '/sales/workspace?tab=followups',
  '/sales/workspace?tab=payments',
  `/sales/leads/${LEADS[1].id}`,
  `/sales/students/${STUDENTS[0].id}`,
  '/sales/classes',
  `/sales/classes/${CLASS_ID}`,
  '/sales/teachers',
  '/sales/courses',
  '/sales/submissions',
  '/sales/bac-results',
  '/sales/announcements',
  '/sales/gamification',
  '/sales/verify',
  '/sales/notifications',
  '/sales/notifications?tab=log',
  '/sales/notifications?tab=inbox',
  '/sales/channels',
  '/admin',
  '/admin/team',
  '/admin/team?tab=payroll',
  '/admin/team?tab=activity',
  '/admin/teachers',
  '/admin/analytics',
  '/admin/settings',
  '/admin/activity',
  '/admin/games',
  '/admin/vocab-book',
  '/admin/level1-book',
  '/admin/bac-pack',
  '/admin/everyday-book',
  '/admin/level2-book',
  '/admin/level2-workbook',
  '/admin/level1-cards',
  '/admin/level1-vocab',
]

/** Against the device width — a phone zooming a too-wide page out also widens innerWidth. */
async function noSidewaysScroll(page: Page) {
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  const vw = page.viewportSize()?.width ?? 0
  expect(sw, 'page wider than the screen').toBeLessThanOrEqual(vw + 1)
}

test.describe('every CRM screen opens', () => {
  for (const path of FOUNDER_PAGES) {
    test(path, async ({ page }) => {
      const errors = collectErrors(page)
      await mockSupabase(page, { role: 'founder' })
      await page.goto(path)
      // First visit compiles the page in dev — give it time.
      await expect(page.locator('header h1').first()).toBeVisible({ timeout: 90_000 })
      await page.waitForLoadState('networkidle')
      expect(errors, 'uncaught errors on the page').toEqual([])
      await noSidewaysScroll(page)
    })
  }
})

test.describe('flows', () => {
  test('search finds a lead and opens it', async ({ page, isMobile }) => {
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/sales/dashboard')
    if (isMobile) await page.getByRole('button', { name: 'بحث' }).click()
    const box = page.getByPlaceholder('ابحث عن عميل أو طالب بالاسم أو الهاتف…').last()
    await box.fill('سلمى')
    await page.getByRole('button', { name: /سلمى بنعلي/ }).first().click()
    await expect(page).toHaveURL(new RegExp(`/leads/${LEADS[1].id}`))
    await expect(page.getByRole('heading', { name: 'سلمى بنعلي' })).toBeVisible()
  })

  test('follow-up queue: one tap records the outcome and the lead leaves the queue', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'founder' })
    await page.goto('/sales/workspace')
    const card = page.locator('article').filter({ hasText: 'ياسين العلوي' })
    await expect(card).toContainText('جديد')
    // the pre-written first message, to the right number
    await expect(card.getByRole('link', { name: 'واتساب' })).toHaveAttribute('href', /^https:\/\/wa\.me\/212610000000\?text=.+/)
    await card.getByRole('button', { name: 'سجّل النتيجة' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByRole('button', { name: /لم يرد/ }).click()
    await sheet.getByRole('button', { name: 'حفظ', exact: true }).click()
    await expect(sheet).toBeHidden()
    const patch = calls.find(c => c.method === 'PATCH' && c.path.endsWith('/subscription_leads'))
    expect(patch?.body).toMatchObject({ status: 'contacted' })
    expect((patch?.body as any).next_followup_at).toMatch(/T08:00:00\.000Z$|T09:00:00\.000Z$/)
    expect(calls.some(c => c.path.endsWith('/rpc/log_lead_event'))).toBe(true)
    await expect(page.locator('article').filter({ hasText: 'ياسين العلوي' })).toHaveCount(0)
    await page.getByRole('tab', { name: /مجدولة/ }).click()
    await expect(page.locator('article').filter({ hasText: 'ياسين العلوي' })).toBeVisible()
    expect(patch?.body).toMatchObject({ last_outcome: 'no_answer', contact_attempts: 1 })
  })

  test('leads: the results panel shows the period, and outcome chips narrow the queue', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'founder' })
    await page.goto('/sales/workspace')
    await expect(page.getByText('نتائج المتابعة')).toBeVisible()
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/staff_followup_report'))?.body).toBeTruthy()
    await page.getByRole('button', { name: 'منذ البداية' }).click()
    await expect.poll(() => calls.filter(c => c.path.endsWith('/rpc/staff_followup_report')).at(-1)?.body).toMatchObject({ p_from: null, p_to: null })
    await expect(page.locator('article')).not.toHaveCount(0)
    await page.getByRole('button', { name: /مهتم/ }).first().click()
    await expect(page.locator('article')).toHaveCount(1)
    await expect(page.locator('article')).toContainText('أمين الإدريسي')
  })

  test('leads: every card says which offer the lead is about — or that none was chosen', async ({ page }) => {
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/sales/workspace')
    await page.getByRole('button', { name: 'منذ البداية' }).click()
    const card = (name: string) => page.locator('article').filter({ hasText: name })
    await expect(card('ياسين العلوي')).toContainText('المستوى الثاني')
    await expect(card('سلمى بنعلي')).toContainText('لم يختر عرضًا')
    await card('سلمى بنعلي').getByRole('button', { name: /فتح/ }).click()
    await expect(page.getByText('اسأله أولًا: أي عرض يهمّه؟')).toBeVisible()
  })

  test('public form: a visitor in Algeria gets a polite message and no lead is saved', async ({ page }) => {
    const calls = await mockSupabase(page)
    await page.route('**/api/geo', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country: 'DZ' }) }))
    await page.goto('/free')
    await page.getByPlaceholder('الاسم الكامل').fill('كريم')
    await page.getByPlaceholder('رقم الواتساب (مع رمز الدولة)').fill('0551234567')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText('دوراتنا غير متاحة حاليًا في بلدك')).toBeVisible()
    const inserts = calls.filter(c => c.method === 'POST' && c.path.endsWith('/subscription_leads'))
    expect(inserts).toHaveLength(1)
    expect(inserts[0].body).toMatchObject({ plan_id: 'inquiry', notes: 'region_blocked:DZ' })
    expect(JSON.stringify(inserts[0].body)).not.toContain('0551234567')
  })

  test('workbook: one unit shown alone keeps the page numbers the full contents gives it', async ({ page }) => {
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/games')
    const sel = page.locator('select').first()
    await sel.selectOption('front')
    const row = await page.locator('.print-sheet').nth(2).locator('div.flex.items-center.gap-3', { hasText: 'UNIT 07' }).innerText()
    await sel.selectOption('7')
    const firstFooter = await page.locator('.print-sheet').first().evaluate(s => (s.lastElementChild as HTMLElement).innerText)
    const n = firstFooter.match(/UNIT 7 \| (\d+)/)![1]
    expect(Number(n)).toBeGreaterThan(4)            // after the 4 front pages, not restarted at 1
    expect(row).toContain(n)
  })

  test('workbook: the cover carries the contact details and takes no page number', async ({ page }) => {
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/games')
    const sel = page.locator('select').first()
    await sel.selectOption('cover')
    const cover = page.locator('.print-sheet')
    await expect(cover).toHaveCount(1)
    for (const t of ['inglizi.com', '+212 764 189 311', 'الأستاذ حمزة القصراوي', 'Hamza El Qasraoui']) await expect(cover.getByText(t, { exact: true })).toBeVisible()
    await page.getByLabel('الهاتف 2 (اختياري)').fill('+212 600 000 000')
    await expect(cover.getByText('+212 600 000 000')).toBeVisible()
    await sel.selectOption('book')
    const welcomeFooter = await page.locator('.print-sheet').nth(1).evaluate(s => (s.lastElementChild as HTMLElement).innerText)
    expect(welcomeFooter).toContain('01')
  })

  test('workbook: printing gives exactly one A4 page per sheet (no footer spilling onto its own page)', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one PDF run is enough')
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/games')
    const sel = page.locator('select').first()
    for (const v of ['7', 'front', 'cover']) {
      await sel.selectOption(v)
      const sheets = await page.locator('.print-sheet').count()
      const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
      expect((pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length, `view ${v}`).toBe(sheets)
    }
  })

  test('vocabulary book: every page fits above its footer, and it prints one A4 page per sheet', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one PDF run is enough')
    test.setTimeout(120_000)
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/vocab-book')
    const sheets = page.locator('.print-sheet')
    await expect(sheets.first()).toBeVisible()
    // cover + contents + why + 19 units × 4 + index + answers + final + back cover
    expect(await sheets.count()).toBeGreaterThan(2 + 2 + 19 * 4 + 3)
    const tooLong = await page.evaluate(() => [...document.querySelectorAll('.print-sheet')].flatMap((s, i) => {
      const body = s.querySelector(':scope > div.px-10')
      if (!body) return []
      return body.getBoundingClientRect().bottom > (s.lastElementChild as HTMLElement).getBoundingClientRect().top ? [i] : []
    }))
    expect(tooLong).toEqual([])
    const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
    expect((pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(await sheets.count())
  })

  test('level 1 book: every lesson fits its page, a copy carries its buyer, one PDF page per sheet', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one PDF run is enough')
    test.setTimeout(120_000)
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/level1-book')
    const sheets = page.locator('.print-sheet')
    await expect(sheets).toHaveCount(3 + 19)
    await expect(page.getByText('QR / CODE')).toHaveCount(3 + 19)   // a code slot on every page
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(500)
    const tooLong = await page.evaluate(() => [...document.querySelectorAll('.lb-body')].flatMap((b, i) => {
      const inner = b.firstElementChild as HTMLElement
      return inner.getBoundingClientRect().bottom > b.getBoundingClientRect().bottom + 1 ? [i + 1] : []
    }))
    expect(tooLong).toEqual([])
    // the first edition still fits too
    await page.getByRole('button', { name: 'النسخة الأولى' }).click()
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => [...document.querySelectorAll('.lb-body')].filter(b =>
      (b.firstElementChild as HTMLElement).getBoundingClientRect().bottom > b.getBoundingClientRect().bottom + 1).length)).toBe(0)
    await page.getByRole('button', { name: 'النسخة الجديدة' }).click()
    await page.getByPlaceholder('مثلًا: أنور').fill('أنور')
    await expect(page.getByText('شكرًا من القلب يا أنور')).toBeVisible()
    await expect(page.locator('.lb-foot').first()).toContainText('أنور')
    const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
    expect((pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(await sheets.count())
  })

  test('everyday textbook: every page fits, units are complete, one PDF page per sheet', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one PDF run is enough')
    test.setTimeout(240_000)
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/everyday-book')
    const sheets = page.locator('.print-sheet')
    await expect(sheets.first()).toBeVisible()
    const count = await sheets.count()
    // cover, why, thanks, certificate, next, back · welcome, how to, contents, progress · 5+ pages a unit · word list
    expect(count).toBeGreaterThanOrEqual(6 + 4 + 19 * 5 + 2)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1000)
    const tooLong = await page.evaluate(() => [...document.querySelectorAll('.lb-body')].flatMap((b, i) => {
      const inner = b.firstElementChild as HTMLElement
      return inner.getBoundingClientRect().bottom > b.getBoundingClientRect().bottom + 1 ? [i + 1] : []
    }))
    expect(tooLong).toEqual([])
    await expect(page.locator('.print-sheet', { hasText: 'Three Nights at the Hotel' }).last()).toContainText('Make it yours')   // the opener names the reading too
    await expect(page.locator('.print-sheet', { hasText: 'Unit 17' }).filter({ hasText: 'Conversation - المحادثة' }).first()).toContainText('Layla Hamdan')
    // each unit opens on its own page, the word list and the certificate close the book
    await expect(page.locator('.print-sheet', { hasText: 'Key phrase' })).toHaveCount(19)
    await expect(page.locator('.print-sheet', { hasText: 'Word list' }).filter({ hasText: 'appointment' })).toHaveCount(1)
    await expect(page.locator('.print-sheet', { hasText: 'This is to certify that' })).toHaveCount(1)
    // every vocabulary photo loads, and on the admin domain too (its /everyday-book route must not swallow them)
    // (a picture still to be uploaded tries .webp, .png, .jpg, then shows its sign: give it time to settle)
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLImageElement>('.print-sheet img')].filter(i => i.complete && !i.naturalWidth).length), { timeout: 15_000 }).toBe(0)
    const photo = await page.request.get('/everyday-book/vocab/u01/wake-up.webp?_admin=1')
    expect(photo.status()).toBe(200)
    expect(photo.headers()['content-type']).toContain('image/webp')
    const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
    expect((pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(count)
  })

  test('bac results: staff see what students did in the portal\'s Bac tab', async ({ page }) => {
    await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/bac-results')
    const row = page.locator('tr', { hasText: STUDENTS[0].full_name })
    await expect(row).toContainText('15.5')        // mock exam 1 mark
    await expect(row).toContainText('79%')         // (5 + 6) / (6 + 8) first-try answers
    await row.click()
    await expect(page.getByText('الامتحانات التجريبية (من 20)')).toBeVisible()
    // the student's own page gets a «حقيبة الباك» tab
    await page.goto(`/sales/students/${STUDENTS[0].id}`)
    await page.getByRole('button', { name: 'حقيبة الباك' }).click()
    await expect(page.getByText('دروس مكتملة')).toBeVisible()
    await expect(page.getByText('15.5/20')).toBeVisible()
  })

  test('bac pack: every page fits, exams and keys are in, one PDF page per sheet', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one PDF run is enough')
    test.setTimeout(150_000)
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/bac-pack')
    const sheets = page.locator('.print-sheet')
    await expect(sheets.first()).toBeVisible()
    const count = await sheets.count()
    expect(count).toBeGreaterThanOrEqual(52)                            // cover + thanks + 50 numbered pages at least
    await expect(page.getByText('QR / CODE')).toHaveCount(count - 1)   // every page but the cover
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(800)
    const tooLong = await page.evaluate(() => [...document.querySelectorAll('.lb-body')].flatMap(b => {
      const inner = b.firstElementChild as HTMLElement
      return inner.getBoundingClientRect().bottom > b.getBoundingClientRect().bottom + 1 ? [b.closest('[aria-label]')?.getAttribute('aria-label') ?? '?'] : []
    }))
    expect(tooLong).toEqual([])
    await expect(page.locator('.print-sheet', { hasText: 'Text - Coming home' })).toContainText('Part I · Reading comprehension (15 pts)')
    await expect(page.getByText('Ex. 1 · p. 4', { exact: true })).toBeVisible()
    const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
    expect((pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(count)
  })

  test('level 1 workbook: every page fits, conversations come from the book, one PDF page per sheet', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one PDF run is enough')
    test.setTimeout(120_000)
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/games')
    await page.getByRole('button', { name: 'الإنجليزية من الصفر — المستوى الأول' }).click()
    const sel = page.locator('select').first()
    await sel.selectOption('book')
    const tooLong = await page.evaluate(() => [...document.querySelectorAll('.print-sheet')].flatMap((s, i) => {
      const body = s.querySelector(':scope > div.px-10')
      return body && body.getBoundingClientRect().bottom > (s.lastElementChild as HTMLElement).getBoundingClientRect().top ? [i] : []
    }))
    expect(tooLong).toEqual([])
    await sel.selectOption('2')
    await expect(page.locator('.print-sheet').first()).toContainText('LESSON 2')
    await expect(page.getByText('COMPLETE THE CONVERSATION').first()).toBeVisible()
    await expect(page.locator('.print-sheet', { hasText: 'COMPLETE THE CONVERSATION' }).first()).toContainText('Hamza: Hello Ali')
    const sheets = await page.locator('.print-sheet').count()
    const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
    expect((pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(sheets)
  })

  test('payroll: recording a payment sends status paid with the method', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'founder' })
    await page.goto('/admin/team?tab=payroll')
    const card = page.locator('div').filter({ has: page.getByText('فاطمة الزهراء', { exact: true }) }).filter({ has: page.getByRole('button', { name: /تسجيل الدفع/ }) }).last()
    await card.getByRole('button', { name: /تسجيل الدفع/ }).click()
    await page.getByRole('dialog').locator('select').selectOption('cash')
    await page.getByRole('button', { name: 'تأكيد الدفع' }).click()
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/founder_save_payout'))?.body).toMatchObject({
      p_payee: IDS.assistant, p_base: 3500, p_status: 'paid', p_method: 'cash',
    })
  })

  test('team: adding an assistant creates the account and shows the login to hand over', async ({ page }) => {
    await mockSupabase(page, { role: 'founder' })
    let sent: any = null
    await page.route('**/api/admin/create-assistant', async route => {
      sent = route.request().postDataJSON()
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: '00000000-0000-4000-8000-0000000000a9' }) })
    })
    await page.goto('/admin/team')
    await page.getByRole('button', { name: 'إضافة عضو' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('مثال: فاطمة الزهراء').fill('ليلى')
    await dialog.getByPlaceholder('name@gmail.com').fill('laila@e2e.test')
    await dialog.getByRole('button', { name: 'إنشاء الحساب' }).click()
    await expect(page.getByRole('dialog', { name: 'تمت الإضافة' })).toBeVisible()
    expect(sent).toMatchObject({ email: 'laila@e2e.test', full_name: 'ليلى' })
    expect(String(sent.password).length).toBeGreaterThanOrEqual(8)
  })

  test('phone: the tab bar and the "more" drawer reach every section', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only')
    await mockSupabase(page, { role: 'founder' })
    await page.goto('/sales/dashboard')
    await page.getByRole('button', { name: 'المزيد' }).click()
    await page.getByRole('link', { name: 'المدفوعات' }).last().click()
    await expect(page).toHaveURL(/tab=payments/)
  })
})

test.describe('who may go where', () => {
  test('an assistant has no founder links and is sent away from founder pages', async ({ page }) => {
    await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/dashboard')
    await expect(page.locator('header h1').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'الفريق والرواتب' })).toHaveCount(0)
    await page.goto('/admin/team')
    await expect(page).toHaveURL(/\/sales/)
  })

  test('a blocked assistant sees the suspended screen, not the CRM', async ({ page }) => {
    await mockSupabase(page, { role: 'assistant', profile: { blocked: true } })
    await page.goto('/sales/dashboard')
    await expect(page.getByText('تم إيقاف هذا الحساب')).toBeVisible()
    await expect(page.locator('header h1')).toHaveCount(0)
  })

  test('a signed-out visitor is sent to sign in', async ({ page }) => {
    await mockSupabase(page, { role: null })
    await page.goto('/sales/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('assistants: teachers and live classes', () => {
  test('an assistant opens Teachers, sees pay, but cannot change it or delete', async ({ page }) => {
    await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/dashboard')
    await expect(page.locator('header h1').first()).toBeVisible({ timeout: 90_000 })
    await page.goto('/sales/teachers')
    await expect(page.getByText('سارة بن يوسف').first()).toBeVisible()
    await expect(page.getByText('100 د.م / ساعة').first()).toBeVisible()      // rate
    await expect(page.getByText(/1,500/).first()).toBeVisible()             // 15 h × 100
    await page.getByRole('button', { name: 'إدارة الحساب' }).first().click()
    await expect(page.getByText('تعديل الأجر من صلاحيات المؤسس.')).toBeVisible()
    await expect(page.getByRole('button', { name: /حذف الحساب نهائياً/ })).toHaveCount(0)
  })

  test('the founder can set the rate and still has delete', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'founder' })
    await page.goto('/sales/teachers')
    await page.getByRole('button', { name: 'إدارة الحساب' }).first().click({ timeout: 90_000 })
    await expect(page.getByRole('button', { name: /حذف الحساب نهائياً/ })).toBeVisible()
    const rate = page.getByPlaceholder('100')
    await expect(rate).toHaveValue('100')
    await rate.fill('130')
    await page.getByRole('button', { name: 'حفظ', exact: true }).click()   // saving closes the window
    await expect.poll(() => calls.find(c => c.method === 'PATCH' && c.path.endsWith('/teacher_profiles'))?.body)
      .toMatchObject({ hourly_rate_mad: 130, pay_model: 'hourly' })
  })

  test('an assistant marks attendance for a session', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'assistant' })
    await page.goto(`/sales/classes/${CLASS_ID}`)
    await page.getByRole('button', { name: 'الحضور' }).click({ timeout: 90_000 })
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'الكل حاضر' }).click()
    await dialog.getByRole('button', { name: 'غائب' }).first().click()
    await dialog.getByRole('button', { name: 'حفظ الحضور' }).click()
    await expect.poll(() => calls.find(c => c.method === 'POST' && c.path.endsWith('/class_attendance'))?.body).toBeTruthy()
    const body = calls.find(c => c.method === 'POST' && c.path.endsWith('/class_attendance'))!.body as any[]
    expect(body).toHaveLength(3)
    expect(body.every(r => r.session_id === SESSION_ID && r.marked_by === IDS.assistant)).toBe(true)
    expect(body.filter(r => r.status === 'absent')).toHaveLength(1)
    expect(body.filter(r => r.status === 'present')).toHaveLength(2)
  })

  test('phone: live classes and teachers are in the tab bar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only')
    await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/dashboard')
    const bar = page.locator('nav.fixed')
    await bar.getByRole('link', { name: 'الأساتذة' }).click({ timeout: 90_000 })
    await expect(page).toHaveURL(/\/teachers/)
    await bar.getByRole('link', { name: 'الأقسام' }).click()
    await expect(page).toHaveURL(/\/classes/)
  })
})
test.describe('students teachers add (059)', () => {
  test('staff see the new student, approve it (access code) and confirm the declared payment', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/dashboard')
    await expect(page.getByText('جديد من الأساتذة')).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText('هبة العلوي')).toBeVisible()
    await expect(page.getByText('الطلاب والمداخيل حسب الأستاذ')).toBeVisible()
    await expect(page.getByText('بدون أستاذ', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'تأكيد' }).click()
    await expect.poll(() => calls.find(c => c.method === 'PATCH' && c.path.endsWith('/crm_payments'))?.body)
      .toMatchObject({ payment_status: 'paid', approved_by_id: IDS.assistant })

    await page.getByRole('button', { name: 'قبول' }).click()
    await expect(page.getByRole('dialog', { name: 'تم القبول' }).getByText('ING-AB12CD34')).toBeVisible()
    expect(calls.find(c => c.path.endsWith('/rpc/staff_review_teacher_student'))?.body).toMatchObject({ p_student: INTAKE_STUDENT, p_approve: true })
  })
})

test.describe('teacher adds a student', () => {
  test('the form sends the student and shows what happens next', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'teacher' })
    await page.goto('/teacher/students')
    await page.getByRole('button', { name: 'إضافة طالب' }).first().click({ timeout: 90_000 })
    const sheet = page.getByRole('dialog', { name: 'إضافة طالب' })
    await sheet.getByPlaceholder('مثال: هبة العلوي').fill('هبة العلوي')
    await sheet.getByPlaceholder('06 12 34 56 78').fill('0611223344')
    await sheet.getByRole('button', { name: 'إضافة الطالب' }).click()
    await expect(page.getByRole('dialog', { name: 'تمت الإضافة' })).toBeVisible()
    expect(calls.find(c => c.path.endsWith('/rpc/teacher_add_student'))?.body).toMatchObject({
      p_full_name: 'هبة العلوي', p_phone: '0611223344', p_kind: 'group', p_level: 'A1',
    })
  })

  test('a teacher the founder has not allowed sees no "add student" (061)', async ({ page }) => {
    await mockSupabase(page, { role: 'teacher', teacherProfile: { can_add_students: false } })
    await page.goto('/teacher/students')
    await expect(page.locator('main').getByRole('heading', { name: 'طلابي' })).toBeVisible({ timeout: 90_000 })
    await expect(page.getByRole('button', { name: 'إضافة طالب' })).toHaveCount(0)
  })
})

test.describe('notifications (062)', () => {
  test('the bell shows the unread count, lists them, and marks all read', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/dashboard')
    const bell = page.getByRole('button', { name: 'الإشعارات (2 جديد)' })
    await expect(bell).toBeVisible({ timeout: 90_000 })
    await bell.click()
    const panel = page.getByRole('dialog', { name: 'الإشعارات' })
    await expect(panel.getByText('✉️ رسالة من سلمى بنعلي')).toBeVisible()
    await noSidewaysScroll(page)
    await panel.getByRole('button', { name: /تحديد الكل كمقروء/ }).click()
    await expect.poll(() => calls.some(c => c.path.endsWith('/rpc/notifications_mark_read'))).toBe(true)
    await expect(page.getByRole('button', { name: 'الإشعارات', exact: true })).toBeVisible()
  })

  test('staff send to a chosen teacher, and read teacher↔student messages in the log', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'assistant' })
    await page.goto('/sales/notifications')
    await page.getByRole('button', { name: 'سارة بن يوسف' }).click({ timeout: 90_000 })
    await page.getByLabel('العنوان').fill('اجتماع الجمعة')
    await page.getByRole('button', { name: 'إرسال', exact: true }).click()
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/staff_send_notification'))?.body)
      .toMatchObject({ p_title: 'اجتماع الجمعة', p_teachers: [IDS.teacher], p_students: [] })
    await expect(page.getByText(/أُرسل إلى 1 أستاذ/)).toBeVisible()
    await page.getByRole('tab', { name: /سجل الرسائل/ }).click()
    await expect(page.getByText('واجب الغد')).toBeVisible()
    await expect(page.getByText('متى الحصة القادمة؟')).toBeVisible()
    await noSidewaysScroll(page)
  })
})

test.describe('payments follow the lessons (061)', () => {
  test('staff link a payment to the teacher whose lessons it pays for', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'assistant' })
    await page.goto(`/sales/students/${STUDENTS[0].id}`)
    await page.getByRole('button', { name: 'المدفوعات والفواتير' }).click({ timeout: 90_000 })
    const picker = page.getByRole('combobox', { name: 'أستاذ الحصص' }).first()
    await expect(picker).toBeVisible()
    await picker.selectOption(IDS.teacher)
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/staff_set_payment_teacher'))?.body)
      .toMatchObject({ p_teacher: IDS.teacher })
  })
})
test.describe('monthly report (staff)', () => {
  test('staff open a teacher\'s month, see the money split and write the academy note', async ({ page }) => {
    const calls = await mockSupabase(page, { role: 'assistant' })
    await page.goto(`/sales/teachers/report?teacher=${IDS.teacher}`)
    await expect(page.getByText('التقرير الشهري للأستاذ')).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText('نصيب الأكاديمية')).toBeVisible()
    await expect(page.getByText('600 د.م').first()).toBeVisible()          // 60% of 1,000
    await noSidewaysScroll(page)
    const frame = page.locator('[data-report-frame]')
    const { sw, cw } = await frame.evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth }))
    expect(sw, 'report wider than its frame').toBeLessThanOrEqual(cw + 1)
    await page.getByPlaceholder(/مثال: شهر جيد/).fill('ركّز على تقارير الحصص.')
    await page.getByRole('button', { name: 'حفظ الملاحظة' }).click()
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/staff_set_teacher_month_note'))?.body)
      .toMatchObject({ p_teacher: IDS.teacher, p_note: 'ركّز على تقارير الحصص.' })
  })

  test('the sample button swaps in a full example month, stamped as sample', async ({ page }) => {
    await mockSupabase(page, { role: 'assistant' })
    await page.goto(`/sales/teachers/report?teacher=${IDS.teacher}`)
    await expect(page.getByText('التقرير الشهري للأستاذ')).toBeVisible({ timeout: 90_000 })
    await page.getByRole('button', { name: 'تقرير تجريبي' }).click()
    await expect(page.getByText(/بيانات وهمية للتوضيح فقط/)).toBeVisible()
    await expect(page.getByText('1,530 د.م').first()).toBeVisible()          // the sample's net: 60% of 2,550
    await expect(page.getByPlaceholder(/مثال: شهر جيد/)).toHaveCount(0)    // no note editor on a sample
    await page.getByRole('button', { name: 'رجوع لتقريري الحقيقي' }).click()
    await expect(page.getByText(/بيانات وهمية للتوضيح فقط/)).toHaveCount(0)
  })
})