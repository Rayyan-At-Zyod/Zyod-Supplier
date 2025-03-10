import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { setLoading } from "../../../store/rawMaterialsSlice";

// internal imports
import { useAuth } from "../../../context/AuthContext";
import ImageDisplayModal from "../../util/ImageDisplayModal";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import { currentTabStyles } from "../../../styles/CurrentTab.styles";
import { loadRawMaterials } from "../../../services/functions/loadRMs";
import MaterialCard from "./MaterialCard";

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
  const { isOnline } = useNetworkStatus();

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
    return <MaterialCard item={item} handleImagePress={handleImagePress} />;
  };

  return (
    <View style={currentTabStyles.container}>
      {/* <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Text style={currentTabStyles.title}>
          App is{" "}
          <Text style={{ fontWeight: 600 }}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </Text>
        <TouchableOpacity
          style={currentTabStyles.title}
          onPress={() => {
            if (isOnline) onRefresh();
            else
              Alert.alert(
                "No internet connection",
                "Fetching last saved offline data from the app cache."
              );
          }}
        >
          <Text>{isOnline ? "Pull to refresh" : "Load offline data"}</Text>
        </TouchableOpacity>
      </View> */}
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
