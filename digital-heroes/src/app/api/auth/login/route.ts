import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Safety check: Prevent administrators from logging in through the user portal
    if ((user as any).role === 'admin') {
      return NextResponse.json({ 
        error: 'Administrator account detected. Please use the dedicated Admin Login portal.',
        redirect: '/admin-login' 
      }, { status: 403 });
    }

    // Check credentials
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Sign Token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user._id, email: user.email, fullName: user.fullName }
    });

    // Set HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
