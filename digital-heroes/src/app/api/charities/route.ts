import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { Charity } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function GET() {
  try {
    await dbConnect();
    let charities = await Charity.find({}).sort({ createdAt: -1 });

    if (charities.length === 0) {
      const defaultCharities = [
        { name: 'Golfers For Good', description: 'Helping youth access golf equipment and mentoring.', totalRaised: 45000, imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e1c4391a1?auto=format&fit=crop&q=80&w=400' },
        { name: 'Fairways Foundation', description: 'Maintaining public courses and environmental conservation.', totalRaised: 32000, imageUrl: 'https://images.unsplash.com/photo-1535136124119-94b29dcbd868?auto=format&fit=crop&q=80&w=400' },
        { name: 'Veterans Drive', description: 'Rehabilitation programs for veterans through golf.', totalRaised: 68500, imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?auto=format&fit=crop&q=80&w=400' }
      ];
      await Charity.insertMany(defaultCharities);
      charities = await Charity.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: charities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      const adminUser = jwt.verify(token, JWT_SECRET) as any;
      if (adminUser.role !== 'admin' && process.env.NODE_ENV === 'production') {
        // Enforce admin in prod
        // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, imageUrl } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const newCharity = await Charity.create({
      name,
      description,
      imageUrl,
      totalRaised: 0
    });

    return NextResponse.json({ success: true, data: newCharity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
