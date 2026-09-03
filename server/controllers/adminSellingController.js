const UserPackCard = require("../models/UserPackCard");
const User = require("../models/User");
const Card = require("../models/Card");
const Pack = require("../models/Pack");

// =====================================================
// GET DATE RANGE
// =====================================================

const getDateRange = (req) => {
  const {
    preset = "today",
    from,
    to,
  } = req.query;

  const now = new Date();

  // ===================================================
  // TODAY
  // ===================================================

  if (preset === "today") {
    const start = new Date(now);

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end = new Date(now);

    end.setHours(
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
    };
  }

  // ===================================================
  // THIS MONTH
  // ===================================================

  if (preset === "month") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
    };
  }

  // ===================================================
  // ALL TIME
  // ===================================================

  if (preset === "all") {
    return {
      start: null,
      end: null,
    };
  }

  // ===================================================
  // CUSTOM DATE
  // ===================================================

  if (preset === "custom") {
    let start = null;
    let end = null;

    // FROM
    if (from) {
      start = new Date(
        `${from}T00:00:00`
      );
    }

    // TO
    if (to) {
      end = new Date(
        `${to}T23:59:59.999`
      );
    }

    return {
      start,
      end,
    };
  }

  // ===================================================
  // DEFAULT TODAY
  // ===================================================

  const start = new Date(now);

  start.setHours(
    0,
    0,
    0,
    0
  );

  const end = new Date(now);

  end.setHours(
    23,
    59,
    59,
    999
  );

  return {
    start,
    end,
  };
};

// =====================================================
// BUILD SOLD FILTER
// =====================================================

const buildSoldFilter = (
  start,
  end
) => {
  const filter = {
    status: "SOLD",
  };

  // ===================================================
  // DATE FILTER
  // ===================================================

  if (start || end) {
    filter.soldAt = {};

    if (start) {
      filter.soldAt.$gte = start;
    }

    if (end) {
      filter.soldAt.$lte = end;
    }
  }

  return filter;
};

// =====================================================
// GET SEARCH IDS
// =====================================================

const getSearchIds = async (
  search
) => {
  if (
    !search ||
    !String(search).trim()
  ) {
    return {
      userIds: [],
      cardIds: [],
      packIds: [],
    };
  }

  const searchText =
    String(search).trim();

  const regex =
    new RegExp(
      searchText,
      "i"
    );

  // ===================================================
  // SEARCH USERS
  // ===================================================

  const usersPromise =
    User.find({
      $or: [
        {
          name: regex,
        },
        {
          username: regex,
        },
        {
          email: regex,
        },
      ],
    })
      .select("_id")
      .limit(100)
      .lean();

  // ===================================================
  // SEARCH CARDS
  // ===================================================

  const cardsPromise =
    Card.find({
      $or: [
        {
          name: regex,
        },
        {
          tcgId: regex,
        },
        {
          number: regex,
        },
        {
          rarity: regex,
        },
      ],
    })
      .select("_id")
      .limit(100)
      .lean();

  // ===================================================
  // SEARCH PACKS
  // ===================================================

  const packsPromise =
    Pack.find({
      $or: [
        {
          name: regex,
        },
        {
          slug: regex,
        },
      ],
    })
      .select("_id")
      .limit(100)
      .lean();

  const [
    users,
    cards,
    packs,
  ] = await Promise.all([
    usersPromise,
    cardsPromise,
    packsPromise,
  ]);

  return {
    userIds:
      users.map(
        (item) =>
          item._id
      ),

    cardIds:
      cards.map(
        (item) =>
          item._id
      ),

    packIds:
      packs.map(
        (item) =>
          item._id
      ),
  };
};

// =====================================================
// ADD SEARCH TO FILTER
// =====================================================

