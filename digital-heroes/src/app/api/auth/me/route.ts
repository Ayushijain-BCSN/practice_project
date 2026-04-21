import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import { Subscription } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Endpoint to retrieve current session info.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, role: 'guest' });
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      
      // Check database for active subscription
      await dbConnect();
      const subscription = await Subscription.findOne({ 
        userId: payload.id,
        status: 'active'
      }).sort({ createdAt: -1 });

      return NextResponse.json({
        authenticated: true,
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role || 'user',
          subscriptionActive: !!subscription
        }
      });
    } catch (error) {
      return NextResponse.json({ authenticated: false, role: 'guest' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
