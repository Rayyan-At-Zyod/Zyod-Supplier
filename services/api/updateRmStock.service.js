import { API_ENDPOINTS } from "./endpoints";

export const updateRM = async (payload, token) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.ADJUST_STOCK_INVENTORY_FOR_ITEMS_API,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          origin: "https://dev-erp.zyod.com",
          referer: "https://dev-erp.zyod.com/",
        },
        body: JSON.stringify(payload),
      }
    );

    // First check if response is ok
    if (!response.ok) {
      // Try to parse error response as JSON
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message;
      } catch (e) {
        // If parsing fails, use status text
        errorMessage = `Failed to update stock (${response.status}: ${response.statusText})`;
      }
      throw new Error(errorMessage);
    }

    // If response is ok, then parse the JSON
    const data = await response.json();
    console.log("Success response:", data);
    return data;
  } catch (error) {
    console.error("Stock update error:", error);
    throw error;
  }
};
