const PRICECHARTING_API_URL =
  "https://www.pricecharting.com/api/product";

const getPriceChartingProduct = async ({
  query,
}) => {
  const token =
    process.env.PRICECHARTING_API_TOKEN;

  if (!token) {
    throw new Error(
      "PRICECHARTING_API_TOKEN is not configured"
    );
  }

  if (!query?.trim()) {
    throw new Error(
      "PriceCharting search query is required"
    );
  }

  const params = new URLSearchParams();

  params.set("t", token);
  params.set("q", query.trim());

  const response = await fetch(
    `${PRICECHARTING_API_URL}?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.["error-message"] ||
        "PriceCharting request failed"
    );
  }

  if (data.status !== "success") {
    throw new Error(
      data?.["error-message"] ||
        "PriceCharting returned an error"
    );
  }

  return data;
};


// PriceCharting returns prices in cents
const centsToDollars = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue =
    Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue / 100;
};


module.exports = {
  getPriceChartingProduct,
  centsToDollars,
};