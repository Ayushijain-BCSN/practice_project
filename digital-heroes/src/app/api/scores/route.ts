import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { GolfScore, User } from '@/models';
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

export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scores = await GolfScore.find({ userId: user.id }).sort({ datePlayed: -1 }).limit(5);
    return NextResponse.json({ success: true, data: scores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { score, datePlayed } = body;

    if (score == null || !datePlayed) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    score = Number(score);
    if (isNaN(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
    }

    // Check if score already exists for date
    const existingScore = await GolfScore.findOne({ userId: user.id, datePlayed: new Date(datePlayed) });
    if (existingScore) {
       return NextResponse.json({ error: 'Only one score entry is permitted per date.' }, { status: 400 });
    }

    await GolfScore.create({
      userId: user.id,
      score,
      datePlayed: new Date(datePlayed)
    });

    // Enforce 5-score limit
    const allScores = await GolfScore.find({ userId: user.id }).sort({ datePlayed: -1 });
    if (allScores.length > 5) {
      const scoresToDelete = allScores.slice(5);
      const idsToDelete = scoresToDelete.map(s => s._id);
      await GolfScore.deleteMany({ _id: { $in: idsToDelete } });
    }

    return NextResponse.json({ success: true, message: 'Score saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
