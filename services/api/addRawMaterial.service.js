import { convertImageToBase64} from '../utilities/imageBase64Converter'
import { API_ENDPOINTS } from "./endpoints";

export const addRawMaterial = async (payload, token) => {
  console.log("token?", token);
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

  const newPayload = {
    ...payload,
    skuDetails: {
      ...payload.skuDetails,
      image: await convertImageToBase64(payload.skuDetails.image),
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
    throw new Error(data.message || "Failed to add raw material");
  }
  return data;
};
