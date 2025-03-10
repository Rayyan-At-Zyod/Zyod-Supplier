import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { setLoading, setHasMoreItems } from "../../../store/rawMaterialsSlice";

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
  const hasMoreItems = useSelector((state) => state.rawMaterials.hasMoreItems);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // states for image display.
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  //offline syncing.
  const { isOnline } = useNetworkStatus();

  const onRefresh = async () => {
    setRefreshing(true);
    // Reset pagination when refreshing
    setCurrentPage(1);
    dispatch(setHasMoreItems(true));
    await fetchData(1);
    setCurrentPage(1);
    dispatch(setHasMoreItems(true));
    await fetchData(1);
    setRefreshing(false);
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };

  const fetchData = async (page = 1) => {
    await loadRawMaterials(
      token,
      isOnline,
      dispatch,
      page,
      PAGE_SIZE,
      page > 1
    );
  };

  const loadMoreData = async () => {
    // Don't load more if already loading, refreshing, or no more items are available...
    if (isLoading || refreshing || loadingMore || !hasMoreItems || !isOnline)
      return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await loadRawMaterials(
        token,
        isOnline,
        dispatch,
        nextPage,
        PAGE_SIZE,
        true
      );
      // check for new items exist or not...
      if (result && result.data && result.data.length > 0) {
        setCurrentPage(nextPage);
      } else {
        dispatch(setHasMoreItems(false));
      }
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => {
    return <MaterialCard item={item} handleImagePress={handleImagePress} />;
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={currentTabStyles.footerLoader}>
        <ActivityIndicator size="large" color="black" />
        <Text style={currentTabStyles.loadingMoreText}>
          Loading More Items...
        </Text>
      </View>
    );
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
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
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
