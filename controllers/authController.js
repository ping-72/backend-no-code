const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Accept either username or name field (for compatibility)
    const { username, name, email, password } = req.body;

    // Use name as username if username is not provided
    const actualUsername = username || name;

    console.log("Registration attempt:", {
      username: actualUsername,
      email,
      passwordLength: password ? password.length : 0,
    });

    // Validate required fields
    if (!actualUsername || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        errors: [
          !actualUsername && "Username/name is required",
          !email && "Email is required",
          !password && "Password is required",
        ].filter(Boolean),
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      username: actualUsername,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        userId: user._id.toString(),
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", {
      email,
      passwordLength: password ? password.length : 0,
    });

    // Check for user email
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        userId: user._id.toString(),
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        userId: user._id.toString(),
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
