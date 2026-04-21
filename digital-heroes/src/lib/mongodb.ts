import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('🔌 Attempting to connect to MongoDB...', MONGODB_URI);
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected Successfully');
      return mongoose;
    }).catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      if (err.message.includes('bad auth')) {
        console.error('👉 Tip: Check your password in the .env file.');
      } else if (err.message.includes('ETIMEDOUT') || err.message.includes('not permitted')) {
        console.error('👉 Tip: Check if your current IP is whitelisted in MongoDB Atlas under "Network Access".');
      }
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
