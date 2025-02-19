import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import * as FileSystem from 'expo-file-system';
import LoadingModal from "../../util/LoadingModal";

function AddRMScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // The callback for updating local state in CurrentScreen
  const { addMaterial } = route.params;

  // Pull token (and possibly userData) from your auth context
  const { token, userData } = useAuth();

  // Top-level raw material form fields
  const [name, setName] = useState("");
  const [gsm, setGSM] = useState("");
  const [width, setWidth] = useState("");
  const [type, setType] = useState("Solids"); // "Solids" or "Prints"
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [constructionOrPrint, setConstructionOrPrint] = useState("");
  const [mainImage, setMainImage] = useState(""); // For storing a URI or base64

  // Additional Info (if needed)
  const [costPrice, setCostPrice] = useState("");
  const [availableStock, setAvailableStock] = useState("");

  // Variants array
  const [variants, setVariants] = useState([]);

  // For handling the "Pick Image" modal logic
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(null);
  // index to know which variant (or main image) we're editing

  // Add this state near other state declarations
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Adds a new empty variant row.
   */
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        price: "",
        quantity: "",
        type: "Solids", // or "Prints"
        width: "", // or anything else needed
        image: "",
      },
    ]);
  };

  /**
   * Removes a variant at a specific index.
   */
  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Updates a single field in a given variant.
   */
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  /**
   * Handle the "Click Picture" or "Add Image" action.
   * Here we just show a modal, but you'll integrate your actual image picker/camera logic.
   */
  const openImageModal = (variantIndex = null) => {
    setImageModalIndex(variantIndex);
    setShowImageModal(true);
  };

  /**
   * Example function to handle an image pick result.
   * You'd integrate a real image picker or camera here.
   */
  const handleImageSelected = (pickedUri) => {
    setShowImageModal(false);
    if (imageModalIndex === null) {
      // Setting main image
      setMainImage(pickedUri);
    } else {
      // Setting a variant image
      handleVariantChange(imageModalIndex, "image", pickedUri);
    }
  };

  /**
   * Upload images
   */
  const uploadImage = async (mode = "camera") => {
    let result = {};
    try {
      if (mode === "gallery") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }
      if (!result.canceled) {
        console.log("image was:", result.assets[0].uri);
        await saveImage(result.assets[0].uri);
      }
    } catch (err) {
      alert("Error uploading image", err.message);
      setShowImageModal(false);
      setImageModalIndex(null);
    }
  };

  // image upload helper function
  const saveImage = async (image) => {
    try {
      if (imageModalIndex === null) {
        // For main image
        setMainImage(image);
      } else {
        // For variant images
        handleVariantChange(imageModalIndex, "image", image);
      }
      setShowImageModal(false);
      setImageModalIndex(null);
    } catch (err) {
      console.log("error was:", err);
      throw Error(err);
    }
  };

  /**
   * Remove image
   */
  const removeImage = async () => {
    try {
      saveImage(null);
      // alert("Image removed");
      imageModalIndex === null
        ? setMainImage(null)
        : handleVariantChange(imageModalIndex, "image", null); // @FIXME: this is the code for remove image
      showImageModal(false);
    } catch (err) {
      alert("Error while removing pic.", err);
    }
  };

  // Add this helper function
  const convertImageToBase64 = async (uri) => {
    try {
      if (!uri) return null;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  /**
   * Constructs the payload and calls the addSku API.
   */
  const handleSave = async () => {
    try {
      // Show loading modal immediately when save is initiated
      setIsLoading(true);

      const requestUUID = uuidv4();
      const printTypeCode = type === "Solids" ? "S" : "P";
      const newCode = width ? `_${width}` : "";

      // Validate required fields
      if (!name) {
        throw new Error("Name is required");
      }

      // Convert main image to base64
      const mainImageBase64 = await convertImageToBase64(mainImage);

      // Create array starting with main item as first variant
      const RMsData = [
        // First variant contains the main item details
        {
          RMCategoryId: 3,
          RMSubCategoryId: 15,
          GreigeTypeId: null,
          Name: name,
          Description: constructionOrPrint || "",
          RMCodeBuilder: {
            BaseFabricCode: "RMD",
            FabricTypeCode: "W",
            PrintTypeCode: printTypeCode,
          },
          UnitOfMeasureId: 1,
          WarpLeft: null,
          WeftLeft: null,
          WarpRight: null,
          WeftRight: null,
          PrintTypeId: printTypeCode === "S" ? 2 : 3,
          RMSolidColorText: type === "Solids" ? "S" : "P",
          RMImage: mainImageBase64 ? [mainImageBase64] : [], // Convert main image
          RMVariationDetails: [
            {
              GeneralPrice: Number(price),
              NewCode: newCode,
              RMVarAttributeValueId: 9,
            },
          ],
          RMSupplierDetails: [
            {
              SupplierId: userData?.supplierId || 606,
              Price: price.toString(),
              Priority: "1",
              IsActive: true,
              NewCode: newCode,
            },
          ],
          RMInventoryDetails: [
            {
              NewCode: newCode,
              Warehouse: 2,
              CurrentStock: quantity.toString(),
            },
          ],
          RMTags: [],
          RMSolidColourId: null,
        },
        // Then add all other variants
        ...await Promise.all(variants.map(async (v, index) => {
          if (!v.name) {
            throw new Error(`Name is required for variant ${index + 1}`);
          }

          const variantImageBase64 = await convertImageToBase64(v.image);
          const variantPrintTypeCode = v.type === "Solids" ? "S" : "P";
          const variantNewCode = v.width ? `_${v.width}` : "";

          return {
            RMCategoryId: 3,
            RMSubCategoryId: 15,
            GreigeTypeId: null,
            Name: v.name,
            Description: v.description || "",
            image: null,
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
            RMSolidColorText: v.type === "Solids" ? "S" : "P",
            RMImage: variantImageBase64 ? [variantImageBase64] : [],
            RMVariationDetails: [
              {
                GeneralPrice: Number(v.price),
                NewCode: variantNewCode,
                RMVarAttributeValueId: 9,
              },
            ],
            RMSupplierDetails: [
              {
                SupplierId: userData?.supplierId || 606,
                Price: v.price.toString(),
                Priority: "1",
                IsActive: true,
                NewCode: variantNewCode,
              },
            ],
            RMInventoryDetails: [
              {
                NewCode: variantNewCode,
                Warehouse: 2,
                CurrentStock: v.quantity.toString(),
              },
            ],
            RMTags: [],
            RMSolidColourId: null,
          };
        })),
      ];

      const payload = {
        skuDetails: {
          appDbId: requestUUID,
          name: name,
          image: mainImageBase64 ? mainImageBase64 : "",
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

      // Log the payload before making the API call
      console.log('Request Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(
        "https://dev-api.zyod.com/v1/sku/addSkuRmMarketPlace",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('API Response:', data); // Log the response too

      if (!response.ok) {
        throw new Error(data.message || "Failed to add raw material");
      }

      // 4) On success, call addMaterial with something relevant from the response
      const createdItem = data?.data || {};
      addMaterial(createdItem);

      // 5) Navigate back
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      // Hide loading modal on error
      setIsLoading(false);
      console.error("Add Raw Material Error:", error);
      Alert.alert("Error", error.message || "Failed to add raw material. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Create Raw Material</Text>

        {/* Main Product Image */}
        <TouchableOpacity
          style={styles.imagePlaceholder}
          onPress={() => openImageModal(null)}
        >
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.mainImage} />
          ) : (
            <Text style={styles.imagePlaceholderText}>
              Click To Upload Product Image
            </Text>
          )}
        </TouchableOpacity>

        {/* Name */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        {/* GSM & Width */}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              placeholder="GSM"
              value={gsm}
              onChangeText={setGSM}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              placeholder="Width"
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Price & Quantity (Top-Level) */}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              placeholder="Price (Rs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Select Type Dropdown (Solids / Prints) */}
        <View style={styles.dropdown}>
          <Text style={styles.dropdownLabel}>Select Type: </Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setType(type === "Solids" ? "Prints" : "Solids")}
          >
            <Text>{type}</Text>
            <Ionicons name="chevron-down" size={16} color="black" />
          </TouchableOpacity>
        </View>

        {/* Construction / Print / Count */}
        <TextInput
          style={styles.input}
          placeholder="Count / Construction / Print"
          value={constructionOrPrint}
          onChangeText={setConstructionOrPrint}
        />

        {/* Additional Info (Optional) */}
        <Text style={styles.subHeading}>Additional Info</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              placeholder="Cost Price"
              value={costPrice}
              onChangeText={setCostPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              placeholder="Available Stock"
              value={availableStock}
              onChangeText={setAvailableStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Variants Section */}
        <Text style={styles.subHeading}>Add Variants</Text>
        {variants.map((variant, index) => (
          <View key={index} style={styles.variantContainer}>
            <TouchableOpacity
              style={styles.removeIcon}
              onPress={() => handleRemoveVariant(index)}
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={variant.name}
              onChangeText={(text) => handleVariantChange(index, "name", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={variant.description}
              onChangeText={(text) =>
                handleVariantChange(index, "description", text)
              }
            />

            {/* Type Toggle */}
            <View style={styles.dropdown}>
              <Text style={styles.dropdownLabel}>Select Type: </Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() =>
                  handleVariantChange(
                    index,
                    "type",
                    variant.type === "Solids" ? "Prints" : "Solids"
                  )
                }
              >
                <Text>{variant.type}</Text>
                <Ionicons name="chevron-down" size={16} color="black" />
              </TouchableOpacity>
            </View>

            {/* Price & Quantity */}
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={variant.price}
                  onChangeText={(text) =>
                    handleVariantChange(index, "price", text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  value={variant.quantity}
                  onChangeText={(text) =>
                    handleVariantChange(index, "quantity", text)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Width -> used for NewCode */}
            <TextInput
              style={styles.input}
              placeholder="Width"
              value={variant.width}
              onChangeText={(text) => handleVariantChange(index, "width", text)}
              keyboardType="numeric"
            />

            {/* Variant Image */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => openImageModal(index)}
            >
              <Text style={{ color: "#fff" }}>
                {variant.image ? "Change Picture" : "Click Picture*"}
              </Text>
            </TouchableOpacity>

            {variant.image && (
              <Image
                source={{ uri: variant.image }}
                style={styles.variantImage}
              />
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addVariantButton}
          onPress={handleAddVariant}
        >
          <Text style={styles.addVariantText}>+ Add Variant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Raw Material</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for picking images - placeholder logic */}
      <Modal
        transparent={true}
        visible={showImageModal}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setShowImageModal(false)}
          />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select an image</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                uploadImage();
              }}
            >
              <Text style={styles.modalOptionText}>Upload from Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                uploadImage("gallery");
              }}
            >
              <Text style={styles.modalOptionText}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                removeImage();
              }}
            >
              <Text style={styles.modalOptionText}>Remove image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add LoadingModal at the bottom of the View */}
      <LoadingModal visible={isLoading} />
    </View>
  );
}

export default AddRMScreen;

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: "#FFFACD",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePlaceholderText: {
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowItem: {
    flex: 1,
    marginRight: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dropdownLabel: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
  },
  variantContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    paddingTop: 32,
    position: "relative",
  },
  removeIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  uploadButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  variantImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  addVariantButton: {
    backgroundColor: "#efefef",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  addVariantText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "black",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#007BFF",
  },
  mainImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
  },
});
