import express from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

const router = express.Router();

const validStatuses = ["To Do", "In Progress", "Done"];

function validateObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

router.get("/", async (req, res) => {
  const { projectId } = req.query;
  const filter = projectId ? { project_id: projectId } : {};

  const tasks = await Task.find(filter).sort({ updatedAt: -1 });
  return res.json(tasks);
});

router.post("/", async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Only admin can create and assign tasks" });
  }

  const { title, description, assigned_to, status, due_date, project_id } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Task title is required" });
  }
  if (!project_id || !validateObjectId(project_id)) {
    return res.status(400).json({ message: "Valid project_id is required" });
  }
  if (!assigned_to || !validateObjectId(assigned_to)) {
    return res.status(400).json({ message: "Valid assigned_to user is required" });
  }

  const assignee = await User.findById(assigned_to);
  if (!assignee) {
    return res.status(404).json({ message: "Assigned user not found" });
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || "",
    assigned_to: assignee._id,
    assigned_to_name: assignee.name,
    status: validStatuses.includes(status) ? status : "To Do",
    due_date: due_date || undefined,
    project_id,
    activity: [
      {
        action: "Task created",
        user_id: req.user._id,
        user_name: req.user.name,
        detail: `Assigned to ${assignee.name}`
      }
    ],
    lastUpdatedBy: {
      userId: req.user._id,
      userName: req.user.name
    }
  });

  return res.status(201).json(task);
});

router.put("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const { title, description, assigned_to, status, due_date } = req.body;

  if (title?.trim()) task.title = title.trim();
  if (typeof description === "string") task.description = description.trim();
  if (validStatuses.includes(status)) task.status = status;
  if (due_date !== undefined) task.due_date = due_date || undefined;

  if (assigned_to && validateObjectId(assigned_to)) {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Only admin can reassign tasks" });
    }
    const assignee = await User.findById(assigned_to);
    if (!assignee) {
      return res.status(404).json({ message: "Assigned user not found" });
    }
    task.assigned_to = assignee._id;
    task.assigned_to_name = assignee.name;
  }

  task.lastUpdatedBy = {
    userId: req.user._id,
    userName: req.user.name
  };
  task.activity.push({
    action: "Task updated",
    user_id: req.user._id,
    user_name: req.user.name,
    detail: "Task details changed"
  });

  await task.save();
  return res.json(task);
});

router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.status = status;
  task.lastUpdatedBy = {
    userId: req.user._id,
    userName: req.user.name
  };
  task.activity.push({
    action: "Status changed",
    user_id: req.user._id,
    user_name: req.user.name,
    detail: `Set to ${status}`
  });

  await task.save();
  return res.json(task);
});

router.post("/:id/comments", async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.comments.push({
    text: text.trim(),
    user_id: req.user._id,
    user_name: req.user.name
  });
  task.lastUpdatedBy = {
    userId: req.user._id,
    userName: req.user.name
  };
  task.activity.push({
    action: "Comment added",
    user_id: req.user._id,
    user_name: req.user.name,
    detail: text.trim().slice(0, 80)
  });

  await task.save();
  return res.status(201).json(task);
});

export default router;
