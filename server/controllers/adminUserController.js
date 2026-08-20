const mongoose = require("mongoose");
const User = require("../models/User");

// =====================================================
// GET ALL USERS
// GET /api/admin/users
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      100
    );

    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    const filter = {
      role: "USER",
    };

    // Search by name or email
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
      totalUsers / limit
    );

    return res.status(200).json({
      success: true,

      data: {
        users,

        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET USER BY ID
// GET /api/admin/users/:id
// =====================================================

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "USER",
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get user by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE USER STATUS
// PATCH /api/admin/users/:id/status
// =====================================================

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (
      !["ACTIVE", "SUSPENDED"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be ACTIVE or SUSPENDED",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "USER",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${
        status === "ACTIVE"
          ? "activated"
          : "suspended"
      } successfully`,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// DELETE USER
// DELETE /api/admin/users/:id
// =====================================================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "USER",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.deleteOne({
      _id: id,
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};