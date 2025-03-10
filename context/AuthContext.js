import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPrimaryWarehouseIdOfThisUser } from "../services/api/getWarehouseId.service";
import { startBackgroundSync } from "../services/background/backgroundSync";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState(null);

  useEffect(() => {
    console.log("🔄 Auth context use effect.");
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    console.log("=== Loading Stored Auth Data ===");
    try {
      const [storedToken, storedUserData, authData] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userData"),
        AsyncStorage.getItem("authData"),
      ]);

      if (storedToken && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);

        setToken(storedToken);
        setUserData(parsedUserData);
        let newWarehouseId = await fetchPrimaryWarehouseIdOfThisUser(
          storedToken,
          parsedUserData.user_SupplierId
        );
        console.log("🥺 Warehouse ID:", newWarehouseId);
        setWarehouseId(newWarehouseId);
        console.log("=== Auth data loaded successfully ===");
        
        // If we don't have authData for background tasks, store it now
        if (!authData) {
          await AsyncStorage.setItem("authData", JSON.stringify({ token: storedToken }));
        }
      } else {
        console.log("No stored auth data found");
      }
    } catch (error) {
      console.error("=== Error Loading Stored Data ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (token, user) => {
    console.log("=== Sign In Process ===");
    try {
      // storing user data in async storage
      await Promise.all([
        AsyncStorage.setItem("userToken", token),
        AsyncStorage.setItem("userData", JSON.stringify(user)),
        AsyncStorage.setItem("authData", JSON.stringify({ token })),
      ]);

      console.log("user data:", userData);
      console.log("user token:", token);
      setToken(token);
      setUserData(user);
      loadStoredData();
      
      // Schedule a background sync task in case there are pending items
      startBackgroundSync().catch(error => {
        console.error('Failed to start background sync after sign in:', error);
      });
      
      console.log("Auth data stored successfully on sign in.");
    } catch (error) {
      console.error("=== Error Storing Auth Data ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  };

  const signOut = async () => {
    console.log("=== Sign Out Process ===");
    try {
      console.log("Removing auth data from app storage...");
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userData"),
        AsyncStorage.removeItem("authData"),
      ]);
      setToken(null);
      setUserData(null);
      console.log("Sign out completed successfully");
    } catch (error) {
      console.error("=== Error During Sign Out ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Even if AsyncStorage fails, we should still clear the context
      setToken(null);
      setUserData(null);
      console.log("Context state cleared despite error");
    } finally {
      console.log("Sign out process completed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, userData, signIn, signOut, loading, warehouseId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
