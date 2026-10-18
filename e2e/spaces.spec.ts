import { test, expect, type Page } from '@playwright/test'
import { mockSupabase, collectErrors, IDS, STUDENTS } from './mock'

/*
 * The other three surfaces, opened the way people open them:
 *   teacher space (demo data, signed in as a teacher), student space (demo
 *   data, no login), and the public pages. A page passes when it renders its
 *   main content, throws nothing, and fits a phone screen.
 */

/** Compared with the device's width, not window.innerWidth: a phone that zooms
 *  a too-wide page out widens innerWidth too, and the overflow hides. */
async function fits(page: Page) {
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  const vw = page.viewportSize()?.width ?? 0
  expect(sw, 'page wider than the screen').toBeLessThanOrEqual(vw + 1)
}

const TEACHER_PAGES: [string, RegExp][] = [
  ['/teacher', /لوحة القيادة|مرحبًا|صباح|مساء/],
  ['/teacher/classes', /حصص/],
  ['/teacher/students', /الطلاب|طلابي/],
  ['/teacher/earnings', /الأرباح والساعات/],
  ['/teacher/leaderboard', /المنافسة|الترتيب/],
  ['/teacher/profile', /ملف/],
  ['/teacher/notifications', /الإشعارات/],
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

  const TAB_MARKER: Record<string, string> = {
    courses: 'مساراتي', profile: 'الحضور', path: 'مسار الدورة', tasks: 'تمارين المنهج',
    rewards: 'رصيدك من الكوينات', files: 'ملفاتي', progress: 'تقدّمي', bac: 'حقيبة الباك',
  }
  for (const [tab, marker] of Object.entries(TAB_MARKER)) {
    test(`#${tab} renders`, async ({ page }) => {
      const errors = collectErrors(page)
      await mockSupabase(page, { role: null })
      await page.goto(`/student-space?demo=1#${tab}`)
      await expect(page.getByText(marker).first()).toBeVisible({ timeout: 90_000 })
      expect(errors).toEqual([])
      await fits(page)
    })
  }

  test('bac pack: exercises are done in place, checked, and remembered on the device', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: null })
    await page.goto('/student-space?demo=1#bac')
    await page.getByRole('button', { name: /Vocab 01/ }).click({ timeout: 90_000 })
    await expect(page).toHaveURL(/#bac\/vocab-01$/)

    // word bank: the first blank is active; each word goes to the next empty blank.
    // Checking waits until every blank is filled; the last two are swapped (wrong).
    const ex = page.locator('section', { hasText: 'Complete with a word from the list.' })
    const words = ['compulsory', 'scholarship', 'overcrowded', 'dropout', 'curriculum']
    for (const w of words) await ex.getByRole('button', { name: w, exact: true }).click()
    await expect(ex.getByRole('button', { name: /أجب عن كل الأسئلة \(5\/6\)/ })).toBeDisabled()
    await ex.getByRole('button', { name: 'skills', exact: true }).click()
    await ex.getByRole('button', { name: 'تحقّق من أجوبتي' }).click()
    await expect(ex.getByText('4/6', { exact: true })).toBeVisible()
    await fits(page)

    // a refresh keeps the unit open and the result
    await page.reload()
    await expect(page.locator('section', { hasText: 'Complete with a word from the list.' }).getByText('4/6', { exact: true })).toBeVisible({ timeout: 90_000 })

    // mock exam: answer True/False and tap the sentence that proves it (only the first is right)
    await page.goto('/student-space?demo=1#bac/mock-exam-1')
    const tf = page.locator('section', { hasText: 'A. True or false? Justify.' })
    for (let i = 0; i < 4; i++) {
      await tf.getByRole('button', { name: 'False', exact: true }).nth(i).click({ timeout: 90_000 })
      await tf.getByRole('button', { name: /برّر/ }).first().click()
      await tf.getByRole('button', { name: /fifteen kilometres away/ }).click()
    }
    await tf.getByRole('button', { name: 'تحقّق من أجوبتي' }).click()
    await expect(tf.getByText('1/4', { exact: true })).toBeVisible()

    // tap the word in its paragraph (the third is wrong)
    const find = page.locator('section', { hasText: 'C. Find words in the text.' })
    const pickIn = (i: number, w: string) => find.locator('li').nth(i).getByRole('button', { name: w, exact: true }).first().click()
    await pickIn(0, 'afraid'); await pickIn(1, 'attend'); await pickIn(2, 'Experts'); await pickIn(3, 'challenges')
    await find.getByRole('button', { name: 'تحقّق من أجوبتي' }).click()
    await expect(find.getByText('3/4', { exact: true })).toBeVisible()
    await expect(page.getByText('الوقت المنقضي')).toBeVisible()
    await fits(page)
    expect(errors).toEqual([])
  })
})

