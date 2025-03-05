import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, View, TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../../context/AuthContext";
import ViewRMScreen from "../screens/raw-material/ViewRM";
import AddRMScreen from "../screens/raw-material/AddRM";
import SignInScreen from "../screens/auth/SignInScreen";
import HomeNavigatorScreen from "./HomeNavigator";
import LoadingModal from "../util/LoadingModal";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token } = useAuth();
  const navigation = useNavigation();

  return (
    <>
      {/* <LoadingModal visible={loading} /> */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen
              name="MainApp"
              component={HomeNavigatorScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ViewRawMaterial"
              component={ViewRMScreen}
              options={{
                headerShown: true,
                headerTitle: "Edit Material",
                headerTintColor: "black",
                headerTitleAlign: "center",
                headerStyle: {
                  backgroundColor: "white",
                },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                ),
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="AddRawMaterial"
              component={AddRMScreen}
              options={{
                headerShown: true,
                headerTitle: "Add Raw Material",
                headerTintColor: "black",
                headerTitleAlign: "center",
                headerStyle: {
                  backgroundColor: "white",
                },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                ),
                presentation: "modal",
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
