const mongoose = require("mongoose");

const Pack = require("../models/Pack");
const Card = require("../models/Card");
const PackCategory = require("../models/PackCategory");


// =====================================================
// HELPER
// =====================================================

const makeSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};


// =====================================================
// GET ALL PACKS
// GET /api/admin/packs
// =====================================================

const getAllPacks = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      100
    );

    const search =
      req.query.search?.trim() || "";

    const status =
      req.query.status?.trim() || "";

    const category =
      req.query.category?.trim() || "";

    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (
      status &&
      [
        "DRAFT",
        "PUBLISHED",
        "PAUSED",
        "ARCHIVED",
      ].includes(status)
    ) {
      filter.status = status;
    }

    if (
      category &&
      mongoose.Types.ObjectId.isValid(category)
    ) {
      filter.category = category;
    }

    const [packs, totalPacks] =
      await Promise.all([
        Pack.find(filter)
          .populate(
            "category",
            "name slug image"
          )
          .populate(
            "cards.card",
            "name tcgId imageSmall imageLarge set rarity number"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit),

        Pack.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,

      data: {
        packs,

        pagination: {
          page,
          limit,
          totalPacks,
          totalPages: Math.ceil(
            totalPacks / limit
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get all packs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET PACK BY ID
// GET /api/admin/packs/:id
// =====================================================

const getPackById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const pack = await Pack.findById(id)
      .populate(
        "category",
        "name slug image"
      )
      .populate(
        "cards.card",
        "name tcgId imageSmall imageLarge set rarity number"
      );

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    return res.status(200).json({
      success: true,
      pack,
    });
  } catch (error) {
    console.error(
      "Get pack by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// CREATE PACK
// POST /api/admin/packs
// =====================================================

const createPack = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      category,
      price,
      totalStock,
      cards,
      status,
    } = req.body;

    // -------------------------
    // Validation
    // -------------------------

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pack name is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message:
          "Pack category is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        category
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pack category",
      });
    }

    const categoryExists =
      await PackCategory.findOne({
        _id: category,
        status: "ACTIVE",
      });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message:
          "Pack category not found or inactive",
      });
    }

    const numericPrice =
      Number(price);

    const numericStock =
      Number(totalStock);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack price",
      });
    }

    if (
      !Number.isInteger(
        numericStock
      ) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a positive whole number",
      });
    }

    // -------------------------
    // Validate cards
    // -------------------------

    const submittedCards =
      Array.isArray(cards)
        ? cards
        : [];

    const cardIds =
      submittedCards.map(
        (item) =>
          item.card
      );

    const uniqueCardIds =
      [...new Set(
        cardIds.map(String)
      )];

    if (
      uniqueCardIds.some(
        (id) =>
          !mongoose.Types.ObjectId.isValid(
            id
          )
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid card ID in pack",
      });
    }

    if (uniqueCardIds.length > 0) {
      const existingCards =
        await Card.countDocuments({
          _id: {
            $in: uniqueCardIds,
          },
          status: "ACTIVE",
        });

      if (
        existingCards !==
        uniqueCardIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more cards do not exist",
        });
      }
    }

    // -------------------------
    // Build cards
    // -------------------------

    const packCards =
      submittedCards.map(
        (item) => ({
          card: item.card,

          pullWeight:
            Number(
              item.pullWeight
            ) || 0,

          quantity:
            Number(
              item.quantity
            ) || 0,
        })
      );

    // -------------------------
    // Slug
    // -------------------------

    const baseSlug =
      makeSlug(name);

    let slug = baseSlug;

    let counter = 1;

    while (
      await Pack.exists({ slug })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // -------------------------
    // Status
    // -------------------------

    const packStatus = [
      "DRAFT",
      "PUBLISHED",
      "PAUSED",
    ].includes(status)
      ? status
      : "DRAFT";

    // -------------------------
    // Create
    // -------------------------

    const pack =
      await Pack.create({
        name: name.trim(),

        slug,

        description:
          description?.trim() || "",

        image:
          image || "",

        category,

        price: numericPrice,

        totalStock:
          numericStock,

        cards: packCards,

        status: packStatus,

        createdBy:
          req.user?._id || null,
      });

    const populatedPack =
      await Pack.findById(
        pack._id
      )
        .populate(
          "category",
          "name slug image"
        )
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number"
        );

    return res.status(201).json({
      success: true,

      message:
        "Pack created successfully",

      pack: populatedPack,
    });
  } catch (error) {
    console.error(
      "Create pack error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE PACK
// PATCH /api/admin/packs/:id
// =====================================================

const updatePack = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const pack =
      await Pack.findById(id);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    const {
      name,
      description,
      image,
      category,
      price,
      totalStock,
      cards,
      status,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Pack name cannot be empty",
        });
      }

      pack.name = name.trim();
    }

    if (
      category !== undefined
    ) {
      if (
        !mongoose.Types.ObjectId.isValid(
          category
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category",
        });
      }

      const categoryExists =
        await PackCategory.findOne({
          _id: category,
          status: "ACTIVE",
        });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message:
            "Category not found or inactive",
        });
      }

      pack.category = category;
    }

    if (
      price !== undefined
    ) {
      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid price",
        });
      }

      pack.price =
        numericPrice;
    }

    if (
      totalStock !== undefined
    ) {
      const numericStock =
        Number(totalStock);

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid stock",
        });
      }

      pack.totalStock =
        numericStock;
    }

    if (
      description !== undefined
    ) {
      pack.description =
        description.trim();
    }

    if (
      image !== undefined
    ) {
      pack.image = image;
    }

    if (
      Array.isArray(cards)
    ) {
      const cardIds =
        cards.map(
          (item) =>
            item.card
        );

      const uniqueCardIds =
        [...new Set(
          cardIds.map(String)
        )];

      const existingCards =
        await Card.countDocuments({
          _id: {
            $in: uniqueCardIds,
          },
          status: "ACTIVE",
        });

      if (
        existingCards !==
        uniqueCardIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more cards are invalid",
        });
      }

      pack.cards =
        cards.map(
          (item) => ({
            card: item.card,
            pullWeight:
              Number(
                item.pullWeight
              ) || 0,
            quantity:
              Number(
                item.quantity
              ) || 0,
          })
        );
    }

    if (
      status !== undefined
    ) {
      if (
        ![
          "DRAFT",
          "PUBLISHED",
          "PAUSED",
          "ARCHIVED",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid pack status",
        });
      }

      pack.status = status;
    }

    if (name !== undefined) {
      const baseSlug =
        makeSlug(name);

      let slug = baseSlug;

      let counter = 1;

      while (
        await Pack.exists({
          slug,
          _id: {
            $ne: pack._id,
          },
        })
      ) {
        slug =
          `${baseSlug}-${counter}`;
        counter++;
      }

      pack.slug = slug;
    }

    await pack.save();

    const updatedPack =
      await Pack.findById(
        pack._id
      )
        .populate(
          "category",
          "name slug image"
        )
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number"
        );

    return res.status(200).json({
      success: true,
      message:
        "Pack updated successfully",
      pack: updatedPack,
    });
  } catch (error) {
    console.error(
      "Update pack error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE STATUS
// PATCH /api/admin/packs/:id/status
// =====================================================

const updatePackStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    if (
      ![
        "DRAFT",
        "PUBLISHED",
        "PAUSED",
        "ARCHIVED",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pack status",
      });
    }

    const pack =
      await Pack.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Pack status updated",
      pack,
    });
  } catch (error) {
    console.error(
      "Update pack status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// DELETE / ARCHIVE PACK
// DELETE /api/admin/packs/:id
// =====================================================

const deletePack = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    const pack =
      await Pack.findById(id);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    // Archive instead of hard delete.
    pack.status = "ARCHIVED";

    await pack.save();

    return res.status(200).json({
      success: true,
      message:
        "Pack archived successfully",
    });
  } catch (error) {
    console.error(
      "Delete pack error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  getAllPacks,
  getPackById,
  createPack,
  updatePack,
  updatePackStatus,
  deletePack,
};