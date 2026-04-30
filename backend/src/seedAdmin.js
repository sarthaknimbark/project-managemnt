import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";

dotenv.config();

async function run() {
  await connectDB(process.env.MONGO_URI);

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
  await User.create({
    name: process.env.ADMIN_NAME || "Admin User",
    email,
    password: passwordHash,
    isAdmin: true
  });

  console.log("Admin user created");
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
