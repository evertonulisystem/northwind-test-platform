// Shared JSON response convention. Existing data and pagination metadata stay in place.
function normalizeApiBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: body ?? null, mensagens: [] };
  }
  const { mensagens, mensagem, message, error, ...payload } = body;
  const text = mensagens ?? mensagem ?? message ?? error;
  const messages = (Array.isArray(text) ? text : text == null ? [] : [text])
    .map(value => typeof value === 'string' ? value : JSON.stringify(value));
  if (Object.hasOwn(payload, 'data')) return { ...payload, mensagens: messages };
  return { data: Object.keys(payload).length ? payload : null, mensagens: messages };
}

module.exports = { normalizeApiBody };
