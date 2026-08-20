const mongoose = require("mongoose");
const PackCategory = require("../models/PackCategory");


// =====================================================
// GET ALL CATEGORIES
// GET /api/admin/pack-categories
// =====================================================

const getCategories = async (req, res) => {
  try {
    const categories = await PackCategory.find()
      .sort({
        sortOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "Get pack categories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// CREATE CATEGORY
// POST /api/admin/pack-categories
// =====================================================

const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      sortOrder,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing =
      await PackCategory.findOne({
        $or: [
          { name: name.trim() },
          { slug },
        ],
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Category already exists",
      });
    }

    const category =
      await PackCategory.create({
        name: name.trim(),
        slug,
        description:
          description?.trim() || "",
        image: image || "",
        sortOrder:
          Number(sortOrder) || 0,
      });

    return res.status(201).json({
      success: true,
      message:
        "Pack category created successfully",
      category,
    });
  } catch (error) {
    console.error(
      "Create pack category error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE CATEGORY
// PATCH /api/admin/pack-categories/:id
// =====================================================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category =
      await PackCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      description,
      image,
      status,
      sortOrder,
    } = req.body;

    if (name !== undefined) {
      category.name = name.trim();

      category.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (description !== undefined) {
      category.description =
        description.trim();
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (status !== undefined) {
      if (
        !["ACTIVE", "INACTIVE"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category status",
        });
      }

      category.status = status;
    }

    if (sortOrder !== undefined) {
      category.sortOrder =
        Number(sortOrder) || 0;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message:
        "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "Update pack category error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// DELETE CATEGORY
// DELETE /api/admin/pack-categories/:id
// =====================================================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category =
      await PackCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await PackCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete pack category error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};