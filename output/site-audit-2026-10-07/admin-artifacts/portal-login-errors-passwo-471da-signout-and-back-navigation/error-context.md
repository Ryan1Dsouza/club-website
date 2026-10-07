# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> login errors, password visibility, successful login, signout and back navigation
- Location: tests\browser\portal.spec.ts:17:1

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
- complementary:
  - text: NUCLEUS SJEC · MANGALURU N Nucleus workspace Website administration
  - paragraph: WORKSPACE
  - navigation "Main navigation":
    - link "Dashboard":
      - /url: /
    - link "Events":
      - /url: /events
    - link "Team Members":
      - /url: /team
    - link "Settings":
      - /url: /settings
  - text: ✳
  - heading "Made of many minds." [level=3]
  - paragraph: A little care behind the scenes. A better space for everyone.
  - link "Visit website":
    - /url: https://example.com
  - text: A
  - strong: Administrator
  - text: admin@example.com
  - button "Sign out"
- banner:
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
        - row "# MEMBER ROLE PHOTO ACTIONS":
          - columnheader "#"
          - columnheader "MEMBER"
          - columnheader "ROLE"
          - columnheader "PHOTO"
          - columnheader "ACTIONS"
      - rowgroup:
        - row "01 AD Alex D’Souza Nucleus team President Not added Edit Alex D’Souza Delete Alex D’Souza":
          - cell "01"
          - cell "AD Alex D’Souza Nucleus team":
            - text: AD
            - strong: Alex D’Souza
            - text: Nucleus team
          - cell "President"
          - cell "Not added"
          - cell "Edit Alex D’Souza Delete Alex D’Souza":
            - button "Edit Alex D’Souza"
            - button "Delete Alex D’Souza"
        - row "02 MR Maya Rao Nucleus team Design Lead Not added Edit Maya Rao Delete Maya Rao":
          - cell "02"
          - cell "MR Maya Rao Nucleus team":
            - text: MR
            - strong: Maya Rao
            - text: Nucleus team
          - cell "Design Lead"
          - cell "Not added"
          - cell "Edit Maya Rao Delete Maya Rao":
            - button "Edit Maya Rao"
            - button "Delete Maya Rao"
        - row "03 JF Jordan Fernandes Nucleus team Web Development Not added Edit Jordan Fernandes Delete Jordan Fernandes":
          - cell "03"
          - cell "JF Jordan Fernandes Nucleus team":
            - text: JF
            - strong: Jordan Fernandes
            - text: Nucleus team
          - cell "Web Development"
          - cell "Not added"
          - cell "Edit Jordan Fernandes Delete Jordan Fernandes":
            - button "Edit Jordan Fernandes"
            - button "Delete Jordan Fernandes"
        - row "04 SP Sam Pereira Nucleus team Events Lead Not added Edit Sam Pereira Delete Sam Pereira":
          - cell "04"
          - cell "SP Sam Pereira Nucleus team":
            - text: SP
            - strong: Sam Pereira
            - text: Nucleus team
          - cell "Events Lead"
          - cell "Not added"
          - cell "Edit Sam Pereira Delete Sam Pereira":
            - button "Edit Sam Pereira"
            - button "Delete Sam Pereira"
        - row "05 CT Casey Thomas Nucleus team Community Lead Not added Edit Casey Thomas Delete Casey Thomas":
          - cell "05"
          - cell "CT Casey Thomas Nucleus team":
            - text: CT
            - strong: Casey Thomas
            - text: Nucleus team
          - cell "Community Lead"
          - cell "Not added"
          - cell "Edit Casey Thomas Delete Casey Thomas":
            - button "Edit Casey Thomas"
            - button "Delete Casey Thomas"
        - row "06 AD Avery D’Souza Nucleus team Web Development Not added Edit Avery D’Souza Delete Avery D’Souza":
          - cell "06"
          - cell "AD Avery D’Souza Nucleus team":
            - text: AD
            - strong: Avery D’Souza
            - text: Nucleus team
          - cell "Web Development"
          - cell "Not added"
          - cell "Edit Avery D’Souza Delete Avery D’Souza":
            - button "Edit Avery D’Souza"
            - button "Delete Avery D’Souza"
        - row "07 JP Jamie Patel Nucleus team Design Lead Not added Edit Jamie Patel Delete Jamie Patel":
          - cell "07"
          - cell "JP Jamie Patel Nucleus team":
            - text: JP
            - strong: Jamie Patel
            - text: Nucleus team
          - cell "Design Lead"
          - cell "Not added"
          - cell "Edit Jamie Patel Delete Jamie Patel":
            - button "Edit Jamie Patel"
            - button "Delete Jamie Patel"
        - row "08 TL Taylor Lewis Nucleus team Secretary Not added Edit Taylor Lewis Delete Taylor Lewis":
          - cell "08"
          - cell "TL Taylor Lewis Nucleus team":
            - text: TL
            - strong: Taylor Lewis
            - text: Nucleus team
          - cell "Secretary"
          - cell "Not added"
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
  1   | ﻿import { expect, test } from '@playwright/test'
  2   | import AxeBuilder from '@axe-core/playwright'
  3   | import { adminId, imageBytes, mockSupabase } from './supabase-mock'
  4   | 
  5   | test('every protected route redirects without querying dashboard data', async ({ page }) => {
  6   |   const api = await mockSupabase(page, { signedIn: false })
  7   |   for (const path of ['/', '/team', '/events', '/settings', '/unknown']) {
  8   |     await page.goto(path)
  9   |     await expect(page).toHaveURL(/\/login$/)
  10  |     await expect(page.getByRole('heading', { name: 'Admin login' })).toBeVisible()
  11  |   }
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
> 30  |   await expect(page.getByRole('heading', { name: 'Team members.' })).toBeVisible()
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
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
```