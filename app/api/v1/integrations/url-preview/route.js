import { requireAuth } from '@/lib/auth';
import { normalizeApiBody } from '@/lib/api-envelope';

const ALLOWED_URL = 'https://northwind-test-platform.vercel.app/api/v1/health';

function reply(data, message, status) {
  return Response.json(normalizeApiBody({ data, mensagens: [message] }), { status });
}

export const POST = requireAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return reply(null, 'URL de integração não permitida.', 400);
  }
  // Compare the original string: parsing a URL could normalize forbidden variants.
  if (body?.url !== ALLOWED_URL) {
    return reply(null, 'URL de integração não permitida.', 400);
  }

  const controller = new AbortController();
  let timer;
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error('Integration timeout'));
      }, 3000);
    });
    const integration = async () => {
      const response = await fetch(ALLOWED_URL, {
        signal: controller.signal,
        redirect: 'manual',
        cache: 'no-store'
      });
      if (!response.ok || response.redirected
        || response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        throw new Error('Invalid integration response');
      }
      const payload = await response.json();
      const status = payload?.data?.status;
      if (typeof status !== 'string' || status.trim().toLowerCase() !== 'ok') {
        throw new Error('Unexpected health status');
      }
      return { status: 'ok' };
    };
    const data = await Promise.race([integration(), timeout]);
    return reply(data, 'Integração consultada com segurança.', 200);
  } catch {
    return reply(null, 'Não foi possível consultar o serviço externo.', 502);
  } finally {
    clearTimeout(timer);
  }
});
