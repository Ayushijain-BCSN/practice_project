import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { User, Charity } from '@/models';
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

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { charityId, percentage } = body;

    if (!charityId || percentage == null) {
      return NextResponse.json({ error: 'Missing charityId or percentage' }, { status: 400 });
    }

    if (percentage < 10) {
      return NextResponse.json({ error: 'Minimum charity contribution is 10%' }, { status: 400 });
    }

    // Verify Charity exists
    const charity = await Charity.findById(charityId);
    if (!charity) {
      return NextResponse.json({ error: 'Invalid charity selected' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser.id,
      { charityId: charity._id, charityPercentage: percentage },
      { new: true }
    );

    return NextResponse.json({ success: true, message: 'Charity preference updated', data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
