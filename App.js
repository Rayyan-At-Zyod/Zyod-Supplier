import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./components/context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider } from 'react-redux';
import { store } from './store/store';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}
