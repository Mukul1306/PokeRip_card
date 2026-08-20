const User = require("../models/User");

// =====================================================
// GET ALL USERS KYC
// GET /api/admin/kyc/users
// =====================================================

const getKycUsers = async (req, res) => {
  try {
    const {
      status = "ALL",
      search = "",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    // =================================================
    // FILTER
    // =================================================

    const query = {};

    // -------------------------------------------------
    // KYC STATUS
    // -------------------------------------------------

    if (status !== "ALL") {
      if (
        status === "NOT_STARTED" ||
        status === "NOT_VERIFIED"
      ) {
        query.$or = [
          {
            "kyc.status": {
              $exists: false,
            },
          },
          {
            "kyc.status": null,
          },
          {
            "kyc.status": "NOT_STARTED",
          },
        ];
      } else {
        query["kyc.status"] = status;
      }
    }

    // =================================================
    // SEARCH
    // =================================================

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      const searchCondition = {
        $or: [
          {
            name: searchRegex,
          },
          {
            email: searchRegex,
          },
          {
            mobile: searchRegex,
          },
          {
            phone: searchRegex,
          },
        ],
      };

      if (query.$or) {
        query.$and = [
          {
            $or: query.$or,
          },
          searchCondition,
        ];

        delete query.$or;
      } else {
        query.$or = searchCondition.$or;
      }
    }

    // =================================================
    // COUNT
    // =================================================

    const totalUsers =
      await User.countDocuments(query);

    // =================================================
    // USERS
    // =================================================

    const users =
      await User.find(query)
        .select(
          "name email mobile phone createdAt kyc"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (pageNumber - 1) *
            limitNumber
        )
        .limit(limitNumber)
        .lean();

    // =================================================
    // NORMALIZE
    // =================================================

    const formattedUsers =
      users.map((user) => {

        const kycStatus =
          user.kyc?.status ||
          "NOT_STARTED";

        return {
          _id: user._id,

          name:
            user.name ||
            "Unknown",

          email:
            user.email ||
            "-",

          mobile:
            user.mobile ||
            user.phone ||
            "-",

          createdAt:
            user.createdAt,

          // IMPORTANT
          // Keep KYC object because frontend
          // reads user.kyc.status

          kyc: {
            status:
              kycStatus,

            provider:
              user.kyc?.provider ||
              null,

            inquiryId:
              user.kyc?.inquiryId ||
              null,

            verificationId:
              user.kyc?.verificationId ||
              null,

            rejectionReason:
              user.kyc?.rejectionReason ||
              null,
          },
        };
      });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      data: {
        users: formattedUsers,

        pagination: {
          page: pageNumber,

          limit: limitNumber,

          total: totalUsers,

          totalPages:
            Math.ceil(
              totalUsers /
                limitNumber
            ),
        },
      },
    });

  } catch (error) {

    console.error(
      "Admin KYC users error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load KYC users",
    });
  }
};


// =====================================================
// KYC STATISTICS
// GET /api/admin/kyc/stats
// =====================================================

const getKycStats = async (
  req,
  res
) => {

  try {

    const [
      totalUsers,
      verified,
      pending,
      rejected,
      requiresRetry,
      notStarted,
    ] = await Promise.all([

      // TOTAL
      User.countDocuments(),

      // VERIFIED
      User.countDocuments({
        "kyc.status":
          "VERIFIED",
      }),

      // PENDING
      User.countDocuments({
        "kyc.status":
          "PENDING",
      }),

      // REJECTED
      User.countDocuments({
        "kyc.status":
          "REJECTED",
      }),

      // RETRY
      User.countDocuments({
        "kyc.status":
          "REQUIRES_RETRY",
      }),

      // NOT STARTED
      User.countDocuments({
        $or: [
          {
            "kyc.status": {
              $exists: false,
            },
          },
          {
            "kyc.status": null,
          },
          {
            "kyc.status":
              "NOT_STARTED",
          },
        ],
      }),
    ]);

    return res.status(200).json({

      success: true,

      data: {

        // Frontend-friendly names

        total:
          totalUsers,

        verified,

        pending,

        rejected,

        requiresRetry,

        notStarted,
      },
    });

  } catch (error) {

    console.error(
      "KYC stats error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to load KYC statistics",
    });
  }
};


module.exports = {
  getKycUsers,
  getKycStats,
};