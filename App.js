import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import SignInScreen from "./components/screens/auth/SignInScreen";
import { ActivityIndicator, View } from "react-native";
import TabNavigator from "./components/navigation/TabNavigator";
import UpdateRMScreen from "./components/screens/raw-material/UpdateRM";
import AddRMScreen from "./components/screens/raw-material/AddRM";

const Stack = createNativeStackNavigator();

function NavigationContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
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
              headerShown: false,
              headerTitle: "Edit Material",
              headerTintColor: "black",
              headerStyle: {
                backgroundColor: "white",
              },
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="AddRawMaterial"
            component={AddRMScreen}
            options={{
              headerShown: false,
              headerTitle: "Add Raw Material",
              headerTintColor: "black",
              headerAStyle: {
                backgroundColor: "white",
              },
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
