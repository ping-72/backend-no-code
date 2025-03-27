const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "archived"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
submissionSchema.index({ userId: 1, formId: 1 });
submissionSchema.index({ submittedAt: -1 });

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
