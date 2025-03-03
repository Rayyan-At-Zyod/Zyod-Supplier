import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  clearPendingActions,
  loadFromCache,
  processCurrentAction,
  processPendingActions,
  saveToCache,
} from "../../../services/offline/storage.service";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import MaterialCard from "./MaterialCard";
import { useAuth } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setOfflineMaterials,
} from "../../../store/rawMaterialsSlice";
import { archivedTabStyles } from "../../styles/ArchivedTab.styles";
import LoadingModal from "../../util/LoadingModal";

const ArchivedTab = () => {
  const dispatch = useDispatch();
  const offlineItems = useSelector((state) => state.rawMaterials.offlineItems);
  const loading = useSelector((state) => state.rawMaterials.loading);
  const syncing = useSelector((state) => state.rawMaterials.syncing);
  const { isOnline } = useNetworkStatus();
  const { token } = useAuth();

  const loadPendingMaterials = async () => {
    try {
      const pendingActions = (await loadFromCache("pendingActions")) || [];
      // Filter only ADD actions and transform them into displayable format
      const pendingAdds = pendingActions.filter(
        (action) => action.type === "ADD"
      );
      dispatch(setOfflineMaterials(pendingAdds));
    } catch (error) {
      console.error("Error loading pending materials:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={archivedTabStyles.cardContainer}>
      <MaterialCard
        item={item.temporaryDisplay}
        showEditButton={isOnline ? false : true}
      />
      {isOnline && (
        <TouchableOpacity
          style={archivedTabStyles.pendingBadge}
          onPress={async () => {
            try {
              dispatch(setLoading(true));
              await processCurrentAction(item.id, token);
              await loadPendingMaterials();
            } catch (error) {
              console.error("Failed to process item:", error);
            } finally {
              dispatch(setLoading(false));
            }
          }}
        >
          <Text style={archivedTabStyles.pendingText}>Pending Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    loadPendingMaterials();
  }, []);

  return (
    <>
      <View style={archivedTabStyles.container}>
        <View style={archivedTabStyles.actionButtons}>
          <TouchableOpacity
            style={archivedTabStyles.loadButton}
            onPress={loadPendingMaterials}
          >
            <Text style={archivedTabStyles.loadButtonText}>
              Load Saved Actions
            </Text>
          </TouchableOpacity>
          {isOnline && (
            <TouchableOpacity
              style={archivedTabStyles.loadButton}
              onPress={async () => {
                try {
                  dispatch(setLoading(true));
                  await processPendingActions(token);
                  await loadPendingMaterials();
                } catch (error) {
                  console.error("Failed to process all items:", error);
                } finally {
                  dispatch(setLoading(false));
                }
              }}
            >
              <Text style={archivedTabStyles.loadButtonText}>Process All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={archivedTabStyles.loadButton}
            onPress={async () => {
              await clearPendingActions();
              await loadPendingMaterials();
            }}
          >
            <Text style={archivedTabStyles.loadButtonText}>Delete all</Text>
          </TouchableOpacity>
        </View>
        {offlineItems.length > 0 ? (
          <>
            <Text style={archivedTabStyles.header}>
              Pending Materials ({offlineItems.length})
            </Text>
            <Text style={archivedTabStyles.subHeader}>
              {isOnline
                ? "✅ Online - You can upload the items now using the buttons below."
                : "⚠️ Offline - Items will sync when online"}
            </Text>
            <FlatList
              data={offlineItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.temporaryDisplay.greigeId.toString()}
              contentContainerStyle={archivedTabStyles.listContainer}
              extraData={offlineItems.length}
            />
          </>
        ) : (
          <View style={archivedTabStyles.emptyContainer}>
            <Text style={archivedTabStyles.emptyText}>
              No pending materials to sync
            </Text>
            <Text style={archivedTabStyles.emptySubText}>
              {isOnline
                ? "All materials are synced! 🎉"
                : "You're offline. Add materials and they'll appear here."}
            </Text>
          </View>
        )}
      </View>
      <LoadingModal visible={loading || syncing} />
    </>
  );
};

export default ArchivedTab;
