'use server';

import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/konektly';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || DEFAULT_URI;
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}


