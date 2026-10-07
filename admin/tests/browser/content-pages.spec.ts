import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockSupabase, records, stamp } from './supabase-mock'

async function mockContent(page: Page, empty = false) {
  await mockSupabase(page)
  const state = {
    failList: false,
    failWrite: false,
    delayWrite: null as Promise<void> | null,
    writes: [] as { table: string; method: string; body: unknown }[],
    tables: {
      live_news: empty
        ? []
        : [
            {
              id: 'news-1',
              title: 'Workshop registration opens',
              description: 'Registration is open for the October web development workshop.',
              date: 'Oct 12',
              image_url: null,
              created_at: stamp,
            },
            {
              id: 'news-2',
              title: 'Team applications',
              description: 'Applications for the club team are now open.',
              date: null,
              image_url: null,
              created_at: stamp,
            },
          ],
      achievements: empty
        ? []
        : [
            {
              id: 'achievement-1',
              title: 'National innovation challenge',
              category: 'Hackathons',
              result: 'First place',
              year: '2026',
              description: 'An accessible campus navigation project.',
              href: null,
              created_at: stamp,
            },
            {
              id: 'achievement-2',
              title: 'Open source fellowship',
              category: 'Open source',
              result: 'Selected',
              year: '2025',
              description: '',
              href: null,
              created_at: stamp,
            },
          ],
      achievement_members: empty
        ? []
        : [{ achievement_id: 'achievement-1', member_id: records[0].id }],
    } as Record<string, Record<string, unknown>[]>,
  }
  await page.route('https://portal-test.supabase.co/rest/v1/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const table = url.pathname.split('/').pop()!
    if (!(table in state.tables)) return route.fallback()
    const method = request.method()
    if (method === 'GET')
      return route.fulfill(
        state.failList
          ? { status: 404, json: { message: 'Content unavailable' } }
          : { json: state.tables[table] },
      )
    const body = request.postDataJSON()
    state.writes.push({ table, method, body })
    if (state.delayWrite) await state.delayWrite
    if (state.failWrite)
      return route.fulfill({ status: 403, json: { message: 'Changes could not be saved' } })
    if (method === 'POST') {
      if (table === 'achievement_members') {
        state.tables[table].push(...body)
        return route.fulfill({ status: 201, json: body })
      }
      const item = { ...body, id: crypto.randomUUID(), created_at: stamp }
      state.tables[table].unshift(item)
      return route.fulfill({ status: 201, json: item })
    }
    const key = table === 'achievement_members' ? 'achievement_id' : 'id'
    const id = url.searchParams.get(key)?.replace('eq.', '')
    if (method === 'DELETE') {
      state.tables[table] = state.tables[table].filter((item) => item[key] !== id)
      return route.fulfill({ status: 204 })
    }
    const item = state.tables[table].find((item) => item.id === id)!
    Object.assign(item, body)
    return route.fulfill({ json: item })
  })
  return state
}

