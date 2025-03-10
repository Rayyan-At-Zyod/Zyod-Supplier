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
} from "../../../services/offline/storage.service";
import MaterialCard from "./MaterialCard";
import { useAuth } from "../../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../store/rawMaterialsSlice";
import { offlineTabStyles } from "../../../styles/OfflineTab.styles";
import { loadPendingMaterials } from "../../../services/functions/loadPendingMaterials";
import ImageDisplayModal from "../../util/ImageDisplayModal";
import { useSync } from "../../../context/SyncContext";

const OfflineMaterialsTab = () => {
  const dispatch = useDispatch();
  const offlineItems = useSelector((state) => state.rawMaterials.offlineItems);
  const loading = useSelector((state) => state.rawMaterials.loading);
  const syncing = useSelector((state) => state.rawMaterials.syncing);
  const { token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  
  // Use the sync context instead of useNetworkStatus
  const { isOnline, isSyncing, lastSyncTime, syncOfflineData } = useSync();

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
    </View>
  );

  return (
    <View style={offlineTabStyles.container}>
      <>
        <Text style={offlineTabStyles.header}>
          Pending Offline Materials ({offlineItems.length})
        </Text>
        <Text style={offlineTabStyles.subHeader}>
          {isOnline
            ? `✅ Online${
                offlineItems.length > 0
                  ? " - Auto-sync is enabled. Last sync: " + 
                    (lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : "Never")
                  : ""
              }`
            : "⚠️ Offline - Items will sync automatically when online"}
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
