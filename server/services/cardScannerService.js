const axios = require("axios");
const FormData = require("form-data");

// =====================================================
// CARDVAULT IDENTIFY
// =====================================================

const identifyCard = async (buffer) => {
  if (!buffer) {
    throw new Error("No card image received");
  }

  if (!process.env.CARDVAULT_API_KEY) {
    throw new Error(
      "CARDVAULT_API_KEY is missing from .env"
    );
  }

  const form = new FormData();

  form.append("front", buffer, {
    filename: "pokemon-card.jpg",
    contentType: "image/jpeg",
  });

  form.append("category", "pokemon");

  console.log("Sending card image to CardVault...");

  const response = await axios.post(
    "https://aicardvault.io/api/v1/identify",
    form,
    {
      headers: {
        ...form.getHeaders(),

        Authorization:
          `Bearer ${process.env.CARDVAULT_API_KEY}`,
      },

      timeout: 30000,

      maxContentLength:
        20 * 1024 * 1024,

      maxBodyLength:
        20 * 1024 * 1024,
    }
  );

  console.log(
    "CardVault response:",
    JSON.stringify(
      response.data,
      null,
      2
    )
  );

  return response.data;
};


// =====================================================
// SCAN CARD IMAGE
// =====================================================

const scanCardImage = async (buffer) => {
  console.log(
    "================================="
  );

  console.log(
    "STARTING CARDVAULT CARD SCAN"
  );

  console.log(
    "================================="
  );

  const result =
    await identifyCard(buffer);

  return result;
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  identifyCard,
  scanCardImage,
};