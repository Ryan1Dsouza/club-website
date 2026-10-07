# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-events.spec.ts >> failed photo upload followed by retry does not create duplicate events
- Location: output\site-audit-2026-10-07\admin-events.spec.ts:23:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 2
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
    - generic [ref=e52]:
      - generic [ref=e53]: A
      - generic [ref=e54]:
        - strong [ref=e55]: Administrator
        - generic "admin@example.com" [ref=e56]
      - button "Sign out" [ref=e57] [cursor=pointer]
  - generic [ref=e61]:
    - banner [ref=e62]:
      - generic [ref=e63]:
        - generic [ref=e64]: Workspace
        - strong [ref=e67]: Events
      - generic [ref=e68]: Admin session
    - main [ref=e74]:
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]: THE MOMENTS THAT MATTER
          - heading [level=1] [ref=e78]:
            - text: Event
            - emphasis [ref=e79]: stories.
          - paragraph [ref=e80]: A home for every gathering, workshop, and new beginning.
        - button "Add event" [ref=e81] [cursor=pointer]
      - generic [ref=e83]:
        - generic [ref=e88]:
          - text: Total events
          - strong [ref=e89]: "0"
        - generic [ref=e97]:
          - text: Published
          - strong [ref=e98]: "0"
      - region "Events directory" [ref=e99]:
        - generic [ref=e100]:
          - generic [ref=e101]:
            - heading "All events 0" [level=2] [ref=e102]:
              - text: All events
              - generic [ref=e103]: "0"
            - paragraph [ref=e104]: Memories worth keeping.
          - button "Refresh events" [ref=e105] [cursor=pointer]
        - textbox "Search events" [ref=e116]:
          - /placeholder: Search by title, location, or category…
        - generic [ref=e117]:
          - heading "Your first event awaits." [level=3] [ref=e121]
          - paragraph [ref=e122]: Create an event to start collecting memories.
          - button "Plan your first event" [ref=e123] [cursor=pointer]
        - generic [ref=e125]:
          - generic [ref=e126]:
            - text: Showing
            - strong [ref=e127]: 0–0
            - text: of
            - strong [ref=e128]: "0"
            - text: events
          - generic [ref=e129]:
            - button [disabled] [ref=e130]
            - generic [ref=e133]:
              - text: "1"
              - generic [ref=e134]: / 1
            - button [disabled] [ref=e135]
      - dialog [ref=e138]:
        - generic [ref=e139]:
          - generic [ref=e140]:
            - generic [ref=e141]: THE PEOPLE / NUCLEUS
            - heading "Plan a new event." [level=2] [ref=e142]
            - paragraph [ref=e143]: Get everything ready for the big day.
          - button "Close dialog" [ref=e144] [cursor=pointer]
        - generic [ref=e148]:
          - generic [ref=e150]:
            - generic [ref=e151]:
              - text: Event Title *
              - textbox "Event Title *" [ref=e152]:
                - /placeholder: e.g. Beyond the baseline
                - text: Audit workshop
            - generic [ref=e153]:
              - text: Description *
              - textbox "Description *" [ref=e154]:
                - /placeholder: Event details...
                - text: A local isolated fixture to verify failed photo upload recovery.
            - generic [ref=e155]:
              - generic [ref=e156]:
                - text: Start Date & Time *
                - textbox "Start Date & Time *" [ref=e157]: 2026-10-07T08:12
              - generic [ref=e158]:
                - text: End Date & Time *
                - textbox "End Date & Time *" [ref=e159]: 2026-10-07T09:12
            - generic [ref=e160]:
              - generic [ref=e161]:
                - text: Location *
                - textbox "Location *" [ref=e162]:
                  - /placeholder: e.g. Auditorium
                  - text: Campus lab
              - generic [ref=e163]:
                - text: Category *
                - textbox "Category *" [ref=e164]:
                  - /placeholder: e.g. Workshop
                  - text: Workshop
            - generic [ref=e165]:
              - generic [ref=e166]:
                - text: Registration URL
                - generic [ref=e167]: Optional
                - textbox "Registration URL Optional" [ref=e168]:
                  - /placeholder: https://...
              - generic [ref=e169]:
                - text: External Album URL
                - generic [ref=e170]: Optional
                - textbox "External Album URL Optional" [ref=e171]:
                  - /placeholder: https://...
            - generic [ref=e172]:
              - text: Event Photos
              - generic [ref=e173]: Optional
              - generic [ref=e174]:
                - button "Event Photos Optional Upload" [ref=e176] [cursor=pointer]
                - generic [ref=e180] [cursor=pointer]: Upload
            - generic [ref=e185]:
              - checkbox "Publish to website" [ref=e186]
              - text: Publish to website
          - alert [ref=e187]: The photo could not be uploaded.
          - generic [ref=e188]:
            - generic [ref=e189]: "* Required fields"
            - generic [ref=e190]:
              - button "Cancel" [ref=e191] [cursor=pointer]
              - button "Create event" [ref=e192] [cursor=pointer]
    - contentinfo [ref=e195]:
      - generic [ref=e196]: NUCLEUS / CONTROL ROOM
      - generic [ref=e197]: Made of many minds. ✳
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import { mockSupabase, stamp, imageBytes } from '../../admin/tests/browser/supabase-mock';
  4  | 
  5  | for (const width of [320,390,768,1440]) test(`event editor layout and accessibility ${width}`, async({page},info)=>{
  6  |   await page.setViewportSize({width,height:900});
  7  |   await mockSupabase(page);
  8  |   await page.route('**/rest/v1/events**',r=>r.fulfill({json:[]}));
  9  |   await page.goto('/events');
  10 |   await page.getByRole('button',{name:'Add event',exact:true}).click();
  11 |   const dialog=page.getByRole('dialog');
  12 |   await expect(dialog).toBeVisible();
  13 |   await page.screenshot({path:info.outputPath('editor.png'),fullPage:true});
  14 |   const before=await dialog.evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,viewport:innerWidth,body:document.documentElement.scrollWidth}));
  15 |   await page.locator('input[type=file]').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:imageBytes});
  16 |   await dialog.locator('img').first().scrollIntoViewIfNeeded();
  17 |   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  18 |   console.log(JSON.stringify({width,geometry:before,accessibility:axe.violations.map(({id,impact,nodes})=>({id,impact,targets:nodes.map(n=>n.target)}))}));
  19 |   expect.soft(before.scroll).toBeLessThanOrEqual(before.client+1);
  20 |   expect.soft(axe.violations.map(x=>x.id)).toEqual([]);
  21 | });
  22 | 
  23 | test('failed photo upload followed by retry does not create duplicate events',async({page})=>{
  24 |   await mockSupabase(page);
  25 |   let inserts=0;
  26 |   await page.route('**/rest/v1/events**',async r=>{
  27 |     if(r.request().method()==='POST') {
  28 |       inserts++;
  29 |       return r.fulfill({json:{...r.request().postDataJSON(),id:`event-${inserts}`,created_at:stamp,updated_at:stamp}});
  30 |     }
  31 |     return r.fulfill({json:[]});
  32 |   });
  33 |   await page.route('**/storage/v1/object/event-photos/**',r=>r.fulfill({status:413,json:{statusCode:'413',error:'Payload too large',message:'Audit simulated upload failure'}}));
  34 |   await page.goto('/events');
  35 |   await page.getByRole('button',{name:'Add event',exact:true}).click();
  36 |   await page.locator('input[name=title]').fill('Audit workshop');
  37 |   await page.locator('textarea[name=description]').fill('A local isolated fixture to verify failed photo upload recovery.');
  38 |   await page.getByLabel('Location',{exact:false}).fill('Campus lab');
  39 |   await page.locator('input[type=file]').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:imageBytes});
  40 |   const submit=page.locator('button[type=submit]');
  41 |   await submit.click();
  42 |   await expect(page.getByRole('alert')).toContainText('photo could not be uploaded');
  43 |   await submit.click();
  44 |   await expect(page.getByRole('alert')).toContainText('photo could not be uploaded');
  45 |   console.log(JSON.stringify({eventInsertsAfterTwoAttempts:inserts}));
