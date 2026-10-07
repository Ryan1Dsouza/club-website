# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-events.spec.ts >> event editor layout and accessibility 320
- Location: output\site-audit-2026-10-07\admin-events.spec.ts:5:41

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 285
Received:    555
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e7]:
        - button "Open navigation" [ref=e8] [cursor=pointer]
        - generic [ref=e10]: Workspace
        - strong [ref=e13]: Events
      - generic [ref=e14]: Admin session
    - main [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: THE MOMENTS THAT MATTER
          - heading [level=1] [ref=e21]:
            - text: Event
            - emphasis [ref=e22]: stories.
          - paragraph [ref=e23]: A home for every gathering, workshop, and new beginning.
        - button "Add event" [ref=e24] [cursor=pointer]
      - generic [ref=e26]:
        - generic [ref=e31]:
          - generic [ref=e32]: Total events
          - strong [ref=e33]: "0"
        - generic [ref=e41]:
          - generic [ref=e42]: Published
          - strong [ref=e43]: "0"
      - region "Events directory" [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]:
            - heading "All events 0" [level=2] [ref=e47]:
              - text: All events
              - generic [ref=e48]: "0"
            - paragraph [ref=e49]: Memories worth keeping.
          - button "Refresh events" [ref=e50] [cursor=pointer]
        - textbox "Search events" [ref=e61]:
          - /placeholder: Search by title, location, or category…
        - generic [ref=e62]:
          - heading "Your first event awaits." [level=3] [ref=e66]
          - paragraph [ref=e67]: Create an event to start collecting memories.
          - button "Plan your first event" [ref=e68] [cursor=pointer]
        - generic [ref=e70]:
          - generic [ref=e71]:
            - text: Showing
            - strong [ref=e72]: 0–0
            - text: of
            - strong [ref=e73]: "0"
            - text: events
          - generic [ref=e74]:
            - button [disabled] [ref=e75]
            - generic [ref=e78]:
              - text: "1"
              - generic [ref=e79]: / 1
            - button [disabled] [ref=e80]
      - dialog [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]: THE PEOPLE / NUCLEUS
            - heading "Plan a new event." [level=2] [ref=e87]
            - paragraph [ref=e88]: Get everything ready for the big day.
          - button "Close dialog" [ref=e89] [cursor=pointer]
        - generic [ref=e93]:
          - generic [ref=e95]:
            - generic [ref=e96]:
              - text: Event Title *
              - textbox "Event Title *" [active] [ref=e97]:
                - /placeholder: e.g. Beyond the baseline
            - generic [ref=e98]:
              - text: Description *
              - textbox "Description *" [ref=e99]:
                - /placeholder: Event details...
            - generic [ref=e100]:
              - generic [ref=e101]:
                - text: Start Date & Time *
                - textbox "Start Date & Time *" [ref=e102]: 2026-10-07T08:12
              - generic [ref=e103]:
                - text: End Date & Time *
                - textbox "End Date & Time *" [ref=e104]: 2026-10-07T09:12
            - generic [ref=e105]:
              - generic [ref=e106]:
                - text: Location *
                - textbox "Location *" [ref=e107]:
                  - /placeholder: e.g. Auditorium
              - generic [ref=e108]:
                - text: Category *
                - textbox "Category *" [ref=e109]:
                  - /placeholder: e.g. Workshop
                  - text: Workshop
            - generic [ref=e110]:
              - generic [ref=e111]:
                - text: Registration URL
                - generic [ref=e112]: Optional
                - textbox "Registration URL Optional" [ref=e113]:
                  - /placeholder: https://...
              - generic [ref=e114]:
                - text: External Album URL
                - generic [ref=e115]: Optional
                - textbox "External Album URL Optional" [ref=e116]:
                  - /placeholder: https://...
            - generic [ref=e117]:
              - text: Event Photos
              - generic [ref=e118]: Optional
              - generic [ref=e119]:
                - button "Event Photos Optional Upload" [ref=e121] [cursor=pointer]
                - generic [ref=e125] [cursor=pointer]: Upload
            - generic [ref=e130]:
              - checkbox "Publish to website" [ref=e131]
              - text: Publish to website
          - generic [ref=e133]:
            - button "Cancel" [ref=e134] [cursor=pointer]
            - button "Create event" [disabled] [ref=e135]
    - contentinfo [ref=e138]:
      - generic [ref=e139]: NUCLEUS / CONTROL ROOM
      - generic [ref=e140]: Made of many minds. ✳
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
> 19 |   expect.soft(before.scroll).toBeLessThanOrEqual(before.client+1);
     |                              ^ Error: expect(received).toBeLessThanOrEqual(expected)
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
  46 |   expect(inserts).toBe(1);
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