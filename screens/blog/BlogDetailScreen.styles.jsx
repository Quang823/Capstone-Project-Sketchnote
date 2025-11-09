import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const blogDetailStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },

  // Loading & Error States
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },

  // Header Section
  heroSection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 32,
  },
  heroImage: {
    width: "100%",
    height: isTablet ? 450 : 300,
    resizeMode: "cover",
  },

  // Back Button
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  // Content Container
  contentContainer: {
    maxWidth: isTablet ? 1000 : "100%",
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: isTablet ? 40 : 20,
    paddingTop: 32,
  },

  // Title
  blogTitle: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: isTablet ? 44 : 36,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // Author Card
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 28,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  authorDate: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  // Summary Box
  summaryBox: {
    backgroundColor: "#EFF6FF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#60A5FA",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 15,
    color: "#1E293B",
    lineHeight: 24,
    fontWeight: "500",
  },

  // Sections Container
  sectionsContainer: {
    maxWidth: isTablet ? 1000 : "100%",
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: isTablet ? 40 : 20,
    paddingVertical: 20,
  },

  // Section Card
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: isTablet ? 32 : 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIndicator: {
    width: 5,
    height: 28,
    backgroundColor: "#60A5FA",
    borderRadius: 3,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    letterSpacing: -0.5,
  },

  // Desktop/Tablet Layout
  sectionRowLeft: {
    flexDirection: "row",
    gap: 32,
  },
  sectionRowRight: {
    flexDirection: "row-reverse",
    gap: 32,
  },
  sectionImageContainer: {
    width: "45%",
  },
  sectionImage: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    resizeMode: "cover",
  },
  sectionTextContainer: {
    flex: 1,
    justifyContent: "center",
  },

  // Mobile Layout
  sectionImageMobile: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
  },

  // Section Content Text
  sectionContent: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 28,
    textAlign: "justify",
    fontWeight: "500",
  },

  // End Marker
  endMarker: {
    marginTop: 20,
    marginBottom: 40,
    paddingTop: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  endMarkerLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  endMarkerDivider: {
    width: 40,
    height: 1,
    backgroundColor: "#CBD5E1",
  },
  endMarkerText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});