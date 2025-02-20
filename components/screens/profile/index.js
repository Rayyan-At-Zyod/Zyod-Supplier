import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Linking } from "react-native";
import { useAuth } from "../../context/AuthContext";
import ProfileContent from "../../util/ProfileContent";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { signOut, userData } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = async (url) => {
    setMenuVisible(false);

    if (url === "https://logout.example.com") {
      await signOut();
      return;
    }

    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerLeft}
              onPress={() => navigation.navigate("Home")}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.headerRight}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileContainer}>
            <ProfileContent
              icon="person"
              label="Full Name"
              value={`${userData?.user_FirstName || ""} ${
                userData?.user_LastName || ""
              }`}
            />
            <ProfileContent
              icon="call"
              label="Mobile Number"
              value={userData?.user_PhoneNumber}
            />
            <ProfileContent
              icon="mail"
              label="Email ID"
              value={userData?.user_email}
            />
            <ProfileContent
              icon="card"
              label="PAN Card"
              value={userData?.pan_card}
            />
            <ProfileContent
              icon="briefcase"
              label="GST Number"
              value={userData.gst_number}
            />
          </View>

          {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity
                onPress={() =>
                  handleMenuPress("https://www.zyod.com/privacy-policy")
                }
              >
                <Text style={styles.menuItem}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleMenuPress("https://www.zyod.com/terms-and-conditions")
                }
              >
                <Text style={styles.menuItem}>Terms & Conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={signOut}>
                <Text style={styles.menuItem}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 56,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {},
  headerTitle: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  headerRight: {},
  menu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 50,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 5,
    color: "black",
  },
  loader: {
    marginTop: 20,
  },
  profileContainer: {
    marginTop: 0,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ProfileScreen;
