import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../store/rawMaterialsSlice";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../services/api/endpoints";
import { signupStyles } from "../../../styles/Signup.styles";
import { useNavigation } from "@react-navigation/native";
import { useImagePicker } from "../../../hooks/useImagePicker";
import ImageSelectionModal from "../../util/ImageSelectionModal";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [firstname, setFirstname] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [companyPhone, setCompanyPhone] = useState("");
  const [billingAddress1, setBillingAddress1] = useState("");
  const [billingAddress2, setBillingAddress2] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingPhoneNumber, setBillingPhoneNumber] = useState("");
  const [shippingAddress1, setShippingAddress1] = useState("");
  const [shippingAddress2, setShippingAddress2] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [fabricSupplier, setFabricSupplier] = useState("");
  const [gstDetails, setGstDetails] = useState("");
  const [gstImage, setGstImage] = useState(null);
  const [panDetails, setPanDetails] = useState("");
  const [panFilePicker, setPanFilePicker] = useState(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [chooseCancelCheque, setChooseCancelCheque] = useState("");

  const [showImageModal, setShowImageModal] = useState(false);
  const [error, setError] = useState("");

  const lastnameRef = useRef();
  const companyNameRef = useRef();
  const usernameAndEmailRef = useRef();
  const companyPhoneRef = useRef();
  const billingPhoneNumberRef = useRef();
  const billingAddress1Ref = useRef();
  const billingAddress2Ref = useRef();
  const billingCountryRef = useRef();
  const billingStateRef = useRef();
  const billingCityRef = useRef();
  const billingPostalCodeRef = useRef();
  const shippingAddress1Ref = useRef();
  const shippingAddress2Ref = useRef();
  const shippingCountryRef = useRef();
  const shippingStateRef = useRef();
  const shippingCityRef = useRef();
  const shippingPostalCodeRef = useRef();
  const fabricSupplierRef = useRef();
  const gstDetailsRef = useRef();
  const gstFilePickerRef = useRef();
  const panDetailsRef = useRef();
  const panFilePickerRef = useRef();
  const bankNameRef = useRef();
  const accountNumberRef = useRef();
  const ifscCodeRef = useRef();
  const chooseCancelChequeRef = useRef();

  const [currentImageTarget, setCurrentImageTarget] = useState(null);

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.rawMaterials.loading);

  useEffect(() => {
    Alert.alert(
      "Sign Up Feature Not Available",
      "The Signup feature is not enabled for this version. Please try again later."
    );
    Alert.alert(
      "Sign Up Feature Not Available",
      "The Signup feature is not enabled for this version. Please try again later."
    );
    Alert.alert(
      "Sign Up Feature Not Available",
      "The Signup feature is not enabled for this app version. Please try again later."
    );
  }, []);

  // Upload images
  const uploadImage = async (mode = "camera") => {
    try {
      const { uri, error } = await useImagePicker({ mode });
      if (error) {
        throw new Error(error);
      } else if (uri) {
        if (currentImageTarget === "gst") {
          setGstImage(uri);
        } else if (currentImageTarget === "pan") {
          setPanFilePicker(uri);
        } else {
          setImage(uri);
        }
      }
    } catch (err) {
      Alert.alert("Error uploading image", err.message);
    } finally {
      setShowImageModal(false);
      setImageModalIndex(null);
    }
  };

  // Remove image
  const removeImage = async () => {
    try {
      if (currentImageTarget === "gst") {
        setGstImage(null);
      } else if (currentImageTarget === "pan") {
        setPanFilePicker(null);
      } else {
        setImage(null);
      }
      setShowImageModal(false);
    } catch (err) {
      Alert.alert("Error while removing pic.", err.message);
    }
  };

  const handleSignUp = async () => {
    console.log("=== Sign Up Attempt ===");

    // if (!firstname) {
    //   console.log("Validation failed: Missing credentials");
    //   setError("Please fill in all fields");
    //   return;
    // }

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
          UserName: firstname,
          Password: ifscCode,
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
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={signupStyles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <SafeAreaView style={signupStyles.container}>
            <View style={signupStyles.formContainer}>
              <Text style={signupStyles.mainTitle}>Sign Up</Text>
              <TouchableOpacity
                style={signupStyles.signInButton}
                onPress={() => navigation.goBack()}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={signupStyles.signInButtonText}>
                    Already have an account? {"\n"} Back to sign in.
                  </Text>
                )}
              </TouchableOpacity>
              <Text style={signupStyles.info}>
                Kindly note that all fields in each section are mandatory.
              </Text>
              <Text style={signupStyles.title}>New Supplier</Text>

              {error && <Text style={signupStyles.error}>{error}</Text>}

              <TextInput
                style={signupStyles.input}
                mode="outlined"
                label="First Name"
                value={firstname}
                onChangeText={setFirstname}
                blurOnSubmit={false}
                onSubmitEditing={() => lastnameRef.current?.focus()}
                textContentType="username"
                autoComplete="username"
                autoCapitalize="none"
                returnKeyType="next"
              />

              {/* Last Name */}
              <TextInput
                ref={lastnameRef}
                style={signupStyles.input}
                mode="outlined"
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => companyNameRef.current?.focus()}
              />

              {/* companyNameRef */}
              <TextInput
                ref={companyNameRef}
                style={signupStyles.input}
                mode="outlined"
                label="Company Name"
                value={companyName}
                onChangeText={setCompanyName}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => usernameAndEmailRef.current?.focus()}
              />

              {/* Main Product Image */}
              <TouchableOpacity
                style={signupStyles.imagePlaceholder}
                onPress={() => {
                  setCurrentImageTarget("main");
                  setShowImageModal(true);
                }}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={signupStyles.mainImage}
                  />
                ) : (
                  <Text style={signupStyles.imagePlaceholderText}>
                    Click To Upload Product Image
                  </Text>
                )}
              </TouchableOpacity>

              {/* usernameAndEmailRef */}
              <TextInput
                ref={usernameAndEmailRef}
                style={signupStyles.input}
                mode="outlined"
                label="Username (Must be company email)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => companyPhoneRef.current?.focus()}
              />

              {/* companyPhoneRef */}
              <TextInput
                ref={companyPhoneRef}
                style={signupStyles.input}
                mode="outlined"
                label="Company Phone Number"
                value={companyPhone}
                onChangeText={setCompanyPhone}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingAddress1Ref.current?.focus()}
              />

              {/* Billing Address 1 */}
              <TextInput
                ref={billingAddress1Ref}
                style={signupStyles.input}
                mode="outlined"
                label="Billing Address 1"
                value={billingAddress1}
                onChangeText={setBillingAddress1}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingAddress2Ref.current?.focus()}
              />

              {/* Billing Address 2 */}
              <TextInput
                ref={billingAddress2Ref}
                style={signupStyles.input}
                mode="outlined"
                label="Billing Address 2"
                value={billingAddress2}
                onChangeText={setBillingAddress2}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingCountryRef.current?.focus()}
              />

              {/* Billing Country */}
              <TextInput
                ref={billingCountryRef}
                style={signupStyles.input}
                mode="outlined"
                label="Billing Country"
                value={billingCountry}
                onChangeText={setBillingCountry}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingStateRef.current?.focus()}
              />

              {/* Billing State */}
              <TextInput
                ref={billingStateRef}
                style={signupStyles.input}
                mode="outlined"
                label="Billing State"
                value={billingState}
                onChangeText={setBillingState}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingCityRef.current?.focus()}
              />

              {/* Billing City */}
              <TextInput
                ref={billingCityRef}
                style={signupStyles.input}
                mode="outlined"
                label="Billing City"
                value={billingCity}
                onChangeText={setBillingCity}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingPostalCodeRef.current?.focus()}
              />

              {/* Billing Postal Code */}
              <TextInput
                ref={billingPostalCodeRef}
                style={signupStyles.input}
                mode="outlined"
                label="Billing Postal Code"
                value={billingPostalCode}
                onChangeText={setBillingPostalCode}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => billingPhoneNumberRef.current?.focus()}
              />

              {/* Billing Phone Number */}
              <TextInput
                ref={billingPhoneNumberRef}
                style={signupStyles.input}
                mode="outlined"
                label="Billing Phone Number"
                value={billingPhoneNumber}
                onChangeText={setBillingPhoneNumber}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => shippingAddress1Ref.current?.focus()}
              />

              {/* Shipping Address 1 */}
              <TextInput
                ref={shippingAddress1Ref}
                style={signupStyles.input}
                mode="outlined"
                label="Shipping Address 1"
                value={shippingAddress1}
                onChangeText={setShippingAddress1}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => shippingAddress2Ref.current?.focus()}
              />

              {/* Shipping Address 2 */}
              <TextInput
                ref={shippingAddress2Ref}
                style={signupStyles.input}
                mode="outlined"
                label="Shipping Address 2"
                value={shippingAddress2}
                onChangeText={setShippingAddress2}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => shippingCountryRef.current?.focus()}
              />

              {/* Shipping Country */}
              <TextInput
                ref={shippingCountryRef}
                style={signupStyles.input}
                mode="outlined"
                label="Shipping Country"
                value={shippingCountry}
                onChangeText={setShippingCountry}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => shippingStateRef.current?.focus()}
              />

              {/* Shipping State */}
              <TextInput
                ref={shippingStateRef}
                style={signupStyles.input}
                mode="outlined"
                label="Shipping State"
                value={shippingState}
                onChangeText={setShippingState}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => shippingCityRef.current?.focus()}
              />

              {/* Shipping City */}
              <TextInput
                ref={shippingCityRef}
                style={signupStyles.input}
                mode="outlined"
                label="Shipping City"
                value={shippingCity}
                onChangeText={setShippingCity}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => shippingPostalCodeRef.current?.focus()}
              />

              {/* Shipping Postal Code */}
              <TextInput
                ref={shippingPostalCodeRef}
                style={signupStyles.input}
                mode="outlined"
                label="Shipping Postal Code"
                value={shippingPostalCode}
                onChangeText={setShippingPostalCode}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => fabricSupplierRef.current?.focus()}
              />

              {/* Fabric Supplier */}
              <TextInput
                ref={fabricSupplierRef}
                style={signupStyles.input}
                mode="outlined"
                label="Fabric Supplier"
                value={fabricSupplier}
                onChangeText={setFabricSupplier}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => gstDetailsRef.current?.focus()}
              />

              <Text style={signupStyles.title}>KYC Details</Text>

              {/* GST Details */}
              <TextInput
                ref={gstDetailsRef}
                style={signupStyles.input}
                mode="outlined"
                label="GST Details"
                value={gstDetails}
                onChangeText={setGstDetails}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => panDetailsRef.current?.focus()}
              />

              {/* GST File Picker - product image */}
              <TouchableOpacity
                style={signupStyles.imagePlaceholder}
                ref={gstFilePickerRef}
                onPress={() => {
                  setCurrentImageTarget("gst");
                  setShowImageModal(true);
                }}
              >
                {gstImage ? (
                  <Image
                    source={{ uri: gstImage }}
                    style={signupStyles.mainImage}
                  />
                ) : (
                  <Text style={signupStyles.imagePlaceholderText}>
                    Click To Upload GST Number Image
                  </Text>
                )}
              </TouchableOpacity>

              {/* PAN File Picker */}
              <TextInput
                ref={panDetailsRef}
                style={signupStyles.input}
                mode="outlined"
                label="PAN Details"
                value={panDetails}
                onChangeText={setPanDetails}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => bankNameRef.current?.focus()}
              />

              {/* Pan details image */}
              <TouchableOpacity
                ref={panFilePickerRef}
                style={signupStyles.imagePlaceholder}
                onPress={() => {
                  setCurrentImageTarget("pan");
                  setShowImageModal(true);
                }}
              >
                {panFilePicker ? (
                  <Image
                    source={{ uri: panFilePicker }}
                    style={signupStyles.mainImage}
                  />
                ) : (
                  <Text style={signupStyles.imagePlaceholderText}>
                    Click To Upload PAN File
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={signupStyles.title}>Bank Details</Text>

              {/* Bank Name */}
              <TextInput
                ref={bankNameRef}
                style={signupStyles.input}
                mode="outlined"
                label="Bank Name"
                value={bankName}
                onChangeText={setBankName}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => accountNumberRef.current?.focus()}
              />

              {/* Account Number */}
              <TextInput
                ref={accountNumberRef}
                style={signupStyles.input}
                mode="outlined"
                label="Account Number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => ifscCodeRef.current?.focus()}
              />

              {/* IFSC Code */}
              <TextInput
                ref={ifscCodeRef}
                style={signupStyles.input}
                mode="outlined"
                label="IFSC Code"
                value={ifscCode}
                onChangeText={setIfscCode}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => chooseCancelChequeRef.current?.focus()}
              />

              {/* Choose Cancel Cheque */}
              <TextInput
                ref={chooseCancelChequeRef}
                style={signupStyles.input}
                mode="outlined"
                label="Cancel Cheque"
                value={chooseCancelCheque}
                onChangeText={setChooseCancelCheque}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />

              <TouchableOpacity
                style={signupStyles.button}
                onPress={handleSignUp}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={signupStyles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
      <ImageSelectionModal
        mainImage={image}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        uploadImage={uploadImage}
        removeImage={removeImage}
      />
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
