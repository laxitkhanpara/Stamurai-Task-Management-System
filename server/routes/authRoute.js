const express = require("express");
const { check } = require("express-validator");
const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Register validation
const registerValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
];

// Login validation
const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

// Register route
router.post("/register", registerValidation, register);

// Login route
router.post("/login", loginValidation, login);

// Get current user route
router.get("/me", protect, getMe);

// Logout route
router.get("/logout", protect, logout);

module.exports = router;
