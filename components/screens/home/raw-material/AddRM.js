// external library
import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { addMaterial } from "../../../../store/rawMaterialsSlice";

// internal imports
import { useAuth } from "../../../context/AuthContext";
import LoadingModal from "../../../util/LoadingModal";
import { rmStyles } from "../../../styles/AddRM.styles";
import ImageSelectionModal from "../../../util/ImageSelectionModal";
import { useImagePicker } from "../../../../hooks/useImagePicker";
import { addRawMaterial } from "../../../../services/api/addRawMaterial.service";
import { createRMsData } from "../../../../services/helpers/functions/createRmsDataForRMAdd";
import { createPayload } from "../../../../services/helpers/functions/createPayloadForRMAdd";
import { convertImageToBase64 } from "../../../../services/helpers/utilities/imageBase64Converter";
import { fetchPrimaryWarehouseIdOfThisUser } from "../../../../services/api/getWarehouseId.service";

function AddRMScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

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

  // Loading state
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
   */
  const openImageModal = (variantIndex = null) => {
    setImageModalIndex(variantIndex);
    setShowImageModal(true);
  };

  /**
   * Upload images
   */
  const uploadImage = async (mode = "camera") => {
    try {
      const { uri, error } = await useImagePicker({ mode });
      if (error) {
        throw new Error(error);
      } else if (uri) {
        await saveImage(uri);
      }
    } catch (err) {
      Alert.alert("Error uploading image", err.message);
    } finally {
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
    } catch (err) {
      console.error("Image save error:", err);
      throw Error(err);
    }
  };

  /**
   * Remove image
   */
  const removeImage = async () => {
    try {
      saveImage(null);
      imageModalIndex === null
        ? setMainImage(null)
        : handleVariantChange(imageModalIndex, "image", null);
      setShowImageModal(false);
    } catch (err) {
      Alert.alert("Error while removing pic.", err.message);
    }
  };

  /**
   * Fecth warehouseId for ADD API.
   */
  const fetchWarehouseId = async () => {
    try {
      // console.log("Token", token);
      // console.log("User data:", userData);
      // console.log("Getting warehosue Id.");
      const warehouseId = await fetchPrimaryWarehouseIdOfThisUser(
        token,
        userData.user_SupplierId
      );
      // console.log("got warehouse id:", warehouseId);
      return warehouseId;
    } catch (err) {
      // console.log("here.");
      throw new Error("Warehouses not found.");
    }
  };

  /**
   * Constructs the payload and calls the addSku API.
   */
  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (!name) {
        throw new Error("Name is required");
      }

      const warehouseId = await fetchWarehouseId();

      // 1) Convert main image to base64
      const mainImageBase64 = await convertImageToBase64(mainImage);

      // 2) Create RMsData array using the imported function
      const RMsData = await createRMsData({
        name,
        constructionOrPrint,
        type,
        price,
        width,
        quantity,
        mainImage,
        variants,
        userData,
        warehouseId, // Use the warehouseId from context
      });

      // 3) Create the payload using the helper function
      const payload = createPayload({
        name,
        constructionOrPrint,
        type,
        price,
        width,
        quantity,
        mainImage: mainImageBase64,
        gsm,
        costPrice,
        availableStock,
        variants,
        RMsData,
      });

      // 4) Make the API call
      const data = await addRawMaterial(payload, token);

      const temporaryItem = {
        greigeId: data?.data?.greigeId || Date.now(),
        gsm: gsm,
        rmVariations: [
          {
            rmVariationId: Date.now(),
            name: name,
            width: width,
            availableQuantity: quantity,
            unitCode: "mtr",
            generalPrice: price,
            rmImage: mainImage,
          },
        ],
      };

      dispatch(addMaterial(temporaryItem));
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={rmStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={rmStyles.scrollContainer}>
        <Text style={rmStyles.heading}>Create Raw Material</Text>

        {/* Main Product Image */}
        <TouchableOpacity
          style={rmStyles.imagePlaceholder}
          onPress={() => openImageModal(null)}
        >
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={rmStyles.mainImage} />
          ) : (
            <Text style={rmStyles.imagePlaceholderText}>
              Click To Upload Product Image
            </Text>
          )}
        </TouchableOpacity>

        {/* Name */}
        <TextInput
          style={rmStyles.input}
          label="Name"
          mode="outlined"
          value={name}
          onChangeText={setName}
        />

        {/* GSM & Width */}
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              label="GSM"
              mode="outlined"
              value={gsm}
              onChangeText={setGSM}
              keyboardType="numeric"
            />
          </View>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              label="Width"
              mode="outlined"
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Price & Quantity (Top-Level) */}
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              label="Price (Rs.)"
              mode="outlined"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={rmStyles.rowItem}>
            <TextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              mode="outlined"
              style={rmStyles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Select Type Dropdown (Solids / Prints) */}
        <View style={rmStyles.typeContainer}>
          <Text style={rmStyles.label}>Select Type:</Text>
          <View style={rmStyles.radioContainer}>
            {["Solids", "Prints"].map((option) => (
              <TouchableOpacity
                key={option}
                style={rmStyles.radioButton}
                onPress={() => setType(option)}
              >
                <View style={rmStyles.outerCircle}>
                  {type === option && <View style={rmStyles.innerCircle} />}
                </View>
                <Text style={rmStyles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Construction / Print / Count */}
        <TextInput
          style={rmStyles.input}
          label="Count / Construction / Print"
          mode="outlined"
          value={constructionOrPrint}
          onChangeText={setConstructionOrPrint}
        />

        {/* Additional Info (Optional) */}
        <Text style={rmStyles.subHeading}>Additional Info</Text>
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              label="Available Stock"
              mode="outlined"
              value={availableStock}
              onChangeText={setAvailableStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Variants Section */}
        <Text style={rmStyles.subHeading}>Add Variants</Text>
        {variants.map((variant, index) => (
          <View key={index} style={rmStyles.variantContainer}>
            <TouchableOpacity
              style={rmStyles.removeIcon}
              onPress={() => handleRemoveVariant(index)}
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>

            <TextInput
              style={rmStyles.input}
              label="Variant Name"
              mode="outlined"
              value={variant.name}
              onChangeText={(text) => handleVariantChange(index, "name", text)}
            />

            <TextInput
              style={rmStyles.input}
              label="Variant Description"
              mode="outlined"
              value={variant.description}
              onChangeText={(text) =>
                handleVariantChange(index, "description", text)
              }
            />

            {/* Select Type Toggle for Variants */}
            <View style={rmStyles.typeContainer}>
              <Text style={rmStyles.label}>Select Type:</Text>
              <View style={rmStyles.radioContainer}>
                {["Solids", "Prints"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={rmStyles.radioButton}
                    onPress={() => handleVariantChange(index, "type", option)}
                  >
                    <View style={rmStyles.outerCircle}>
                      {variant.type === option && (
                        <View style={rmStyles.innerCircle} />
                      )}
                    </View>
                    <Text style={rmStyles.radioText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price & Quantity */}
            <View style={rmStyles.row}>
              <View style={rmStyles.rowItem}>
                <TextInput
                  style={rmStyles.input}
                  label="Variant Price"
                  mode="outlined"
                  value={variant.price}
                  onChangeText={(text) =>
                    handleVariantChange(index, "price", text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={rmStyles.rowItem}>
                <TextInput
                  style={rmStyles.input}
                  label="Variant Quantity"
                  mode="outlined"
                  value={variant.quantity}
                  onChangeText={(text) =>
                    handleVariantChange(index, "quantity", text)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Width */}
            <TextInput
              style={rmStyles.input}
              label="Variant Width"
              mode="outlined"
              value={variant.width}
              onChangeText={(text) => handleVariantChange(index, "width", text)}
              keyboardType="numeric"
            />

            {/* Variant Image */}
            <TouchableOpacity
              style={rmStyles.uploadButton}
              onPress={() => openImageModal(index)}
            >
              <Text style={{ color: "#fff" }}>
                {variant.image ? "Change Picture" : "Click Picture*"}
              </Text>
            </TouchableOpacity>

            {variant.image && (
              <Image
                source={{ uri: variant.image }}
                style={rmStyles.variantImage}
              />
            )}
          </View>
        ))}

        <TouchableOpacity
          style={rmStyles.addVariantButton}
          onPress={handleAddVariant}
        >
          <Text style={rmStyles.addVariantText}>+ Add Variant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={rmStyles.saveButton} onPress={handleSave}>
          <Text style={rmStyles.saveButtonText}>Save Raw Material</Text>
        </TouchableOpacity>
      </ScrollView>

      <ImageSelectionModal
        mainImage={mainImage}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        uploadImage={uploadImage}
        removeImage={removeImage}
        openImageModal={openImageModal}
      />

      <LoadingModal visible={isLoading} />
    </KeyboardAvoidingView>
  );
}

export default AddRMScreen;
