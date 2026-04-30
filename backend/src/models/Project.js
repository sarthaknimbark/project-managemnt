import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
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

export const Project = mongoose.model("Project", projectSchema);
