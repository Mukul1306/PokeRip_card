const User = require("../models/User");

const {
  createPersonaInquiry,
  getPersonaInquiry,
} = require("../services/personaService");


// =====================================================
// START KYC
// POST /api/kyc/start
// =====================================================

const startKyc = async (req, res) => {

  try {

    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {

      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });

    }


    const user =
      await User.findById(userId);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    // -------------------------------------------------
    // ALREADY VERIFIED
    // -------------------------------------------------

    if (
      user.kyc?.status ===
      "VERIFIED"
    ) {

      return res.status(400).json({
        success: false,
        message: "KYC already verified",
      });

    }


    // -------------------------------------------------
    // CREATE NEW PERSONA INQUIRY
    // -------------------------------------------------

    const persona =
      await createPersonaInquiry({
        userId: user._id,
      });


    const inquiry =
      persona?.data;

    const inquiryId =
      inquiry?.id;

    const oneTimeLink =
      persona?.meta?.["one-time-link"];


    if (!inquiryId) {

      console.error(
        "Persona response:",
        persona
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create KYC inquiry",
      });

    }


    // -------------------------------------------------
    // SAVE KYC
    // -------------------------------------------------

    user.kyc = {

      ...(user.kyc || {}),

      status: "PENDING",

      provider: "PERSONA",

      inquiryId,

      verificationId:
        null,

      rejectionReason:
        null,

    };


    await user.save();


    return res.status(200).json({

      success: true,

      message:
        "KYC verification started",

      data: {

        inquiryId,

        verificationUrl:
          oneTimeLink || null,

        status:
          user.kyc.status,

      },

    });

  } catch (error) {

    console.error(
      "Start KYC error:",
      error?.response?.data ||
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to start KYC verification",

    });

  }
};


// =====================================================
// GET MY KYC STATUS
// GET /api/kyc/status
// =====================================================

const getMyKycStatus = async (
  req,
  res
) => {

  try {

    const userId =
      req.user?.id ||
      req.user?._id;


    const user =
      await User.findById(userId)
        .select("kyc");


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    return res.status(200).json({

      success: true,

      data: {
        kyc: user.kyc,
      },

    });

  } catch (error) {

    console.error(
      "KYC status error:",
      error
    );

    return res.status(500).json({

      success: false,
      message: "Server error",

    });

  }
};


module.exports = {
  startKyc,
  getMyKycStatus,
};