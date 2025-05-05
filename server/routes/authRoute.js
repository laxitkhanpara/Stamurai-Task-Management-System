const express = require("express");
const { check } = require("express-validator");
const {
  register,
  login,
  getMe,
  logout,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateDetails,
  updatePassword
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation arrays
const registerValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
];

const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

const createUserValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("role", "Role is invalid").optional().isIn(['user', 'admin']),
];

const updateUserValidation = [
  check("name", "Name must be valid").optional().not().isEmpty(),
  check("email", "Email must be valid").optional().isEmail(),
  check("role", "Role is invalid").optional().isIn(['user', 'admin']),
];

const updateDetailsValidation = [
  check("name", "Name must be valid").optional().not().isEmpty(),
  check("email", "Email must be valid").optional().isEmail(),
];

const updatePasswordValidation = [
  check("currentPassword", "Current password is required").exists(),
  check(
    "newPassword",
    "New password must be at least 6 characters"
  ).isLength({ min: 6 }),
];

// Auth routes - Public access
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/logout", protect, logout);

// Current user routes - Private access
router.get("/me", protect, getMe);
router.put(
  "/updatedetails",
  [protect, updateDetailsValidation],
  updateDetails
);
router.put(
  "/updatepassword",
  [protect, updatePasswordValidation],
  updatePassword
);

// Admin user management routes - Admin access only
router.route("/users")
  .get(protect, authorize('admin'), getUsers)
  .post(
    [protect, authorize('admin'), createUserValidation],
    createUser
  );

router.route("/users/:id")
  // .get(protect, authorize('admin'), getUser)
  .get(getUser)
  .put(
    [protect, authorize('admin'), updateUserValidation],
    updateUser
  )
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;