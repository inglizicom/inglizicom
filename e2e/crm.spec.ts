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
  '/admin/games/word-search',
  '/admin/games/matching',
  '/admin/games/scramble',
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