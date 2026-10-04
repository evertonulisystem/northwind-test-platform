// Real browser UI, isolated API fixtures. Never forwards API requests to a database.
const {chromium}=require(process.argv[2]||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const identity of ['admin','A','B','new-user']){
 const context=await browser.newContext();const page=await context.newPage();let cartWrites=0,reportReads=0;const role=identity==='admin'?'admin':'customer';
 await context.addInitScript(()=>{localStorage.setItem('token','isolated');localStorage.setItem('user',JSON.stringify({role:'admin'}));});
 await context.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url());let data=[];
 if(url.pathname.endsWith('/auth/me'))data={user:{id:identity,role,full_name:'Test User',is_active:true}};
 else if(url.pathname.endsWith('/products'))data=[{id:1,name:'Produto Teste',price:10,stock_quantity:20,sku:'TEST',slug:'produto-teste',category_id:1,supplier_id:1,categories:{name:'Categoria'},suppliers:{company_name:'Fornecedor'}}];
 else if(url.pathname.endsWith('/categories'))data=[{id:1,name:'Categoria',description:'Descricao teste'}];
 else if(url.pathname.endsWith('/suppliers'))data=[{id:1,company_name:'Fornecedor',contact_name:'Maria Silva',email:'supplier@example.test',cnpj:'12345678000190',phone:'11999999999',uf:'SP'}];
 else if(url.pathname.endsWith('/cart')&&req.method()==='POST'){cartWrites++;assert.equal(req.postDataJSON().product_id,1);data={id:10};}
 else if(url.pathname.includes('/reports/'))reportReads++;
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data,mensagens:['OK'],pagination:{page:1,total:1,totalPages:1}})});
 });
 await page.goto('http://localhost:3000/products');await page.getByTestId('view-details-product-1').waitFor();await page.getByTestId('logout-button').waitFor();
 for(const id of ['add-product-button','new-supplier-button','new-category-button','view-reports-button']){assert.equal(await page.getByTestId(id).isDisabled(),role!=='admin');if(role!=='admin')assert.equal(await page.getByTestId(id).getAttribute('title'),'Disponível apenas para administradores');}
 assert.equal(await page.getByTestId('edit-product-1').count(),role==='admin'?1:0);assert.equal(await page.getByTestId('delete-product-1').count(),role==='admin'?1:0);
 for(const id of ['product-search-input','category-filter-select','supplier-filter-select','view-reviews-button'])assert.equal(await page.getByTestId(id).isEnabled(),true);
 await page.getByTestId('product-search-input').fill('Produto');await page.getByTestId('category-filter-select').selectOption('Categoria');await page.getByTestId('supplier-filter-select').selectOption('Fornecedor');await page.getByTestId('view-details-product-1').click();
 await page.evaluate(()=>{window.__printed=false;window.open=()=>({document:{write(){},close(){}},focus(){},print(){window.__printed=true;}});});
 await page.getByTestId('product-details-print').click();await page.waitForFunction(()=>window.__printed===true);
 await page.getByTestId('modal-add-to-cart-button').click();assert.equal(cartWrites,1);
 await page.goto('http://localhost:3000/reviews');await page.getByTestId('reviews-page-title').waitFor();
 for(const [url,id]of [['categories','add-category-btn'],['suppliers','new-supplier-btn']]){await page.goto('http://localhost:3000/'+url);await page.getByTestId(id).waitFor();await page.waitForFunction(({id,disabled})=>document.querySelector('[data-testid="'+id+'"]')?.disabled===disabled,{id,disabled:role!=='admin'});assert.equal(await page.getByTestId(id).isDisabled(),role!=='admin');}
 await page.goto('http://localhost:3000/reports');if(role!=='admin'){await page.waitForURL('**/products');assert.equal(reportReads,0);}else{await page.getByTestId('limit-select').waitFor();}
 console.log('PASS browser permissions, filters, details, print, own cart and reviews:',identity);await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
