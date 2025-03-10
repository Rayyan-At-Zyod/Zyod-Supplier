import { StyleSheet, Platform } from "react-native";

export const currentTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
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
  showVariationsButton: {
    position: "absolute",
    top: 95,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    alignSelf: "flex-start",
  },
  variationsContainer: {
    marginTop: 16,
    // backgroundColor: 'pink',
  },
  variationsContentContainer: {
    justifyContent: "space-evenly",
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
  updateButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  // Sync status banner styles
  syncStatusBanner: {
    backgroundColor: "#333",
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  syncStatusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
