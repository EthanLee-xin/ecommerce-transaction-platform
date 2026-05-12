const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export const getProducts = async ({ keyword = "", pageNumber = "" } = {}) => {
  const searchParams = new URLSearchParams();

  if (keyword) {
    searchParams.set("keyword", keyword);
  }

  if (pageNumber) {
    searchParams.set("pageNumber", pageNumber);
  }

  const queryString = searchParams.toString();

  const res = await fetch(
    `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
};

export const getProductById = async (productId) => {
  const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
};
