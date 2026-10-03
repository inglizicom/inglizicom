import { test, expect, type Page } from '@playwright/test'
import { mockSupabase, collectErrors, IDS, LEADS, STUDENTS } from './mock'

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
  '/sales/courses',
  '/sales/submissions',
  '/sales/announcements',
  '/sales/gamification',
  '/sales/verify',
  '/admin',
  '/admin/team',
  '/admin/team?tab=payroll',
  '/admin/team?tab=activity',
  '/admin/teachers',
  '/admin/analytics',
  '/admin/settings',
  '/admin/activity',
]

async function noSidewaysScroll(page: Page) {
  const { sw, vw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: window.innerWidth }))
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
