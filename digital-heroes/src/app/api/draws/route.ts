import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Draw } from '@/models';

export async function GET() {
  try {
    await dbConnect();
    
    // Attempt to find the upcoming active draw
    let draw = await Draw.findOne({ status: 'pending' }).sort({ drawMonth: 1 });

    // Seed mock draw for demo if empty
    if (!draw) {
      draw = await Draw.create({
        drawMonth: new Date('2026-05-01T00:00:00Z'),
        status: 'pending',
        totalPrizePool: 24500,
        winningNumbers: []
      });
    }

    return NextResponse.json({ success: true, data: draw });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
