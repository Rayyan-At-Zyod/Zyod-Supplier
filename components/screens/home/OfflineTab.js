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
  processCurrentAction,
  processPendingActions,
} from "../../../services/offline/storage.service";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import MaterialCard from "./MaterialCard";
import { useAuth } from "../../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../store/rawMaterialsSlice";
import { offlineTabStyles } from "../../../styles/OfflineTab.styles";
import { loadPendingMaterials } from "../../../services/functions/loadPendingMaterials";
import ImageDisplayModal from "../../util/ImageDisplayModal";

const OfflineMaterialsTab = () => {
  const dispatch = useDispatch();
  const offlineItems = useSelector((state) => state.rawMaterials.offlineItems);
  const loading = useSelector((state) => state.rawMaterials.loading);
  const syncing = useSelector((state) => state.rawMaterials.syncing);
  const { isOnline } = useNetworkStatus();
  const { token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    loadPendingMaterials(dispatch);
  }, [offlineItems?.length]);

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const onRefresh = async () => {
    setLoading(true);
    await loadPendingMaterials(dispatch);
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={offlineTabStyles.cardContainer}>
      <MaterialCard
        item={item.temporaryDisplay}
        handleImagePress={handleImagePress}
        isOfflineItem={true}
      />
      {isOnline && (
        <TouchableOpacity
          style={offlineTabStyles.pendingBadge}
          onPress={async () => {
            try {
              dispatch(setLoading(true));
              await processCurrentAction(item.id, token);
              await loadPendingMaterials(dispatch);
            } catch (error) {
              console.error("Failed to process item:", error);
            } finally {
              dispatch(setLoading(false));
            }
          }}
        >
          <Text style={offlineTabStyles.pendingText}>Pending Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={offlineTabStyles.container}>
      <View style={offlineTabStyles.actionButtons}>
        {isOnline && offlineItems.length > 0 && (
          <TouchableOpacity
            style={offlineTabStyles.loadButton}
            onPress={async () => {
              try {
                dispatch(setLoading(true));
                await processPendingActions(token);
                await loadPendingMaterials(dispatch);
              } catch (error) {
                console.error("Failed to process all items:", error);
              } finally {
                dispatch(setLoading(false));
              }
            }}
          >
            <Text style={offlineTabStyles.loadButtonText}>Process All</Text>
          </TouchableOpacity>
        )}
        {/* Delete all pending actions */}
        {/* <TouchableOpacity
          style={offlineTabStyles.loadButton}
          onPress={async () => {
            await clearPendingActions();
            await loadPendingMaterials(dispatch);
          }}
        >
          <Text style={offlineTabStyles.loadButtonText}>Delete all</Text>
        </TouchableOpacity> */}
      </View>
      <>
        <Text style={offlineTabStyles.header}>
          Pending Offline Materials ({offlineItems.length})
        </Text>
        <Text style={offlineTabStyles.subHeader}>
          {isOnline
            ? `✅ Online${
                offlineItems.length > 0
                  ? " - You can upload the items now using the buttons below."
                  : ""
              }`
            : "⚠️ Offline - Items will sync when online"}
        </Text>
        <FlatList
          data={offlineItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.temporaryDisplay.greigeId.toString()}
          contentContainerStyle={offlineTabStyles.listContainer}
          extraData={JSON.stringify(offlineItems)}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor="black"
              colors={["black"]}
              progressBackgroundColor="white"
            />
          }
        />
      </>
      <ImageDisplayModal
        visible={isImageModalVisible}
        imageUrl={selectedImage}
        onClose={() => setIsImageModalVisible(false)}
      />
    </View>
  );
};

export default OfflineMaterialsTab;
