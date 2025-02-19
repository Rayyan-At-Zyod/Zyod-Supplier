import { v4 as uuidv4 } from "uuid";

export const createPayload = ({
  name,
  constructionOrPrint,
  type,
  price,
  width,
  quantity,
  mainImage,
  gsm,
  costPrice,
  availableStock,
  variants = [],
  RMsData,
}) => {
  // Generate UUID for the request
  const requestUUID = uuidv4();
  const printTypeCode = type === "Solids" ? "S" : "P";

  return {
    skuDetails: {
      appDbId: requestUUID,
      name: name,
      image: mainImage || "",
      categoryId: 15,
      rmCodeBuilder: {
        BaseFabricCode: "RMD",
        FabricTypeCode: "W",
        PrintTypeCode: printTypeCode,
      },
      gsm: gsm.toString(),
      unitId: 1,
      baseFabricId: 288,
      printTypeId: type === "Solids" ? 2 : 3,
      width: width.toString(),
      multipleVariation: variants.length > 0,
      RMsData,
    },
    additionalInfo: {
      costPrice: costPrice.toString(),
      availableStock: availableStock.toString(),
      warehouseId: 2,
    },
    skuType: "Fabric",
  };
};