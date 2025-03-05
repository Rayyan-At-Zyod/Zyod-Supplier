// MaterialCard.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { currentTabStyles } from "../../../styles/CurrentTab.styles";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setLoading, updateItems } from "../../../store/rawMaterialsSlice";
import { updateRM } from "../../../services/api/updateRmStock.service";
import { useAuth } from "../../../context/AuthContext";

const MaterialCard = ({ item, handleImagePress, showEditButton = true }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { warehouseId, token } = useAuth();
  const [showVariants, setShowVariants] = useState(false);
  // stock update specific state
  const [isEditing, setIsEditing] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [operationType, setOperationType] = useState("STOCK IN");
  // Initialize selectedVariation with the first variation.
  const [selectedVariation, setSelectedVariation] = useState(
    item.rmVariations?.[0]
  );

  const handleStockUpdate = async () => {
    if (!stockQuantity || stockQuantity.trim() === "") {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    const quantity = parseInt(stockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Error", "Please enter a valid positive number");
      return;
    }

    try {
      dispatch(setLoading(true));

      const payload = {
        warehouseId,
        reason: "Stock adjustment",
        itemDetailsArray: [
          {
            itemId: selectedVariation.rmVariationId,
            itemCode: selectedVariation.newCode,
            itemType: "Fabric",
            itemUnit: selectedVariation.unitCode,
            operationType,
            quantityChange: quantity,
          },
        ],
      };

      await updateRM(payload, token);
      
      // Calculate new quantity based on operation type
      const currentQuantity = selectedVariation.availableQuantity || 0;
      const newQuantity = operationType === "STOCK IN" 
        ? currentQuantity + quantity 
        : currentQuantity - quantity;
      
      // Update Redux store
      dispatch(updateItems({
        itemId: selectedVariation.rmVariationId,
        newQuantity: newQuantity
      }));

      Alert.alert("Success", "Stock updated successfully");
      setIsEditing(false);
      setStockQuantity("");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update stock");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View
      style={
        showVariants && !isEditing
          ? [currentTabStyles.card, currentTabStyles.cardWithVariations]
          : currentTabStyles.card
      }
    >
      {/* View button */}
      {!isEditing && (
        <TouchableOpacity
          style={currentTabStyles.viewButton}
          onPress={() =>
            navigation.navigate("ViewRawMaterial", {
              material: item,
            })
          }
        >
          <Ionicons name="eye-outline" size={20} color="black" />
        </TouchableOpacity>
      )}

      {/* Edit button & Variants Toggle */}
      {showEditButton && !isEditing && (
        <>
          <TouchableOpacity
            style={currentTabStyles.editButton}
            onPress={() => {
              setIsEditing(true);
              setShowVariants(false);
            }}
          >
            <Ionicons name="trail-sign-outline" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={currentTabStyles.showVariationsButton}
            onPress={() => setShowVariants(!showVariants)}
          >
            <Ionicons
              name={showVariants ? "arrow-up-sharp" : `arrow-down`}
              size={22}
              color="black"
            />
          </TouchableOpacity>
        </>
      )}

      {/* Cancel Edit Button */}
      {isEditing && (
        <TouchableOpacity
          style={currentTabStyles.editButton}
          onPress={() => setIsEditing(false)}
        >
          <Ionicons name="close" size={20} color="black" />
        </TouchableOpacity>
      )}

      <View style={currentTabStyles.topContainer}>
        {/* Main image from the selected variation */}
        {selectedVariation?.rmImage && (
          <TouchableOpacity
            onPress={() =>
              !isEditing && handleImagePress(selectedVariation.rmImage)
            }
          >
            <Image
              source={{ uri: selectedVariation.rmImage }}
              style={currentTabStyles.materialImage}
            />
          </TouchableOpacity>
        )}

        {/* Main info container */}
        <View style={currentTabStyles.mainInfoContainer}>
          <Text style={currentTabStyles.materialName}>
            {selectedVariation?.name || "No Name"}
          </Text>
          <Text style={currentTabStyles.description}>
            Description: {selectedVariation?.description || "N/A"}
          </Text>

          {!isEditing ? (
            <>
              <Text style={currentTabStyles.description}>
                Stock:{" "}
                {selectedVariation.availableQuantity
                  ? `${selectedVariation.availableQuantity}`
                  : "Out of Stock"}
              </Text>
              <View style={currentTabStyles.detailsContainer}>
                <Text style={currentTabStyles.description}>
                  Price: ₹{selectedVariation?.generalPrice || "N/A"}/
                  {selectedVariation.unitCode}
                </Text>
                <Text style={currentTabStyles.description}>
                  Width: {selectedVariation?.width || "N/A"} m
                </Text>
              </View>
              <Text style={currentTabStyles.variationsTitle}>
                Variations Available: {item.rmVariations.length}
              </Text>
            </>
          ) : (
            <View style={currentTabStyles.stockAdjustContainer}>
              <Text style={currentTabStyles.description}>
                Current Available Stock:{" "}
                {selectedVariation.availableQuantity || 0}
              </Text>
              <TextInput
                style={currentTabStyles.stockInput}
                placeholder="Enter quantity"
                value={stockQuantity}
                onChangeText={setStockQuantity}
                keyboardType="numeric"
              />
              <View style={currentTabStyles.stockButtonsContainer}>
                <TouchableOpacity
                  style={[
                    currentTabStyles.stockButton,
                    operationType === "STOCK IN" &&
                      currentTabStyles.activeStockButton,
                  ]}
                  onPress={() => setOperationType("STOCK IN")}
                >
                  <Text
                    style={[
                      currentTabStyles.stockButtonText,
                      operationType === "STOCK IN" &&
                        currentTabStyles.activeStockButtonText,
                    ]}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    currentTabStyles.stockButton,
                    operationType === "STOCK OUT" &&
                      currentTabStyles.activeStockButton,
                  ]}
                  onPress={() => setOperationType("STOCK OUT")}
                >
                  <Text
                    style={[
                      currentTabStyles.stockButtonText,
                      operationType === "STOCK OUT" &&
                        currentTabStyles.activeStockButtonText,
                    ]}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={currentTabStyles.updateButton}
                onPress={handleStockUpdate}
              >
                <Text style={currentTabStyles.updateButtonText}>
                  Update Stock
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Variations section */}
      {showVariants && !isEditing && (
        <View style={currentTabStyles.variationsContainer}>
          <View style={currentTabStyles.variationsContentContainer}>
            {item.rmVariations.map((variation) => (
              <TouchableOpacity
                key={variation.rmVariationId.toString()}
                style={currentTabStyles.variationItem}
                onPress={() => setSelectedVariation(variation)}
              >
                <Image
                  source={{ uri: variation.rmImage }}
                  style={currentTabStyles.variationImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default MaterialCard;
