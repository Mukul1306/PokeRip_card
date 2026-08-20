const axios = require("axios");

const personaClient = axios.create({
  baseURL: "https://api.withpersona.com/api/v1",

  headers: {
    Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});


// =====================================================
// CREATE PERSONA INQUIRY
// =====================================================

const createPersonaInquiry = async ({ userId }) => {

  const templateId =
    process.env.PERSONA_INQUIRY_TEMPLATE_ID;

  if (!templateId) {
    throw new Error(
      "PERSONA_INQUIRY_TEMPLATE_ID is missing"
    );
  }

  console.log("Persona template:", templateId);

  const response = await personaClient.post(
    "/inquiries",
    {
      data: {
        attributes: {
          "inquiry-template-id": templateId,

          "reference-id":
            String(userId),
        },
      },

      meta: {
        "auto-create-one-time-link": true,
      },
    }
  );

  console.log(
    "PERSONA RESPONSE:",
    JSON.stringify(
      response.data,
      null,
      2
    )
  );

  return response.data;
};


// =====================================================
// GET PERSONA INQUIRY
// =====================================================

const getPersonaInquiry = async (
  inquiryId
) => {

  const response =
    await personaClient.get(
      `/inquiries/${inquiryId}`
    );

  return response.data;
};


module.exports = {
  createPersonaInquiry,
  getPersonaInquiry,
};