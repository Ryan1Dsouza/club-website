import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { adminId, imageBytes, mockSupabase } from './supabase-mock'

test('every protected route redirects without querying dashboard data', async ({ page }) => {
  const api = await mockSupabase(page, { signedIn: false })
  for (const path of ['/', '/team', '/events', '/settings', '/unknown']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Admin login' })).toBeVisible()
  }
  expect(api.requests.filter((r) => r.path.startsWith('/rest/'))).toHaveLength(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/login-desktop.png', fullPage: true })
})

test('login errors, password visibility, successful login, signout and back navigation', async ({
  page,
}) => {
  await mockSupabase(page, { signedIn: false })
  await page.goto('/team')
  await page.getByLabel('Email address').fill('admin@example.com')
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('Unable to sign in')
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Team members.' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => localStorage.getItem('sb-portal-test-auth-token'))).toBeNull()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Team members.' })).not.toBeVisible()
})

test('authenticated non-admin and forged stored session cannot open the directory', async ({
  page,
}) => {
  const api = await mockSupabase(page, { admin: false })
  await page.goto('/team')
  await expect(page.getByRole('heading', { name: 'An invitation is required.' })).toBeVisible()
  expect(api.requests.filter((r) => r.path === '/rest/v1/team_members')).toHaveLength(0)
  api.authInvalid = true
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page).toHaveURL(/\/login$/)
  expect(api.requests.filter((r) => r.path === '/rest/v1/team_members')).toHaveLength(0)
})

test('directory filters, pagination, accessible desktop layout and dashboard', async ({ page }) => {
  await mockSupabase(page)
  await page.goto('/team')
  await expect(page.getByText('Alex D’Souza', { exact: true })).toBeVisible()
  await expect(page.getByText('Morgan Kumar', { exact: true })).not.toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByText('Morgan Kumar', { exact: true })).toBeVisible()
  await page.getByLabel('Search members').fill('maya')
  await expect(page.getByText('Maya Rao', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search' }).click()
  await page.getByLabel('Filter by role').selectOption('Design Lead')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await page.getByLabel('Filter by role').selectOption('all')
  await page.getByLabel('Sort members').selectOption('name')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/team-desktop.png', fullPage: true })
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'The control room.' })).toBeVisible()
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true })
})

