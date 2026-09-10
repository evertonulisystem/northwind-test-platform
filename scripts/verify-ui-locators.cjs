// Browser integration with mocked API responses; never writes to the database.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 try {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('token', 'browser-test-token'));
  let category = { id: 1, name: 'Categoria teste', description: 'Descricao original' };
  let updates = 0;
  await page.route('**/api/v1/**', async route => {
   const request = route.request(), url = new URL(request.url());
   let body = { data: [] };
   if(url.pathname === '/api/v1/categories/1' && request.method() === 'PUT') {
    category = { ...category, ...request.postDataJSON() }; updates++;
    body = { data: category, mensagens: ['Categoria atualizada com sucesso!'] };
   } else if(url.pathname === '/api/v1/categories') body = { data: [category] };
   else if(url.pathname === '/api/v1/reviews/without-reviews') body = { data: Array.from({length:9},(_,i)=>({id:i+1,name:`Produto ${i+1}`,price:10,sales_count:1})) };
   else if(url.pathname === '/api/v1/reviews') {
    assert.equal(url.searchParams.get('limit'),'6');
    const p=Number(url.searchParams.get('page'));
    body={data:Array.from({length:p===1?6:1},(_,i)=>({id:(p-1)*6+i+1,product_id:i+1,rating:5,comment:'Avaliacao de teste',products:{name:'Produto teste'}})),pagination:{page:p,limit:6,total:7,totalPages:2}};
   }
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto('http://localhost:3000/categories');
  await page.getByTestId('edit-category-1').click();
  await page.locator('#edit-category-form input[name="name"]').fill('Categoria alterada');
  await page.getByTestId('update-category-btn').click();
  const toast = page.getByTestId('categories-handle-update-success-toast');
  await toast.waitFor();
  assert.match(await toast.innerText(),/Categoria atualizada com sucesso/);
  assert.ok(await toast.getAttribute('id'),'Toastify generated ID preserved');
  console.log('Rendered alert:', await toast.evaluate(el => el.outerHTML.slice(0, 750)));
  assert.equal(await toast.getAttribute('data-testid'), 'categories-handle-update-success-toast');
  assert.equal(updates,1);
  await page.getByTestId('categories-handle-update-success-toast-close-btn').click();
  await toast.waitFor({state:'hidden'});
  await page.reload();
  await page.getByText('Categoria alterada',{exact:true}).waitFor();
  console.log('PASS: category edit, success toast, generated ID, close button and refreshed list (mock API).');
  await page.goto('http://localhost:3000/reviews');
  await page.getByTestId('without-review-row-1').waitFor();
  assert.equal(await page.locator('[data-testid^="without-review-row-"]').count(),8);
  await page.getByTestId('without-reviews-next-page-btn').click();
  await page.getByTestId('without-review-row-9').waitFor();
  assert.equal(await page.locator('[data-testid^="without-review-row-"]').count(),1);
  assert.equal(await page.locator('[data-testid^="review-card-"]').count(),6);
  await page.getByTestId('reviews-next-page-btn').click();
  await page.getByTestId('review-card-7').waitFor();
  assert.equal(await page.locator('[data-testid^="review-card-"]').count(),1);
  assert.equal(await page.locator('[data-testid^="without-review-row-"]').count(),1);
  console.log('PASS: independent pagination, 8 products and 6 reviews per page.');
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
