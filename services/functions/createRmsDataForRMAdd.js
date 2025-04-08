import { convertImageToBase64 } from "../utilities/imageBase64Converter";

export const createRMsData = async ({
  name,
  constructionOrPrint,
  type,
  price,
  width,
  quantity,
  mainImage,
  variants = [],
  userData,
  warehouseId,
  color,
}) => {
  try {
    // const mainImageBase64 = await convertImageToBase64(mainImage);
    const printTypeCode = type === "Solids" ? "S" : "P";
    const newCode = width ? `_${width}` : "";
    console.log("color:", color, "typeof color:", typeof color);

    // Create array starting with main item as first variant
    const RMsData = [
      // First variant contains the main item details
      {
        RMCategoryId: 3,
        RMSubCategoryId: 15,
        GreigeTypeId: null,
        Name: name,
        Description: constructionOrPrint || "",
        UnitOfMeasureId: 1,
        WarpLeft: null,
        WeftLeft: null,
        WarpRight: null,
        WeftRight: null,
        PrintTypeId: printTypeCode === "S" ? 2 : 3,
        RMSolidColorText: color.toString(),
        RMSolidColourId: null,
        RMTags: [],
        RMCodeBuilder: {
          BaseFabricCode: "RMD",
          FabricTypeCode: "W",
          PrintTypeCode: printTypeCode,
        },
        // RMImage: mainImageBase64 ? [mainImageBase64] : [],
        RMImage: mainImage,
        RMInventoryDetails: [
          {
            NewCode: newCode,
            Warehouse: warehouseId,
            CurrentStock: quantity.toString(),
          },
        ],
        RMSupplierDetails: [
          {
            SupplierId: userData?.user_SupplierId,
            Price: price.toString(),
            Priority: "1",
            IsActive: true,
            NewCode: newCode,
          },
        ],
        RMVariationDetails: [
          {
            GeneralPrice: Number(price),
            NewCode: newCode,
            RMVarAttributeValueId: 9,
          },
        ],
      },
      // Then process all variants
      ...(await Promise.all(
        variants.map(async (v) => {
          // const variantImageBase64 = await convertImageToBase64(v.image);
          const variantImageBase64 = await convertImageToBase64(v.image);
          const variantPrintTypeCode = v.type === "Solids" ? "S" : "P";
          const variantNewCode = v.width ? `_${v.width}` : "";

          return {
            RMCategoryId: 3,
            RMSubCategoryId: 15,
            GreigeTypeId: null,
            Name: v.name,
            Description: v.description || "",
            RMCodeBuilder: {
              BaseFabricCode: "RMD",
              FabricTypeCode: "W",
              PrintTypeCode: variantPrintTypeCode,
            },
            UnitOfMeasureId: 1,
            WarpLeft: null,
            WeftLeft: null,
            WarpRight: null,
            WeftRight: null,
            PrintTypeId: variantPrintTypeCode === "S" ? 2 : 3,
            RMSolidColorText: v.color,
            // RMImage: variantImageBase64 ? [variantImageBase64] : [],
            RMImage: v.image ? v.image : [],
            RMVariationDetails: [
              {
                GeneralPrice: Number(v.price),
                NewCode: variantNewCode,
                RMVarAttributeValueId: 9,
              },
            ],
            RMSupplierDetails: [
              {
                SupplierId: userData?.user_SupplierId,
                Price: v.price.toString(),
                Priority: "1",
                IsActive: true,
                NewCode: variantNewCode,
              },
            ],
            RMInventoryDetails: [
              {
                NewCode: variantNewCode,
                Warehouse: warehouseId,
                CurrentStock: v.quantity.toString(),
              },
            ],
            RMTags: [],
            RMSolidColourId: null,
          };
        })
      )),
    ];

    console.log(">>RMsData:", JSON.stringify(RMsData, null, 2));
    return RMsData;
  } catch (error) {
    console.error("Error creating RMsData:", error);
    throw error;
  }
};
