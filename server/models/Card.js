const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    tcgId: {
  type: String,
  default: "",
  index: true,
},

    name: {
      type: String,
      required: true,
      trim: true,
    },

    supertype: {
      type: String,
      default: "",
    },

    subtypes: {
      type: [String],
      default: [],
    },

    hp: {
      type: String,
      default: "",
    },

    types: {
      type: [String],
      default: [],
    },

    number: {
      type: String,
      default: "",
    },

    rarity: {
      type: String,
      default: "",
    },

    artist: {
      type: String,
      default: "",
    },

    imageSmall: {
      type: String,
      default: "",
    },

    imageLarge: {
      type: String,
      default: "",
    },

    set: {
      id: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },

      series: {
        type: String,
        default: "",
      },

      printedTotal: {
        type: Number,
        default: null,
      },

      total: {
        type: Number,
        default: null,
      },

      releaseDate: {
        type: String,
        default: "",
      },

      symbol: {
        type: String,
        default: "",
      },

      logo: {
        type: String,
        default: "",
      },
    },

    cardmarket: {
      url: {
        type: String,
        default: "",
      },
    },

    tcgplayer: {
      url: {
        type: String,
        default: "",
      },

      prices: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    // =========================
    // POKEWALLET
    // =========================
    pokeWallet: {
      id: {
        type: String,
        default: "",
      },

      cardInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      tcgplayer: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      cardmarket: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    legalities: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Card", cardSchema);