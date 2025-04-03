// external library
import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

// internal imports
import { rmStyles } from "../../../styles/viewRM.styles";

function ViewRMScreen() {
  const route = useRoute();
  const { material } = route.params; // Get the material data from navigation params

  return (
    <View style={rmStyles.container}>
      <ScrollView contentContainerStyle={rmStyles.scrollContainer}>
        <Text style={rmStyles.heading}>Raw Material Details</Text>

        {/* Main Product Image */}
        <View style={rmStyles.imagePlaceholder}>
          {material.rmVariations[0]?.rmImage ? (
            <Image
              source={{ uri: material.rmVariations[0].rmImage }}
              style={rmStyles.mainImage}
            />
          ) : (
            <Text style={rmStyles.imagePlaceholderText}>
              No Image Available
            </Text>
          )}
        </View>

        {/* Name */}
        <Text style={rmStyles.label}>Name:</Text>
        <Text style={rmStyles.input}>
          {material.rmVariations[0]?.name || "No Name"}
        </Text>

        {/* GSM & Width */}
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <Text style={rmStyles.label}>GSM:</Text>
            <Text style={rmStyles.input}>{material.gsm || "N/A"}</Text>
          </View>
          <View style={rmStyles.rowItem}>
            <Text style={rmStyles.label}>Width:</Text>
            <Text style={rmStyles.input}>
              {material.rmVariations[0]?.width || "N/A"}
            </Text>
          </View>
        </View>

        {/* Price & Quantity */}
        <View style={rmStyles.row}>
          <View style={rmStyles.rowItem}>
            <Text style={rmStyles.label}>Price (Rs.):</Text>
            <Text style={rmStyles.input}>
              {material.rmVariations[0]?.generalPrice || "N/A"}
            </Text>
          </View>
          <View style={rmStyles.rowItem}>
            <Text style={rmStyles.label}>Quantity:</Text>
            <Text style={rmStyles.input}>
              {material.rmVariations[0]?.availableQuantity || "N/A"}
            </Text>
          </View>
        </View>

        {/* Type */}
        <Text style={rmStyles.label}>Type:</Text>
        <Text style={rmStyles.input}>
          {material.rmVariations[0]?.type || "N/A"}
        </Text>

        {/* Description */}
        <Text style={rmStyles.label}>Description:</Text>
        <Text style={rmStyles.input}>
          {material.rmVariations[0]?.description || "N/A"}
        </Text>

        {/* Variants Section */}
        <Text style={rmStyles.subHeading}>Variants</Text>
        {material.rmVariations.map((variation, index) => (
          <View key={index} style={rmStyles.variantContainer}>
            <Text style={rmStyles.label}>Variant Name:</Text>
            <Text style={rmStyles.input}>{variation.name || "N/A"}</Text>

            <Text style={rmStyles.label}>Variant Description:</Text>
            <Text style={rmStyles.input}>{variation.description || "N/A"}</Text>

            <Text style={rmStyles.label}>Variant Width:</Text>
            <Text style={rmStyles.input}>{variation.width || "N/A"}</Text>

            <Text style={rmStyles.label}>Variant Price:</Text>
            <Text style={rmStyles.input}>
              {variation.generalPrice || "N/A"}
            </Text>

            <Text style={rmStyles.label}>Variant Quantity:</Text>
            <Text style={rmStyles.input}>
              {variation.availableQuantity || "N/A"}
            </Text>

            <Text style={rmStyles.label}>Variant Code:</Text>
            <Text style={rmStyles.input}>
              {variation.newCode || "N/A"}
            </Text>

            {variation.rmImage && (
              <Image
                source={{ uri: variation.rmImage }}
                style={rmStyles.variantImage}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default ViewRMScreen;
