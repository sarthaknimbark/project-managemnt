import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  await mongoose.connect(mongoUri, {
    dbName: "project_management"
  });
  console.log("MongoDB connected");
}
