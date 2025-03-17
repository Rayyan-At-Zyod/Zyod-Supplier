import * as Sentry from "@sentry/react-native";
import { convertImageToBase64 } from "../utilities/imageBase64Converter";
import { API_ENDPOINTS } from "./endpoints";
import NetInfo from "@react-native-community/netinfo";

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
// Delay between retries (in milliseconds)
const RETRY_DELAY = 1000;

/**
 * Helper function to add retry logic to API calls
 */
const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  try {
    // Check network connectivity first
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      throw new Error("Network request failed - device is offline");
    }
    
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // If we have retries left and it's a network error, retry after a delay
    if (
      retries > 0 && 
      (error.message.includes("Network request failed") || 
       error.message.includes("timeout") ||
       error.message.includes("connection"))
    ) {
      Sentry.captureMessage(`API call failed, retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, "info");
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Check network connectivity again before retrying
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        throw new Error("Network request failed - device is offline");
      }
      
      // Retry the request
      return fetchWithRetry(url, options, retries - 1);
    }
    
    // If we're out of retries or it's not a network error, throw the error
    throw error;
  }
};

export const addRawMaterial = async (payload, token) => {
  Sentry.captureMessage("Hitting API addRawMaterial", "info");

  try {
    // Convert images in RMsData
    const newRMsData = await Promise.all(
      payload.skuDetails.RMsData.map(async (rmd) => {
        Sentry.captureMessage(
          "Converting RMImage to base64 for one RMsData entry",
          "info"
        );
        return Object.fromEntries(
          await Promise.all(
            Object.entries(rmd).map(async ([key, value]) => {
              if (key === "RMImage") {
                const base64Image = await convertImageToBase64(value);
                return [key, [base64Image]];
              }
              return [key, value];
            })
          )
        );
      })
    );

    // Convert the main payload image
    Sentry.captureMessage("Converting main payload image to base64");
    const base64ImagePayload = await convertImageToBase64(
      payload.skuDetails.image
    );

    const newPayload = {
      ...payload,
      skuDetails: {
        ...payload.skuDetails,
        image: base64ImagePayload,
        RMsData: newRMsData,
      },
    };

    Sentry.captureMessage("Making API call to add raw material");
    
    // Use our fetchWithRetry helper instead of fetch
    const response = await fetchWithRetry(
      API_ENDPOINTS.ADD_RAW_MATERIAL, 
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPayload),
      }
    );

    Sentry.captureMessage(
      `Received API response with status: ${response.status}`
    );
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.message || "Failed to add raw material";
      Sentry.captureException(new Error(errorMessage));
      throw new Error(errorMessage);
    }

    Sentry.captureMessage("Raw material added successfully");
    return data;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error in addRawMaterial:", error);
    throw error;
  }
};
