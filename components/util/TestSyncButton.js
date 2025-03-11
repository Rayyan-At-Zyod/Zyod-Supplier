import React from "react";
import { Button, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { processPendingActions } from "./services/storage.service";
// import { loadPendingMaterials } from "./functions/loadPendingMaterials";
import { store } from "../../store/store";
import { loadPendingMaterials } from "../../services/functions/loadPendingMaterials";
import { processPendingActions } from "../../services/offline/storage.service";
// import { store } from "./store/store";

const TestSyncButton = () => {
  const handleSync = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("No token found");
        return;
      }
      console.log("Starting manual sync...");
      await processPendingActions(token);
      await loadPendingMaterials(store.dispatch);
      Alert.alert("Sync completed successfully!");
    } catch (error) {
      console.error("Error during manual sync:", error);
      Alert.alert("Sync failed. Check console for details.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Test Background Sync" onPress={handleSync} />
    </View>
  );
};

export default TestSyncButton;
