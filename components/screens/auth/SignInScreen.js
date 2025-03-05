import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../store/rawMaterialsSlice";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../services/api/endpoints";

const SignInScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const passwordRef = useRef();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.rawMaterials.loading);

  const handleSignIn = async () => {
    console.log("=== Sign In Attempt ===");
    console.log("Username:", username);
    console.log("Password:", password);

    if (!username || !password) {
      console.log("Validation failed: Missing credentials");
      setError("Please fill in all fields");
      return;
    }

    dispatch(setLoading(true));
    setError("");

    try {
      console.log("Making API request to /users/login");
      const response = await fetch(API_ENDPOINTS.USER_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserName: username,
          Password: password,
          PortalId: 3,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);

      const data = await response.json();
      console.log("Response data:", JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        console.log("API request failed:", data);
        throw new Error(data.message || "Sign in failed");
      }

      if (!data.data?.token || !data.data?.user) {
        throw new Error("Invalid response format");
      }

      console.log("Token received, length:", data.data.token.length);
      console.log("User data received:", {
        id: data.data.user.user_id,
        name: data.data.user.user_FirstName,
        email: data.data.user.user_email,
        role: data.data.user.user_role,
      });

      await signIn(data.data.token, data.data.user);
      console.log("Sign in successful");
    } catch (err) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              textContentType="username"
              autoComplete="username"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={handleSignIn}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
});

export default SignInScreen;
