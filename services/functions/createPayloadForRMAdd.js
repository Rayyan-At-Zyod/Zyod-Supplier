import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { convertImageToBase64 } from "../utilities/imageBase64Converter";

// export const createPayload = ({
export const createPayload = async ({
  name,
  type,
  width,
  mainImage,
  gsm,
  price,
  RMsData,
  quantity,
  warehouseId,
  color,
}) => {
  // Generate UUID for the request
  const requestUUID = uuidv4();
  const printTypeCode = type === "Solids" ? "S" : "P";

  const payload = {
    skuDetails: {
      appDbId: requestUUID,
      name: name,
      // image: mainImage ? await convertImageToBase64(mainImage) : "",
      image: mainImage || "",
      categoryId: 15,
      gsm: gsm.toString(),
      unitId: 1,
      baseFabricId: 288,
      printTypeId: type === "Solids" ? 2 : 3,
      width: width.toString(),
      multipleVariation: true, // variants.length > 0
      rmCodeBuilder: {
        BaseFabricCode: "RMD",
        FabricTypeCode: "W",
        PrintTypeCode: printTypeCode,
      },
      RMsData,
    },
    additionalInfo: {
      costPrice: price.toString(),
      availableStock: quantity.toString(),
      warehouseId: warehouseId,
    },
    skuType: "Fabric",
  };

  return payload;
};
