const express = require("express");
const router = express.Router();
const { body, query, param } = require("express-validator");
const {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  updateFormByFormId,
  getFormByFormId,
  getFormPublic,
} = require("../controllers/formController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validation");

// Validation rules
const formValidation = [
  body("formTitle").trim().notEmpty().withMessage("Form title is required"),
  body("order").isInt().withMessage("Order must be an integer"),
  body("sections").isArray().withMessage("Sections must be an array"),
  body("sections.*.SectionId").optional().isString(),
  body("sections.*.sectionTitle")
    .trim()
    .notEmpty()
    .withMessage("Section title is required"),
  body("sections.*.order")
    .isInt()
    .withMessage("Section order must be an integer"),
  body("sections.*.questions")
    .isArray()
    .withMessage("Questions must be an array"),
  body("sections.*.questions.*.questionId").optional().isString(),
  body("sections.*.questions.*.questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required"),
  body("sections.*.questions.*.type")
    .isIn([
      "single-select",
      "multi-select",
      "integer",
      "number",
      "text",
      "linear-scale",
      "table",
    ])
    .withMessage("Invalid question type"),
  body("sections.*.questions.*.order")
    .isInt()
    .withMessage("Question order must be an integer"),
  body("sections.*.questions.*.scaleRange")
    .optional()
    .isIn([5, 10])
    .withMessage("Scale range must be either 5 or 10"),
  body("sections.*.questions.*.scaleLabels")
    .optional()
    .isObject()
    .withMessage("Scale labels must be an object"),
  body("sections.*.questions.*.scaleLabels.start").optional().isString(),
  body("sections.*.questions.*.scaleLabels.end").optional().isString(),
  body("sections.*.questions.*.options")
    .isArray()
    .withMessage("Options must be an array"),
  body("sections.*.questions.*.options.*.optionId").optional().isString(),
  body("sections.*.questions.*.options.*.type")
    .isIn(["normal", "table"])
    .withMessage("Invalid option type"),
  body("sections.*.questions.*.options.*.value").optional().isString(),
  body("sections.*.questions.*.options.*.tableData")
    .optional()
    .isObject()
    .withMessage("Table data must be an object"),
  body("sections.*.questions.*.options.*.tableData.rows").optional().isArray(),
  body("sections.*.questions.*.options.*.tableData.columns")
    .optional()
    .isArray(),
  body("sections.*.questions.*.dependencies")
    .optional()
    .isArray()
    .withMessage("Dependencies must be an array"),
  body("sections.*.questions.*.dependencies.*.dependencyType")
    .optional()
    .isIn(["visibility", "options"])
    .withMessage("Invalid dependency type"),
  body("sections.*.questions.*.dependencies.*.range")
    .optional()
    .isArray()
    .withMessage("Range must be an array"),
  body("sections.*.questions.*.dependencies.*.range.*.minValue")
    .optional()
    .isNumeric(),
  body("sections.*.questions.*.dependencies.*.range.*.maxValue")
    .optional()
    .isNumeric(),
];

// Additional validation for userId
const userIdValidation = [
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ID"),
];

// Public route validation
const publicFormValidation = [
  param("formId").notEmpty().withMessage("Form ID is required"),
  query("userId")
    .isMongoId()
    .withMessage("Valid User ID is required as a query parameter"),
];

// Protected Routes
// Creates a new form for the authenticated user
router.post("/", protect, formValidation, validate, createForm);
// Retrieves all forms that belong to the authenticated user
router.get("/", protect, getForms);

// Routes to work with formId
// Retrieves a specific form by custom formId for the authenticated user
router.get("/byFormId/:formId", protect, getFormByFormId);
// Updates a specific form by custom formId, allows specifying userId in request body
router.put(
  "/byFormId/:formId",
  protect,
  [...formValidation, ...userIdValidation],
  validate,
  updateFormByFormId
);

// Public Routes (no authentication required)
// Retrieves form data publicly using formId and userId query parameter without authentication
router.get("/public/:formId", publicFormValidation, validate, getFormPublic);

// More general routes that match any ID - these must come AFTER more specific routes
// Retrieves a specific form by MongoDB ID for the authenticated user
router.get("/:formId", protect, getFormById);
// Updates a specific form by MongoDB ID for the authenticated user
router.put("/:formId", protect, formValidation, validate, updateForm);
// Deletes a specific form by MongoDB ID for the authenticated user
router.delete("/:formId", protect, deleteForm);

module.exports = router;
