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
import {
  setLoading,
  updateMaterials,
  updateOfflineMaterials,
} from "../../../store/rawMaterialsSlice";
import { updateRM } from "../../../services/api/updateRmStock.service";
import { useAuth } from "../../../context/AuthContext";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import { updateAnOfflineMaterialAction } from "../../../services/offline/storage.service";

const MaterialCard = ({ item, handleImagePress, isOfflineItem = false }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { warehouseId, token } = useAuth();
  const [showVariants, setShowVariants] = useState(false);
  const { isOnline } = useNetworkStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [operationType, setOperationType] = useState("STOCK IN");
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const selectedVariation = item.rmVariations[selectedVariationIndex];

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
      // Calculate new quantity based on operation type
      const currentQuantity =
        Number.parseInt(selectedVariation.availableQuantity) || 0;
      const newQuantity =
        operationType === "STOCK IN"
          ? currentQuantity + quantity
          : currentQuantity - quantity >= 0
          ? currentQuantity - quantity
          : 0;
      if (!isOnline) {
        // Offline ka offline time me kardia
        await updateAnOfflineMaterialAction(
          selectedVariation.rmVariationId,
          newQuantity
        );
        // online ka offline me karna hai. @TODO: online item updates during offline app times
        console.error("Item which was online.", JSON.stringify(item, null, 2));
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
      } else {
        // For online materials
        if (isOfflineItem) {
          // offline ka online me block kardia (sync hoyga lele.)
          Alert.alert(
            "=== Feature under construction ===",
            "Update of offline items can be done only when app is offline also. Please sync this item once online."
          );
          return;
        }
        // online ka online me kardia.
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
        // Send to API
        await updateRM(payload, token);

        // Update Redux store after actually changing database
        dispatch(
          updateMaterials({
            itemId: selectedVariation.rmVariationId,
            newQuantity: newQuantity,
          })
        );
      }
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
      {!isEditing && (
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
                keyboardType="number-pad"
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
            {item.rmVariations.map((variation, index) => (
              <TouchableOpacity
                key={variation.rmVariationId.toString()}
                style={currentTabStyles.variationItem}
                onPress={() => setSelectedVariationIndex(index)}
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
