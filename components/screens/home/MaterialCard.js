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
import {
  updateAnOfflineMaterialAction,
  updateAnOnlineMaterialAction,
} from "../../../services/offline/storage.service";
import { loadRawMaterials } from "../../../services/functions/loadRMs";

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

  const handleStockUpdate = async (makeEmpty = false) => {
    if (!makeEmpty && (!stockQuantity || stockQuantity.trim() === "")) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    const quantity = parseInt(stockQuantity);
    if (!makeEmpty && (isNaN(quantity) || quantity <= 0)) {
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
          : currentQuantity - quantity;

      if (makeEmpty) {
        setOperationType("STOCK OUT");
        setStockQuantity(currentQuantity);
      }
      if (currentQuantity < quantity && operationType === "STOCK OUT") {
        Alert.alert("Error", "You can't decrease stock to negative values.");
        return;
      }
      // offline
      if (!isOnline) {
        if (isOfflineItem) {
          // For offline materials
          await updateAnOfflineMaterialAction(
            selectedVariation.rmVariationId,
            newQuantity
          );
        } else {
          // For online materials during offline mode
          const nonSelectedRmVariationIds = item.rmVariations
            .map((rmv) => rmv.rmVariationId)
            .filter((rmvId) => rmvId !== selectedVariation.rmVariationId);

          const nonSelectedRmVariationQuantities = item.rmVariations
            .map((rmv) => {
              return rmv.rmVariationId === selectedVariation.rmVariationId
                ? null
                : rmv.availableQuantity;
            })
            .filter((quantity) => quantity !== null);

          await updateAnOnlineMaterialAction(
            item.greigeId,
            selectedVariation.rmVariationId,
            newQuantity,
            operationType,
            quantity,
            item,
            warehouseId,
            nonSelectedRmVariationIds,
            nonSelectedRmVariationQuantities
          );
        }
      } else {
        // online
        // Online me offline item.
        if (isOfflineItem) {
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

        await updateRM(payload, token);
        await loadRawMaterials(token, isOnline, dispatch);
      }
      Alert.alert("Success", "Stock updated successfully");
      setIsEditing(false);
      setStockQuantity("");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update stock");
    } finally {
      dispatch(setLoading(false));
      console.log("Here");
    }
  };

  const handleStockEmpty = async () => {
    // const response = Alert.alert(
    //   "Confirm",
    //   "Are you sure you want to empty stock?",
    //   [
    //     {
    //       text: "No",
    //       onPress: () => {},
    //       style: "cancel",
    //     },
    //     { text: "Yes", onPress: () => handleStockUpdate(true) },
    //   ]
    // );
    Alert.alert(
      "Hey",
      "Empty stock feature is not ready - Please do it using the manual changes."
    );
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
          <Ionicons name="eye" size={20} color="black" />
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
            style={
              showVariants
                ? [
                    currentTabStyles.showVariationsButton,
                    currentTabStyles.varBottomVariantOpened,
                  ]
                : [
                    currentTabStyles.showVariationsButton,
                    currentTabStyles.varBottom,
                  ]
            }
            onPress={() => setShowVariants(!showVariants)}
          >
            <Ionicons
              // name={showVariants ? "arrow-up-sharp" : `arrow-down`}
              name={showVariants ? "apps-outline" : "apps-sharp"}
              size={22}
              color="black"
            />
          </TouchableOpacity>
        </>
      )}

      {/* Cancel Edit Button */}
      {isEditing && (
        <>
          <TouchableOpacity
            style={currentTabStyles.editButton}
            onPress={() => setIsEditing(false)}
          >
            <Ionicons name="close" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={currentTabStyles.stockOutButton}
            onPress={handleStockEmpty}
          >
            <Text>Empty Stock!</Text>
            <Ionicons name="trail-sign" size={20} color="black" />
          </TouchableOpacity>
        </>
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
                  ? `${selectedVariation.availableQuantity} meters`
                  : "Out of Stock"}
              </Text>
              <View style={currentTabStyles.detailsContainer}>
                <Text style={currentTabStyles.description}>
                  Price: ₹{selectedVariation?.generalPrice || "N/A"}/m
                </Text>
                <Text style={currentTabStyles.description}>
                  Width: {selectedVariation?.width || "N/A"}
                </Text>
              </View>
              <Text style={currentTabStyles.variationsTitle}>
                Variants: {item.rmVariations.length}
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
                allowFontScaling={false}
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
                <Ionicons name="trail-sign" size={20} color="black" />
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
