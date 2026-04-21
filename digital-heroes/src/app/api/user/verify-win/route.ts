import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { DrawEntry } from '@/models';
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

// POST /api/user/verify-win — user uploads screenshot proof
export async function POST(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const entryId = formData.get('entryId') as string;
    const file = formData.get('proof') as File;

    if (!entryId || !file) {
      return NextResponse.json({ error: 'Missing entryId or proof file' }, { status: 400 });
    }

    // Find the draw entry and ensure it belongs to this user
    const entry = await DrawEntry.findOne({ _id: entryId, userId: user.id });
    if (!entry) {
      return NextResponse.json({ error: 'Draw entry not found' }, { status: 404 });
    }

    if (entry.matchCount < 3) {
      return NextResponse.json({ error: 'Only winners (3+ matches) need to submit proof' }, { status: 400 });
    }

    // Convert image to base64 for storage (MVP approach without S3/Supabase Storage)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;
    const proofUrl = `data:${mimeType};base64,${base64}`;

    entry.proofUrl = proofUrl;
    entry.verificationStatus = 'pending';
    await entry.save();

    return NextResponse.json({ success: true, message: 'Proof submitted. Admin will review within 2-3 working days.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/user/verify-win — user fetches their own winning entries
export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const winningEntries = await DrawEntry.find({ userId: user.id, matchCount: { $gte: 3 } })
      .populate('drawId', 'drawMonth winningNumbers')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: winningEntries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
