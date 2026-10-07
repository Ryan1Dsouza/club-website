# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> create with photo, preserve on edit, replace and remove, then delete
- Location: tests\browser\portal.spec.ts:72:1

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "11111111-1111-4111-8111-111111111111/f80a578d-efcf-4f30-8591-7860b1b62bb7.webp"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - complementary [ref=e5]:
    - generic [ref=e10]:
      - text: NUCLEUS
      - generic [ref=e11]: SJEC · MANGALURU
    - generic [ref=e12]:
      - generic [ref=e13]: "N"
      - generic [ref=e14]:
        - text: Nucleus workspace
        - generic [ref=e15]: Website administration
    - paragraph [ref=e19]: WORKSPACE
    - navigation "Main navigation" [ref=e20]:
      - link "Dashboard" [ref=e21] [cursor=pointer]:
        - /url: /
      - link "Events" [ref=e30] [cursor=pointer]:
        - /url: /events
      - link "Team Members" [ref=e36] [cursor=pointer]:
        - /url: /team
      - link "Settings" [ref=e44] [cursor=pointer]:
        - /url: /settings
    - generic [ref=e51]:
      - generic [ref=e52]:
        - text: ✳
        - heading "Made of many minds." [level=3] [ref=e53]
        - paragraph [ref=e54]: A little care behind the scenes.A better space for everyone.
        - link "Visit website" [ref=e55] [cursor=pointer]:
          - /url: https://example.com
      - generic [ref=e59]:
        - generic [ref=e60]: A
        - generic [ref=e61]:
          - strong [ref=e62]: Administrator
          - generic "admin@example.com" [ref=e63]
        - button "Sign out" [ref=e64] [cursor=pointer]
  - generic [ref=e68]:
    - banner [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]: Workspace
        - strong [ref=e74]: Team Members
      - generic [ref=e75]: Admin session
    - main [ref=e81]:
      - generic [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]: TEAM DIRECTORY
          - heading "Team Members" [level=1] [ref=e85]
          - paragraph [ref=e86]: Manage the team members displayed on the public website.
        - button "Add member" [ref=e87] [cursor=pointer]
      - generic [ref=e89]:
        - generic [ref=e96]:
          - text: Total members
          - strong [ref=e97]: "1"
        - generic [ref=e101]:
          - text: Unique roles
          - strong [ref=e102]: "1"
        - generic [ref=e109]:
          - text: Profile photos
          - strong [ref=e110]: 1 / 1
      - status "Member update" [ref=e111]:
        - generic [ref=e115]: New Test Member updated successfully.
        - button "Dismiss notification" [ref=e116] [cursor=pointer]
      - region "Team directory" [ref=e120]:
        - generic [ref=e121]:
          - generic [ref=e122]:
            - heading "All members 1" [level=2] [ref=e123]:
              - text: All members
              - generic [ref=e124]: "1"
            - paragraph [ref=e125]: The minds making things happen.
          - button "Refresh members" [ref=e126] [cursor=pointer]
        - generic [ref=e132]:
          - textbox "Search members" [ref=e137]:
            - /placeholder: Search by name or role…
          - generic [ref=e138]:
            - combobox "Filter by role" [ref=e141] [cursor=pointer]:
              - option "All roles" [selected]
              - option "President"
            - combobox "Sort members" [ref=e145] [cursor=pointer]:
              - option "Newest first" [selected]
              - option "Name A–Z"
        - table [ref=e147]:
          - caption [ref=e148]: Nucleus team members and profile actions
          - rowgroup [ref=e149]:
            - row [ref=e150]:
              - columnheader "#" [ref=e151]
              - columnheader "MEMBER" [ref=e152]
              - columnheader "ROLE" [ref=e153]
              - columnheader "PHOTO" [ref=e154]
              - columnheader "ACTIONS" [ref=e155]
          - rowgroup [ref=e156]:
            - row [ref=e157]:
              - cell "01" [ref=e158]
              - cell "New Test Member Nucleus team" [ref=e159]:
                - generic [ref=e162]:
                  - strong [ref=e163]: New Test Member
                  - generic [ref=e164]: Nucleus team
              - cell "President" [ref=e165]
              - cell "Uploaded" [ref=e167]
              - cell [ref=e170]:
                - generic [ref=e171]:
                  - button "Edit New Test Member" [ref=e172] [cursor=pointer]
                  - button "Delete New Test Member" [ref=e176] [cursor=pointer]
        - generic [ref=e180]:
          - generic [ref=e181]:
            - text: Showing
            - strong [ref=e182]: 1–1
            - text: of
            - strong [ref=e183]: "1"
            - text: members
          - generic [ref=e184]:
            - button "Previous page" [disabled] [ref=e185]
            - generic [ref=e188]:
              - text: "1"
              - generic [ref=e189]: / 1
            - button "Next page" [disabled] [ref=e190]
      - generic [ref=e193]: Saved profiles are available to the Nucleus website.
      - dialog [ref=e195]:
        - generic [ref=e196]:
          - generic [ref=e197]:
            - generic [ref=e198]: THE PEOPLE / NUCLEUS
            - heading "Edit team member" [level=2] [ref=e199]
            - paragraph [ref=e200]: Keep their profile up to date.
          - button "Close dialog" [disabled] [ref=e201]
        - generic [ref=e205]:
          - generic [ref=e206]:
            - generic [ref=e207]:
              - generic [ref=e208]:
                - text: Full name *
                - textbox "Full name" [disabled] [ref=e209]:
                  - /placeholder: e.g. Alex D’Souza
                  - text: New Test Member
              - generic [ref=e210]:
                - text: Role *
                - textbox "Role" [disabled] [ref=e211]:
                  - /placeholder: e.g. Design Lead
                  - text: President
              - generic [ref=e212]:
                - generic [ref=e213]:
                  - text: Profile photo
                  - generic [ref=e214]: Optional
                - generic [ref=e215] [cursor=pointer]:
                  - strong [ref=e220]: replacement.png
                  - generic [ref=e221]: JPG, PNG, WebP or AVIF · Up to 5 MB
                  - button "Profile photo" [disabled] [ref=e222]
                - button "Remove photo" [disabled] [ref=e223]
              - paragraph [ref=e227]: A square portrait works best. Photos are optimized automatically.
            - complementary [ref=e232]:
              - generic [ref=e233]: PROFILE PREVIEW
              - generic [ref=e238]:
                - heading "New Test Member" [level=3] [ref=e239]
                - paragraph [ref=e240]: President
              - generic [ref=e241]:
                - text: ONE OF MANY MINDS.
                - generic [ref=e242]: ✳
          - generic [ref=e243]:
            - generic [ref=e244]: "* Required fields"
            - generic [ref=e245]:
              - button "Cancel" [disabled] [ref=e246]
              - button "Saving…" [disabled] [ref=e247]
    - contentinfo [ref=e249]:
      - generic [ref=e250]: NUCLEUS / CONTROL ROOM
      - generic [ref=e251]: Made of many minds. ✳
