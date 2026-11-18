const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

for (const mode of ['add', 'edit', 'without-products', 'with-products', 'unknown-products']) {
  test(`suppliers ${mode} form renders all fields and existing action selectors`, () => {
    let index = 0;
    const dependencies = {
      react: { ...React, useEffect() {}, useState(initial) {
        const state = index++;
        if (state === 0 && mode.includes('products')) return [[{
          id: 1, company_name: 'Test Supplier', contact_name: 'Test Contact',
          email: 'supplier@example.test', phone: '11999999999', cnpj: '12345678000190', uf: 'SP',
          product_count: mode === 'with-products' ? 2 : mode === 'without-products' ? 0 : undefined,
        }], () => {}];
        if (state === 1) return [false, () => {}];
        if (state === 2) return [mode === 'add', () => {}];
        if (state === 3) return [mode === 'edit', () => {}];
        if (state === 4) return [{ id: 1, company_name: 'Test Supplier' }, () => {}];
        return [initial, () => {}];
      } },
      'next/navigation': { useRouter: () => ({ push() {} }) },
      'react-toastify': { toast: { error() {}, success() {} } },
      '@/components/usePermissions': { default: () => ({ isAdmin: true }) },
      '@/components/ToastMessage': { default: () => null },
      '@/components/UnlinkSupplierModal.jsx': { default: () => null },
      'react/jsx-runtime': require('react/jsx-runtime'),
      'lucide-react': require('lucide-react'),
    };
    const source = fs.readFileSync(require('node:path').join(__dirname, '../app/suppliers/page.js'), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
    } });
    const exports = {};
    vm.runInNewContext(outputText, { exports, console, Set, require(name) {
      assert.ok(Object.hasOwn(dependencies, name), name);
      return dependencies[name];
    } });
    const html = renderToStaticMarkup(React.createElement(exports.default));
    if (mode.includes('products')) {
      const button = html.match(/<button[^>]*data-testid="unlink-supplier-1"[^>]*>/)?.[0];
      assert.ok(button, 'unlink button remains visible with the existing selector');
      assert.equal(button.includes('disabled=""'), mode !== 'with-products');
      return;
    }
    for (const field of ['company_name', 'contact_name', 'email', 'phone', 'cnpj', 'uf']) {
      assert.ok(html.includes(`name="${field}"`), `missing ${field}`);
    }
    assert.ok(html.includes(`data-testid="${mode === 'add' ? 'save' : 'update'}-supplier-btn"`));
    assert.ok(html.includes(`data-testid="cancel-${mode}-supplier-btn"`));
  });
}
