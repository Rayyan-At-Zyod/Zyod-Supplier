import React, { useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function CurrentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { rawMaterials, setRawMaterials, loadRawMaterials } = route.params;
  const [refreshing, setRefreshing] = useState(false);

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditRawMaterial", {
            material: item,
            updateMaterial: (updatedMaterial) => {
              setRawMaterials((current) =>
                current.map((mat) =>
                  mat.greigeId === updatedMaterial.greigeId ? updatedMaterial : mat
                )
              );
            },
          })
        }
      >
        <Ionicons name="pencil" size={18} color="black" />
      </TouchableOpacity>

      {item.rmVariations?.[0]?.rmImage && (
        <Image
          source={{ uri: item.rmVariations[0].rmImage }}
          style={styles.materialImage}
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.materialName}>
          {item.rmVariations[0]?.name || 'No Name'}
        </Text>
        <Text style={styles.gsm}>GSM: {item.gsm || 'N/A'}</Text>
        
        <View style={styles.variationsContainer}>
          <Text style={styles.variationsTitle}>Variations:</Text>
          {item.rmVariations.map((variation, index) => (
            <View key={variation.rmVariationId} style={styles.variationItem}>
              <Text style={styles.variationText}>
                Width: {variation.width}"{' '}
                {variation.availableQuantity ? 
                  `• Stock: ${variation.availableQuantity} ${variation.unitCode}` : 
                  '• Out of Stock'}
                {' '}• ₹{variation.generalPrice}/{variation.unitCode}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rawMaterials}
        renderItem={renderItem}
        keyExtractor={(item) => item.greigeId.toString()}
        contentContainerStyle={styles.listContainer}
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
        style={styles.addButton}
        onPress={() =>
          navigation.navigate("AddRawMaterial", {
            addMaterial: (newMaterial) => {
              setRawMaterials((current) => [...current, newMaterial]);
            },
          })
        }
      >
        <Ionicons name="add-circle" size={50} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  materialImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  materialName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  gsm: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },
  variationsContainer: {
    marginTop: 8,
  },
  variationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  variationItem: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  variationText: {
    fontSize: 13,
    color: "#666",
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default CurrentScreen;
