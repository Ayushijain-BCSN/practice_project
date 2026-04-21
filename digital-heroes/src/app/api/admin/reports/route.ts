import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { User, Draw, Charity } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function GET() {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET) as any;
      if (decodedToken.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    // Aggregate statistics
    const [userCount, draws, charities] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Draw.find({}),
      Charity.find({})
    ]);

    const totalPrizePool = draws.reduce((acc, d) => acc + (d.totalPrizePool || 0), 0);
    const totalCharityRaised = charities.reduce((acc, c) => acc + (c.totalRaised || 0), 0);

    // Get historical draw summaries
    const history = await Draw.find({ status: 'published' }).sort({ drawMonth: -1 }).limit(12);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalPrizePool,
        totalCharityRaised,
        activeCharities: charities.length,
        totalDraws: draws.length,
        history
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
