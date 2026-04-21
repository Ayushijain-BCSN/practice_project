import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { DrawEntry, User } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Unauthorized', status: 401 };
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return { error: 'Forbidden', status: 403 };
    }
    return { data: decoded };
  } catch (e) {
    return { error: 'Unauthorized', status: 401 };
  }
}

// GET /api/admin/verify-win — fetch all pending winner verifications
export async function GET() {
  try {
    await dbConnect();
    const auth = await getAuthUser();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const pending = await DrawEntry.find({ matchCount: { $gte: 3 }, proofUrl: { $exists: true, $ne: null } })
      .populate('userId', 'fullName email')
      .populate('drawId', 'drawMonth winningNumbers')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: pending });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/verify-win — approve or reject a submission
export async function POST(request: Request) {
  try {
    await dbConnect();
    const auth = await getAuthUser();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { entryId, action } = body; // action: 'approve' | 'reject'

    if (!entryId || !action) {
      return NextResponse.json({ error: 'Missing entryId or action' }, { status: 400 });
    }

    const entry = await DrawEntry.findById(entryId);
    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    if (action === 'approve') {
      entry.verificationStatus = 'verified';
      entry.payoutStatus = 'pending'; // ready for payout
    } else if (action === 'reject') {
      entry.verificationStatus = 'rejected';
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 });
    }

    await entry.save();

    return NextResponse.json({ 
      success: true, 
      message: `Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      data: entry
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/verify-win — mark payout as completed
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const auth = await getAuthUser();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { entryId } = body;

    const entry = await DrawEntry.findById(entryId);
    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    if (entry.verificationStatus !== 'verified') {
      return NextResponse.json({ error: 'Cannot mark payout before verification is approved' }, { status: 400 });
    }

    entry.payoutStatus = 'paid';
    await entry.save();

    return NextResponse.json({ success: true, message: 'Payout marked as completed.', data: entry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
