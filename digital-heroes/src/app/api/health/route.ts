import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // Check connection state
    const isConnected = mongoose.connection.readyState === 1;
    
    return NextResponse.json({ 
      status: 'success', 
      message: isConnected ? 'Connected to MongoDB successfully!' : 'Database disconnected',
      mongodb_state: mongoose.connection.readyState
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to connect to MongoDB', 
      error: error.message 
    }, { status: 500 });
  }
}
