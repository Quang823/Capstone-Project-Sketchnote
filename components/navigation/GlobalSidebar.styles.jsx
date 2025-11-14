import { StyleSheet } from "react-native";

export const drawerStyles = StyleSheet.create({
  // Overlay
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },

  // Main Drawer Container
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Header Section
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  drawerTitle: {
    fontSize: 20,
    fontFamily: "Pacifico-Regular",
     color: "#084F8C",
    letterSpacing: -0.5,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  // User Info Section
 // User Info Section
userInfo: {
  alignItems: "center",
  paddingVertical: 24,
  paddingHorizontal: 20,
  backgroundColor: "#F8FAFC",
  borderBottomWidth: 1,
  borderBottomColor: "#E2E8F0",
},

avatar: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "#EFF6FF",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 12,
  overflow: "hidden",   // quan trọng để bo tròn ảnh
},

avatarImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

userName: {
  fontSize: 18,
  fontWeight: "600",
  color: "#1E293B",
  marginBottom: 4,
},

userEmail: {
  fontSize: 13,
  color: "#64748B",
  fontWeight: "400",
},

// Role Badge
roleBadge: {
  marginTop: 8,
  borderRadius: 16,
  paddingVertical: 4,
  paddingHorizontal: 10,
  backgroundColor: "#3B82F6",
},

roleText: {
  fontSize: 12,
  fontWeight: "600",
  color: "#FFFFFF",
  textTransform: "capitalize",
},


  // Navigation Items Section
  drawerItems: {
    flex: 1,
    paddingTop: 8,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 10,
    gap: 12,
  },

  drawerItemActive: {
    backgroundColor: "#EFF6FF",
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  iconContainerActive: {
    backgroundColor: "#3B82F6",
  },

  drawerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#475569",
    flex: 1,
  },

  drawerTextActive: {
    color: "#1E293B",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
    marginHorizontal: 20,
  },

  // Footer Section
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },

  versionText: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "500",
  },
});