test('news search, create, edit, busy state, and confirmed delete', async ({ page }) => {
  const api = await mockContent(page)
  await page.goto('/news')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await page.getByLabel('Search news').fill('workshop')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByLabel('Search news').fill('missing')
  await expect(page.getByRole('heading', { name: 'No matching news' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search' }).click()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/news-desktop.png', fullPage: true })

  await page.getByRole('button', { name: 'Add news', exact: true }).click()
  await expect(page.getByLabel('Title', { exact: true })).toBeFocused()
  await page.getByLabel('Title', { exact: true }).fill('Research seminar')
  await page.getByLabel('Description', { exact: true }).fill('The seminar begins at 10 am.')
  await page.getByLabel('Display date').fill('Oct 20')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/news-editor-desktop.png', fullPage: true })
  let release!: () => void
  api.delayWrite = new Promise((resolve) => {
    release = resolve
  })
  await page.getByRole('button', { name: 'Save news', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeVisible()
  release()
  api.delayWrite = null
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('status')).toContainText('News saved.')
  expect(api.tables.live_news[0]).toMatchObject({
    title: 'Research seminar',
    date: 'Oct 20',
    image_url: null,
  })

  await page.getByRole('button', { name: 'Edit Research seminar' }).click()
  await page.getByLabel('Title', { exact: true }).fill('Updated seminar')
  await page.getByRole('button', { name: 'Save news', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Delete Updated seminar' }).click()
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  expect(api.tables.live_news).toHaveLength(3)
  await page.getByRole('button', { name: 'Delete Updated seminar' }).click()
  await page.getByRole('button', { name: 'Delete news item', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(api.tables.live_news).toHaveLength(2)
})

test('achievement fields and member associations survive create and edit', async ({ page }) => {
  const api = await mockContent(page)
  await page.goto('/achievements')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/achievements-desktop.png', fullPage: true })
  await page.getByLabel('Search achievements').fill('2025')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByLabel('Search achievements').fill('')
  await page.getByRole('button', { name: 'Add achievement', exact: true }).click()
  await page.getByLabel('Title', { exact: true }).fill('Regional programming final')
  await page.getByLabel('Category', { exact: true }).selectOption('Competitive programming')
  await page.getByLabel('Year', { exact: true }).fill('2026')
  await page.getByLabel('Result', { exact: true }).fill('Finalist')
  await page.getByRole('checkbox', { name: /Maya Rao/ }).check()
  await page.getByRole('checkbox', { name: /Jordan Fernandes/ }).check()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/achievement-editor-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Save achievement', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const id = api.tables.achievements[0].id
  expect(api.tables.achievement_members.filter((item) => item.achievement_id === id)).toHaveLength(
    2,
  )
  await page.getByRole('button', { name: 'Edit Regional programming final' }).click()
  await expect(page.getByRole('checkbox', { name: /Maya Rao/ })).toBeChecked()
  await page.getByRole('checkbox', { name: /Jordan Fernandes/ }).uncheck()
  await page.getByLabel('Result', { exact: true }).fill('Runner-up')
  await page.getByRole('button', { name: 'Save achievement', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(api.tables.achievement_members.filter((item) => item.achievement_id === id)).toEqual([
    { achievement_id: id, member_id: records[1].id },
  ])
  await page.getByRole('button', { name: 'Delete Regional programming final' }).click()
  await page.getByRole('button', { name: 'Delete achievement', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(api.tables.achievements).toHaveLength(2)
})

for (const route of ['news', 'achievements']) {
  test(route + ' handles empty results, load failures, and save failures', async ({ page }) => {
    const api = await mockContent(page, true)
    api.failList = true
    await page.goto('/' + route)
    await expect(page.getByRole('alert')).toContainText('Content unavailable')
    api.failList = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { name: 'No ' + route + ' yet' })).toBeVisible()
    await page
      .getByRole('button', { name: route === 'news' ? 'Add news' : 'Add achievement', exact: true })
      .click()
    await page.getByLabel('Title', { exact: true }).fill('New content')
    if (route === 'news') await page.getByLabel('Description', { exact: true }).fill('Details')
    else await page.getByLabel('Result', { exact: true }).fill('Winner')
    api.failWrite = true
    await page
      .getByRole('button', {
        name: route === 'news' ? 'Save news' : 'Save achievement',
        exact: true,
      })
      .click()
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
      'Changes could not be saved',
    )
    await expect(page.getByLabel('Title', { exact: true })).toHaveValue('New content')
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page
      .getByRole('button', { name: route === 'news' ? 'Add news' : 'Add achievement', exact: true })
      .click()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
}

for (const width of [390, 820]) {
  test('content lists and editors fit at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await mockContent(page)
    for (const route of ['news', 'achievements']) {
      await page.goto('/' + route)
      await expect(page.locator('tbody tr')).toHaveCount(2)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await expect(page.getByRole('button', { name: /^Edit / }).first()).toBeInViewport()
      await expect(page.getByRole('button', { name: /^Delete / }).first()).toBeInViewport()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.screenshot({
        path: 'test-results/' + route + '-' + width + '.png',
        fullPage: true,
      })
      await page
        .getByRole('button', {
          name: route === 'news' ? 'Add news' : 'Add achievement',
          exact: true,
        })
        .click()
      await expect(page.getByLabel('Title', { exact: true })).toBeFocused()
      expect(
        await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true)
      await page.getByRole('button', { name: 'Cancel', exact: true }).scrollIntoViewIfNeeded()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.screenshot({
        path: 'test-results/' + route + '-editor-' + width + '.png',
        fullPage: true,
      })
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }
  })
}
