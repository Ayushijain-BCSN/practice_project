import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { GolfScore } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { scores } = body; // Array of { score, datePlayed, _id? }

    if (!Array.isArray(scores)) {
        return NextResponse.json({ error: 'Invalid scores format' }, { status: 400 });
    }

    // Since we maintain a "Rolling 5", the easiest way for an admin to "edit" 
    // is to replace the set. For simplicity in this demo, we'll delete and re-insert 
    // or update them if _ids are provided.
    
    // For this implementation, we'll delete current scores and insert the new ones
    // to strictly maintain the order provided by the admin.
    await GolfScore.deleteMany({ userId: params.id });

    const newScores = scores.slice(0, 5).map(s => ({
        userId: params.id,
        score: s.score,
        datePlayed: s.datePlayed
    }));

    await GolfScore.insertMany(newScores);

    return NextResponse.json({ success: true, message: 'Scores updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
