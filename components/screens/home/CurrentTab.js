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
import { useAuth } from "../../context/AuthContext";
import ImageDisplayModal from "../../util/ImageDisplayModal";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import { currentTabStyles } from "../../styles/CurrentTab.styles";
import LoadingModal from "../../util/LoadingModal";
import { loadRawMaterials } from "../../../services/helpers/functions/loadRMs";

function CurrentTab() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const rawMaterials = useSelector((state) => state.rawMaterials.items);
  const isLoading = useSelector((state) => state.rawMaterials.loading);
  const [refreshing, setRefreshing] = useState(false);

  // states for image display.
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  //offline syncing.
  const { isOnline } = useNetworkStatus(
    () => {
      // Callback when the app comes online
      console.log("App is back online");
    },
    token,
    dispatch
  );

  // Select variations.
  const [selectedItem, setSelectedItem] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const fetchData = async () => {
    await loadRawMaterials(token, isOnline, dispatch);
  };

  useEffect(() => {
    fetchData();
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
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.rmVariations}
            keyExtractor={(variation) => variation.rmVariationId.toString()}
            renderItem={({ item: variation }) => (
              <View style={currentTabStyles.variationItem}>
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
                    ? `Stock: ${
                        variation.availableQuantity
                      } ${variation.unitCode.toLowerCase()}`
                    : "Out of Stock"}
                  {"\n"}
                  Price: ₹{variation.generalPrice}/{variation.unitCode}
                </Text>
              </View>
            )}
            contentContainerStyle={currentTabStyles.variationsContentContainer}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
          {/* {item.rmVariations.map((variation) => (
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
                  ? `Stock: ${
                      variation.availableQuantity
                    } ${variation.unitCode.toLowerCase()}`
                  : "Out of Stock"}
                {"\n"}
                Price: ₹{variation.generalPrice}/{variation.unitCode}
              </Text>
            </View>
          ))} */}
        </View>
      </View>
    );
  };

  return (
    <View style={currentTabStyles.container}>
      {isLoading && <LoadingModal visible={isLoading} />}
      <View>
        <Text style={currentTabStyles.title}>
          App is {isOnline ? "Online" : "Offline"}
        </Text>
      </View>
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