```

# Test source

```ts
  12  |   expect(api.requests.filter((r) => r.path.startsWith('/rest/'))).toHaveLength(0)
  13  |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  14  |   await page.screenshot({ path: 'test-results/login-desktop.png', fullPage: true })
  15  | })
  16  | 
  17  | test('login errors, password visibility, successful login, signout and back navigation', async ({
  18  |   page,
  19  | }) => {
  20  |   await mockSupabase(page, { signedIn: false })
  21  |   await page.goto('/team')
  22  |   await page.getByLabel('Email address').fill('admin@example.com')
  23  |   await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  24  |   await page.getByRole('button', { name: 'Show password' }).click()
  25  |   await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
  26  |   await page.getByRole('button', { name: 'Sign in' }).click()
  27  |   await expect(page.getByRole('alert')).toContainText('Unable to sign in')
  28  |   await page.getByLabel('Password', { exact: true }).fill('test-password')
  29  |   await page.getByRole('button', { name: 'Sign in' }).click()
  30  |   await expect(page.getByRole('heading', { name: 'Team members.' })).toBeVisible()
  31  |   await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  32  |   await expect(page).toHaveURL(/\/login$/)
  33  |   expect(await page.evaluate(() => localStorage.getItem('sb-portal-test-auth-token'))).toBeNull()
  34  |   await page.goBack()
  35  |   await expect(page.getByRole('heading', { name: 'Team members.' })).not.toBeVisible()
  36  | })
  37  | 
  38  | test('authenticated non-admin and forged stored session cannot open the directory', async ({
  39  |   page,
  40  | }) => {
  41  |   const api = await mockSupabase(page, { admin: false })
  42  |   await page.goto('/team')
  43  |   await expect(page.getByRole('heading', { name: 'An invitation is required.' })).toBeVisible()
  44  |   expect(api.requests.filter((r) => r.path === '/rest/v1/team_members')).toHaveLength(0)
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
> 112 |   expect(api.members[0].photo_path).not.toBe(firstPath)
      |                                         ^ Error: expect(received).not.toBe(expected) // Object.is equality
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
```