test.describe('public pages', () => {
  for (const path of ['/', '/pricing', '/books', '/courses', '/classes', '/business', '/level-test', '/faq',
                      '/pricing/pack-intensif', '/pricing/class-8', '/courses/a0-a1', '/courses/a2-b1', '/teacher-showcase/demo',
                      '/audio', '/audio/L13', '/audio/L13-8', '/audio/B-06', '/audio/book/13', '/audio/workbook/13', '/audio/vocab/13', '/audio/level2/book/13', '/audio/level2/vocab/13']) {
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

test.describe('notifications (062)', () => {
  test('a teacher sees the bell and writes to one of their students', async ({ page }) => {
    const calls = await mockSupabase(page, {
      role: 'teacher',
      rpc: { teacher_my_students: [{ id: STUDENTS[0].id, full_name: STUDENTS[0].full_name }], teacher_my_classes: [] },
    })
    await page.goto('/teacher/notifications')
    await expect(page.getByRole('button', { name: 'الإشعارات (2 جديد)' })).toBeVisible({ timeout: 90_000 })
    await page.getByRole('tab', { name: 'إرسال لطلابي' }).click()
    await page.getByRole('button', { name: STUDENTS[0].full_name }).click()
    await page.getByLabel('العنوان').fill('واجب الغد')
    await page.getByRole('button', { name: 'إرسال', exact: true }).click()
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/teacher_send_notification'))?.body)
      .toMatchObject({ p_title: 'واجب الغد', p_students: [STUDENTS[0].id] })
    await fits(page)
  })

  test('a student writes to their teacher from the bell', async ({ page }) => {
    const calls = await mockSupabase(page, { role: null })
    await page.goto('/student-space?demo=1')
    await expect(page.getByText('دوراتي').first()).toBeVisible({ timeout: 90_000 })
    await page.getByRole('button', { name: 'الإشعارات' }).click()
    await page.getByRole('button', { name: /راسل أستاذك/ }).click()
    const dlg = page.getByRole('dialog', { name: 'رسالة' })
    await expect(dlg.getByRole('combobox', { name: 'إلى' })).toHaveValue(IDS.teacher)
    await dlg.getByLabel('رسالتك').fill('متى الحصة القادمة؟')
    await dlg.getByRole('button', { name: 'إرسال' }).click()
    await expect.poll(() => calls.find(c => c.path.endsWith('/rpc/student_send_notification'))?.body)
      .toMatchObject({ p_body: 'متى الحصة القادمة؟', p_teacher: IDS.teacher })
    await expect(dlg.getByText('أُرسلت رسالتك ✓')).toBeVisible()
  })
})

test.describe('monthly report', () => {
  test('a teacher opens the month and downloads it as a PDF in one click', async ({ page }) => {
    await mockSupabase(page, { role: 'teacher' })
    await page.goto('/teacher/monthly?demo=1')
    await expect(page.getByText('التقرير الشهري للأستاذ')).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText('نقاط القوة')).toBeVisible()
    await expect(page.getByText('الأجر الصافي')).toBeVisible()
    await reportFits(page)
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByRole('button', { name: /تحميل PDF/ }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
    await expect(page.getByRole('button', { name: /تحميل PDF/ })).toBeEnabled()
    await reportFits(page)   // back to the screen layout after the PDF
  })
})

/** The report document fits the screen: no sideways scroll, inside the page or inside its frame. */
export async function reportFits(page: Page) {
  await fits(page)
  const frame = page.locator('[data-report-frame]')
  await expect(frame).toBeVisible()
  const { sw, cw } = await frame.evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth }))
  expect(sw, 'report wider than its frame').toBeLessThanOrEqual(cw + 1)
}
/* VIIZA interactive (/viiza): the travel guide as an app. Without a sign-in
 * only the free sample (stop 1) opens; its sections, exercises, stamp and
 * games work on the device. */
