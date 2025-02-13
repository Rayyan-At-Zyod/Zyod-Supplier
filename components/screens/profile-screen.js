import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://api.example.com/user";

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false); // Track menu state

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = (url) => {
    setMenuVisible(false); // Close menu when navigating
    Linking.openURL(url);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <View style={styles.profileContainer}>
            <ProfileField icon="person" label="Full Name" value={userData?.fullName} />
            <ProfileField icon="call" label="Mobile Number" value={userData?.mobile} />
            <ProfileField icon="mail" label="Email ID" value={userData?.email} />
            <ProfileField icon="card" label="Pan Card" value={userData?.pan} />
            <ProfileField icon="document" label="GST Number" value={userData?.gst} />
          </View>
        )}

        {/* 3-Dots Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity onPress={() => handleMenuPress("https://privacy.example.com")}>
                <Text style={styles.menuItem}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress("https://terms.example.com")}>
                <Text style={styles.menuItem}>Terms & Conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress("https://logout.example.com")}>
                <Text style={styles.menuItem}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress("https://delete-account.example.com")}>
                <Text style={styles.menuItem}>Delete My Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const ProfileField = ({ icon, label, value }) => (
  <View style={styles.field}>
    <Ionicons name={icon} size={20} color="black" />
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "N/A"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  menuContainer: { position: "absolute", top: 10, right: 10 },
  menu: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: { fontSize: 16, paddingVertical: 5, color: "blue" },
  loader: { marginTop: 20 },
  profileContainer: { marginTop: 20 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  fieldLabel: { fontSize: 12, color: "gray" },
  fieldValue: { fontSize: 16, fontWeight: "bold" },
});

export default ProfileScreen;