> 46 |   expect(inserts).toBe(1);
     |                   ^ Error: expect(received).toBe(expected) // Object.is equality
  47 | });
  48 | 
  49 | test('member photo replacement completes after the save request',async({page})=>{
  50 |   const api=await mockSupabase(page,{empty:true});
  51 |   await page.goto('/team?new=1');
  52 |   await page.getByLabel('Full name').fill('Audit Member');
  53 |   await page.getByRole('textbox',{name:'Role',exact:true}).fill('Member');
  54 |   await page.getByLabel('Profile photo',{exact:true}).setInputFiles({name:'first.png',mimeType:'image/png',buffer:imageBytes});
  55 |   await expect(page.locator('.upload-zone')).toContainText('first.png');
  56 |   await page.getByRole('dialog').getByRole('button',{name:'Add member',exact:true}).click();
  57 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  58 |   const first=api.members[0].photo_path;
  59 |   await page.getByRole('button',{name:'Edit Audit Member'}).click();
  60 |   await page.getByLabel('Profile photo',{exact:true}).setInputFiles({name:'second.png',mimeType:'image/png',buffer:imageBytes});
  61 |   await expect(page.locator('.upload-zone')).toContainText('second.png');
  62 |   await page.getByRole('button',{name:'Save changes'}).click();
  63 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  64 |   expect(api.members[0].photo_path).not.toBe(first);
  65 | });
  66 | 
```