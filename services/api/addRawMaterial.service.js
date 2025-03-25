import * as Sentry from "@sentry/react-native";
import { convertImageToBase64 } from "../utilities/imageBase64Converter";
import { API_ENDPOINTS } from "./endpoints";

export const addRawMaterial = async (payload, token) => {
  try {
    // Convert images in RMsData
    const newRMsData = await Promise.all(
      payload.skuDetails.RMsData.map(async (rmd) => {
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

    const response = await fetch(API_ENDPOINTS.ADD_RAW_MATERIAL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.message || "Failed to add raw material";
      throw new Error(errorMessage);
    } else {
      Sentry.captureMessage("Error during API hit for add..");
    }
    return data;
  } catch (error) {
    throw error;
  }
};
