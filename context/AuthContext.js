import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPrimaryWarehouseIdOfThisUser } from "../services/api/getWarehouseId.service";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedToken, storedUserData] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userData"),
      ]);

      if (storedToken && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);

        setToken(storedToken);
        console.log(
          "parsedUserData before fetching WAREHOUSE ID:",
          parsedUserData
        );
        console.log("Stored token before fetching WAREHOUSE ID:", storedToken);
        console.log(
          "parsedUserData.user_SupplierId before fetching WAREHOUSE ID:",
          parsedUserData.user_SupplierId
        );
        setUserData(parsedUserData);
        let newWarehouseId = await fetchPrimaryWarehouseIdOfThisUser(
          storedToken,
          parsedUserData.user_SupplierId
        );
        setWarehouseId(newWarehouseId);
        console.log("=== Auth data loaded successfully ===");
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
      ]);

      console.log("user data:", userData);
      console.log("user token:", token);
      setToken(token);
      setUserData(user);
      loadStoredData();
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
