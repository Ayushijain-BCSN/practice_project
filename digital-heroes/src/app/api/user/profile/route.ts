import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { User, Subscription } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

// GET /api/user/profile — returns user details + subscription + charity info
export async function GET() {
  try {
    await dbConnect();
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(authUser.id).populate('charityId', 'name description imageUrl');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const subscription = await Subscription.findOne({ userId: authUser.id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        charity: user.charityId,
        charityPercentage: user.charityPercentage,
        subscription: subscription ? {
          status: subscription.status,
          planInterval: subscription.planInterval,
          currentPeriodEnd: subscription.currentPeriodEnd
        } : null
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
