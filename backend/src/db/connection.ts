import mongoose from 'mongoose';
import { env } from '../config/env';

let isConnected = false;

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'quickbasket',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
    isConnected = true;
  });
}

export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected gracefully');
}
