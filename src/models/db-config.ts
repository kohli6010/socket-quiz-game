import { connect } from 'mongoose';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/myDatabase';

export const connectDB = async () => {
  try {
    await connect(uri);
    console.log('Connected to MongoDB using Mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

