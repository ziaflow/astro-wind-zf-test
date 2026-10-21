import { test, expect } from '@playwright/test';
const base='http://localhost:4321';
const pages=[
 ['website-project-estimator','Website project estimator'],
 ['lead-follow-up-assessment','Lead follow-up assessment'],
 ['software-stack-assessment','Software stack assessment'],
 ['local-visibility-check','Local visibility check'],
 ['website-conversion-checklist','Website conversion checklist'],
];
for(const [slug,title] of pages){
 test(slug+' is independently usable on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/growth-tools/'+slug+'/');
  await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Show my results'}).click();
  await expect(page.getByRole('button',{name:'Download report'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 });
}
test('unknowns stay unscored and edits require recalculation',async({page})=>{
 await page.goto(base+'/growth-tools/local-visibility-check/');
 await page.locator('select[name=profile]').selectOption('unknown');
 await page.getByRole('button',{name:'Show my results'}).click();
 await expect(page.locator('#results')).toContainText('More evidence needed');
 await page.locator('select[name=profile]').selectOption('yes');
 await expect(page.getByRole('button',{name:'Download report'})).toBeHidden();
 await page.getByRole('button',{name:'Show my results'}).click();
 await expect(page.locator('#results')).toContainText('Provisional readiness: 100/100');
 await expect(page.locator('#results')).toContainText('1 of 8 checks assessed');
});
test('estimator export preserves inputs and itemized result',async({page})=>{
 await page.goto(base+'/growth-tools/website-project-estimator/');
 await page.getByRole('button',{name:'Show my results'}).click();
 await expect(page.locator('#results')).toContainText('$6,800');
 await expect(page.locator('#results')).toContainText('68 planning hours');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download report'}).click();
 expect((await download).suggestedFilename()).toBe('website-project-estimator-report.json');
});
test('inventory overlap is a review candidate and removable',async({page})=>{
 await page.goto(base+'/growth-tools/software-stack-assessment/');
 for(const name of ['Tool A','Tool B']){
  await page.getByRole('button',{name:'Add software',exact:true}).click();
  const row=page.locator('.stack-row').last();
  await row.locator('[data-name]').fill(name);
  await row.locator('[data-function]').fill('CRM');
  await row.locator('[data-cost]').fill('25');
 }
 await page.getByRole('button',{name:'Show my results'}).click();
 await expect(page.locator('#results')).toContainText('$50/month');
 await expect(page.locator('#results')).toContainText('Review overlap in crm: Tool A, Tool B');
 await page.getByRole('button',{name:'Remove software'}).first().click();
 await expect(page.getByRole('button',{name:'Download report'})).toBeHidden();
});
test('separate tools do not reuse each other answers',async({page})=>{
 await page.goto(base+'/growth-tools/local-visibility-check/');
 await page.locator('select[name=profile]').selectOption('yes');
 await page.goto(base+'/growth-tools/lead-follow-up-assessment/');
 await expect(page.locator('select[name=capture]')).toHaveValue('');
 await page.goto(base+'/growth-tools/local-visibility-check/');
 await expect(page.locator('select[name=profile]')).toHaveValue('yes');
 await page.getByRole('button',{name:'Clear this assessment'}).click();
 await expect(page.locator('select[name=profile]')).toHaveValue('');
});
