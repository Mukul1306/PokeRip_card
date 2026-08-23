const mongoose = require("mongoose");

const UserPack = require("../models/UserPack");
const UserPackCard = require("../models/UserPackCard");
const Pack = require("../models/Pack");

// =====================================================
// RIP ONE CARD
// POST /api/rip/:userPackId
// =====================================================

const ripCard = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user?.id || req.user?._id;
    const { userPackId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userPackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user pack ID",
      });
    }

    session.startTransaction();

    // =================================================
    // FIND USER PACK
    // =================================================

    const userPack = await UserPack.findOne({
      _id: userPackId,
      user: userId,
    }).session(session);

    if (!userPack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Pack not found in your collection",
      });
    }

    // =================================================
    // CHECK REMAINING CARDS
    // =================================================

    if (Number(userPack.cardsRemaining) <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "No cards remaining in this pack",
      });
    }

    // =================================================
    // GET PACK
    // =================================================

    const pack = await Pack.findById(
      userPack.pack
    )
      .populate(
        "cards.card",
        "name image"
      )
      .session(session);

    if (!pack) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Original pack not found",
      });
    }

    // =================================================
    // CREATE AVAILABLE CARD POOL
    // =================================================

    const availableCards = pack.cards.filter(
      (packCard) =>
        packCard.card &&
        Number(packCard.quantity || 0) > 0 &&
        Number(packCard.pullWeight || 0) > 0
    );

    if (availableCards.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "No cards available in this pack",
      });
    }

    // =================================================
    // WEIGHTED RANDOM CARD
    // =================================================

    const totalWeight = availableCards.reduce(
      (total, packCard) =>
        total +
        Number(packCard.pullWeight || 0),
      0
    );

    if (totalWeight <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid card pull weights",
      });
    }

    let random =
      Math.random() * totalWeight;

    let selectedPackCard = null;

    for (const packCard of availableCards) {
      random -= Number(
        packCard.pullWeight || 0
      );

      if (random <= 0) {
        selectedPackCard = packCard;
        break;
      }
    }

    // Safety fallback
    if (!selectedPackCard) {
      selectedPackCard =
        availableCards[
          availableCards.length - 1
        ];
    }

    const selectedCard =
      selectedPackCard.card;

    // =================================================
    // UPDATE USER PACK
    // =================================================

    userPack.cardsRemaining =
      Math.max(
        0,
        Number(userPack.cardsRemaining) - 1
      );

    userPack.cardsRipped =
      Number(userPack.cardsRipped) + 1;

    if (userPack.cardsRemaining === 0) {
      userPack.status = "COMPLETED";
    }

    await userPack.save({
      session,
    });

    // =================================================
    // SAVE REVEALED CARD
    // =================================================

    const userPackCard =
      await UserPackCard.create(
        [
          {
            user: userId,

            userPack: userPack._id,

            card: selectedCard._id,

            marketPrice: 0,

            status: "REVEALED",

            revealedAt: new Date(),
          },
        ],
        {
          session,
        }
      );

    // =================================================
    // COMMIT
    // =================================================

    await session.commitTransaction();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message: "Card revealed successfully",

      data: {
        card: {
          _id: selectedCard._id,
          name: selectedCard.name,
          image: selectedCard.image,
        },

        userPackCard:
          userPackCard[0],

        pack: {
          _id: userPack._id,
          cardsTotal:
            userPack.cardsTotal,
          cardsRemaining:
            userPack.cardsRemaining,
          cardsRipped:
            userPack.cardsRipped,
          status:
            userPack.status,
        },
      },
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error(
        "Transaction abort error:",
        abortError
      );
    }

    console.error(
      "Rip card error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to rip card",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  ripCard,
};