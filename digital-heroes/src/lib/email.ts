/**
 * Digital Heroes - Email Notification Service
 * 
 * In production, replace this with a real email provider like SendGrid or Resend.
 * For now, this service logs formatted emails to the terminal to simulate dispatch.
 */

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendSystemEmail({ to, subject, body }: EmailPayload): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // In production: replace with actual email provider
  // e.g., await sgMail.send({ to, from: 'noreply@digitalheroes.co.in', subject, html: body });
  
  console.log('\n========== [DIGITAL HEROES EMAIL LOG] ==========');
  console.log(`📧 TIMESTAMP : ${timestamp}`);
  console.log(`📬 TO        : ${to}`);
  console.log(`📌 SUBJECT   : ${subject}`);
  console.log(`📝 BODY      :\n${body}`);
  console.log('=================================================\n');
}

export function buildWelcomeEmail(fullName: string): string {
  return `
Hello ${fullName},

Welcome to Digital Heroes! 🏌️‍♂️

Your account is now active. Here's what you can do next:
  1. Subscribe to a Monthly or Yearly plan to enter draws.
  2. Enter your 5 latest Stableford golf scores.
  3. Choose a charity to support with a portion of your subscription.
  4. Participate in our monthly draw and win amazing prizes!

Good luck and play well,
The Digital Heroes Team
`.trim();
}

export function buildWinnerEmail(fullName: string, matchCount: number, winnings: number): string {
  const tier = matchCount === 5 ? 'Jackpot 🏆' : matchCount === 4 ? 'Top Prize 🥇' : 'Prize Winner 🎉';
  return `
Congratulations ${fullName}! You've won!

You matched ${matchCount} numbers in this month's draw — ${tier}!

Your prize amount: £${winnings.toFixed(2)}

Next Steps:
  - Log into your Digital Heroes dashboard.
  - Upload your golf score screenshot as verification proof.
  - Our admin team will review your submission within 2-3 working days.
  - Once approved, your prize will be transferred to your registered payment method.

Best of luck next month too,
The Digital Heroes Team
`.trim();
}

export function buildDrawResultsEmail(fullName: string, winningNumbers: number[]): string {
  return `
Hello ${fullName},

This month's draw has been completed!

The winning numbers were: ${winningNumbers.join(' | ')}

Log into your dashboard to see if your scores matched any of the winning numbers.

Better luck next time!
The Digital Heroes Team
`.trim();
}
