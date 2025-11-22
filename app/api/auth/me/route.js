import { requireAuth } from '@/lib/auth';

async function handler(request, { user }) {
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }
  });
}

export const GET = requireAuth(handler);