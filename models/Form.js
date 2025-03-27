const mongoose = require("mongoose");

const rangeSchema = new mongoose.Schema({
  minValue: Number,
  maxValue: Number,
});

const functionDependencySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["function"],
    required: true,
  },
  expression: String,
  dependencies: [String],
});

const attributeSchema = new mongoose.Schema({
  attributeId: String,
  attributeName: String,
  value: mongoose.Schema.Types.Mixed, // Can be string, number, or FunctionDependency
});

const tableDataSchema = new mongoose.Schema({
  rows: [attributeSchema],
  columns: [String],
});

const dependencyConditionSchema = new mongoose.Schema({
  sectionId: String,
  questionId: String,
  expectedAnswer: mongoose.Schema.Types.Mixed,
  questionText: String,
  dependencyType: {
    type: String,
    enum: ["visibility", "options"],
    required: true,
  },
  triggerOptionId: String,
  range: [rangeSchema],
  targetOptions: [String],
});

const optionSchema = new mongoose.Schema({
  optionId: String,
  questionId: String,
  type: {
    type: String,
    enum: ["normal", "table"],
    required: true,
  },
  value: String,
  tableData: tableDataSchema,
  dependencies: [dependencyConditionSchema],
});

const questionSchema = new mongoose.Schema({
  questionId: String,
  sectionId: String,
  questionText: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "single-select",
      "multi-select",
      "integer",
      "number",
      "text",
      "linear-scale",
      "table",
    ],
    required: true,
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  dependencies: [dependencyConditionSchema],
  dependentOn: [dependencyConditionSchema],
  order: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  options: [optionSchema],
  scaleRange: {
    type: Number,
    enum: [5, 10],
  },
  scaleLabels: {
    start: String,
    end: String,
  },
});

const sectionSchema = new mongoose.Schema({
  SectionId: String,
  formId: String,
  sectionTitle: {
    type: String,
    required: true,
  },
  description: String,
  questions: [questionSchema],
  order: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const formSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formTitle: {
      type: String,
      required: true,
    },
    description: String,
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    sections: [sectionSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on userId and formId to ensure uniqueness
formSchema.index({ userId: 1, formId: 1 }, { unique: true });

// Add validation to ensure userId exists in User collection
formSchema.pre("save", async function (next) {
  try {
    const User = mongoose.model("User");
    const userExists = await User.exists({ _id: this.userId });

    if (!userExists) {
      throw new Error("Referenced user does not exist");
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
