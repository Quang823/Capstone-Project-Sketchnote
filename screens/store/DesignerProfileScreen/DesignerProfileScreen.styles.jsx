import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: "#64748B",
        fontWeight: "600",
    },

    // Header
    header: {
        paddingTop: 30,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
        position: "relative",
        overflow: "hidden",
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#3B82F6",
        opacity: 0.05,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
        letterSpacing: -0.5,
    },
    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    cartBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#EF4444",
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFF",
    },
    cartBadgeText: {
        color: "#FFF",
        fontWeight: "900",
        fontSize: 12,
    },

    // Designer Info Section
    designerInfoSection: {
        backgroundColor: "#FFF",
        margin: 20,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    designerHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    designerAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "#E0E7FF",
    },
    designerDetails: {
        flex: 1,
    },
    designerName: {
        fontSize: 24,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
        marginBottom: 4,
    },
    designerEmail: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: "row",
        gap: 24,
        marginTop: 8,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "900",
        color: "#1E293B",
    },
    statLabel: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },

    // Products Section
    productsSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
    },
    productCount: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "600",
    },

    // Products Grid - 4 items per row
    productsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },

    // Product Card - 23.5% width for 4 items per row
    productCard: {
        width: "23.5%",
        backgroundColor: "#FFF",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    productImageContainer: {
        height: 120,
        position: "relative",
        backgroundColor: "#F1F5F9",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    typeBadge: {
        position: "absolute",
        top: 6,
        left: 6,
        backgroundColor: "rgba(30, 41, 59, 0.85)",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeBadgeText: {
        color: "#FFF",
        fontSize: 8,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    ownerBadge: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        borderWidth: 1,
        borderColor: "#D1FAE5",
    },
    ownerBadgeText: {
        fontSize: 8,
        fontWeight: "800",
        color: "#059669",
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 13,
        fontWeight: "800",
        color: "#1E293B",
        lineHeight: 18,
        marginBottom: 3,
    },
    productDescription: {
        fontSize: 11,
        color: "#64748B",
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: "row",
        gap: 1,
        marginBottom: 6,
    },
    productFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 3,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: "900",
        color: "#1E293B",
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#084F8C",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#084F8C",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    // Empty State
    emptyProducts: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyProductsText: {
        marginTop: 16,
        fontSize: 16,
        color: "#64748B",
        fontWeight: "600",
    },
});
