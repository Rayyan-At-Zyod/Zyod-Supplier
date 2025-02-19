import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import SignInScreen from "./components/screens/auth/SignInScreen";
import { ActivityIndicator, View, TouchableOpacity } from "react-native";
import TabNavigator from "./components/navigation/TabNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import UpdateRMScreen from "./components/screens/home/raw-material/UpdateRM";
import AddRMScreen from "./components/screens/home/raw-material/AddRM";

const Stack = createNativeStackNavigator();

function NavigationContent() {
  const { token, loading } = useAuth();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen
            name="MainApp"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditRawMaterial"
            component={UpdateRMScreen}
            options={{
              headerShown: true,
              headerTitle: "Edit Material",
              headerTintColor: "black",
              headerStyle: {
                backgroundColor: "white",
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: 16 }}
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
              headerStyle: {
                backgroundColor: "white",
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: 16 }}
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <NavigationContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
