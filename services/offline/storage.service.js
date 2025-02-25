import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToCache = async (key, data) => {
  try {
    console.log("data in saveTocAche:", data);
    const newStorage = await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log("New storage in save to cache.\n", (await AsyncStorage.getItem(key)).length);
  } catch (error) {
    console.error(`Failed to save to cache (${key}):`, error);
  }
};

export const loadFromCache = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    console.log(
      "Loading from cache. Old storage in cache.\n",
      JSON.parse(data)
    );
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to load from cache (${key}):`, error);
    return null;
  }
};

export const queuePendingAction = async (action) => {
  try {
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    console.log("Adding a pending action.", action);
    pendingActions.push(action);
    console.log(
      "Hey, im adding an action, so new actions are:",
      pendingActions
    );
    await saveToCache("pendingActions", pendingActions);
  } catch (error) {
    console.error("Failed to queue new pending action:", error);
  }
};

// Add a helper function to clear pending actions
export const clearPendingActions = async () => {
  console.log("looks like ev worked.");
  try {
    await AsyncStorage.removeItem("pendingActions");
  } catch (error) {
    console.error("Failed to clear pending actions:", error);
  }
};
