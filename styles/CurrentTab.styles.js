import { StyleSheet, Platform } from "react-native";

export const currentTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 75,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    position: "relative",
    padding: 16,
  },
  cardWithVariations: {
    borderBottomLeftRadius: 75,
    borderBottomRightRadius: 75,
  },
  viewButton: {
    position: "absolute",
    top: 0,
    right: 2,
    margin: 12,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 6,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
  },
  editButton: {
    position: "absolute",
    top: 45,
    right: 2,
    margin: 12,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 6,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
  },
  varBottom: {
    bottom: 5,
  },
  varBottomVariantOpened: {
    bottom: 45,
  },
  showVariationsButton: {
    position: "absolute",
    right: 2,
    margin: 12,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 6,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
  },
  topContainer: {
    flexDirection: "row",
    gap: 16,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 0,
  },
  materialImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  mainInfoContainer: {
    flex: 0.9,
    justifyContent: "space-between",
  },
  materialName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    flex: 1,
  },
  variationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    alignSelf: "flex-start",
  },
  variationsContainer: {
    marginTop: 16,
    // backgroundColor: 'pink',
  },
  variationsContentContainer: {
    justifyContent: "center",
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  variationItem: {
    backgroundColor: "#f8f8f8",
    color: "black",
    paddingVertical: 2,
    paddingHorizontal: 2,
    marginBottom: 4,
    borderRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  variationImage: {
    width: 65,
    height: 65,
    borderRadius: 33,
  },
  variationText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
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
  stockAdjustContainer: {
    gap: 12,
  },
  stockInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  stockButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  stockButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  activeStockButton: {
    backgroundColor: "#000",
  },
  stockButtonText: {
    fontSize: 14,
    color: "#333",
  },
  activeStockButtonText: { color: "white" },
  stockOutButton: {
    position: "absolute",
    bottom: 5,
    left: 2,
    margin: 12,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 18,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
  },
  updateButton: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    // backgroundColor: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 18,
    // borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
  },
  updateButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
});
