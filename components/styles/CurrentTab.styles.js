import { StyleSheet, Platform } from "react-native";

export const currentTabStyles = StyleSheet.create({
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
  editButton: {
    position: "absolute",
    top: 4,
    right: 4,
    margin: 12,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 12,
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
  materialImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  mainInfoContainer: {
    flex: 1,
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
    // @TODO: check next 3 lines and width in variationsContentContainer for carousel
    // flexDirection: "row",
    // flexWrap: "wrap",
    // gap: 12,
    marginTop: 16,
  },
  variationsContentContainer: {
    paddingHorizontal: 4,
  },
  variationItem: {
    // width: Platform.OS === "ios" ? "48%" : 171,
    width: 250,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    width: 60,
    height: 60,
    borderRadius: 20,
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
});
