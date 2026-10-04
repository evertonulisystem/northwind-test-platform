const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { normalizeApiBody } = require('./api-envelope');

function load(file, dependencies, globals = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, Response, TextEncoder, URL,
    console: { log() {}, error() {}, warn() {} },
    require(name) { assert.ok(Object.hasOwn(dependencies, name), name); return dependencies[name]; },
    ...globals
  });
  return exports;
}

async function setup() {
  const jose = await import('jose');
  const secret = 'aula87-test-only';
  const users = {
    admin: { id: 'admin', role: 'admin', is_active: true },
    A: { id: 'A', role: 'customer', is_active: true },
    B: { id: 'B', role: 'customer', is_active: true }
  };
  users.inactive = { id: 'inactive', role: 'admin', is_active: false };
  const calls = [];
  const supabase = { from(table) {
    calls.push(['from', table]);
    const filters = {};
    let operation = 'read', values;
    return {
      select() { return this; },
      eq(key, value) { filters[key] = value; calls.push(['eq', table, key, value]); return this; },
      update(value) { operation = 'update'; values = value; calls.push(['update', table, value]); return this; },
      insert(value) { operation = 'insert'; values = value; calls.push(['insert', table, value]); return this; },
      delete() { operation = 'delete'; calls.push(['delete', table]); return this; },
      neq() { return this; }, gte() { return this; }, lte() { return this; }, order() { return this; }, range() { return this; }, limit() { return this; }, or() { return this; }, gt() { return this; }, not() { return this; },
      then(resolve, reject) { return Promise.resolve({ data: table === "payments" ? [{id:1,order_id:10}] : table === "products" ? [{id:1,name:"Produto Aula",slug:"produto-aula",stock_quantity:20}] : [], error: null, count: 0 }).then(resolve, reject); },
      async maybeSingle() { return { data: table === 'orders' ? { id: 10, user_id: 'A' } : table === 'products' && filters.id ? { id: 1, stock_quantity: 20 } : null, error: null }; },
      async single() {
        if (table === 'users') { if (operation === 'insert') users['new-user'] = { id: 'new-user', ...values }; return { data: operation === 'insert' ? users['new-user'] : users[filters.id] ?? null, error: null }; }
        if (table === 'cart_items') return { data: { id: 10, user_id: 'A', products: { stock_quantity: 20 }, ...values }, error: null };
        return { data: { id: 99, stock_quantity: 20, ...values }, error: null };
      }
    };
  } };
  const jwt = load('jwt.js', { jose }, { process: { env: { JWT_SECRET: secret } } });
  const auth = load('auth.js', {
    '@/lib/api-envelope': { normalizeApiBody }, './supabase': { supabase }, './jwt': jwt,
    'next/headers': { cookies() { throw new Error('Unexpected cookie helper'); } }
  });
  const deps = {
    '@/lib/api-envelope': { normalizeApiBody }, '@/lib/supabase': { supabase },
    '@/lib/jwt': jwt, '@/lib/auth': auth, 'next/server': { NextResponse: Response },
    'fs/promises': { default: {} }, path: { default: path }, fs: { existsSync() { throw Error('No filesystem access allowed'); } }, crypto: { default: {} },
    bcryptjs: { default: { async hash() { return 'test-hash'; } } }
  };
  async function request(identity, body, payload) {
    const token = identity === null ? null : await new jose.SignJWT(payload ?? users[identity])
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new TextEncoder().encode(secret));
    return { url: 'http://localhost/api', headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
      cookies: { get() {} }, async json() { return body; } };
  }
  async function response(value) { return { status: value.status, body: await value.json() }; }
  return { calls, users, request, response, loadRoute: file => load(file, deps, { process: { env: {}, cwd: () => '/isolated' } }) };
}

