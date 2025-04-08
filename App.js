import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store/store";
import * as Sentry from "@sentry/react-native";
import { View, Text } from "react-native";

// Initialize Sentry with error tracking
// Sentry.init({
//   dsn: "https://0948c8e8eb6e162346e86654eb054a21@o4509047927603200.ingest.de.sentry.io/4509047939203152",
//   tracesSampleRate: 1.0,
//   sendDefaultPii: true,
//   enableNative: true,
//   enableNativeCrashHandling: true,
//   enableNativeFramesTracking: true,
// });

// Configure notification handling
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

export default function App() {
  return (
    <StoreProvider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <PaperProvider>
            <AppNavigator />
          </PaperProvider>
        </NavigationContainer>
      </AuthProvider>
    </StoreProvider>
  );
}

// Wrap the entire app with Sentry error boundary
// const SentryWrappedApp = Sentry.wrap(App);

// Add error boundary component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     Sentry.captureException(error, { extra: errorInfo });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             padding: 20,
//           }}
//         >
//           <Text style={{ color: "red", textAlign: "center" }}>
//             Something went wrong: {this.state.error?.message}
//           </Text>
//         </View>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default function AppWithErrorBoundary() {
//   return (
//     <ErrorBoundary>
//       <SentryWrappedApp />
//     </ErrorBoundary>
//   );
// }
