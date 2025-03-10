import { API_ENDPOINTS } from "./endpoints";

export const fetchRawMaterials = async (token, page = 1, size = 10) => {
  const url = `${API_ENDPOINTS.FETCH_RAW_MATERIALS}?page=${page}&size=${size}`;

  const response = await fetch(url, {
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
