import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';
import { sendSystemEmail, buildWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log(body);
    const { fullName, email, password } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'user',
      charityPercentage: 10.00
    });

    // Send welcome email
    await sendSystemEmail({
      to: newUser.email,
      subject: 'Welcome to Digital Heroes!',
      body: buildWelcomeEmail(newUser.fullName)
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: { id: newUser._id, email: newUser.email, fullName: newUser.fullName }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
