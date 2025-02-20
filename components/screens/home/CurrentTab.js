import React, { useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { currentTabStyles } from "../../styles/CurrentTab.styles";
import ImageDisplayModal from "../../util/ImageDisplayModal";

function CurrentTab() {
  const route = useRoute();
  const navigation = useNavigation();
  const { rawMaterials, setRawMaterials, loadRawMaterials } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  // states for image display
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRawMaterials();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={currentTabStyles.card}>
      {/* Edit button */}
      <TouchableOpacity
        style={currentTabStyles.editButton}
        onPress={() =>
          navigation.navigate("EditRawMaterial", {
            material: item,
            updateMaterial: (updatedMaterial) => {
              const newMaterials = rawMaterials.map((m) =>
                m.greigeId === updatedMaterial.greigeId ? updatedMaterial : m
              );
              setRawMaterials(newMaterials);
            },
          })
        }
      >
        <Ionicons name="pencil" size={18} color="black" />
      </TouchableOpacity>

      <View style={currentTabStyles.topContainer}>
        {/* Main image */}
        {item.rmVariations?.[0]?.rmImage && (
          <TouchableOpacity
            onPress={() => handleImagePress(item.rmVariations[0].rmImage)}
          >
            <Image
              source={{ uri: item.rmVariations[0].rmImage }}
              style={currentTabStyles.materialImage}
            />
          </TouchableOpacity>
        )}

        {/* Main info container */}
        <View style={currentTabStyles.mainInfoContainer}>
          <View>
            <Text style={currentTabStyles.materialName}>
              {item.rmVariations[0]?.name || "No Name"}
            </Text>
            <Text style={currentTabStyles.description}>
              Description:{" "}
              {item.rmVariations ? item.rmVariations[0].description : "N/A"}
            </Text>
            <Text style={currentTabStyles.description}>
              Available Quantity:{" "}
              {item.rmVariations[0].availableQuantity
                ? item.rmVariations[0].availableQuantity
                : "N/A"}
            </Text>
          </View>
          <Text style={currentTabStyles.variationsTitle}>Variations:-</Text>
        </View>
      </View>

      {/* Variations section */}
      <View style={currentTabStyles.variationsContainer}>
        {item.rmVariations.map((variation) => (
          <View
            key={variation.rmVariationId}
            style={currentTabStyles.variationItem}
          >
            <TouchableOpacity
              onPress={() => handleImagePress(variation.rmImage)}
            >
              <Image
                source={{ uri: variation.rmImage }}
                style={currentTabStyles.variationImage}
              />
            </TouchableOpacity>
            <Text style={currentTabStyles.variationText}>
              Width: {variation.width}"{"\n"}
              {variation.availableQuantity
                ? `${variation.availableQuantity} ${variation.unitCode}`
                : "Out of Stock"}
              {"\n"}
              Price: ₹{variation.generalPrice}/{variation.unitCode}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={currentTabStyles.container}>
      <FlatList
        data={rawMaterials}
        renderItem={renderItem}
        keyExtractor={(item) => item.greigeId.toString()}
        contentContainerStyle={currentTabStyles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="black"
            colors={["black"]} // Android
            progressBackgroundColor="white" // Android
          />
        }
      />

      <TouchableOpacity
        style={currentTabStyles.addButton}
        onPress={() =>
          navigation.navigate("AddRawMaterial", {
            addMaterial: (newMaterial) => {
              console.log("Adding new material to state:", newMaterial);
              const newState = [...rawMaterials, newMaterial];
              setRawMaterials(newState);
              // setRawMaterials((current) => {
              //   console.log("New state after update:", newState);
              //   return newState;
              // });
            },
          })
        }
      >
        <Ionicons name="add-circle" size={50} color="black" />
      </TouchableOpacity>

      <ImageDisplayModal
        visible={isImageModalVisible}
        imageUrl={selectedImage}
        onClose={() => setIsImageModalVisible(false)}
      />
    </View>
  );
}

export default CurrentTab;
