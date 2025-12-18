import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log("Connected to MongoDB:", cached.conn.connection.host);
    return cached.conn;
  }  

  if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
    };

  cached.conn = await cached.promise;

  return cached.conn;
}