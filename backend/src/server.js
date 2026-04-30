import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { authRequired } from "./middleware/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  // Echoes request origin and enables all origins for this internal app.
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", authRoutes);
app.use("/api/projects", authRequired, projectRoutes);
app.use("/api/tasks", authRequired, taskRoutes);
app.use("/api/users", authRequired, userRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect DB", error);
    process.exit(1);
  });
