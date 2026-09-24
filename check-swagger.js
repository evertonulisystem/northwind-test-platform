
try {
  const spec = require('./lib/swagger.js');
  console.log('✅ Syntax OK!');
  console.log('✅ Paths:', Object.keys(spec.paths).length, 'endpoints');
  console.log('✅ Schemas:', Object.keys(spec.components.schemas).length);
} catch (e) {
  console.error('❌ Syntax Error:');
  console.error(e);
}
