const axios = require("axios");

const POKEMON_TCG_API =
  "https://api.pokemontcg.io/v2";

const apiKey =
  process.env.POKEMON_TCG_API_KEY;

console.log(
  "Pokemon TCG API key loaded:",
  !!apiKey
);

const pokemonTcgClient =
  axios.create({
    baseURL: POKEMON_TCG_API,

    timeout: 15000,

    headers: {
      Accept: "application/json",
      "X-Api-Key": apiKey,
    },
  });


// =====================================================
// SEARCH CARDS
// =====================================================

const searchPokemonCards = async ({
  search = "",
  page = 1,
  pageSize = 20,
}) => {

  const params = {
    page,
    pageSize,
  };

  if (search.trim()) {
    params.q =
      `name:${search.trim()}`;
  }

  const response =
    await pokemonTcgClient.get(
      "/cards",
      {
        params,
      }
    );

  return response.data;
};


// =====================================================
// GET CARD BY ID
// =====================================================

const getPokemonCardById =
  async (id) => {

    const response =
      await pokemonTcgClient.get(
        `/cards/${encodeURIComponent(id)}`
      );

    return response.data.data;
  };


// =====================================================
// GET CARD MARKET PRICE
// =====================================================
//
// This function ONLY reads pricing.
// It does not replace or create the Card.
//
// Pokémon TCG API gives TCGPlayer prices
// under:
// card.tcgplayer.prices
//
// Example:
// prices.holofoil.market
// prices.normal.market
// prices.reverseHolofoil.market
// prices.1stEditionHolofoil.market
// =====================================================

const getPokemonCardPrice =
  async (id) => {

    const card =
      await getPokemonCardById(id);

    if (!card) {
      throw new Error(
        "Pokémon card not found"
      );
    }

    const prices =
      card?.tcgplayer?.prices || {};

    const marketPrices = [];

    // -----------------------------------------
    // Collect all available market prices
    // -----------------------------------------

    Object.entries(prices).forEach(
      ([variant, priceData]) => {

        const market =
          Number(priceData?.market);

        if (
          Number.isFinite(market) &&
          market > 0
        ) {
          marketPrices.push({
            variant,
            market,
          });
        }
      }
    );

    // -----------------------------------------
    // No market price available
    // -----------------------------------------

    if (
      marketPrices.length === 0
    ) {
      return {
        price: null,
        currency: "USD",
        source:
          "Pokemon TCG API / TCGPlayer",
        lastUpdated: new Date(),
        variants: [],
      };
    }

    // -----------------------------------------
    // Select highest available market price
    // -----------------------------------------

    const selected =
      marketPrices.reduce(
        (highest, current) =>
          current.market >
          highest.market
            ? current
            : highest
      );

    return {
      price: selected.market,

      currency: "USD",

      source:
        "Pokemon TCG API / TCGPlayer",

      variant:
        selected.variant,

      lastUpdated:
        new Date(),

      variants:
        marketPrices,
    };
  };


// =====================================================
// GET CARD PRICE FROM CARD OBJECT
// =====================================================
//
// Useful when you already have the card object
// from Pokémon TCG API and don't want to make
// another API request.
// =====================================================

const getMarketPriceFromCard =
  (card) => {

    const prices =
      card?.tcgplayer?.prices || {};

    const marketPrices = [];

    Object.entries(prices).forEach(
      ([variant, priceData]) => {

        const market =
          Number(priceData?.market);

        if (
          Number.isFinite(market) &&
          market > 0
        ) {
          marketPrices.push({
            variant,
            market,
          });
        }
      }
    );

    if (
      marketPrices.length === 0
    ) {
      return null;
    }

    return marketPrices.reduce(
      (highest, current) =>
        current.market >
        highest.market
          ? current
          : highest
    );
  };


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  searchPokemonCards,
  getPokemonCardById,
  getPokemonCardPrice,
  getMarketPriceFromCard,
};