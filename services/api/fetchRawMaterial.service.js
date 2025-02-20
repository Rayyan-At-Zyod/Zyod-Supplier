import { API_ENDPOINTS } from "./endpoints";

export const fetchRawMaterials = async (token) => {
  const response = await fetch(API_ENDPOINTS.FETCH_RAW_MATERIALS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch raw materials!!");
  }
  return data;
};

/**
 */
