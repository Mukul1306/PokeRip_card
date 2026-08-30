const UserPackCard = require("../models/UserPackCard");
const Wallet = require("../models/Wallet");

// =====================================================
// AUTOMATIC RIP EXPIRY
//
// If user does not choose SELL or SHIP within 5 minutes:
// REVEALED → SOLD
// wallet + marketPrice
// =====================================================

const processExpiredRipCards = async () => {
  try {
    const now = new Date();

    const expiredCards =
      await UserPackCard.find({
        status: "REVEALED",

        decisionDeadline: {
          $lte: now,
        },
      }).limit(50);

    if (
      expiredCards.length === 0
    ) {
      return;
    }

    console.log(
      `Processing ${expiredCards.length} expired RIP card(s)...`
    );

    for (
      const ripCard of expiredCards
    ) {
      try {
        // =================================================
        // ATOMIC CLAIM
        //
        // This prevents two workers from selling
        // the same card.
        // =================================================

        const claimedCard =
          await UserPackCard.findOneAndUpdate(
            {
              _id: ripCard._id,

              status: "REVEALED",

              decisionDeadline: {
                $lte: now,
              },
            },
            {
              $set: {
                status: "SOLD",

                soldAt: now,
              },
            },
            {
              new: true,
            }
          );

        if (!claimedCard) {
          continue;
        }

        // =================================================
        // GET / CREATE WALLET
        // =================================================

        let wallet =
          await Wallet.findOne({
            user: claimedCard.user,
          });

        if (!wallet) {
          wallet =
            await Wallet.create({
              user: claimedCard.user,
              balance: 0,
            });
        }

        // =================================================
        // SELL AMOUNT
        // =================================================

        const sellAmount =
          Number(
            claimedCard.marketPrice || 0
          );

        // =================================================
        // CREDIT WALLET
        // =================================================

        wallet.balance =
          Number(
            wallet.balance || 0
          ) + sellAmount;

        await wallet.save();

        console.log(
          `Auto-sold RIP card ${claimedCard._id} for $${sellAmount.toFixed(2)}`
        );
      } catch (cardError) {
        console.error(
          `Failed to process expired RIP card ${ripCard._id}:`,
          cardError
        );
      }
    }
  } catch (error) {
    console.error(
      "RIP expiry service error:",
      error
    );
  }
};
module.exports = {
  processExpiredRipCards,
};