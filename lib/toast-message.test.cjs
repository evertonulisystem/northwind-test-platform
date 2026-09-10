const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../components/ToastMessage.jsx'), 'utf8');
const code = ts.transpileModule(source, { fileName: 'ToastMessage.jsx', compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
for (const existing of [false, true]) test(`toast and close control get stable locators while preserving attributes (existing: ${existing})`, () => {
  const attrs = { id: '123', name: 'original', ...(existing ? { 'data-testid': 'existing-alert' } : {}) };
  const closeAttrs = { id: 'close-original', name: 'close', ...(existing ? { 'data-testid': 'existing-close' } : {}) };
  const node = a => ({ hasAttribute: k => Object.hasOwn(a,k), setAttribute: (k,v) => { assert.equal(k, 'data-testid'); a[k]=v; } });
  const close = node(closeAttrs);
  const alert = { ...node(attrs), querySelector: () => close };
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name === 'react' ? {
    useRef: () => ({ current: { closest: () => alert } }), useLayoutEffect: fn => fn()
  } : { jsx: (type, props) => ({ type, props }) } });
  const output = exports.default({ testId: 'category-update-success-toast', children: 'Updated' });
  assert.equal(attrs['data-testid'], existing ? 'existing-alert' : 'category-update-success-toast');
  assert.equal(closeAttrs['data-testid'], existing ? 'existing-close' : 'category-update-success-toast-close-btn');
  assert.equal(attrs.id, '123'); assert.equal(attrs.name, 'original');
  assert.equal(closeAttrs.id, 'close-original'); assert.equal(closeAttrs.name, 'close');
  assert.equal(output.props['data-testid'], 'category-update-success-toast-message');
});
