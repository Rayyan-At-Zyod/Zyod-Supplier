import * as Sentry from "@sentry/react-native";
import { convertImageToBase64 } from "../utilities/imageBase64Converter";
import { API_ENDPOINTS } from "./endpoints";

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
    const response = await fetch(API_ENDPOINTS.ADD_RAW_MATERIAL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPayload),
    });

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
