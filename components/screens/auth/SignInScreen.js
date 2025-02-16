import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithToken } from "../../util/api";

const SignInScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    console.log("=== Sign In Attempt ===");
    console.log("Username:", username);
    console.log("Password:", password);

    if (!username || !password) {
      console.log("Validation failed: Missing credentials");
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Making API request to /users/login");
      const response = await fetch("https://dev-api.zyod.com/v1/users/login", {
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
      console.error("=== Sign In Error ===");
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "An error occurred during sign in");
    } finally {
      console.log("Sign in attempt completed");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
