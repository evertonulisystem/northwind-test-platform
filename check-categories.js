// Falha se opera??es publicadas desaparecerem ou contratos forem alterados.
require("./lib/openapi/categories.test");
const spec = require('./lib/swagger.js');
console.log('===== VALIDAÇÃO CATEGORIES (contrato publicado + exemplos gerados) =====\n');

console.log('OpenAPI version:', spec.openapi);
console.log('Title:', spec.info.title);
console.log();

const categoriesPaths = Object.keys(spec.paths).filter(p => p.startsWith('/api/v1/categories'));
console.log('Paths /api/v1/categories* encontrados:', categoriesPaths.length);

let totalStatusCodes = 0;
let totalWithExample = 0;
let totalWithoutExample = 0;
let missingList = [];

categoriesPaths.sort().forEach(path => {
  const methods = spec.paths[path];
  Object.keys(methods || {}).sort().forEach(method => {
    const op = methods[method];
    console.log('\n' + method.toUpperCase() + ' ' + path);
    console.log('  Tags:', JSON.stringify(op.tags));
    console.log('  Summary:', op.summary || '(sem summary)');
    Object.keys(op.responses || {}).sort().forEach(status => {
      totalStatusCodes++;
      const resp = op.responses[status];
      let hasExample = false;
      const isRef = !!resp['$ref'];
      if (resp.content) {
        Object.keys(resp.content).forEach(ct => {
          const mediaType = resp.content[ct];
          if (mediaType.example || mediaType.examples) hasExample = true;
        });
      }
      if (isRef) hasExample = true;
      if (hasExample) totalWithExample++;
      else {
        totalWithoutExample++;
        missingList.push(method.toUpperCase() + ' ' + path + ' [' + status + ']');
      }
      console.log('    ' + status + ': example=' + (hasExample ? 'YES' : 'NO - PROBLEM') + (isRef ? ' (via $ref)' : ''));
    });
  });
});

console.log('\n========== TOTAIS ==========');
console.log('Paths /categories*:   ' + categoriesPaths.length);
console.log('Status codes:         ' + totalStatusCodes);
console.log('  Com example:        ' + totalWithExample);
console.log('  SEM example:        ' + totalWithoutExample);
if (missingList.length > 0) {
  console.log('\nFALTANTES:');
  missingList.forEach(m => console.log('  - ' + m));
} else {
  console.log('\n[OK] 100% dos status codes de Categories possuem example value!');
}

console.log('\nLista de paths gerados para Categories:');
categoriesPaths.sort().forEach(p => {
  console.log('  -', p, Object.keys(spec.paths[p]).sort().join(' | ').toUpperCase());
});
