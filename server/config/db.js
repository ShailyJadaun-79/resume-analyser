import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumeai');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Warning] Connection failed: ${error.message}`);
    console.error(`[Database Warning] Server will run with database features disabled or throwing connection errors.`);
  }
};

export default connectDB;