const addSearchToFilter =
  async (
    filter,
    search
  ) => {
    const searchText =
      String(
        search || ""
      ).trim();

    if (!searchText) {
      return filter;
    }

    const {
      userIds,
      cardIds,
      packIds,
    } =
      await getSearchIds(
        searchText
      );

    const conditions = [];

    // =================================================
    // USER SEARCH
    // =================================================

    if (
      userIds.length > 0
    ) {
      conditions.push({
        user: {
          $in: userIds,
        },
      });
    }

    // =================================================
    // CARD SEARCH
    // =================================================

    if (
      cardIds.length > 0
    ) {
      conditions.push({
        card: {
          $in: cardIds,
        },
      });
    }

    // =================================================
    // USER PACK CARD ID
    // =================================================

    if (
      /^[a-f0-9]{24}$/i.test(
        searchText
      )
    ) {
      conditions.push({
        _id: searchText,
      });
    }

    // =================================================
    // PACK SEARCH
    // =================================================

    if (
      packIds.length > 0
    ) {
      const UserPack =
        require("../models/UserPack");

      const userPacks =
        await UserPack.find({
          pack: {
            $in: packIds,
          },
        })
          .select("_id")
          .limit(500)
          .lean();

      const userPackIds =
        userPacks.map(
          (item) =>
            item._id
        );

      if (
        userPackIds.length > 0
      ) {
        conditions.push({
          userPack: {
            $in: userPackIds,
          },
        });
      }
    }

    // =================================================
    // APPLY SEARCH
    // =================================================

    if (
      conditions.length > 0
    ) {
      filter.$or =
        conditions;
    } else {
      filter._id = {
        $in: [],
      };
    }

    return filter;
  };

// =====================================================
// FORMAT CARD
// =====================================================

const formatCard = (
  card
) => {
  if (!card) {
    return null;
  }

  const imageLarge =
    card.imageLarge ||
    "";

  const imageSmall =
    card.imageSmall ||
    "";

  return {
    _id:
      card._id,

    name:
      card.name ||
      "",

    tcgId:
      card.tcgId ||
      "",

    number:
      card.number ||
      "",

    rarity:
      card.rarity ||
      "",

    artist:
      card.artist ||
      "",

    // =================================================
    // CARD PRICE
    // =================================================

    price:
      card.price !== undefined &&
      card.price !== null
        ? Number(card.price)
        : null,

    priceCurrency:
      card.priceCurrency ||
      "USD",

    priceSource:
      card.priceSource ||
      "",

    priceLastUpdated:
      card.priceLastUpdated ||
      null,

    // =================================================
    // IMAGE
    // =================================================

    image:
      imageLarge ||
      imageSmall ||
      "",

    imageSmall,

    imageLarge,

    // =================================================
    // SET
    // =================================================

    set:
      card.set || {
        id: "",
        name: "",
        series: "",
        printedTotal: null,
        total: null,
        releaseDate: "",
        symbol: "",
        logo: "",
      },
  };
};

// =====================================================
// GET SOLD CARDS
//
// GET /api/admin/sales
// =====================================================

