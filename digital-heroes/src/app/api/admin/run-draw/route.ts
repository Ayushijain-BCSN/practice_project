import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { Draw, DrawEntry, GolfScore, Subscription, User } from '@/models';
import jwt from 'jsonwebtoken';
import { sendSystemEmail, buildWinnerEmail, buildDrawResultsEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const isSimulation = body.simulate === true;
    const logic = body.logic === 'algorithmic' ? 'algorithmic' : 'random';

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

    // 1. Find Pending Draw
    const draw = await Draw.findOne({ status: 'pending' }).sort({ drawMonth: 1 });
    if (!draw) {
      return NextResponse.json({ error: 'No pending draw found' }, { status: 400 });
    }

    // 2. Generate Winning Numbers (1 - 45)
    let winningNumbers: number[] = [];
    
    if (logic === 'random') {
      const possibleNumbers = Array.from({length: 45}, (_, i) => i + 1);
      for(let i = 0; i < 5; i++) {
          const index = Math.floor(Math.random() * possibleNumbers.length);
          winningNumbers.push(possibleNumbers[index]);
          possibleNumbers.splice(index, 1);
      }
    } else {
      // Algorithmic: Weighted by least frequent user scores
      const activeSubs = await Subscription.find({ status: 'active' });
      const activeUserIds = activeSubs.map(s => s.userId);
      const allScores = await GolfScore.find({ userId: { $in: activeUserIds } }).sort({ datePlayed: -1 });
      
      const frequency: Record<number, number> = {};
      for(let i=1; i<=45; i++) frequency[i] = 0;
      allScores.forEach(s => { if(s.score >= 1 && s.score <= 45) frequency[s.score]++; });

      // Inverse weights: numbers that appear LESS frequently get HIGHER priority
      // We'll use (Max Frequency + 1 - Current Frequency) as weight
      const maxFreq = Math.max(...Object.values(frequency));
      const weightedPool: number[] = [];
      Object.entries(frequency).forEach(([num, freq]) => {
        const weight = maxFreq - freq + 1;
        for(let w=0; w<weight; w++) weightedPool.push(parseInt(num));
      });

      // Pick 5 unique numbers from the weighted pool
      while(winningNumbers.length < 5 && weightedPool.length > 0) {
        const index = Math.floor(Math.random() * weightedPool.length);
        const picked = weightedPool[index];
        if(!winningNumbers.includes(picked)) {
          winningNumbers.push(picked);
        }
        // Remove all instances of the picked number from the weighted pool to ensure uniqueness
        const filteredPool = weightedPool.filter(n => n !== picked);
        weightedPool.length = 0;
        weightedPool.push(...filteredPool);
      }
      
      // Fallback if weighted pool is too small (unlikely)
      while(winningNumbers.length < 5) {
        const fallback = Math.floor(Math.random() * 45) + 1;
        if(!winningNumbers.includes(fallback)) winningNumbers.push(fallback);
      }
    }
    
    winningNumbers.sort((a,b) => a - b);

    // 3. Get Active Subscribers
    const activeSubs = await Subscription.find({ status: 'active' });
    const userIds = activeSubs.map(s => s.userId);

    // 4. Calculate matches
    const entries = [];
    let match5Count = 0;
    let match4Count = 0;
    let match3Count = 0;

    for (const uid of userIds) {
      // Get user's latest 5 scores
      const scores = await GolfScore.find({ userId: uid }).sort({ datePlayed: -1 }).limit(5);
      if (scores.length < 5) continue; // Skip if less than 5 scores

      const userNumbers = scores.map((s:any) => s.score);
      // Count matches
      const matchCount = userNumbers.filter((num:number) => winningNumbers.includes(num)).length;

      if (matchCount === 5) match5Count++;
      if (matchCount === 4) match4Count++;
      if (matchCount === 3) match3Count++;

      entries.push({
        drawId: draw._id,
        userId: uid,
        userNumbers,
        matchCount,
        winnings: 0, // calculated next
        verificationStatus: (matchCount >= 3) ? 'pending' : 'verified', // if they won, need to verify
        payoutStatus: 'pending'
      });
    }

    // 5. Distribute Prize Pool (40% / 35% / 25%)
    const pool = draw.totalPrizePool;
    const pool5 = pool * 0.40;
    const pool4 = pool * 0.35;
    const pool3 = pool * 0.25;

    const finalEntries = entries.map(entry => {
      if (entry.matchCount === 5 && match5Count > 0) entry.winnings = pool5 / match5Count;
      if (entry.matchCount === 4 && match4Count > 0) entry.winnings = pool4 / match4Count;
      if (entry.matchCount === 3 && match3Count > 0) entry.winnings = pool3 / match3Count;
      return entry;
    });

    let rollover = 0;
    if (match5Count === 0) {
      rollover += pool5;
    }
    // Match 4 and 3 pools do not roll over as per PRD Section 07

    if (!isSimulation) {
      // Save all entries
      if (finalEntries.length > 0) {
        await DrawEntry.insertMany(finalEntries);
      }

      // Mark current draw as published
      draw.status = 'published';
      draw.winningNumbers = winningNumbers;
      await draw.save();

      // 6. Create Next Month's Draw with rollover
      const nextMonth = new Date(draw.drawMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      await Draw.create({
        drawMonth: nextMonth,
        status: 'pending',
        totalPrizePool: rollover > 0 ? rollover : 10000
      });

      // 7. Send Email Notifications
      for (const entry of finalEntries) {
        const entryUser = await User.findById(entry.userId);
        if (!entryUser) continue;

        if (entry.matchCount >= 3) {
          // Winner email
          await sendSystemEmail({
            to: entryUser.email,
            subject: `🏆 You Won the Digital Heroes Draw!`,
            body: buildWinnerEmail(entryUser.fullName, entry.matchCount, entry.winnings)
          });
        } else {
          // General draw results email
          await sendSystemEmail({
            to: entryUser.email,
            subject: 'This Month\'s Draw Results Are In!',
            body: buildDrawResultsEmail(entryUser.fullName, winningNumbers)
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: isSimulation ? 'Simulation completed successfully (no data saved)' : 'Draw executed successfully',
      isSimulation,
      statistics: {
         winningNumbers,
         participants: finalEntries.length,
         winners: { match5: match5Count, match4: match4Count, match3: match3Count }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
