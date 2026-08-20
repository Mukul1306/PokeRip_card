const User = require("../models/User");

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Admin profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "USER",
    });

    const activeUsers = await User.countDocuments({
      role: "USER",
      status: "ACTIVE",
    });

    const suspendedUsers = await User.countDocuments({
      role: "USER",
      status: "SUSPENDED",
    });

    res.status(200).json({
      success: true,

      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  getAdminProfile,
  getAdminDashboard,
};