import { API_ENDPOINTS } from "./endpoints";

export const fetchPrimaryWarehouseIdOfThisUser = async (token, supplierId) => {
  // user.user_SupplierId
  try {
    console.log("\nSupplier ID", supplierId);
    const response = await fetch(
      API_ENDPOINTS.ZYOD_USER_WAREHOUSE_ID_API + supplierId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Got response from fetchPrimaryWarehouseIdOfThisUser.");

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch warehouseId!!");
    }
    if (
      Array.isArray(data.data) &&
      data.data.length > 0 &&
      data.data[0].warehouseId
    )
      return data.data[0].warehouseId;
  } catch (err) {
    throw new Error("No warehouseId found on warehouse fetching API response.");
  }
};

/**
 */
