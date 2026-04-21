import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { User, Subscription } from '@/models';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-03-25.dahlia' 
});

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

export async function POST(request: Request) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
      return NextResponse.json({ 
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.' 
      }, { status: 500 });
    }

    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json(); // 'month' or 'year'
    const priceId = plan === 'year' 
      ? process.env.STRIPE_YEARLY_PRICE_ID || 'price_mock_year' 
      : process.env.STRIPE_MONTHLY_PRICE_ID || 'price_mock_month';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
