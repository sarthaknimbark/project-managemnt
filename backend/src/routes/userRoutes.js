import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const users = await User.find().select("-password").sort({ name: 1 });
  return res.json(users);
});

router.post("/", adminOnly, async (req, res) => {
  const { name, email, password, avatar, isAdmin } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hash,
    avatar: avatar?.trim() || "",
    isAdmin: !!isAdmin
  });

  return res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isAdmin: user.isAdmin
  });
});

router.delete("/:id", adminOnly, async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  await User.findByIdAndDelete(req.params.id);
  return res.status(204).send();
});

export default router;
