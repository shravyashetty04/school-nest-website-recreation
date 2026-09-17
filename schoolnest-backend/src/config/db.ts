import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows DNS failing on mongodb+srv SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/schoolnest';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    console.log("Will retry connecting on next request or just keep server alive.");
  }
};
