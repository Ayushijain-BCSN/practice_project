import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { Charity } from '@/models';
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
      const decodedToken = jwt.verify(token, JWT_SECRET) as any;
      if (decodedToken.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    const { name, description, imageUrl } = await request.json();
    const charity = await Charity.findByIdAndUpdate(params.id, {
      name,
      description,
      imageUrl
    }, { new: true });

    if (!charity) return NextResponse.json({ error: 'Charity not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: charity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    const charity = await Charity.findByIdAndDelete(params.id);
    if (!charity) return NextResponse.json({ error: 'Charity not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Charity deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
