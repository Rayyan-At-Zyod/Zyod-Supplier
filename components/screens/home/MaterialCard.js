// MaterialCard.js
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { currentTabStyles } from "../../styles/CurrentTab.styles";
import { useNavigation } from "@react-navigation/native";

const MaterialCard = ({ item, handleImagePress }) => {
  const navigation = useNavigation();
  // Initialize selectedVariation with the first variation.
  const [selectedVariation, setSelectedVariation] = useState(
    item.rmVariations?.[0]
  );

  return (
    <View style={currentTabStyles.card}>
      {/* Edit button */}
      <TouchableOpacity
        style={currentTabStyles.editButton}
        onPress={() =>
          navigation.navigate("EditRawMaterial", {
            material: item,
          })
        }
      >
        <Ionicons name="pencil" size={18} color="black" />
      </TouchableOpacity>

      <View style={currentTabStyles.topContainer}>
        {/* Main image from the selected variation */}
        {selectedVariation?.rmImage && (
          <TouchableOpacity
            onPress={() => handleImagePress(selectedVariation.rmImage)}
          >
            <Image
              source={{ uri: selectedVariation.rmImage }}
              style={currentTabStyles.materialImage}
            />
          </TouchableOpacity>
        )}

        {/* Main info container */}
        <View style={currentTabStyles.mainInfoContainer}>
          <View>
            <Text style={currentTabStyles.materialName}>
              {selectedVariation?.name || "No Name"}
            </Text>
            <Text style={currentTabStyles.description}>
              Description: {selectedVariation?.description || "N/A"}
            </Text>
            <Text style={currentTabStyles.description}>
              Stock:{" "}
              {selectedVariation.availableQuantity
                ? `${selectedVariation.availableQuantity}`
                : "Out of Stock"}
            </Text>
            <View style={currentTabStyles.detailsContainer}>
              <Text style={currentTabStyles.description}>
                Price: ₹{selectedVariation?.generalPrice || "N/A"}/
                {selectedVariation.unitCode}
              </Text>
              <Text style={currentTabStyles.description}>
                Width: {selectedVariation?.width || "N/A"} m
              </Text>
            </View>
          </View>
          <Text style={currentTabStyles.variationsTitle}>
            Variations Available:-
          </Text>
        </View>
      </View>

      {/* Variations section */}
      <View style={currentTabStyles.variationsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={item.rmVariations}
          keyExtractor={(variation) => variation.rmVariationId.toString()}
          renderItem={({ item: variation }) => (
            <TouchableOpacity
              style={currentTabStyles.variationItem}
              onPress={() => {
                setSelectedVariation(variation);
                // handleImagePress(variation.rmImage);
              }}
            >
              {/* <TouchableOpacity
                onPress={() => handleImagePress(variation.rmImage)}
              > */}
              <Image
                source={{ uri: variation.rmImage }}
                style={currentTabStyles.variationImage}
              />
              {/* </TouchableOpacity> */}
            </TouchableOpacity>
          )}
          contentContainerStyle={currentTabStyles.variationsContentContainer}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      </View>
    </View>
  );
};

export default MaterialCard;
