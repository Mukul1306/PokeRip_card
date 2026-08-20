const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@pokerip.com";
    const password = "admin2026";

    const existingAdmin = await User.findOne({
      email,
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const admin = await User.create({
      name: "PokeRip Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    });

    console.log("Admin created successfully.");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:");
    console.error(error.message);

    process.exit(1);
  }
};

createAdmin();