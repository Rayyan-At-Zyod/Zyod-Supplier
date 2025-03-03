import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  clearPendingActions,
  loadFromCache,
} from "../../../services/offline/storage.service";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import MaterialCard from "./MaterialCard";

const ArchivedTab = () => {
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const { isOnline } = useNetworkStatus();

  const loadPendingMaterials = async () => {
    try {
      const pendingActions = (await loadFromCache("pendingActions")) || [];
      // Filter only ADD actions and transform them into displayable format
      const pendingAdds = pendingActions
        .filter((action) => action.type === "ADD")
        .map((action) => {
          console.error("payload", JSON.stringify(action.payload, null, 2));
          // const mappedItem = {
          //   greigeId: Date.now() + Math.random(), // Temporary ID for list key
          //   gsm: Number(action.payload.skuDetails.gsm), // Convert to number
          //   rmVariations: [
          //     {
          //       rmVariationId: Date.now(),
          //       name: action.payload.skuDetails.RMsData[0].Name,
          //       width: Number(
          //         action.payload.skuDetails.RMsData[0].RMInventoryDetails?.[0]
          //           .NewCode
          //       ), // Convert to number
          //       availableQuantity: Number(
          //         action.payload.skuDetails.RMsData[0].RMInventoryDetails?.[0]
          //           .CurrentStock
          //       ), // Convert to number
          //       unitCode: "mtr",
          //       generalPrice: Number(
          //         action.payload.skuDetails.RMsData[0].RMVariationDetails[0]
          //           ?.GeneralPrice
          //       ), // Convert to number
          //       rmImage: action.payload.mainImage,
          //     },
          //     // Include variants if any
          //     ...action.payload.skuDetails.RMsData.slice(1).map(
          //       (variant, index) => ({
          //         rmVariationId: Date.now() + index + 1,
          //         name: variant.Name || null,
          //         width: Number(variant.width) || null, // Convert to number
          //         availableQuantity: Number(variant.quantity) || null, // Convert to number
          //         unitCode: "mtr",
          //         generalPrice: Number(variant.price) || null, // Convert to number
          //         rmImage: variant.image || null,
          //       })
          //     ),
          //   ],
          // };
          // console.error("mappedItem", mappedItem);
          // return mappedItem;
          return action.temporaryDisplay;
        });

      // const pendingAdds = pendingActions
      // .filter((action) => action.type === "ADD")
      // .map((action) => ({
      //   greigeId: Date.now() + Math.random(), // Temporary ID for list key
      //   gsm: Number(action.payload.gsm), // Convert to number
      //   rmVariations: [
      //     {
      //       rmVariationId: Date.now(),
      //       name: action.payload.RMsData[0].name,
      //       width: Number(action.payload.width), // Convert to number
      //       availableQuantity: Number(action.payload.RMsData[0].quantity), // Convert to number
      //       unitCode: "mtr",
      //       generalPrice: Number(action.payload.RMsData[0].price), // Convert to number
      //       rmImage: action.payload.mainImage,
      //     },
      //     // Include variants if any
      //     ...action.payload.RMsData.slice(1).map((variant, index) => ({
      //       rmVariationId: Date.now() + index + 1,
      //       name: variant.name,
      //       width: Number(variant.width), // Convert to number
      //       availableQuantity: Number(variant.quantity), // Convert to number
      //       unitCode: "mtr",
      //       generalPrice: Number(variant.price), // Convert to number
      //       rmImage: variant.image,
      //     })),
      //   ],
      // }));

      setPendingMaterials(pendingAdds);
    } catch (error) {
      console.error("Error loading pending materials:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <MaterialCard item={item} />
      <View style={styles.pendingBadge}>
        <Text style={styles.pendingText}>Pending Sync</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.loadButton}
          onPress={loadPendingMaterials}
        >
          <Text style={styles.loadButtonText}>Load pending items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loadButton}
          onPress={async () => {
            await clearPendingActions();
            await loadPendingMaterials();
          }}
        >
          <Text style={styles.loadButtonText}>Clear pending items</Text>
        </TouchableOpacity>
      </View>
      {pendingMaterials.length > 0 ? (
        <>
          <Text style={styles.header}>
            Pending Materials ({pendingMaterials.length})
          </Text>
          <Text style={styles.subHeader}>
            {isOnline
              ? "✅ Online - These items will sync soon"
              : "⚠️ Offline - Items will sync when online"}
          </Text>
          <FlatList
            data={pendingMaterials}
            renderItem={renderItem}
            keyExtractor={(item) => item.greigeId.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending materials to sync</Text>
          <Text style={styles.emptySubText}>
            {isOnline
              ? "All materials are synced! 🎉"
              : "You're offline. Add materials and they'll appear here."}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  actionButtons: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  loadButton: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    zIndex: 1,
    minWidth: 150,
  },
  loadButtonText: {
    color: "white",
    textAlign: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#fff",
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    position: "relative",
    marginBottom: 16,
  },
  pendingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFA500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  pendingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default ArchivedTab;
