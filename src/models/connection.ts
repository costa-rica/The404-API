import mongoose from "mongoose";

const connectDB = async () => {
	try {
		const uri = process.env.MONGODB_URI as string;
		if (!uri) throw new Error("Missing MONGODB_URI in environment variables.");

		await mongoose.connect(uri, {
			serverSelectionTimeoutMS: 2000,
		});

		console.log("✅ MongoDB connected successfully");
	} catch (error) {
		console.error("❌ MongoDB connection error:", error);
		process.exit(1);
	}
};

export default connectDB;