test.describe('VIIZA interactive', () => {
  test('the journey: 34 stops on the board, the sample open, the rest locked', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza')
    await expect(page.getByText('Departures')).toBeVisible({ timeout: 60_000 })
    await expect(page.locator('a[href^="/viiza/"]').filter({ hasText: 'Passport, visa & forms' }).first()).toBeVisible()
    await expect(page.getByText('LOCKED')).toHaveCount(33 + 6)   // 33 stops and the 6 part checks
    await fits(page)
    expect(errors).toEqual([])
  })

  test('a locked stop sends you back to sign in', async ({ page }) => {
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza/2')
    await expect(page).toHaveURL(/\/viiza\?locked=2/)
    await expect(page.getByText('المحطة 2 مقفلة')).toBeVisible({ timeout: 60_000 })
  })

  test('a wrong code is refused with a message', async ({ page }) => {
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza')
    await page.getByPlaceholder('ING-XXXXXXXX').fill('ING-NOPE0000')
    await page.getByRole('button', { name: /Open/ }).click()
    await expect(page.locator('#signin').getByText(/الرمز غير صحيح|حدث خطأ/)).toBeVisible({ timeout: 30_000 })
  })

  test('the sample stop: sections, a self-checking exercise, the stamp and a game', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza/1')
    await expect(page.getByText('SECTION 1 OF 6')).toBeVisible({ timeout: 60_000 })
    await fits(page)

    await page.locator('[data-sec="words"]').click()
    await expect(page.getByText('ACTION WORDS', { exact: false }).first()).toBeVisible()
    await page.locator('[data-sec="exchanges"]').click()
    await expect(page.getByText('Sure. Is a black pen OK?')).toBeVisible()
    await page.getByRole('button', { name: /Practice mode/ }).click()
    await expect(page.getByText('Sure. Is a black pen OK?')).toHaveCount(0)

    await page.locator('[data-sec="talk"]').click()
    await page.getByRole('button', { name: 'True' }).first().click()
    await expect(page.getByText('✓ Correct')).toBeVisible()

    await page.locator('[data-sec="practice"]').click()
    const gaps = page.locator('input[type="text"], input:not([type])').filter({ hasNot: page.locator('[placeholder]') })
    for (const [k, a] of ['valid', 'appointment', 'upload', 'fee', 'approved'].entries()) await gaps.nth(k).fill(a)
    await page.getByRole('button', { name: 'Check' }).nth(1).click()
    await expect(page.getByText(/Perfect! 5 \/ 5/)).toBeVisible()
    await page.getByRole('button', { name: 'Stamp my passport' }).click()
    await expect(page.getByText('Stamped! Stop 1 is in your passport.')).toBeVisible()

    await page.locator('[data-sec="games"]').click()
    await page.getByRole('button', { name: 'Start boarding' }).click()
    await expect(page.getByText('YOU REPLY')).toBeVisible()

    await page.goto('/viiza')
    await expect(page.getByText('DONE').first()).toBeVisible({ timeout: 60_000 })
    expect(errors).toEqual([])
  })
})

test.describe('VIIZA interactive · book view', () => {
  test('the printed pages, one per screen, turned with the keyboard, a sentence heard on tap', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza/1')
    await page.getByRole('button', { name: /Book/ }).first().click()
    await expect(page.getByText('Page 1 of 6')).toBeVisible({ timeout: 60_000 })
    const sheet = page.locator('.vz-bookpage .print-sheet')
    await expect(sheet).toBeVisible()
    // the whole page is on the screen
    const box = (await page.locator('.vz-bookpage').boundingBox())!
    const vp = page.viewportSize()!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1)
    expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 1)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(page.getByText('Page 3 of 6')).toBeVisible()
    await page.locator('.vz-bookpage').getByText('Sure. Is a black pen OK?').click()
    await page.getByRole('button', { name: /App view/ }).or(page.getByTitle('Back to the app view')).first().click()
    await expect(page.getByText('SECTION 3 OF 6')).toBeVisible()
    expect(errors).toEqual([])
  })
})

test.describe('VIIZA interactive · full screen', () => {
  test('the app goes full screen and stays there across sections and games', async ({ page }) => {
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza/1')
    await page.getByTitle('Full screen', { exact: true }).click()
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement), { timeout: 10_000 }).toBe(true)
    await page.locator('[data-sec="games"]').click()
    await page.getByRole('button', { name: 'Start boarding' }).click()
    await expect(page.getByText('YOU REPLY')).toBeVisible()
    expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(true)
    await page.getByTitle('Exit full screen').click()
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false)
  })
})

