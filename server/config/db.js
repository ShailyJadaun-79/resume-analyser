import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 DNS resolution to avoid SRV lookup failures on Windows with Node.js
dns.setDefaultResultOrder('ipv4first');

// Disable buffering commands globally so that we get instant errors when disconnected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable (5s)
      socketTimeoutMS: 45000,
    });

    console.log(`\n[Database] ✅ MongoDB Atlas Connected`);
    console.log(`[Database]    Host: ${conn.connection.host}`);
    console.log(`[Database]    Name: ${conn.connection.name}\n`);

    // Log on disconnect
    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] ⚠️  MongoDB connection lost. Attempting to reconnect...');
    });

    return true;
  } catch (error) {
    console.error(`\n[Database Error] ❌ MongoDB Connection Failed: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error(`[Database Error] Critical connection failure in production. Exiting...`);
      process.exit(1);
    }
    
    console.warn(`[Database Warning] The server is starting in "Offline Database Mode" (Development only).`);
    console.warn(`[Database Warning] Please whitelist your IP address (e.g. 0.0.0.0/0) in MongoDB Atlas to enable database features.\n`);
    return false;
  }
};

export default connectDB;
