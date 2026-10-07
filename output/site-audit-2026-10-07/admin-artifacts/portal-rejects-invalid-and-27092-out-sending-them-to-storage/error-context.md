# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> rejects invalid and oversized images without sending them to storage
- Location: tests\browser\portal.spec.ts:136:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('alert')
Expected substring: "Choose a JPG, PNG, or WebP"
Received string:    "Choose a JPG, PNG, WebP, or AVIF image."
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')
    13 × locator resolved to <p role="alert" class="notice error modal-notice">Choose a JPG, PNG, WebP, or AVIF image.</p>
       - unexpected value "Choose a JPG, PNG, WebP, or AVIF image."

```

```yaml
- alert: Choose a JPG, PNG, WebP, or AVIF image.
```

# Test source

```ts
  45  |   api.authInvalid = true
  46  |   await page.getByRole('button', { name: 'Try again' }).click()
  47  |   await expect(page).toHaveURL(/\/login$/)
  48  |   expect(api.requests.filter((r) => r.path === '/rest/v1/team_members')).toHaveLength(0)
  49  | })
  50  | 
  51  | test('directory filters, pagination, accessible desktop layout and dashboard', async ({ page }) => {
  52  |   await mockSupabase(page)
  53  |   await page.goto('/team')
  54  |   await expect(page.getByText('Alex D’Souza', { exact: true })).toBeVisible()
  55  |   await expect(page.getByText('Morgan Kumar', { exact: true })).not.toBeVisible()
  56  |   await page.getByRole('button', { name: 'Next page' }).click()
  57  |   await expect(page.getByText('Morgan Kumar', { exact: true })).toBeVisible()
  58  |   await page.getByLabel('Search members').fill('maya')
  59  |   await expect(page.getByText('Maya Rao', { exact: true })).toBeVisible()
  60  |   await page.getByRole('button', { name: 'Clear search' }).click()
  61  |   await page.getByLabel('Filter by role').selectOption('Design Lead')
  62  |   await expect(page.locator('tbody tr')).toHaveCount(2)
  63  |   await page.getByLabel('Filter by role').selectOption('all')
  64  |   await page.getByLabel('Sort members').selectOption('name')
  65  |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  66  |   await page.screenshot({ path: 'test-results/team-desktop.png', fullPage: true })
  67  |   await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
  68  |   await expect(page.getByRole('heading', { name: 'The control room.' })).toBeVisible()
  69  |   await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true })
  70  | })
  71  | 
  72  | test('create with photo, preserve on edit, replace and remove, then delete', async ({ page }) => {
  73  |   const api = await mockSupabase(page, { empty: true })
  74  |   await page.goto('/team')
  75  |   await page.getByRole('button', { name: 'Add member', exact: true }).click()
  76  |   await page.getByLabel('Full name').fill('New Test Member')
  77  |   await page.getByRole('textbox', { name: 'Role', exact: true }).fill('Design Lead')
  78  |   await page
  79  |     .getByLabel('Profile photo', { exact: true })
  80  |     .setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: imageBytes })
  81  |   await expect(page.locator('.profile-preview img')).toBeVisible()
  82  |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  83  |   await page.screenshot({ path: 'test-results/member-editor.png', fullPage: true })
  84  |   // Returning from the file picker or another window must not destroy the form.
  85  |   await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  86  |   await expect(page.getByLabel('Full name')).toHaveValue('New Test Member')
  87  |   await page.getByRole('dialog').getByRole('button', { name: 'Add member', exact: true }).click()
  88  |   await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
  89  |     'added successfully',
  90  |   )
  91  |   expect(api.members[0].photo_url).toMatch(new RegExp(`/team-photos/${adminId}/.+\\.webp$`))
  92  |   const firstPath = api.members[0].photo_path
  93  |   await page.getByRole('button', { name: 'Edit New Test Member' }).click()
  94  |   await page.getByRole('textbox', { name: 'Role', exact: true }).fill('President')
  95  |   await page.getByRole('button', { name: 'Save changes' }).click()
  96  |   await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
  97  |     'updated successfully',
  98  |   )
  99  |   expect(api.members[0].photo_path).toBe(firstPath)
  100 |   expect(
  101 |     api.requests.filter((r) => r.method === 'DELETE' && r.path.startsWith('/storage')),
  102 |   ).toHaveLength(0)
  103 |   await page.getByRole('button', { name: 'Edit New Test Member' }).click()
  104 |   await page
  105 |     .getByLabel('Profile photo', { exact: true })
  106 |     .setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: imageBytes })
  107 |   await expect(page.locator('.upload-zone')).toContainText('replacement.png')
  108 |   await page.getByRole('button', { name: 'Save changes' }).click()
  109 |   await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
  110 |     'updated successfully',
  111 |   )
  112 |   expect(api.members[0].photo_path).not.toBe(firstPath)
  113 |   expect(
  114 |     api.requests.some((r) => r.method === 'DELETE' && JSON.stringify(r.body).includes(firstPath!)),
  115 |   ).toBe(true)
  116 |   await page.getByRole('button', { name: 'Edit New Test Member' }).click()
  117 |   await page.getByRole('button', { name: 'Remove photo' }).click()
  118 |   await page.getByRole('button', { name: 'Save changes' }).click()
  119 |   await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
  120 |     'updated successfully',
  121 |   )
  122 |   expect(api.members[0].photo_url).toBeNull()
  123 |   await page.getByRole('button', { name: 'Delete New Test Member' }).click()
  124 |   await expect(page.getByRole('button', { name: 'Keep member' })).toBeFocused()
  125 |   await page.keyboard.press('Escape')
  126 |   await expect(page.getByRole('dialog')).not.toBeVisible()
  127 |   expect(api.members).toHaveLength(1)
  128 |   await page.getByRole('button', { name: 'Delete New Test Member' }).click()
  129 |   await page.getByRole('button', { name: 'Delete member', exact: true }).click()
  130 |   await expect(page.getByRole('status', { name: 'Member update' })).toContainText(
  131 |     'deleted successfully',
  132 |   )
  133 |   expect(api.members).toHaveLength(0)
  134 | })
  135 | 
  136 | test('rejects invalid and oversized images without sending them to storage', async ({ page }) => {
  137 |   const api = await mockSupabase(page)
  138 |   await page.goto('/team?new=1')
  139 |   const input = page.getByLabel('Profile photo', { exact: true })
  140 |   await input.setInputFiles({
  141 |     name: 'active.svg',
  142 |     mimeType: 'image/svg+xml',
  143 |     buffer: Buffer.from('<svg/>'),
  144 |   })
> 145 |   await expect(page.getByRole('alert')).toContainText('Choose a JPG, PNG, or WebP')
      |                                         ^ Error: expect(locator).toContainText(expected) failed
  146 |   await input.setInputFiles({
  147 |     name: 'too-large.png',
  148 |     mimeType: 'image/png',
  149 |     buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  150 |   })
  151 |   await expect(page.getByRole('alert')).toContainText('smaller than 5 MB')
  152 |   await input.setInputFiles({
  153 |     name: 'invalid.png',
  154 |     mimeType: 'image/png',
  155 |     buffer: Buffer.from('not an image'),
  156 |   })
  157 |   await expect(page.getByRole('alert')).toContainText('could not be opened')
  158 |   expect(api.requests.filter((r) => r.path.startsWith('/storage'))).toHaveLength(0)
  159 | })
  160 | 
  161 | test('failed upload prevents writes; failed write cleans new photo; conflicts stay open', async ({
  162 |   page,
  163 | }) => {
  164 |   const api = await mockSupabase(page)
  165 |   await page.goto('/team')
  166 |   await page.getByRole('button', { name: 'Edit Maya Rao' }).click()
  167 |   await page
  168 |     .getByLabel('Profile photo', { exact: true })
  169 |     .setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: imageBytes })
  170 |   await expect(page.locator('.profile-preview img')).toBeVisible()
  171 |   api.failUpload = true
  172 |   await page.getByRole('button', { name: 'Save changes' }).click()
  173 |   await expect(page.getByRole('alert')).toContainText('photo could not be uploaded')
  174 |   expect(api.requests.filter((r) => r.method === 'PATCH')).toHaveLength(0)
  175 |   api.failUpload = false
  176 |   api.failWrite = true
  177 |   await page.getByRole('button', { name: 'Save changes' }).click()
  178 |   await expect(page.getByRole('alert')).toContainText('cannot make this change')
  179 |   expect(
  180 |     api.requests.filter((r) => r.method === 'DELETE' && r.path.startsWith('/storage')),
  181 |   ).toHaveLength(1)
  182 |   expect(api.members[1].photo_url).toBeNull()
  183 |   api.failWrite = false
  184 |   api.conflict = true
  185 |   await page.getByRole('button', { name: 'Save changes' }).click()
  186 |   await expect(page.getByRole('alert')).toContainText('changed or was deleted')
  187 |   await expect(page.getByRole('dialog')).toBeVisible()
  188 | })
  189 | 
  190 | test('failed delete retains profile and never removes its photo; load errors recover', async ({
  191 |   page,
  192 | }) => {
  193 |   const api = await mockSupabase(page)
  194 |   api.failList = true
  195 |   await page.goto('/team')
  196 |   await expect(page.getByRole('alert')).toBeVisible()
  197 |   api.failList = false
  198 |   await page.getByRole('button', { name: 'Try again' }).click()
  199 |   await page.getByRole('button', { name: 'Delete Maya Rao' }).click()
  200 |   api.failDelete = true
  201 |   await page.getByRole('button', { name: 'Delete member', exact: true }).click()
  202 |   await expect(page.getByRole('alert')).toContainText('cannot make this change')
  203 |   expect(api.members).toHaveLength(9)
  204 |   expect(api.requests.filter((r) => r.path.startsWith('/storage'))).toHaveLength(0)
  205 | })
  206 | 
  207 | test('mobile login, sidebar, directory, and editor fit the viewport', async ({ page }) => {
  208 |   await page.setViewportSize({ width: 390, height: 844 })
  209 |   await mockSupabase(page, { signedIn: false })
  210 |   await page.goto('/login')
  211 |   await expect(page.getByRole('heading', { name: 'Admin login' })).toBeVisible()
  212 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  213 |   await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true })
  214 |   await page.getByLabel('Email address').fill('admin@example.com')
  215 |   await page.getByLabel('Password', { exact: true }).fill('test-password')
  216 |   await page.getByRole('button', { name: 'Sign in' }).click()
  217 |   await page.getByRole('button', { name: 'Open navigation' }).click()
  218 |   await page.getByRole('link', { name: 'Team Members', exact: true }).click()
  219 |   await expect(page.getByRole('heading', { name: 'Team members.' })).toBeVisible()
  220 |   await expect(page.getByText('Alex D’Souza', { exact: true })).toBeVisible()
  221 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  222 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  223 |   await page.screenshot({ path: 'test-results/team-mobile.png', fullPage: true })
  224 |   await page.getByRole('button', { name: 'Add member', exact: true }).click()
  225 |   await expect(page.getByLabel('Full name')).toBeFocused()
  226 |   expect(await page.getByRole('dialog').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
  227 |     true,
  228 |   )
  229 |   await page.screenshot({ path: 'test-results/editor-mobile.png', fullPage: true })
  230 | })
  231 | 
  232 | test('access revocation closes protected content on focus', async ({ page }) => {
  233 |   const api = await mockSupabase(page)
  234 |   await page.goto('/team')
  235 |   await expect(page.getByText('Maya Rao', { exact: true })).toBeVisible()
  236 |   api.isAdmin = false
  237 |   await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  238 |   await expect(page.getByRole('heading', { name: 'An invitation is required.' })).toBeVisible()
  239 |   await expect(page.getByText('Maya Rao', { exact: true })).not.toBeVisible()
  240 | })
  241 | 
```