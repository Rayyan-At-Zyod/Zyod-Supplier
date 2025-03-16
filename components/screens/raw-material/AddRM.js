// external library
import React, { useState, useRef, createRef } from "react";
import { TextInput } from "react-native-paper";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { addMaterial, setLoading } from "../../../store/rawMaterialsSlice";

// internal imports
import { useAuth } from "../../../context/AuthContext";
import { rmStyles } from "../../../styles/AddRM.styles";
import ImageSelectionModal from "../../util/ImageSelectionModal";
import { useImagePicker } from "../../../hooks/useImagePicker";
import { addRawMaterial } from "../../../services/api/addRawMaterial.service";
import { createRMsData } from "../../../services/functions/createRmsDataForRMAdd";
import { createPayload } from "../../../services/functions/createPayloadForRMAdd";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import { loadRawMaterials } from "../../../services/functions/loadRMs";
import {
  loadFromCache,
  queuePendingAction,
  saveToCache,
} from "../../../services/offline/storage.service";
import { validateAddRMForm } from "../../../services/validation/addFormValidator";

function AddRMScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Pull token (and userData) from auth context
  const { token, userData, warehouseId } = useAuth();

  // Top-level raw material form fields
  const [name, setName] = useState("");
  const [gsm, setGSM] = useState("");
  const [width, setWidth] = useState("");
  const [type, setType] = useState("Solids");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [constructionOrPrint, setConstructionOrPrint] = useState("");
  const [mainImage, setMainImage] = useState(""); // For storing a URI or base64

  // Variants array
  const [variants, setVariants] = useState([]);

  // For handling the "Pick Image" modal logic
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(null);
  // index to know which variant (or main image) we're editing

  // useRefs
  const gsmRef = useRef();
  const widthRef = useRef();
  const priceRef = useRef();
  const quantityRef = useRef();
  const descriptionRef = useRef();
  const [variantRefs, setVariantRefs] = useState([]);
  const saveButtonRef = useRef();

  // Use the network status hook
  const { isOnline } = useNetworkStatus();

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
    setVariantRefs((prev) => [
      ...prev,
      {
        nameRef: createRef(),
        descriptionRef: createRef(),
        priceRef: createRef(),
        quantityRef: createRef(),
        widthRef: createRef(),
      },
    ]);
  };

  //Removes a variant at a specific index.
  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setVariantRefs((prev) => prev.filter((_, i) => i !== index));
  };

  // Updates a single field in a given variant.
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  // Handle the "Click Picture" or "Add Image" action.
  const openImageModal = (variantIndex = null) => {
    setImageModalIndex(variantIndex);
    setShowImageModal(true);
  };

  // Upload images
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

  // Remove image
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

  // Constructs the payload and calls the addSku API.
  const handleSave = async () => {
    try {
      dispatch(setLoading(true));
      // 1) Validate forms.
      const validationError = validateAddRMForm({
        name,
        mainImage,
        price,
        gsm,
        width,
        quantity,
        description: constructionOrPrint,
      });
      if (validationError) {
        throw new Error(validationError);
      }
      variants.forEach((v) => {
        const variantError = validateAddRMForm({
          name: v.name,
          mainImage: v.image,
          price: v.price,
          gsm,
          width: v.width,
          quantity: v.quantity,
          description: v.description,
        });
        if (variantError) {
          throw new Error(variantError);
        }
      });

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
      const payload = await createPayload({
        name,
        type,
        width,
        // mainImage: mainImageBase64,
        mainImage,
        gsm,
        price,
        RMsData,
        quantity,
        warehouseId,
      });

      const temporaryItem = {
        greigeId: Date.now(),
        gsm: gsm,
        rmVariations: [
          {
            rmVariationId: Date.now() + 1,
            name: name,
            width: width,
            availableQuantity: quantity,
            unitCode: "mtr",
            generalPrice: price,
            rmImage: mainImage,
          },
          ...variants.map((variant, index) => ({
            rmVariationId: (index + 1) * Date.now(),
            name: variant.name,
            width: variant.width,
            availableQuantity: variant.quantity,
            unitCode: "mtr",
            generalPrice: variant.price,
            rmImage: variant.image,
          })),
        ],
      };

      // 4) Make the API call
      if (isOnline) {
        await addRawMaterial(payload, token);
        await loadRawMaterials(token, isOnline, dispatch);
        const newCache = (await loadFromCache("cachedData")) || [];
        console.log("items in cache", newCache);
      } else {
        await queuePendingAction({
          type: "ADD",
          payload,
          temporaryDisplay: temporaryItem,
        });
      }
      
      // Navigate directly to MainApp
      navigation.navigate("MainApp");
    } catch (error) {
      Alert.alert("Error", error.message.toString());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      style={rmStyles.container}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 128 : 100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={rmStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
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
              returnKeyType="next"
              onSubmitEditing={() => gsmRef.current && gsmRef.current.focus()}
              onChangeText={setName}
            />

            {/* GSM & Width */}
            <View style={rmStyles.row}>
              <View style={rmStyles.rowItem}>
                <TextInput
                  style={rmStyles.input}
                  ref={gsmRef}
                  label="GSM"
                  mode="outlined"
                  value={gsm}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    widthRef.current && widthRef.current.focus()
                  }
                  onChangeText={setGSM}
                  keyboardType="number-pad"
                />
              </View>
              <View style={rmStyles.rowItem}>
                <TextInput
                  style={rmStyles.input}
                  ref={widthRef}
                  label="Width"
                  mode="outlined"
                  value={width}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    priceRef.current && priceRef.current.focus()
                  }
                  onChangeText={setWidth}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Price & Quantity (Top-Level) */}
            <View style={rmStyles.row}>
              <View style={rmStyles.rowItem}>
                <TextInput
                  style={rmStyles.input}
                  ref={priceRef}
                  label="Price (Rs.)"
                  mode="outlined"
                  value={price}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    quantityRef.current && quantityRef.current.focus()
                  }
                  onChangeText={setPrice}
                  keyboardType="number-pad"
                />
              </View>
              <View style={rmStyles.rowItem}>
                <TextInput
                  label="Quantity (in meters)"
                  ref={quantityRef}
                  value={quantity}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    descriptionRef.current && descriptionRef.current.focus()
                  }
                  onChangeText={setQuantity}
                  mode="outlined"
                  style={rmStyles.input}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Select Type Dropdown (Solids / Prints) */}
            <View style={rmStyles.typeContainer}>
              <Text style={rmStyles.label}>Select Type:</Text>
              <View style={rmStyles.radioContainer}>
                {["Solid", "Prints"].map((option) => (
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
            <Text style={rmStyles.subHeading}>Additional Information</Text>
            <TextInput
              key={`descriptionSendButtonChange-${variants.length}`}
              style={rmStyles.input}
              ref={descriptionRef}
              label="Count / Construction / Print"
              mode="outlined"
              value={constructionOrPrint}
              returnKeyType={variants.length > 0 ? "send" : "done"}
              onSubmitEditing={() => {
                if (variants.length > 0) {
                  variantRefs[0]?.nameRef.current?.focus();
                } else {
                  handleSave();
                }
              }}
              onChangeText={setConstructionOrPrint}
            />

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
                  ref={variantRefs[index]?.nameRef}
                  style={rmStyles.input}
                  label="Variant Name"
                  mode="outlined"
                  value={variant.name}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    variantRefs[index]?.descriptionRef.current?.focus()
                  }
                  onChangeText={(text) =>
                    handleVariantChange(index, "name", text)
                  }
                />

                <TextInput
                  ref={variantRefs[index]?.descriptionRef}
                  style={rmStyles.input}
                  label="Variant Description"
                  mode="outlined"
                  value={variant.description}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    variantRefs[index]?.priceRef.current?.focus()
                  }
                  onChangeText={(text) =>
                    handleVariantChange(index, "description", text)
                  }
                />

                {/* Select Type Toggle for Variants */}
                <View style={rmStyles.typeContainer}>
                  <Text style={rmStyles.label}>Select Type:</Text>
                  <View style={rmStyles.radioContainer}>
                    {["Solid", "Prints"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={rmStyles.radioButton}
                        onPress={() =>
                          handleVariantChange(index, "type", option)
                        }
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
                      ref={variantRefs[index]?.priceRef}
                      style={rmStyles.input}
                      label="Variant Price"
                      mode="outlined"
                      value={variant.price}
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        variantRefs[index]?.quantityRef.current?.focus()
                      }
                      onChangeText={(text) =>
                        handleVariantChange(index, "price", text)
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={rmStyles.rowItem}>
                    <TextInput
                      ref={variantRefs[index]?.quantityRef}
                      style={rmStyles.input}
                      label="Variant Quantity"
                      mode="outlined"
                      value={variant.quantity}
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        variantRefs[index]?.widthRef.current?.focus()
                      }
                      onChangeText={(text) =>
                        handleVariantChange(index, "quantity", text)
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* Width */}
                <TextInput
                  ref={variantRefs[index]?.widthRef}
                  style={rmStyles.input}
                  label="Variant Width"
                  mode="outlined"
                  value={variant.width}
                  // returnKeyType="send"
                  returnKeyType="send"
                  onSubmitEditing={() => openImageModal(index)}
                  onChangeText={(text) =>
                    handleVariantChange(index, "width", text)
                  }
                  keyboardType="number-pad"
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

            <TouchableOpacity
              ref={saveButtonRef}
              style={rmStyles.saveButton}
              onPress={handleSave}
            >
              <Text style={rmStyles.saveButtonText}>Save Raw Material</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
      <ImageSelectionModal
        // mainImage={mainImage}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        uploadImage={uploadImage}
        removeImage={removeImage}
        // openImageModal={openImageModal}
      />
    </KeyboardAvoidingView>
  );
}

export default AddRMScreen;
