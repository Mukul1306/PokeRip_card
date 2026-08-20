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


module.exports = {
  searchPokemonCards,
  getPokemonCardById,
};