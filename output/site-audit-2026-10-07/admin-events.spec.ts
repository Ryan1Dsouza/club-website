import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockSupabase, stamp, imageBytes } from '../../admin/tests/browser/supabase-mock';

for (const width of [320,390,768,1440]) test(`event editor layout and accessibility ${width}`, async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await mockSupabase(page);
  await page.route('**/rest/v1/events**',r=>r.fulfill({json:[]}));
  await page.goto('/events');
  await page.getByRole('button',{name:'Add event',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.screenshot({path:info.outputPath('editor.png'),fullPage:true});
  const before=await dialog.evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,viewport:innerWidth,body:document.documentElement.scrollWidth}));
  await page.locator('input[type=file]').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:imageBytes});
  await dialog.locator('img').first().scrollIntoViewIfNeeded();
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  console.log(JSON.stringify({width,geometry:before,accessibility:axe.violations.map(({id,impact,nodes})=>({id,impact,targets:nodes.map(n=>n.target)}))}));
  expect.soft(before.scroll).toBeLessThanOrEqual(before.client+1);
  expect.soft(axe.violations.map(x=>x.id)).toEqual([]);
});

test('failed photo upload followed by retry does not create duplicate events',async({page})=>{
  await mockSupabase(page);
  let inserts=0;
  await page.route('**/rest/v1/events**',async r=>{
    if(r.request().method()==='POST') {
      inserts++;
      return r.fulfill({json:{...r.request().postDataJSON(),id:`event-${inserts}`,created_at:stamp,updated_at:stamp}});
    }
    return r.fulfill({json:[]});
  });
  await page.route('**/storage/v1/object/event-photos/**',r=>r.fulfill({status:413,json:{statusCode:'413',error:'Payload too large',message:'Audit simulated upload failure'}}));
  await page.goto('/events');
  await page.getByRole('button',{name:'Add event',exact:true}).click();
  await page.locator('input[name=title]').fill('Audit workshop');
  await page.locator('textarea[name=description]').fill('A local isolated fixture to verify failed photo upload recovery.');
  await page.getByLabel('Location',{exact:false}).fill('Campus lab');
  await page.locator('input[type=file]').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:imageBytes});
  const submit=page.locator('button[type=submit]');
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('photo could not be uploaded');
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('photo could not be uploaded');
  console.log(JSON.stringify({eventInsertsAfterTwoAttempts:inserts}));
  expect(inserts).toBe(1);
});

test('member photo replacement completes after the save request',async({page})=>{
  const api=await mockSupabase(page,{empty:true});
  await page.goto('/team?new=1');
  await page.getByLabel('Full name').fill('Audit Member');
  await page.getByRole('textbox',{name:'Role',exact:true}).fill('Member');
  await page.getByLabel('Profile photo',{exact:true}).setInputFiles({name:'first.png',mimeType:'image/png',buffer:imageBytes});
  await expect(page.locator('.upload-zone')).toContainText('first.png');
  await page.getByRole('dialog').getByRole('button',{name:'Add member',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const first=api.members[0].photo_path;
  await page.getByRole('button',{name:'Edit Audit Member'}).click();
  await page.getByLabel('Profile photo',{exact:true}).setInputFiles({name:'second.png',mimeType:'image/png',buffer:imageBytes});
  await expect(page.locator('.upload-zone')).toContainText('second.png');
  await page.getByRole('button',{name:'Save changes'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(api.members[0].photo_path).not.toBe(first);
});