const administrative = [
 ['products/route.js','POST'], ['suppliers/route.js','POST'], ['categories/route.js','POST'],
 ['products/[id]/route.js','PUT'], ['products/[id]/route.js','PATCH'], ['products/[id]/route.js','DELETE'],
 ['products/[id]/image/route.js','POST'], ['products/[id]/pdf/route.js','POST'],
 ['products/storage/cleanup/route.js','DELETE'], ['reports/top-products/route.js','GET']
];
test('all administrative routes reject consumers, inactive users, absent and forged tokens before protected access', async () => {
 const ctx=await setup();
 for(const [file,method] of administrative) {
  const handler=ctx.loadRoute('../app/api/v1/'+file)[method];
  for(const identity of ['A','B','inactive',null]) {
   ctx.calls.length=0;
   const req=await ctx.request(identity,{role:'admin',userId:'admin'},identity ? {id:identity,role:'admin'} : undefined);
   const result=await ctx.response(await handler(req,{params:Promise.resolve({id:10})}));
   assert.equal(result.status,identity==='A'||identity==='B'?403:401,`${method} ${file} ${identity}`);
   assert.equal(result.body.data,null);
   assert.ok(result.body.mensagens.length);
   assert.ok(ctx.calls.every(c=>c[1]==='users'),file);
  }
  ctx.calls.length=0;
  const req=await ctx.request(null,{});req.headers.set('authorization','Bearer altered.token.signature');
  assert.equal((await handler(req,{params:{id:10}})).status,401);
  assert.equal(ctx.calls.length,0);
 }
});
test('admin creates product, category and supplier while retaining validation; report allowed',async()=>{
 const ctx=await setup();
 const cases=[['products/route.js',{name:'Produto Aula',price:10,stock_quantity:2,sku:'AULA87',category_id:1,supplier_id:1}],['categories/route.js',{name:'Categoria Teste',description:'Descricao teste'}],['suppliers/route.js',{company_name:'Empresa Teste',contact_name:'Maria Silva',email:'supplier@example.test',phone:'11999999999',cnpj:'12345678000190',uf:'SP'}]];
 for(const [file,body]of cases){const h=ctx.loadRoute('../app/api/v1/'+file).POST;const result=await ctx.response(await h(await ctx.request('admin',body)));assert.equal(result.status,201,JSON.stringify(result));assert.equal((await h(await ctx.request('admin',{}))).status,400);}
 assert.equal((await ctx.loadRoute('../app/api/v1/reports/top-products/route.js').GET(await ctx.request('admin',{}))).status,200);
});
test('cart owner and admin can update or delete A item, B cannot; stock validation still applies to admin',async()=>{
 const ctx=await setup(),route=ctx.loadRoute('../app/api/v1/cart/[id]/route.js');
 for(const method of ['PATCH','DELETE'])for(const identity of ['A','B','admin']){ctx.calls.length=0;const r=await ctx.response(await route[method](await ctx.request(identity,{quantity:2,userId:'A'}),{params:{id:10}}));assert.equal(r.status,identity==='B'?403:200);if(identity==='B'){assert.equal(r.body.data,null);assert.ok(!ctx.calls.some(c=>['update','delete'].includes(c[0])));} }
 assert.equal((await route.PATCH(await ctx.request('admin',{quantity:21}),{params:{id:10}})).status,400);
});
test('order details, history and payments deny B before loading related records, allow owner and admin',async()=>{
 const ctx=await setup();
 for(const suffix of ['','/history','/payments'])for(const identity of ['A','B','admin']){ctx.calls.length=0;const r=await ctx.response(await ctx.loadRoute('../app/api/v1/orders/[id]'+suffix+'/route.js').GET(await ctx.request(identity,{}),{params:{id:10}}));assert.equal(r.status,identity==='B'?403:200,JSON.stringify(r));if(identity==='B'){assert.equal(r.body.data,null);assert.ok(ctx.calls.every(c=>['users','orders'].includes(c[1])));}}
});
test('admin selects cart by existing userId; personal writes never trust supplied owner',async()=>{
 const ctx=await setup(),route=ctx.loadRoute('../app/api/v1/cart/route.js');
 for(const identity of ['A','B','admin']){ctx.calls.length=0;const req=await ctx.request(identity,{});req.url='http://localhost/api/v1/cart?userId=A';const r=await route.GET(req);assert.equal(r.status,identity==='B'?403:404);if(identity!=='B')assert.ok(ctx.calls.some(c=>c[0]==='eq'&&c[1]==='cart_items'&&c[2]==='user_id'&&c[3]==='A'));}
 ctx.calls.length=0;
 assert.equal((await route.POST(await ctx.request('B',{product_id:1,quantity:1,user_id:'A',userId:'A'}))).status,201);
 assert.equal(ctx.calls.find(c=>c[0]==='insert'&&c[1]==='cart_items')[2].user_id,'B');
});
test('new public registration receives customer, then is denied every administrative route',async()=>{
 const ctx=await setup();const body={full_name:'Maria Silva',email:'new@example.test',password:'Seguro@9876',confirmPassword:'Seguro@9876'};
 const registration=await ctx.response(await ctx.loadRoute('../app/api/v1/auth/register/route.js').POST(await ctx.request(null,body)));
 assert.equal(registration.status,201);assert.equal(registration.body.data.user.role,'customer');
 for(const [file,method]of administrative){ctx.calls.length=0;const req=await ctx.request(null,{});req.headers.set('authorization','Bearer '+registration.body.data.token);assert.equal((await ctx.loadRoute('../app/api/v1/'+file)[method](req,{params:{id:10}})).status,403);assert.ok(ctx.calls.every(c=>c[1]==='users'));}
});
test('admin product mutations execute existing handlers; invalid data remains rejected',async()=>{
 const ctx=await setup(),route=ctx.loadRoute('../app/api/v1/products/[id]/route.js');
 for(const method of ['PUT','PATCH','DELETE']){ctx.calls.length=0;const body={name:'Produto Aula',sku:'AULA87',price:10,stock_quantity:2,category_id:1,supplier_id:1};const r=await ctx.response(await route[method](await ctx.request('admin',body),{params:{id:1}}));assert.equal(r.status,200,JSON.stringify(r));assert.ok(ctx.calls.some(c=>['update','delete'].includes(c[0])));}
 assert.equal((await route.PUT(await ctx.request('admin',{}),{params:{id:1}})).status,400);
});
test('authenticated customer reads remain available and inactive users are rejected',async()=>{
 const ctx=await setup();
 for(const file of ['products/route.js','products/[id]/route.js','categories/route.js','suppliers/route.js','reviews/route.js','reviews/without-reviews/route.js']){
  const h=ctx.loadRoute('../app/api/v1/'+file).GET;
  for(const identity of ['A','B','inactive']){ctx.calls.length=0;const r=await ctx.response(await h(await ctx.request(identity,{}),{params:{id:1}}));assert.equal(r.status,identity==='inactive'?401:200,file+JSON.stringify(r));if(identity==='inactive')assert.ok(ctx.calls.every(c=>c[1]==='users'));}
 }
});
test('orders collection and personal clearCart ignore client owner and use current identity',async()=>{
 const ctx=await setup();
 for(const identity of ['A','B','admin']){ctx.calls.length=0;const req=await ctx.request(identity,{userId:'A',user_id:'A'});req.url='http://localhost/api/v1/orders?userId=A';const response=await ctx.loadRoute('../app/api/v1/orders/route.js').GET(req);assert.equal(response.status,200);const owners=ctx.calls.filter(c=>c[0]==='eq'&&c[1]==='orders'&&c[2]==='user_id');assert.equal(owners.length,identity==='admin'?0:1);if(identity!=='admin')assert.equal(owners[0][3],identity);
 ctx.calls.length=0;assert.equal((await ctx.loadRoute('../app/api/v1/cart/route.js').DELETE(req)).status,200);assert.ok(ctx.calls.some(c=>c[0]==='eq'&&c[1]==='cart_items'&&c[2]==='user_id'&&c[3]===identity));}
});
