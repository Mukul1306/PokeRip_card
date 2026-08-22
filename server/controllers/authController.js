const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,

      // NEVER accept role from frontend
      role: "USER",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// REQUEST PASSWORD CHANGE
const requestPasswordChange = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only hashed token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;

    // Token valid for 15 minutes
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();
    console.log("PASSWORD RESET TOKEN SAVED");
console.log("User ID:", user._id);
console.log("Token hash:", hashedToken);
console.log("Expires:", new Date(user.passwordResetExpires));

    // Frontend URL
const resetUrl =
  `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"PokeRip" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Change Your PokeRip Password",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          border-radius: 12px;
        ">

          <h2 style="color: #f22;">
            PokeRip
          </h2>

          <h1>Change Your Password</h1>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to change the password
            for your PokeRip account.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 14px 24px;
              background: #ff2222;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Change Password
          </a>

          <p style="margin-top: 25px;">
            This link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request this password change,
            you can safely ignore this email.
          </p>

          <p>
            Thanks,<br>
            PokeRip Team
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password change link sent to your registered email",
    });

  } catch (error) {
    console.error("Request password change error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send password change email",
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check passwords
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required",
      });
    }

    // Check matching passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Minimum password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the token received from email
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    console.log("RESET PASSWORD REQUEST");
console.log("Token hash received:", hashedToken);

const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: {
    $gt: Date.now(),
  },
});

console.log("User found:", !!user);

if (user) {
  console.log("User ID:", user._id);
  console.log(
    "Token expiry:",
    new Date(user.passwordResetExpires)
  );
}

    // Token invalid or expired
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    user.password = hashedPassword;

    // Remove reset token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordChange,
  resetPassword,
};