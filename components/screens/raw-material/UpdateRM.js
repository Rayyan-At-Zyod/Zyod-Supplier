import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

function UpdateRMScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { material, updateMaterial } = route.params;
  const [formData, setFormData] = useState(material);

  const handleSave = async () => {
    try {
      // API call to update material will go here
      await updateMaterial(formData);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update material");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Edit Material: {material.BaseFabricName}</Text>
        {material.RMImage && material.RMImage.length > 0 && (
          <Image style={styles.image} source={{ uri: material.RMImage[0] }} />
        )}
        <TextInput
          style={styles.input}
          value={formData.BaseFabricName}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, BaseFabricName: text }))
          }
        />

        <Text style={styles.label}>Code</Text>
        <TextInput
          style={styles.input}
          value={formData.RMVariationCode}
          editable={false} // Code shouldn't be editable
        />

        {/* Add more fields as needed */}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 16,
    borderRadius: 8,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "black",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UpdateRMScreen;
