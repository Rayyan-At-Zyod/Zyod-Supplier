import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    console.log("=== Loading Stored Auth Data ===");
    try {
      const [storedToken, storedUserData] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userData"),
      ]);

      console.log("Stored token exists:", !!storedToken);
      console.log("Stored user data exists:", !!storedUserData);

      if (storedToken && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        console.log("Loaded user data:", {
          id: parsedUserData.user_id,
          email: parsedUserData.user_email,
          role: parsedUserData.user_role,
        });

        setToken(storedToken);
        setUserData(parsedUserData);
        console.log("Auth data loaded successfully");
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
      console.log("Loading stored data completed");
    }
  };

  const signIn = async (token, user) => {
    console.log("=== Sign In Process ===");
    try {
      console.log("Storing auth data...");
      console.log("Token:", token);
      console.log("User data:", {
        id: user.user_id,
        email: user.user_email,
        role: user.user_role,
        supplierId: user.user_SupplierId,
      });

      // storing user data in async storage
      await Promise.all([
        AsyncStorage.setItem("userToken", token),
        AsyncStorage.setItem("userData", JSON.stringify(user)),
      ]);

      setToken(token);
      setUserData(user);
      console.log("Auth data stored successfully");
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
    console.log(
      "Current user:",
      userData
        ? {
            id: userData.user_id,
            email: userData.user_email,
            role: userData.user_role,
          }
        : "No user data"
    );

    try {
      console.log("Removing auth data from AsyncStorage...");
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userData"),
      ]);
      console.log("AsyncStorage items removed successfully");

      console.log("Clearing auth context state...");
      setToken(null);
      setUserData(null);
      console.log("Context state cleared");

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
    <AuthContext.Provider value={{ token, userData, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
