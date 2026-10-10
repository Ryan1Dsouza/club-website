import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { imageBytes, mockSupabase, stamp } from './supabase-mock'

async function mockManagement(page: Page) {
  await mockSupabase(page)
  const state = {
    failWrite: false,
    settings: { id: 1, recruitment_open: true },
    writes: [] as { table: string; method: string; body: unknown; id: string | null }[],
    tables: {
      recruitment_forms: [
        {
          id: 'application-1',
          name: 'Alex Morgan',
          email: 'alex@example.com',
          domain: 'web',
          year: 2,
          status: 'new',
          motivation: 'I would like to contribute to the website.',
          github: 'https://github.com/example',
          linkedin: null,
          leetcode: null,
          portfolio: null,
          created_at: stamp,
        },
        {
          id: 'application-2',
          name: 'Sam Taylor',
          email: 'sam@example.com',
          domain: 'design',
          year: 3,
          status: 'accepted',
          motivation: 'I work on accessible interfaces.',
          github: null,
          linkedin: null,
          leetcode: null,
          portfolio: 'https://example.com',
          created_at: stamp,
        },
      ],
      events: [
        {
          id: 'event-1',
          title: 'Engineering workshop',
          description: 'A practical engineering workshop.',
          starts_at: '2026-10-20T10:00:00Z',
          ends_at: '2026-10-20T12:00:00Z',
          location: 'Main auditorium',
          category: 'Workshop',
          published: true,
          registration_url: null,
          album_url: null,
          created_at: stamp,
          updated_at: stamp,
        },
      ],
      event_photos: [],
    } as Record<string, Record<string, unknown>[]>,
  }
  await page.route('https://portal-test.supabase.co/rest/v1/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const table = url.pathname.split('/').pop()!
    if (table !== 'site_settings' && !(table in state.tables)) return route.fallback()
    const method = request.method()
    if (method === 'GET')
      return route.fulfill({
        json: table === 'site_settings' ? state.settings : state.tables[table],
      })
    const body = request.postDataJSON()
    const id = url.searchParams.get('id')?.replace('eq.', '') ?? null
    state.writes.push({ table, method, body, id })
    if (state.failWrite)
      return route.fulfill({
        status: 403,
        json: { code: '42501', message: 'Changes could not be saved' },
      })
    if (table === 'site_settings') {
      Object.assign(state.settings, body)
      return route.fulfill({ status: 204 })
    }
    if (method === 'POST') {
      const record = { ...body, id: crypto.randomUUID(), created_at: stamp, updated_at: stamp }
      state.tables[table].unshift(record)
      return route.fulfill({ status: 201, json: record })
    }
    if (method === 'DELETE') {
      state.tables[table] = state.tables[table].filter((record) => record.id !== id)
      return route.fulfill({ json: { id } })
    }
    const record = state.tables[table].find((record) => record.id === id)!
    Object.assign(record, body)
    return route.fulfill({ json: record })
  })
  return state
}

test('recruitment intake, filters, review, status changes, and confirmed deletion', async ({
  page,
}) => {
  const api = await mockManagement(page)
  await page.goto('/recruitment')
  await expect(page.getByRole('heading', { name: 'Applicant Management' })).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await page.getByRole('button', { name: 'Close recruitment', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Open recruitment', exact: true })).toBeVisible()
  expect(api.settings.recruitment_open).toBe(false)
  expect(api.writes[0]).toMatchObject({
    table: 'site_settings',
    method: 'PATCH',
    id: '1',
    body: { recruitment_open: false },
  })
  await page.getByRole('button', { name: 'Open recruitment', exact: true }).click()
  await page.getByRole('button', { name: /^New 1$/ }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'View application from Alex Morgan' }).click()
  await expect(page.getByRole('dialog')).toContainText('I would like to contribute to the website.')
  await expect(page.getByRole('link', { name: 'View profile' })).toHaveAttribute(
    'href',
    'https://github.com/example',
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.getByRole('button', { name: 'Accept application', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'No new applications' })).toBeVisible()
  expect(api.tables.recruitment_forms[0].status).toBe('accepted')
  await page.getByRole('button', { name: /^Accepted 2$/ }).click()
  await page.getByRole('button', { name: 'View application from Alex Morgan' }).click()
  await page.getByRole('button', { name: 'Reject application', exact: true }).click()
  await page.getByRole('button', { name: /^Rejected 1$/ }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'Delete application from Alex Morgan' }).click()
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  expect(api.tables.recruitment_forms).toHaveLength(2)
  await page.getByRole('button', { name: 'Delete application from Alex Morgan' }).click()
  await page.getByRole('button', { name: 'Delete application', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No rejected applications' })).toBeVisible()
  expect(api.tables.recruitment_forms).toHaveLength(1)
})

test('event editor preserves dates, publishing, photo uploads, edits, and deletion', async ({
  page,
}) => {
  const api = await mockManagement(page)
  await page.goto('/events')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: 'Add event', exact: true }).click()
  await page.getByLabel('Event title').fill('Partner briefing')
  await page.getByLabel('Description').fill('Project review with corporate partners.')
  await page.getByLabel('Start date and time').fill('2026-11-10T09:00')
  await page.getByLabel('End date and time').fill('2026-11-10T10:00')
  await page.getByLabel('Location').fill('Conference room')
  await page.getByLabel('Registration URL').fill('https://example.com/register')
  await page.getByLabel('Publish to website').check()
  await page
    .getByLabel('Upload event photos')
    .setInputFiles({ name: 'event.png', mimeType: 'image/png', buffer: imageBytes })
  await expect(page.locator('.event-photo img')).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.getByRole('button', { name: 'Create event', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const event = api.tables.events[0]
  expect(event).toMatchObject({
    title: 'Partner briefing',
    published: true,
    registration_url: 'https://example.com/register',
    album_url: null,
  })
  expect(api.tables.event_photos[0]).toMatchObject({
    event_id: event.id,
    name: 'event.png',
    position: 0,
  })
  const startsAt = event.starts_at
  await page.getByRole('button', { name: 'Edit Partner briefing' }).click()
  await expect(page.locator('.event-photo img')).toBeVisible()
  await page.getByLabel('Location').fill('Boardroom')
  await page.getByLabel('Publish to website').uncheck()
  await page.getByRole('button', { name: 'Remove event photo' }).click()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(event).toMatchObject({ location: 'Boardroom', published: false, starts_at: startsAt })
  expect(api.tables.event_photos).toHaveLength(0)
  await page.getByRole('button', { name: 'Delete Partner briefing' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(api.tables.events).toHaveLength(2)
  await page.getByRole('button', { name: 'Delete Partner briefing' }).click()
  await page.getByRole('button', { name: 'Delete event', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  expect(api.tables.events).toHaveLength(1)
})

for (const width of [390, 820, 1440]) {
  test(
    'management pages and event editor remain accessible at ' + width + 'px',
    async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await mockManagement(page)
      for (const route of ['recruitment', 'events', 'settings']) {
        await page.goto('/' + route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        if (route !== 'settings') await expect(page.locator('tbody tr').first()).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
        await page.screenshot({
          path: 'test-results/' + route + '-' + width + '.png',
          fullPage: true,
        })
      }
      await page.goto('/events')
      await page.getByRole('button', { name: 'Add event', exact: true }).click()
      expect(
        await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true)
      await page.getByLabel('Publish to website').scrollIntoViewIfNeeded()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.screenshot({ path: 'test-results/event-editor-' + width + '.png', fullPage: true })
    },
  )
}
