import dns from 'dns';
// Resolve DNS using IPv4 first to avoid SRV resolution issues on Windows
dns.setDefaultResultOrder('ipv4first');

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

// Load environmental variables
dotenv.config();

const seedDatabase = async () => {
  console.log('[Seeder] Starting database seeding process...');
  
  // Connect to Database
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Database connection established.');
  } catch (error) {
    console.error(`[Seeder Error] Database connection failed: ${error.message}`);
    process.exit(1);
  }

  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@resumeai.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seeder Info] Administrator account '${adminEmail}' already exists in database.`);
    } else {
      console.log('[Seeder Action] Creating default administrator account...');
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        isVerified: true,
        role: 'admin',
      });
      console.log(`[Seeder Success] Default administrator user created:`);
      console.log(` - Email: ${adminEmail}`);
      console.log(` - Password: [Configured in Environment]`);
    }

    console.log('[Seeder Completed] Seeding finished successfully.');
  } catch (error) {
    console.error(`[Seeder Error] Seeding operation failed: ${error.message}`);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('[Seeder] Connection closed.');
    process.exit(0);
  }
};

seedDatabase();
