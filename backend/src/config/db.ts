import mongoose from 'mongoose';
import { dataStore } from '../services/dataStore';
import { seedDatabase } from '../scripts/seed';

export const connectDB = async () => {
  // Ensure seed data is present in dataStore first
  if (!dataStore.hasData()) {
    await seedDatabase();
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/societyfund';
  
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log('📦 Connected to MongoDB successfully.');
    dataStore.setMongoConnected(true);
  } catch (error) {
    console.log('🔄 Running in persistent JSON/Memory Store mode.');
    dataStore.setMongoConnected(false);
  }
};
