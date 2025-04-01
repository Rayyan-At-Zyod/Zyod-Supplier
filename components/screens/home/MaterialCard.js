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
import { materialCardStyles } from "../../../styles/materialCard.styles";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/rawMaterialsSlice";
import { updateRM } from "../../../services/api/updateRmStock.service";
import { useAuth } from "../../../context/AuthContext";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import {
  updateAnOfflineMaterialAction,
  updateAnOnlineMaterialAction,
} from "../../../services/offline/storage.service";
import { loadRawMaterials } from "../../../services/functions/loadRMs";
import * as Sentry from "@sentry/react-native";

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

  const handleStockUpdate = async (
    makeEmpty = false,
    operationType = "STOCK OUT"
  ) => {
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
      let newQuantity =
        operationType === "STOCK IN"
          ? currentQuantity + quantity
          : currentQuantity - quantity;
      console.log("new qty:", newQuantity);

      if (makeEmpty) {
        setOperationType("STOCK OUT");
        setStockQuantity(currentQuantity);
      }
      if (currentQuantity < quantity && operationType === "STOCK OUT") {
        Alert.alert("Error", "You can't decrease stock to negative values.");
        return;
      }

      // offline @TODO:
      if (!isOnline) {
        if (isNaN(newQuantity)) newQuantity = 0;
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
            "Update of offline items can be done only when app is offline also. Please let this item reach server first."
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
              operationType: makeEmpty ? "STOCK OUT" : operationType,
              quantityChange: makeEmpty ? currentQuantity : quantity,
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
    Alert.alert(
      "Empty stock?", // New: Alert title
      "Are you sure you want to empty stock for this variant?", // New: Alert message
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => handleStockUpdate(true),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      style={
        showVariants && !isEditing
          ? [materialCardStyles.card, materialCardStyles.cardWithVariations]
          : materialCardStyles.card
      }
      onPress={() => navigation.navigate("ViewRawMaterial", { material: item })}
    >
      {/* Edit button & Variants Toggle */}
      {!isEditing && (
        <>
          <TouchableOpacity
            style={materialCardStyles.viewButton}
            onPress={() => {
              setIsEditing(true);
              setShowVariants(false);
            }}
          >
            <Ionicons name="trail-sign" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={
              showVariants
                ? [
                    materialCardStyles.showVariationsButton,
                    materialCardStyles.varBottomVariantOpened,
                  ]
                : [
                    materialCardStyles.showVariationsButton,
                    materialCardStyles.varBottom,
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
            style={materialCardStyles.editButton}
            onPress={() => setIsEditing(false)}
          >
            <Ionicons name="close" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={materialCardStyles.stockOutButton}
            onPress={handleStockEmpty}
          >
            <Text style={{ fontWeight: "bold" }}>Empty!</Text>
            <Ionicons
              name="trail-sign-outline"
              size={20}
              style={{ fontWeight: "bold" }}
              color="black"
            />
          </TouchableOpacity>
        </>
      )}
      <View style={materialCardStyles.topContainer}>
        {/* Main image from the selected variation */}
        {selectedVariation?.rmImage && (
          <TouchableOpacity
            onPress={() =>
              !isEditing && handleImagePress(selectedVariation.rmImage)
            }
          >
            <Image
              source={{ uri: selectedVariation.rmImage }}
              style={materialCardStyles.materialImage}
            />
          </TouchableOpacity>
        )}

        {/* Main info container */}
        <View style={materialCardStyles.mainInfoContainer}>
          <Text style={materialCardStyles.materialName}>
            {selectedVariation?.name || "No Name"}
          </Text>
          <Text style={materialCardStyles.description}>
            Description: {selectedVariation?.description || "N/A"}
          </Text>

          {!isEditing ? (
            <>
              <Text style={materialCardStyles.description}>
                Stock:{" "}
                {selectedVariation.availableQuantity
                  ? `${selectedVariation.availableQuantity} meters`
                  : "Out of Stock"}
              </Text>
              <View style={materialCardStyles.detailsContainer}>
                <Text style={materialCardStyles.description}>
                  Price: ₹{selectedVariation?.generalPrice || "N/A"}/m
                </Text>
                <Text style={materialCardStyles.description}>
                  Width: {selectedVariation?.width || "N/A"}
                </Text>
              </View>
              <Text style={materialCardStyles.variationsTitle}>
                Variants: {item.rmVariations.length}
              </Text>
            </>
          ) : (
            <View style={materialCardStyles.stockAdjustContainer}>
              <Text style={materialCardStyles.description}>
                Current Available Stock:{" "}
                {selectedVariation.availableQuantity || 0}
              </Text>
              <TextInput
                style={materialCardStyles.stockInput}
                placeholder="Enter quantity"
                value={stockQuantity}
                onChangeText={setStockQuantity}
                keyboardType="number-pad"
                allowFontScaling={false}
              />
              <View style={materialCardStyles.stockButtonsContainer}>
                <TouchableOpacity
                  style={materialCardStyles.updateButton}
                  onPress={() => {
                    setOperationType("STOCK IN");
                    handleStockUpdate(false, "STOCK IN");
                  }}
                >
                  <Text style={materialCardStyles.updateButtonText}>Add</Text>
                  <Ionicons name="trail-sign-outline" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={materialCardStyles.updateButton}
                  onPress={() => {
                    setOperationType("STOCK IN");
                    handleStockUpdate(false, "STOCK OUT");
                  }}
                >
                  <Text style={materialCardStyles.updateButtonText}>
                    Reduce
                  </Text>
                  <Ionicons name="trail-sign-outline" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
      {/* Variations section */}
      {showVariants && !isEditing && (
        <View style={materialCardStyles.variationsContainer}>
          <View style={materialCardStyles.variationsContentContainer}>
            {item.rmVariations.map((variation, index) => (
              <TouchableOpacity
                key={variation.rmVariationId.toString()}
                style={materialCardStyles.variationItem}
                onPress={() => setSelectedVariationIndex(index)}
              >
                <Image
                  source={{ uri: variation.rmImage }}
                  style={materialCardStyles.variationImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default MaterialCard;
