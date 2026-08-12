import mongoose from 'mongoose';
import { Connection } from 'mongoose';


declare global {
  var mongoose: {
    conn:  Connection | null;
    promise: Promise<Connection> | null;
  };
}

const uri = process.env.MONGODB_URI!;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
    .connect(uri, opts)
    .then(()=>mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.log("Can't connect to DB", error);
    throw error;
  }

  return cached.conn;
  
}


