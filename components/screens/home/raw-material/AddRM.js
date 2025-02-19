// external library
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// internal imports
import { useAuth } from "../../../context/AuthContext";
import LoadingModal from "../../../util/LoadingModal";
import { rmStyles } from "../../../styles/AddRM.styles";
import { useImagePicker } from "../../../../hooks/useImagePicker";
import { addRawMaterial } from "../../../../services/api/addRawMaterial.service";
import { createRMsData } from "../../../../services/helpers/functions/createRmsDataForRMAdd";
import { createPayload } from "../../../../services/helpers/functions/createPayloadForRMAdd";
import MainImageSection from "../../../util/MainImageSection";
import { convertImageToBase64 } from "../../../../services/helpers/utilities/imageBase64Converter";

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
      alert("Error uploading image: " + err.message);
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
      console.log("image save error was", err);
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

  /**
   * Constructs the payload and calls the addSku API.
   */
  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (!name) {
        throw new Error("Name is required");
      }

      // 1) Convert main image to base64
      const mainImageBase64 = await convertImageToBase64(mainImage);

      // 2) Create RMsData array
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

      // 5) On success, call addMaterial with something relevant from the response
      const createdItem = data?.data || {};
      console.log("API Response:", data);
      addMaterial(createdItem); // @FIXME:

      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      console.error("Add Raw Material Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add raw material. Please try again."
      );
    }
  };

  return (
    <View style={rmStyles.container}>
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
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        {/* GSM & Width */}
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              placeholder="GSM"
              value={gsm}
              onChangeText={setGSM}
              keyboardType="numeric"
            />
          </View>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              placeholder="Width"
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
              placeholder="Price (Rs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Select Type Dropdown (Solids / Prints) */}
        <View style={rmStyles.dropdown}>
          <Text style={rmStyles.dropdownLabel}>Select Type: </Text>
          <TouchableOpacity
            style={rmStyles.dropdownButton}
            onPress={() => setType(type === "Solids" ? "Prints" : "Solids")}
          >
            <Text>{type}</Text>
            <Ionicons name="chevron-down" size={16} color="black" />
          </TouchableOpacity>
        </View>

        {/* Construction / Print / Count */}
        <TextInput
          style={rmStyles.input}
          placeholder="Count / Construction / Print"
          value={constructionOrPrint}
          onChangeText={setConstructionOrPrint}
        />

        {/* Additional Info (Optional) */}
        <Text style={rmStyles.subHeading}>Additional Info</Text>
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              placeholder="Cost Price"
              value={costPrice}
              onChangeText={setCostPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={rmStyles.rowItem}>
            <TextInput
              style={rmStyles.input}
              placeholder="Available Stock"
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
              placeholder="Name"
              value={variant.name}
              onChangeText={(text) => handleVariantChange(index, "name", text)}
            />

            <TextInput
              style={rmStyles.input}
              placeholder="Description"
              value={variant.description}
              onChangeText={(text) =>
                handleVariantChange(index, "description", text)
              }
            />

            {/* Type Toggle */}
            <View style={rmStyles.dropdown}>
              <Text style={rmStyles.dropdownLabel}>Select Type: </Text>
              <TouchableOpacity
                style={rmStyles.dropdownButton}
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
            <View style={rmStyles.row}>
              <View style={rmStyles.rowItem}>
                <TextInput
                  style={rmStyles.input}
                  placeholder="Price"
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
              style={rmStyles.input}
              placeholder="Width"
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

      <MainImageSection
          mainImage={mainImage}
          showImageModal={showImageModal}
          setShowImageModal={setShowImageModal}
          uploadImage={uploadImage}
          removeImage={removeImage}
          openImageModal={openImageModal}
        />

      {/* Add LoadingModal at the bottom of the View */}
      <LoadingModal visible={isLoading} />
    </View>
  );
}

export default AddRMScreen;
