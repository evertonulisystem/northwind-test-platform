// tests/api/register.test.js
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    // Limpar mock database
    require('@/app/api/auth/register/route').users = [];
  });

  it('should create user successfully', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Teste@123'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.userId).toBeDefined();
  });

  it('should return 400 for duplicate email', async () => {
    // Primeiro registro
    await POST(new NextRequest('...', {
      body: JSON.stringify({ email: 'test@example.com', password: 'Teste@123' })
    }));

    // Segundo registro (mesmo email)
    const request = new NextRequest('...', {
      body: JSON.stringify({ email: 'test@example.com', password: 'Teste@123' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email already exists');
  });

  it('should validate password strength', async () => {
    const request = new NextRequest('...', {
      body: JSON.stringify({ email: 'test@example.com', password: 'weak' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Password must be at least 8 characters');
  });
});