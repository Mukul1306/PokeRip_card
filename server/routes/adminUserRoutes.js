const express = require("express");

const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} = require("../controllers/adminUserController");

const router = express.Router();


// Get users
router.get(
  "/",
  adminOnly,
  getAllUsers
);


// Get single user
router.get(
  "/:id",
  adminOnly,
  getUserById
);


// Activate / suspend user
router.patch(
  "/:id/status",
  adminOnly,
  updateUserStatus
);


// Delete user
router.delete(
  "/:id",
  adminOnly,
  deleteUser
);


module.exports = router;