const getSoldCards =
  async (
    req,
    res
  ) => {
    try {

      // =================================================
      // QUERY
      // =================================================

      const {
        search = "",
        page = 1,
        limit = 20,
        preset = "today",
      } = req.query;

      // =================================================
      // DATE RANGE
      // =================================================

      const {
        start,
        end,
      } =
        getDateRange(
          req
        );

      // =================================================
      // BASE FILTER
      // =================================================

      let filter =
        buildSoldFilter(
          start,
          end
        );

      // =================================================
      // SEARCH
      // =================================================

      const searchText =
        String(
          search || ""
        ).trim();

      if (searchText) {
        filter =
          await addSearchToFilter(
            filter,
            searchText
          );
      }

      // =================================================
      // PAGINATION
      // =================================================

      const pageNumber =
        Math.max(
          1,
          Number(page) || 1
        );

      const limitNumber =
        Math.min(
          100,
          Math.max(
            1,
            Number(limit) || 20
          )
        );

      const skip =
        (
          pageNumber - 1
        ) *
        limitNumber;

      // =================================================
      // TOTAL + SOLD CARDS
      // =================================================

      const [
        total,
        soldCards,
      ] =
        await Promise.all([

          // TOTAL

          UserPackCard.countDocuments(
            filter
          ),

          // SOLD CARDS

          UserPackCard.find(
            filter
          )

            // =========================================
            // USER
            // =========================================

            .populate(
              "user",
              "name username email phone status"
            )

            // =========================================
            // CARD
            //
            // IMPORTANT:
            // price IS NOW INCLUDED
            // =========================================

            .populate(
              "card",
              [
                "name",
                "tcgId",
                "number",
                "rarity",
                "artist",
                "imageSmall",
                "imageLarge",
                "set",
                "price",
                "priceCurrency",
                "priceSource",
                "priceLastUpdated",
              ].join(" ")
            )

            // =========================================
            // USER PACK
            // =========================================

            .populate({
              path:
                "userPack",

              select:
                "pack quantity cardsTotal cardsRemaining cardsRipped status purchasedAt price purchasePrice packPrice",

              populate: {
                path:
                  "pack",

                // IMPORTANT:
                // price IS NOW INCLUDED
                select:
                  "name slug image status price",
              },
            })

            // =========================================
            // SORT
            // =========================================

            .sort({
              soldAt: -1,
              createdAt: -1,
            })

            // =========================================
            // PAGINATION
            // =========================================

            .skip(
              skip
            )

            .limit(
              limitNumber
            )

            .lean(),
        ]);

      // =================================================
      // FORMAT SALES
      // =================================================

      const sales =
        soldCards.map(
          (soldCard) => {

            // ===========================================
            // CARD
            // ===========================================

            const formattedCard =
              formatCard(
                soldCard.card
              );

            // ===========================================
            // USER
            // ===========================================

            const formattedUser =
              soldCard.user ||
              null;

            // ===========================================
            // USER PACK
            // ===========================================

            const formattedUserPack =
              soldCard.userPack ||
              null;

            // ===========================================
            // CARD PRICE
            // ===========================================

            const cardPrice =
              formattedCard?.price !==
                null &&
              formattedCard?.price !==
                undefined
                ? Number(
                    formattedCard.price
                  )
                : null;

            // ===========================================
            // USER GETS
            //
            // 80% OF CARD PRICE
            // ===========================================

            const userGets =
              cardPrice !== null
                ? Number(
                    (
                      cardPrice *
                      0.8
                    ).toFixed(2)
                  )
                : null;

            // ===========================================
            // COMMISSION
            //
            // 20% OF CARD PRICE
            // ===========================================

            const commission =
              cardPrice !== null
                ? Number(
                    (
                      cardPrice *
                      0.2
                    ).toFixed(2)
                  )
                : null;

            // ===========================================
            // PACK PRICE
            //
            // Priority:
            // UserPack purchasePrice
            // UserPack price
            // UserPack packPrice
            // Pack price
            // ===========================================

            let packPrice = null;

            if (
              formattedUserPack
                ?.purchasePrice !==
                undefined &&
              formattedUserPack
                ?.purchasePrice !==
                null
            ) {
              packPrice =
                Number(
                  formattedUserPack
                    .purchasePrice
                );
            } else if (
              formattedUserPack
                ?.price !==
                undefined &&
              formattedUserPack
                ?.price !==
                null
            ) {
              packPrice =
                Number(
                  formattedUserPack
                    .price
                );
            } else if (
              formattedUserPack
                ?.packPrice !==
                undefined &&
              formattedUserPack
                ?.packPrice !==
                null
            ) {
              packPrice =
                Number(
                  formattedUserPack
                    .packPrice
                );
            } else if (
              formattedUserPack
                ?.pack?.price !==
                undefined &&
              formattedUserPack
                ?.pack?.price !==
                null
            ) {
              packPrice =
                Number(
                  formattedUserPack
                    .pack.price
                );
            }

            // ===========================================
            // RETURN SALE
            // ===========================================

            return {

              _id:
                soldCard._id,

              status:
                soldCard.status,

              revealedAt:
                soldCard.revealedAt,

              soldAt:
                soldCard.soldAt,

              decisionDeadline:
                soldCard.decisionDeadline,

              shippingFee:
                soldCard.shippingFee,

              shippedAt:
                soldCard.shippedAt,

              // ========================================
              // CARD
              // ========================================

              card:
                formattedCard,

              // ========================================
              // FINANCIAL INFORMATION
              // ========================================

              cardPrice:
                cardPrice,

              packPrice:
                packPrice,

              userGets:
                userGets,

              commission:
                commission,

              // ========================================
              // SPLIT
              // ========================================

              userPercentage: 80,

              commissionPercentage: 20,

              // ========================================
              // USER
              // ========================================

              user:
                formattedUser,

              // ========================================
              // USER PACK
              // ========================================

              userPack:
                formattedUserPack,

              createdAt:
                soldCard.createdAt,

              updatedAt:
                soldCard.updatedAt,
            };
          }
        );

      // =================================================
      // STATS
      //
      // ONLY CARD COUNTS
      //
      // NO VALUE
      // NO MONEY
      // NO COMMISSION
      // =================================================

      // =================================================
      // TODAY START
      // =================================================

      const todayStart =
        new Date();

      todayStart.setHours(
        0,
        0,
        0,
        0
      );

      // =================================================
      // TODAY END
      // =================================================

      const todayEnd =
        new Date();

      todayEnd.setHours(
        23,
        59,
        59,
        999
      );

      // =================================================
      // MONTH START
      // =================================================

      const monthStart =
        new Date(
          todayStart.getFullYear(),
          todayStart.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      // =================================================
      // MONTH END
      // =================================================

      const monthEnd =
        new Date(
          todayStart.getFullYear(),
          todayStart.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

      // =================================================
      // TODAY + MONTH + ALL
      // =================================================

      const [
        todayCount,
        monthCount,
        totalCount,
      ] =
        await Promise.all([

          // TODAY

          UserPackCard.countDocuments({
            status:
              "SOLD",

            soldAt: {
              $gte:
                todayStart,

              $lte:
                todayEnd,
            },
          }),

          // THIS MONTH

          UserPackCard.countDocuments({
            status:
              "SOLD",

            soldAt: {
              $gte:
                monthStart,

              $lte:
                monthEnd,
            },
          }),

          // ALL TIME

          UserPackCard.countDocuments({
            status:
              "SOLD",
          }),
        ]);

      // =================================================
      // TOTAL PAGES
      // =================================================

      const totalPages =
        Math.ceil(
          total /
            limitNumber
        );

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success:
          true,

        data: {

          // =============================================
          // SOLD CARDS
          // =============================================

          sales,

          // =============================================
          // CARD COUNTS ONLY
          // =============================================

          stats: {

            today:
              Number(
                todayCount ||
                  0
              ),

            month:
              Number(
                monthCount ||
                  0
              ),

            total:
              Number(
                totalCount ||
                  0
              ),
          },

          // =============================================
          // PAGINATION
          // =============================================

          pagination: {

            page:
              pageNumber,

            limit:
              limitNumber,

            total:
              Number(
                total ||
                  0
              ),

            totalPages:
              totalPages,
          },
        },
      });

    } catch (error) {

      // =================================================
      // ERROR LOG
      // =================================================

      console.error(
        "Get sold cards error:",
        error
      );

      // =================================================
      // ERROR RESPONSE
      // =================================================

      return res.status(500).json({

        success:
          false,

        message:
          error.message ||
          "Unable to fetch sold cards",
      });
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getSoldCards,
};