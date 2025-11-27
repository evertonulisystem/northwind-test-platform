// app/api/auth/login/route.js (só a parte final)

const response = Response.redirect(new URL('/products', request.url));
response.cookies.set({
  name: 'auth-token',
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
});
return response;