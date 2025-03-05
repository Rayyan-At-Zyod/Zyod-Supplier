import { convertImageToBase64} from '../utilities/imageBase64Converter'
import { API_ENDPOINTS } from "./endpoints";

export const addRawMaterial = async (payload, token) => {
  console.log("reading RMsData:", JSON.stringify(payload));
  // console.log(
  //   "reading RMsData:",
  //   JSON.stringify(payload.skuDetails.RMsData, null, 2)
  // );
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
  // console.log(
  //   "reading newRMsData:",
  //   JSON.stringify(newRMsData, null, 2)
  // );

  // const newRMsData = await Promise.all(
  //   payload.skuDetails.RMsData.map(async (rmd) => {
  //     const entries = await Promise.all(
  //       Object.entries(rmd).map(async ([key, value]) => {
  //         if (key === "RMImage") {
  //           const base64 = await convertImageToBase64(value);
  //           return [key, base64];
  //         }
  //         return [key, value];
  //       })
  //     );
  //     console.log("image entries are:", entries);
  //     return Object.fromEntries(entries);
  //   })
  // );

  const newPayload = {
    ...payload,
    skuDetails: {
      ...payload.skuDetails,
      image: await convertImageToBase64(payload.skuDetails.image),
      RMsData: newRMsData,
    },
  };

  // console.log(
  //   "reading newPayload:",
  //   JSON.stringify(newPayload, null, 2)
  // );

  // console.log(
  //   "newRMsData in addRawMaterial",
  //   JSON.stringify(newRMsData, null, 2)
  // );

  // console.log(
  //   "newPayload in addRawMaterial",
  //   JSON.stringify(newPayload, null, 2)
  // );

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

/**
 */
