const express = require("express");
const router = express.Router();
const { body, oneOf } = require("express-validator");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validation");

// Validation rules
const registerValidation = [
  oneOf(
    [
      body("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),
      body("name")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),
    ],
    "Either username or name is required and must be at least 3 characters long"
  ),

  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").exists().withMessage("Password is required"),
];

// Routes
router.post(
  "/register",
  // console.log("Requested for authorization"),
  registerValidation,
  validate,
  register
);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getProfile);

module.exports = router;
