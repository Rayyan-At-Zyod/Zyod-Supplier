import { API_ENDPOINTS } from "./endpoints";

export const addRawMaterial = async (payload, token) => {
  const response = await fetch(API_ENDPOINTS.ADD_RAW_MATERIAL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to add raw material");
  }
  return data;
};

/**
 */
