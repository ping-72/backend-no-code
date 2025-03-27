const express = require("express");
const router = express.Router();
const { body, query, param } = require("express-validator");
const {
  submitFormData,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmission,
  submitFormDataPublic,
  getFormWithSubmissions,
  getFormWithSubmissionsPublic,
} = require("../controllers/dataController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validation");

// Validation rules
const submissionValidation = [
  body("data").isObject().withMessage("Data must be an object"),
  body("status")
    .optional()
    .isIn(["draft", "submitted", "archived"])
    .withMessage("Invalid submission status"),
];

// Public submission validation
const publicSubmissionValidation = [
  body("formId").notEmpty().withMessage("Form ID is required"),
  body("userId").isMongoId().withMessage("Valid User ID is required"),
  body("sections").isArray().withMessage("Sections must be an array"),
  body("status")
    .optional()
    .isIn(["draft", "submitted", "archived"])
    .withMessage("Invalid submission status"),
];

// Form with submissions validation
const formWithSubmissionsValidation = [
  param("formId").isMongoId().withMessage("Form ID must be a valid MongoDB ID"),
];

// Public form with submissions validation
const publicFormWithSubmissionsValidation = [
  param("formId").isMongoId().withMessage("Form ID must be a valid MongoDB ID"),
  query("userId").isMongoId().withMessage("User ID must be a valid MongoDB ID"),
];

// Protected Routes - Require Authentication

// POST /:formId - Submits form data for an authenticated user
router.post(
  "/:formId",
  protect,
  submissionValidation,
  validate,
  submitFormData
);

// GET /:formId - Gets all submissions for a specific form
router.get("/:formId", protect, getFormSubmissions);

// GET /:formId/:submissionId - Gets a specific submission by ID
router.get("/:formId/:submissionId", protect, getSubmissionById);

// DELETE /:formId/:submissionId - Deletes a specific submission
router.delete("/:formId/:submissionId", protect, deleteSubmission);

// GET /form-with-submissions/:formId - Gets form data and all submissions in one request
router.get(
  "/form-with-submissions/:formId",
  protect,
  formWithSubmissionsValidation,
  validate,
  getFormWithSubmissions
);

// Public Routes - No Authentication Required

// POST /public/submit - Submits form data without requiring authentication
router.post(
  "/public/submit",
  publicSubmissionValidation,
  validate,
  submitFormDataPublic
);

// GET /public/form-with-submissions/:formId - Gets form data and all submissions without authentication
router.get(
  "/public/form-with-submissions/:formId",
  publicFormWithSubmissionsValidation,
  validate,
  getFormWithSubmissionsPublic
);

module.exports = router;
