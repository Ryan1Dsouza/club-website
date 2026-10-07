# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> mobile login, sidebar, directory, and editor fit the viewport
- Location: tests\browser\portal.spec.ts:207:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Team members.' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Team members.' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Team members.' })

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - button "Open navigation"
  - text: Workspace
  - strong: Team Members
  - text: Admin session
- main:
  - text: TEAM DIRECTORY
  - heading "Team Members" [level=1]
  - paragraph: Manage the team members displayed on the public website.
  - button "Add member"
  - text: Total members
  - strong: "9"
  - text: Unique roles
  - strong: "7"
  - text: Profile photos
  - strong: 0 / 9
  - region "Team directory":
    - heading "All members 9" [level=2]
    - paragraph: The minds making things happen.
    - button "Refresh members"
    - textbox "Search members":
      - /placeholder: Search by name or role…
    - combobox "Filter by role":
      - option "All roles" [selected]
      - option "Community Lead"
      - option "Design Lead"
      - option "Events Lead"
      - option "President"
      - option "Secretary"
      - option "Treasurer"
      - option "Web Development"
    - combobox "Sort members":
      - option "Newest first" [selected]
      - option "Name A–Z"
    - table "Nucleus team members and profile actions":
      - caption: Nucleus team members and profile actions
      - rowgroup:
        - row "MEMBER ROLE ACTIONS":
          - columnheader "MEMBER"
          - columnheader "ROLE"
          - columnheader "ACTIONS"
      - rowgroup:
        - row "AD Alex D’Souza Nucleus team President Edit Alex D’Souza Delete Alex D’Souza":
          - cell "AD Alex D’Souza Nucleus team":
            - text: AD
            - strong: Alex D’Souza
            - text: Nucleus team
          - cell "President"
          - cell "Edit Alex D’Souza Delete Alex D’Souza":
            - button "Edit Alex D’Souza"
            - button "Delete Alex D’Souza"
        - row "MR Maya Rao Nucleus team Design Lead Edit Maya Rao Delete Maya Rao":
          - cell "MR Maya Rao Nucleus team":
            - text: MR
            - strong: Maya Rao
            - text: Nucleus team
          - cell "Design Lead"
          - cell "Edit Maya Rao Delete Maya Rao":
            - button "Edit Maya Rao"
            - button "Delete Maya Rao"
        - row "JF Jordan Fernandes Nucleus team Web Development Edit Jordan Fernandes Delete Jordan Fernandes":
          - cell "JF Jordan Fernandes Nucleus team":
            - text: JF
            - strong: Jordan Fernandes
            - text: Nucleus team
          - cell "Web Development"
          - cell "Edit Jordan Fernandes Delete Jordan Fernandes":
            - button "Edit Jordan Fernandes"
            - button "Delete Jordan Fernandes"
        - row "SP Sam Pereira Nucleus team Events Lead Edit Sam Pereira Delete Sam Pereira":
          - cell "SP Sam Pereira Nucleus team":
            - text: SP
            - strong: Sam Pereira
            - text: Nucleus team
          - cell "Events Lead"
          - cell "Edit Sam Pereira Delete Sam Pereira":
            - button "Edit Sam Pereira"
            - button "Delete Sam Pereira"
        - row "CT Casey Thomas Nucleus team Community Lead Edit Casey Thomas Delete Casey Thomas":
          - cell "CT Casey Thomas Nucleus team":
            - text: CT
            - strong: Casey Thomas
            - text: Nucleus team
          - cell "Community Lead"
          - cell "Edit Casey Thomas Delete Casey Thomas":
            - button "Edit Casey Thomas"
            - button "Delete Casey Thomas"
        - row "AD Avery D’Souza Nucleus team Web Development Edit Avery D’Souza Delete Avery D’Souza":
          - cell "AD Avery D’Souza Nucleus team":
            - text: AD
            - strong: Avery D’Souza
            - text: Nucleus team
          - cell "Web Development"
          - cell "Edit Avery D’Souza Delete Avery D’Souza":
            - button "Edit Avery D’Souza"
            - button "Delete Avery D’Souza"
        - row "JP Jamie Patel Nucleus team Design Lead Edit Jamie Patel Delete Jamie Patel":
          - cell "JP Jamie Patel Nucleus team":
            - text: JP
            - strong: Jamie Patel
            - text: Nucleus team
          - cell "Design Lead"
          - cell "Edit Jamie Patel Delete Jamie Patel":
            - button "Edit Jamie Patel"
            - button "Delete Jamie Patel"
        - row "TL Taylor Lewis Nucleus team Secretary Edit Taylor Lewis Delete Taylor Lewis":
          - cell "TL Taylor Lewis Nucleus team":
            - text: TL
            - strong: Taylor Lewis
            - text: Nucleus team
          - cell "Secretary"
          - cell "Edit Taylor Lewis Delete Taylor Lewis":
            - button "Edit Taylor Lewis"
            - button "Delete Taylor Lewis"
    - text: Showing
    - strong: 1–8
    - text: of
    - strong: "9"
    - text: members
    - button "Previous page" [disabled]
    - text: 1 / 2
    - button "Next page"
  - text: Saved profiles are available to the Nucleus website.
- contentinfo: NUCLEUS / CONTROL ROOM Made of many minds. ✳
```

# Test source

```ts
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
  145 |   await expect(page.getByRole('alert')).toContainText('Choose a JPG, PNG, or WebP')
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
> 219 |   await expect(page.getByRole('heading', { name: 'Team members.' })).toBeVisible()
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
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