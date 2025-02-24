import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

// internal imports
import { fetchRawMaterials } from "../../../services/api/fetchRawMaterial.service";
import {
  setMaterials,
  setLoading,
  addMaterial,
} from "../../../store/rawMaterialsSlice";
import { useAuth } from "../../context/AuthContext";
import ImageDisplayModal from "../../util/ImageDisplayModal";
import { currentTabStyles } from "../../styles/CurrentTab.styles";
import LoadingModal from "../../util/LoadingModal";

function CurrentTab() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const rawMaterials = useSelector((state) => state.rawMaterials.items);
  const isLoading = useSelector((state) => state.rawMaterials.loading);
  const [refreshing, setRefreshing] = useState(false);

  // states for image display
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const loadRawMaterials = async () => {
    dispatch(setLoading(true));
    try {
      const data = await fetchRawMaterials(token);
      // console.log("✅ Fetched raw materials:", data.length);
      dispatch(setMaterials(data.data));
    } catch (error) {
      // console.error("❌ Error fetching materials:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRawMaterials();
    setRefreshing(false);
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };

  useEffect(() => {
    // if (__DEV__) return;
    console.log("🔄 useEffect called: Fetching raw materials");
    loadRawMaterials();
  }, []);

  const renderItem = ({ item }) => {
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
                Width: {variation.width} m{"\n"}
                {variation.availableQuantity
                  ? `Stock: ${variation.availableQuantity} ${variation.unitCode.toLowerCase()}`
                  : "Out of Stock"}
                {"\n"}
                Price: ₹{variation.generalPrice}/{variation.unitCode}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={currentTabStyles.container}>
      {isLoading && <LoadingModal />}
      <FlatList
        data={rawMaterials}
        renderItem={renderItem}
        keyExtractor={(item) => item.greigeId.toString()}
        contentContainerStyle={currentTabStyles.listContainer}
        extraData={rawMaterials.length}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="black"
            colors={["black"]}
            progressBackgroundColor="white"
          />
        }
      />

      <TouchableOpacity
        style={currentTabStyles.addButton}
        onPress={() => navigation.navigate("AddRawMaterial")}
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
