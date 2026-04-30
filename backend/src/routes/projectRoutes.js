import express from "express";
import { Project } from "../models/Project.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const projects = await Project.find().sort({ updatedAt: -1 });
  return res.json(projects);
});

router.post("/", async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Project title is required" });
  }

  const project = await Project.create({
    title: title.trim(),
    description: description?.trim() || "",
    lastUpdatedBy: {
      userId: req.user._id,
      userName: req.user.name
    }
  });

  return res.status(201).json(project);
});

router.put("/:id", async (req, res) => {
  const { title, description } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (title?.trim()) project.title = title.trim();
  if (typeof description === "string") project.description = description.trim();
  project.lastUpdatedBy = {
    userId: req.user._id,
    userName: req.user.name
  };

  await project.save();
  return res.json(project);
});

export default router;