test.describe('VIIZA interactive · signed in', () => {
  // viiza_session=e2e counts as a signed-in student on the test server (VIIZA_E2E_ACCESS).
  test.beforeEach(async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: 'viiza_session', value: 'e2e', url: baseURL! }])
  })

  test('every stop opens, and a part check is taken to the end and remembered', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/viiza')
    await expect(page.getByText('Part 1 check · 10 questions')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('LOCKED')).toHaveCount(0)
    await page.goto('/viiza/20')
    await expect(page.getByText('SECTION 1 OF 6')).toBeVisible({ timeout: 60_000 })

    await page.goto('/viiza/check/1')
    await expect(page.getByText('QUESTION 1 OF 10')).toBeVisible({ timeout: 60_000 })
    for (let q = 0; q < 10; q++) {
      await page.locator('main button.rounded-2xl').first().click()
      await page.getByRole('button', { name: /Next question|See my score/ }).click()
    }
    await expect(page.getByText(/\d+ \/ 10/).first()).toBeVisible()
    await page.goto('/viiza')
    await expect(page.getByText(/BEST \d+\/10/).first()).toBeVisible({ timeout: 60_000 })
    expect(errors).toEqual([])
  })
})

/* PIIRMI interactive (/piirmi): the everyday book as an app, same sign-in,
 * its own access date. */
test.describe('PIIRMI interactive', () => {
  test('home: 19 units, the sample open, the rest locked, fits a phone', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/piirmi')
    await expect(page.getByText('Morning Routine').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('LOCKED', { exact: true })).toHaveCount(18)
    await fits(page)
    expect(errors).toEqual([])
  })

  test('a locked unit sends you back to sign in', async ({ page }) => {
    await mockSupabase(page, { role: 'student' })
    await page.goto('/piirmi/5')
    await expect(page).toHaveURL(/\/piirmi\?locked=5/)
  })

  test('the sample unit: expressions practice, reading check, sticker, game and book view', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/piirmi/1')
    await expect(page.getByText('SECTION 1 OF 6')).toBeVisible({ timeout: 60_000 })
    await fits(page)
    await page.locator('[data-sec="expressions"]').click()
    await expect(page.getByText('I usually wake up at seven.').first()).toBeVisible()
    await page.getByRole('button', { name: /Practice mode/ }).click()
    await expect(page.getByText('I usually wake up at seven.')).toHaveCount(0)
    await page.locator('[data-sec="reading"]').click()
    await page.getByPlaceholder('Your answer…').first().fill('At seven.')
    await page.getByRole('button', { name: 'Check my answers' }).click()
    await expect(page.getByText('✓ Good!').first()).toBeVisible()
    await page.locator('[data-sec="practice"]').click()
    await page.getByRole('button', { name: 'Add my sticker' }).click()
    await expect(page.getByText('Sticker added! Unit 1 is in your album.')).toBeVisible()
    await page.locator('[data-sec="games"]').click()
    await page.getByRole('button', { name: 'Start boarding' }).click()
    await expect(page.getByText('YOU ANSWER')).toBeVisible()
    await page.getByRole('button', { name: /Book/ }).first().click()
    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible()
    await expect(page.locator('.vz-bookpage .print-sheet')).toBeVisible()
    await page.goto('/piirmi')
    await expect(page.getByText('DONE').first()).toBeVisible({ timeout: 60_000 })
    expect(errors).toEqual([])
  })
})

test.describe('PIIRMI interactive · signed in', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: 'viiza_session', value: 'e2e', url: baseURL! }])
  })

  test('every unit opens, and a review check is taken to the end', async ({ page }) => {
    const errors = collectErrors(page)
    await mockSupabase(page, { role: 'student' })
    await page.goto('/piirmi')
    await expect(page.getByText('Review 1 check')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('LOCKED', { exact: true })).toHaveCount(0)
    await page.goto('/piirmi/19')
    await expect(page.getByText('SECTION 1 OF 6')).toBeVisible({ timeout: 60_000 })
    await page.goto('/piirmi/check/1')
    await expect(page.getByText('QUESTION 1 OF 10')).toBeVisible({ timeout: 60_000 })
    for (let q = 0; q < 10; q++) {
      await page.locator('main button.rounded-2xl').first().click()
      await page.getByRole('button', { name: /Next question|See my score/ }).click()
    }
    await expect(page.getByText(/\d+ \/ 10/).first()).toBeVisible()
    expect(errors).toEqual([])
  })
})
