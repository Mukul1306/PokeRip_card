const jwt = require("jsonwebtoken");

const adminOnly = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log(
      "Authorization header exists:",
      !!authHeader
    );

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader
      .replace("Bearer ", "")
      .trim();

    console.log(
      "Token exists:",
      !!token
    );

    console.log(
      "Token parts:",
      token.split(".").length
    );

    if (!token || token.split(".").length !== 3) {
      return res.status(401).json({
        success: false,
        message: "Invalid JWT format",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "Admin JWT role:",
      decoded.role
    );

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    console.error(
      "Admin auth error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = adminOnly;