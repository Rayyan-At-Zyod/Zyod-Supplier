import { StyleSheet } from "react-native";
export const signupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  info: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    backgroundColor: "#F9F9F9",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    color: "red",
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
    marginHorizontal: 15,
    backgroundColor: "white",
  },
  signInButton: {
    backgroundColor: "lavender",
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  mainImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 200,
    padding: "5%",
    marginHorizontal: "25%",
    backgroundColor: "#E0F7FA", // #E0F7FA
    backgroundColor: "#FFFACD", // #E0F7FA
    // backgroundColor: "lavender", // #FFFACD
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    overflow: "hidden",
  },
  imagePlaceholderText: {
    color: "#555",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
});
