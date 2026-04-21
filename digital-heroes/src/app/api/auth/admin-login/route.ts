import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

/**
 * Dedicated Admin Login Route
 * Uses the exclusive Admin model for maximum security isolation.
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 1. Find administrator in the dedicated Admin collection
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid administrator credentials' }, { status: 401 });
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid administrator credentials' }, { status: 401 });
    }

    // 4. Sign Admin JWT
    const token = jwt.sign(
      { id: admin._id, role: 'admin', email: admin.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: 'admin'
      }
    });

    // 5. Set Secure HTTP-Only Cookie
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
