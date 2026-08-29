const mongoose = require("mongoose");

const Pack = require("../models/Pack");
const Card = require("../models/Card");
const PackCategory = require("../models/PackCategory");
const cloudinary = require("../config/cloudinary");

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
// CLOUDINARY UPLOAD
// =====================================================

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pokerip/packs",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
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

    // =================================================
    // SEARCH
    // =================================================

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // =================================================
    // STATUS
    // =================================================

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

    // =================================================
    // CATEGORY
    // =================================================

    if (
      category &&
      mongoose.Types.ObjectId.isValid(category)
    ) {
      filter.category = category;
    }

    // =================================================
    // GET PACKS
    // =================================================

    const [packs, totalPacks] =
      await Promise.all([
        Pack.find(filter)
          .populate(
            "category",
            "name slug image minPrice maxPrice status"
          )
          .populate(
            "cards.card",
            "name tcgId imageSmall imageLarge set rarity number price"
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
        "name slug image minPrice maxPrice status"
      )
      .populate(
        "cards.card",
        "name tcgId imageSmall imageLarge set rarity number price"
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
//
// IMPORTANT:
//
// category    = category selected by admin
// packPrice   = selling price of the pack
//
// Card price range comes AUTOMATICALLY
// from PackCategory.minPrice / maxPrice
// =====================================================

const createPack = async (req, res) => {
  try {
    // =================================================
    // IMAGE
    // =================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Pack image is required",
      });
    }

    // =================================================
    // UPLOAD IMAGE
    // =================================================

    let uploadedImageUrl = "";

    if (req.file) {
      const uploadResult =
        await uploadToCloudinary(
          req.file.buffer
        );

      uploadedImageUrl =
        uploadResult.secure_url;
    }

    // =================================================
    // BODY
    // =================================================

    const {
      name,
      description,
      category,
      packPrice,
      totalStock,
      cardsPerPack,
      status,
    } = req.body;

    // =================================================
    // NAME
    // =================================================

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pack name is required",
      });
    }

    // =================================================
    // CATEGORY
    // =================================================

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

    // =================================================
    // FETCH CATEGORY
    //
    // THIS IS IMPORTANT
    //
    // We DO NOT trust minPrice/maxPrice
    // sent from frontend.
    //
    // We get them directly from database.
    // =================================================

    const categoryData =
      await PackCategory.findOne({
        _id: category,
        status: "ACTIVE",
      });

    if (!categoryData) {
      return res.status(400).json({
        success: false,
        message:
          "Pack category not found or inactive",
      });
    }

    // =================================================
    // AUTOMATIC CATEGORY PRICE RANGE
    // =================================================

    const categoryMinPrice =
      Number(categoryData.minPrice);

    const categoryMaxPrice =
      categoryData.maxPrice === null ||
      categoryData.maxPrice === undefined
        ? null
        : Number(categoryData.maxPrice);

    if (
      !Number.isFinite(
        categoryMinPrice
      ) ||
      categoryMinPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category minimum price",
      });
    }

    if (
      categoryMaxPrice !== null &&
      (
        !Number.isFinite(
          categoryMaxPrice
        ) ||
        categoryMaxPrice <
          categoryMinPrice
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category maximum price",
      });
    }

    // =================================================
    // PACK PRICE
    //
    // This is the price admin sets for the pack.
    // =================================================

    const numericPackPrice =
      Number(packPrice);

    if (
      !Number.isFinite(
        numericPackPrice
      ) ||
      numericPackPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pack price",
      });
    }

    // =================================================
    // STOCK
    // =================================================

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
          "Stock must be a positive whole number",
      });
    }

    // =================================================
    // CARDS PER PACK
    // =================================================

    const numericCardsPerPack =
      Number(cardsPerPack);

    if (
      !Number.isInteger(
        numericCardsPerPack
      ) ||
      numericCardsPerPack < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cards per pack must be a positive whole number",
      });
    }

    // =================================================
    // FIND CARDS USING CATEGORY PRICE RANGE
    // =================================================

    const cardPriceFilter = {
      status: "ACTIVE",

      price: {
        $gte: categoryMinPrice,
      },
    };

    // If category has maximum price,
    // add $lte.
    if (categoryMaxPrice !== null) {
      cardPriceFilter.price.$lte =
        categoryMaxPrice;
    }

    // =================================================
    // GET AVAILABLE CARDS
    // =================================================

    const availableCards =
      await Card.find(
        cardPriceFilter
      );

    console.log(
      "===================================="
    );

    console.log(
      "PACK CATEGORY:",
      categoryData.name
    );

    console.log(
      "CATEGORY MIN PRICE:",
      categoryMinPrice
    );

    console.log(
      "CATEGORY MAX PRICE:",
      categoryMaxPrice
    );

    console.log(
      "AVAILABLE CARDS:",
      availableCards.length
    );

    console.log(
      "===================================="
    );

    // =================================================
    // NO CARDS
    // =================================================

    if (
      availableCards.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No active cards are available in this category price range",
      });
    }

    // =================================================
    // NOT ENOUGH CARDS
    // =================================================

    if (
      availableCards.length <
      numericCardsPerPack
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Only ${availableCards.length} cards are available in this category price range. ` +
          `You need ${numericCardsPerPack} cards.`,
      });
    }

    // =================================================
    // RANDOM CARD SELECTION
    // =================================================

    const shuffledCards =
      [...availableCards].sort(
        () => Math.random() - 0.5
      );

    const selectedCards =
      shuffledCards.slice(
        0,
        numericCardsPerPack
      );

    // =================================================
    // CREATE PACK CARD RECORDS
    // =================================================

    const packCards =
      selectedCards.map(
        (card) => ({
          card: card._id,
          pullWeight: 1,
          quantity: 1,
        })
      );

    console.log(
      "Selected random cards:",
      selectedCards.map(
        (card) => ({
          id: card._id,
          name: card.name,
          price: card.price,
        })
      )
    );

    // =================================================
    // SLUG
    // =================================================

    const baseSlug =
      makeSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (
      await Pack.exists({
        slug,
      })
    ) {
      slug =
        `${baseSlug}-${counter}`;

      counter++;
    }

    // =================================================
    // STATUS
    // =================================================

    const packStatus = [
      "DRAFT",
      "PUBLISHED",
      "PAUSED",
      "ARCHIVED",
    ].includes(status)
      ? status
      : "DRAFT";

    // =================================================
    // CREATE PACK
    // =================================================

    const pack =
      await Pack.create({
        name: name.trim(),

        slug,

        description:
          description?.trim() || "",

        image:
          uploadedImageUrl,

        // CATEGORY
        category,

        // =================================================
        // PACK SELLING PRICE
        // =================================================

        packPrice:
          numericPackPrice,

        // =================================================
        // CARD PRICE RANGE
        //
        // Automatically taken from category.
        // =================================================

        priceRange: {
          min:
            categoryMinPrice,

          max:
            categoryMaxPrice,
        },

        cardsPerPack:
          numericCardsPerPack,

        totalStock:
          numericStock,

        // RANDOMLY SELECTED CARDS
        cards:
          packCards,

        status:
          packStatus,

        createdBy:
          req.user?._id || null,
      });

    // =================================================
    // POPULATE RESPONSE
    // =================================================

    const populatedPack =
      await Pack.findById(
        pack._id
      )
        .populate(
          "category",
          "name slug image minPrice maxPrice status"
        )
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number price"
        );

    return res.status(201).json({
      success: true,

      message:
        "Pack created successfully",

      pack:
        populatedPack,
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
    const { id } =
      req.params;

    // =================================================
    // ID VALIDATION
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pack ID",
      });
    }

    // =================================================
    // FIND PACK
    // =================================================

    const pack =
      await Pack.findById(id);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: "Pack not found",
      });
    }

    // =================================================
    // BODY
    // =================================================

    const {
      name,
      description,
      category,
      packPrice,
      totalStock,
      cardsPerPack,
      status,
    } = req.body;

    // =================================================
    // NAME
    // =================================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Pack name cannot be empty",
        });
      }

      pack.name =
        name.trim();
    }

    // =================================================
    // CATEGORY
    // =================================================

    let categoryData = null;

    if (category !== undefined) {
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

      categoryData =
        await PackCategory.findOne({
          _id: category,
          status: "ACTIVE",
        });

      if (!categoryData) {
        return res.status(400).json({
          success: false,
          message:
            "Category not found or inactive",
        });
      }

      pack.category =
        category;
    } else {
      // Use existing category
      categoryData =
        await PackCategory.findById(
          pack.category
        );
    }

    // =================================================
    // CATEGORY PRICE RANGE
    //
    // Always get range from category.
    // =================================================

    if (categoryData) {
      const categoryMinPrice =
        Number(
          categoryData.minPrice
        );

      const categoryMaxPrice =
        categoryData.maxPrice === null ||
        categoryData.maxPrice === undefined
          ? null
          : Number(
              categoryData.maxPrice
            );

      if (
        !Number.isFinite(
          categoryMinPrice
        ) ||
        categoryMinPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category minimum price",
        });
      }

      if (
        categoryMaxPrice !== null &&
        (
          !Number.isFinite(
            categoryMaxPrice
          ) ||
          categoryMaxPrice <
            categoryMinPrice
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category maximum price",
        });
      }

      // Automatically update pack range
      pack.priceRange = {
        min:
          categoryMinPrice,

        max:
          categoryMaxPrice,
      };
    }

    // =================================================
    // PACK PRICE
    // =================================================

    if (
      packPrice !== undefined
    ) {
      const numericPackPrice =
        Number(packPrice);

      if (
        !Number.isFinite(
          numericPackPrice
        ) ||
        numericPackPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid pack price",
        });
      }

      pack.packPrice =
        numericPackPrice;
    }

    // =================================================
    // STOCK
    // =================================================

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

    // =================================================
    // CARDS PER PACK
    // =================================================

    if (
      cardsPerPack !== undefined
    ) {
      const numericCardsPerPack =
        Number(cardsPerPack);

      if (
        !Number.isInteger(
          numericCardsPerPack
        ) ||
        numericCardsPerPack < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cards per pack must be a positive whole number",
        });
      }

      pack.cardsPerPack =
        numericCardsPerPack;
    }

    // =================================================
    // DESCRIPTION
    // =================================================

    if (
      description !== undefined
    ) {
      pack.description =
        description.trim();
    }

    // =================================================
    // PACK IMAGE
    // =================================================

    if (req.file) {
      const uploadResult =
        await uploadToCloudinary(
          req.file.buffer
        );

      pack.image =
        uploadResult.secure_url;
    }

    // =================================================
    // STATUS
    // =================================================

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

      pack.status =
        status;
    }

    // =================================================
    // SLUG
    // =================================================

    if (
      name !== undefined
    ) {
      const baseSlug =
        makeSlug(name);

      let slug =
        baseSlug;

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

      pack.slug =
        slug;
    }

    // =================================================
    // SAVE
    // =================================================

    await pack.save();

    // =================================================
    // POPULATED RESPONSE
    // =================================================

    const updatedPack =
      await Pack.findById(
        pack._id
      )
        .populate(
          "category",
          "name slug image minPrice maxPrice status"
        )
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number price"
        );

    return res.status(200).json({
      success: true,

      message:
        "Pack updated successfully",

      pack:
        updatedPack,
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
// UPDATE PACK STATUS
// PATCH /api/admin/packs/:id/status
//
// ARCHIVE:
// {
//   "status": "ARCHIVED"
// }
//
// UNARCHIVE:
// {
//   "status": "PUBLISHED"
// }
// =====================================================

const updatePackStatus = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const { status } =
      req.body;

    // =================================================
    // ID VALIDATION
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pack ID",
      });
    }

    // =================================================
    // STATUS VALIDATION
    // =================================================

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

    // =================================================
    // UPDATE
    // =================================================

    const pack =
      await Pack.findByIdAndUpdate(
        id,

        {
          status,
        },

        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "category",
          "name slug image minPrice maxPrice status"
        )
        .populate(
          "cards.card",
          "name tcgId imageSmall imageLarge set rarity number price"
        );

    // =================================================
    // NOT FOUND
    // =================================================

    if (!pack) {
      return res.status(404).json({
        success: false,
        message:
          "Pack not found",
      });
    }

    // =================================================
    // MESSAGE
    // =================================================

    let message =
      "Pack status updated";

    if (
      status === "ARCHIVED"
    ) {
      message =
        "Pack archived successfully";
    }

    if (
      status === "PUBLISHED"
    ) {
      message =
        "Pack unarchived successfully";
    }

    return res.status(200).json({
      success: true,

      message,

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
// PERMANENTLY DELETE PACK
// DELETE /api/admin/packs/:id
// =====================================================

const deletePack = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    // =================================================
    // ID VALIDATION
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pack ID",
      });
    }

    // =================================================
    // FIND PACK
    // =================================================

    const pack =
      await Pack.findById(id);

    if (!pack) {
      return res.status(404).json({
        success: false,
        message:
          "Pack not found",
      });
    }

    // =================================================
    // PERMANENT DELETE
    // =================================================

    await Pack.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      success: true,

      message:
        "Pack deleted permanently",

      deletedPackId:
        id,
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

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAllPacks,
  getPackById,
  createPack,
  updatePack,
  updatePackStatus,
  deletePack,
};