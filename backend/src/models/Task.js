import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    user_name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    user_name: {
      type: String,
      required: true
    },
    detail: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assigned_to_name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do"
    },
    due_date: {
      type: Date
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    comments: [commentSchema],
    activity: [activitySchema],
    lastUpdatedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      userName: {
        type: String,
        default: ""
      }
    }
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
