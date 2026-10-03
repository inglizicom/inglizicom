import { test, expect, type Page } from '@playwright/test'
import { mockSupabase, collectErrors } from './mock'

/*
 * The other three surfaces, opened the way people open them:
 *   teacher space (demo data, signed in as a teacher), student space (demo
 *   data, no login), and the public pages. A page passes when it renders its
 *   main content, throws nothing, and fits a phone screen.
 */

async function fits(page: Page) {
  const { sw, vw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: window.innerWidth }))
  expect(sw, 'page wider than the screen').toBeLessThanOrEqual(vw + 1)
}

const TEACHER_PAGES: [string, RegExp][] = [
  ['/teacher', /لوحة القيادة|مرحبًا|صباح|مساء/],
  ['/teacher/classes', /حصص/],
  ['/teacher/students', /الطلاب|طلابي/],
  ['/teacher/earnings', /الأرباح والساعات/],
  ['/teacher/leaderboard', /المنافسة|الترتيب/],
  ['/teacher/profile', /ملف/],
]

test.describe('teacher space (demo)', () => {
  for (const [path, heading] of TEACHER_PAGES) {
    test(path, async ({ page }) => {
      const errors = collectErrors(page)
      await mockSupabase(page, { role: 'teacher' })
      await page.goto(`${path}?demo=1`)
      // The page's own heading, inside <main> — the desktop sidebar repeats the same words but is hidden on phones.
      const main = page.locator('main')
      await expect(main.locator('h1, h2').first()).toBeVisible({ timeout: 90_000 })
      await expect(main).toContainText(heading)
      await page.waitForLoadState('networkidle')
      expect(errors).toEqual([])
      await fits(page)
    })
  }

  test('earnings shows "my payments"', async ({ page }) => {
    await mockSupabase(page, { role: 'teacher' })
    await page.goto('/teacher/earnings?demo=1')
    await expect(page.getByText('دفعاتي')).toBeVisible()
    await expect(page.getByText('مجموع ما توصّلت به')).toBeVisible()
  })
})

test.describe('student space (demo)', () => {
  test('home shows the two entry buttons', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: null })
    await page.goto('/student-space?demo=1')
    await expect(page.getByText('دوراتي').first()).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText('ملفي').first()).toBeVisible()
    expect(errors).toEqual([])
    await fits(page)
  })

  for (const tab of ['courses', 'profile']) {
    test(`#${tab} renders`, async ({ page }) => {
      const errors = collectErrors(page)
      await mockSupabase(page, { role: null })
      await page.goto(`/student-space?demo=1#${tab}`)
      await expect(page.getByText(tab === 'courses' ? 'مساراتي' : 'الحضور').first()).toBeVisible()
      expect(errors).toEqual([])
      await fits(page)
    })
  }
})

test.describe('public pages', () => {
  for (const path of ['/', '/pricing', '/teacher-showcase/demo']) {
    test(path, async ({ page }) => {
      const errors = collectErrors(page)
      await mockSupabase(page, { role: null })
      const res = await page.goto(path)
      expect(res?.status(), 'HTTP status').toBeLessThan(400)
      await expect(page.locator('body')).not.toBeEmpty()
      await page.waitForLoadState('networkidle')
      expect(errors).toEqual([])
      await fits(page)
    })
  }
})
