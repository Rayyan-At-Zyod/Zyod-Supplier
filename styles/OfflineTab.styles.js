import { StyleSheet, Platform } from "react-native";

export const offlineTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 20,
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  loadButton: {
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    zIndex: 1,
    minWidth: "25%",
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
  loadButtonText: {
    color: "white",
    textAlign: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#fff",
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    position: "relative",
  },
  pendingBadge: {
    position: "absolute",
    top: 10,
    right: 60,
    backgroundColor: "#FFA500",
    opacity: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  pendingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
