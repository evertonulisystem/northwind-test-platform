import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return Response.json({ error: 'Password required' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    
    return Response.json({ 
      password, 
      hash,
      message: 'Use este hash no UPDATE do banco'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}