test('create with photo, preserve on edit, replace and remove, then delete', async ({ page }) => {
  const api = await mockSupabase(page, { empty: true })
  await page.goto('/team')
  await page.getByRole('button', { name: 'Add member', exact: true }).click()
  await page.getByLabel('Full name').fill('New Test Member')
  await page.getByRole('textbox', { name: 'Role', exact: true }).fill('Design Lead')
  await page
    .getByLabel('Profile photo', { exact: true })
    .setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: imageBytes })
  await expect(page.locator('.profile-preview img')).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/member-editor.png', fullPage: true })
  // Returning from the file picker or another window must not destroy the form.
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByLabel('Full name')).toHaveValue('New Test Member')
  await page.getByRole('dialog').getByRole('button', { name: 'Add member', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
    'added successfully',
  )
  expect(api.members[0].photo_url).toMatch(new RegExp(`/team-photos/${adminId}/.+\\.webp$`))
  const firstPath = api.members[0].photo_path
  await page.getByRole('button', { name: 'Edit New Test Member' }).click()
  await page.getByRole('textbox', { name: 'Role', exact: true }).fill('President')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
    'updated successfully',
  )
  expect(api.members[0].photo_path).toBe(firstPath)
  expect(
    api.requests.filter((r) => r.method === 'DELETE' && r.path.startsWith('/storage')),
  ).toHaveLength(0)
  await page.getByRole('button', { name: 'Edit New Test Member' }).click()
  await page
    .getByLabel('Profile photo', { exact: true })
    .setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: imageBytes })
  await expect(page.locator('.upload-zone')).toContainText('replacement.png')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
    'updated successfully',
  )
  expect(api.members[0].photo_path).not.toBe(firstPath)
  expect(
    api.requests.some((r) => r.method === 'DELETE' && JSON.stringify(r.body).includes(firstPath!)),
  ).toBe(true)
  await page.getByRole('button', { name: 'Edit New Test Member' }).click()
  await page.getByRole('button', { name: 'Remove photo' }).click()
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
    'updated successfully',
  )
  expect(api.members[0].photo_url).toBeNull()
  await page.getByRole('button', { name: 'Delete New Test Member' }).click()
  await expect(page.getByRole('button', { name: 'Keep member' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(api.members).toHaveLength(1)
  await page.getByRole('button', { name: 'Delete New Test Member' }).click()
  await page.getByRole('button', { name: 'Delete member', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
    'deleted successfully',
  )
  expect(api.members).toHaveLength(0)
})

test('rejects invalid and oversized images without sending them to storage', async ({ page }) => {
  const api = await mockSupabase(page)
  await page.goto('/team?new=1')
  const input = page.getByLabel('Profile photo', { exact: true })
  await input.setInputFiles({
    name: 'active.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  })
  await expect(page.getByRole('alert')).toContainText('Choose a JPG, PNG, or WebP')
  await input.setInputFiles({
    name: 'too-large.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  })
  await expect(page.getByRole('alert')).toContainText('smaller than 5 MB')
  await input.setInputFiles({
    name: 'invalid.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not an image'),
  })
  await expect(page.getByRole('alert')).toContainText('could not be opened')
  expect(api.requests.filter((r) => r.path.startsWith('/storage'))).toHaveLength(0)
})

test('failed upload prevents writes; failed write cleans new photo; conflicts stay open', async ({
  page,
}) => {
  const api = await mockSupabase(page)
  await page.goto('/team')
  await page.getByRole('button', { name: 'Edit Maya Rao' }).click()
  await page
    .getByLabel('Profile photo', { exact: true })
    .setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: imageBytes })
  await expect(page.locator('.profile-preview img')).toBeVisible()
  api.failUpload = true
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('alert')).toContainText('photo could not be uploaded')
  expect(api.requests.filter((r) => r.method === 'PATCH')).toHaveLength(0)
  api.failUpload = false
  api.failWrite = true
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('alert')).toContainText('cannot make this change')
  expect(
    api.requests.filter((r) => r.method === 'DELETE' && r.path.startsWith('/storage')),
  ).toHaveLength(1)
  expect(api.members[1].photo_url).toBeNull()
  api.failWrite = false
  api.conflict = true
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('alert')).toContainText('changed or was deleted')
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('failed delete retains profile and never removes its photo; load errors recover', async ({
  page,
}) => {
  const api = await mockSupabase(page)
  api.failList = true
  await page.goto('/team')
  await expect(page.getByRole('alert')).toBeVisible()
  api.failList = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await page.getByRole('button', { name: 'Delete Maya Rao' }).click()
  api.failDelete = true
  await page.getByRole('button', { name: 'Delete member', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('cannot make this change')
  expect(api.members).toHaveLength(9)
  expect(api.requests.filter((r) => r.path.startsWith('/storage'))).toHaveLength(0)
})

test('mobile login, sidebar, directory, and editor fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockSupabase(page, { signedIn: false })
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Admin login' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true })
  await page.getByLabel('Email address').fill('admin@example.com')
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('link', { name: 'Team Members', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Team members.' })).toBeVisible()
  await expect(page.getByText('Alex D’Souza', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/team-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Add member', exact: true }).click()
  await expect(page.getByLabel('Full name')).toBeFocused()
  expect(await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  )
  await page.screenshot({ path: 'test-results/editor-mobile.png', fullPage: true })
})

test('access revocation closes protected content on focus', async ({ page }) => {
  const api = await mockSupabase(page)
  await page.goto('/team')
  await expect(page.getByText('Maya Rao', { exact: true })).toBeVisible()
  api.isAdmin = false
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('heading', { name: 'An invitation is required.' })).toBeVisible()
  await expect(page.getByText('Maya Rao', { exact: true })).not.toBeVisible()
})
