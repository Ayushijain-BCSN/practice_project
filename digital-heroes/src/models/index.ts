import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['user'], default: 'user' },
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  charityPercentage: { type: Number, default: 10.00, min: 10.00 },
  createdAt: { type: Date, default: Date.now }
});

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const CharitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  totalRaised: { type: Number, default: 0.00 },
  createdAt: { type: Date, default: Date.now }
});

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeCustomerId: String,
  stripeSubscriptionId: { type: String, unique: true },
  status: { type: String, required: true },
  planInterval: { type: String, enum: ['month', 'year'] },
  currentPeriodEnd: Date,
  createdAt: { type: Date, default: Date.now }
});

// We enforce the 5 score limit when inserting through the API logic
const GolfScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 45 },
  datePlayed: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

GolfScoreSchema.index({ userId: 1, datePlayed: 1 }, { unique: true });

const DrawSchema = new mongoose.Schema({
  drawMonth: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },
  winningNumbers: [Number],
  totalPrizePool: { type: Number, default: 0.00 },
  createdAt: { type: Date, default: Date.now }
});

const DrawEntrySchema = new mongoose.Schema({
  drawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userNumbers: { type: [Number], required: true },
  matchCount: { type: Number, default: 0 },
  winnings: { type: Number, default: 0.00 },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  payoutStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  proofUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const Charity = mongoose.models.Charity || mongoose.model('Charity', CharitySchema);
export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export const GolfScore = mongoose.models.GolfScore || mongoose.model('GolfScore', GolfScoreSchema);
export const Draw = mongoose.models.Draw || mongoose.model('Draw', DrawSchema);
export const DrawEntry = mongoose.models.DrawEntry || mongoose.model('DrawEntry', DrawEntrySchema);
