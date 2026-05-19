import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error(
            "MONGO_URI is not defined. Copy server/.env.sample to server/.env and set your MongoDB connection string."
        );
    }

    if (isConnected) {
        console.log("Using existing MongoDB connection");
        return;
    }

    try {
        const db = await mongoose.connect(mongoUri, {});
        isConnected = db.connections[0].readyState === 1;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(
            "MongoDB connection error. Update MONGO_URI in server/.env with a valid Atlas connection string.",
            error
        );
    }
};

export default connectDB;
