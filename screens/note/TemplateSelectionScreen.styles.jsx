import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// 👉 Card nhỏ hơn và khoảng cách vừa phải
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_GAP * 3) / 2.2;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    background: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: "transparent",
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#0C4A6E",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },

    headerTitleContainer: {
        alignItems: "center",
        flex: 1,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
        letterSpacing: -0.6,
    },

    headerSubtitle: {
        fontSize: 12,
        fontWeight: "500",
        color: "#64748B",
        marginTop: 2,
    },

    listContent: {
        padding: CARD_GAP,
        paddingBottom: 100,
    },

    columnWrapper: {
        justifyContent: "space-between",
    },

    templateCard: {
        width: CARD_WIDTH,
        marginBottom: CARD_GAP,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",

        // 👉 Giảm shadow cho nhẹ – premium look
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },

    imageContainer: {
        width: "100%",
        height: CARD_WIDTH * 0.65, // nhỏ gọn hơn
        backgroundColor: "#F1F5F9",
        position: "relative",
    },

    templateImage: {
        width: "100%",
        height: "100%",
    },

    placeholderImage: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    imageGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "50%",
    },

    badge: {
        position: "absolute",
        top: 10,
        right: 10,
        borderRadius: 8,
        overflow: "hidden",
        elevation: 4,
    },

    badgeGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },

    badgeText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.7,
    },

    cardInfo: {
        padding: 10,
        gap: 4,
    },

    templateTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#0F172A",
        letterSpacing: -0.3,
    },

    templateDescription: {
        fontSize: 11,
        color: "#64748B",
        lineHeight: 16,
        marginBottom: 2,
    },

    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
    },

    pageCountBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },

    itemCountText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#3B82F6",
        letterSpacing: 0.2,
    },

    useButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    useButtonText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#3B82F6",
    },

    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },

    loadingBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        gap: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
        minWidth: 200,
    },

    loadingText: {
        fontSize: 15,
        color: "#475569",
        fontWeight: "600",
    },

    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },

    emptyIconContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 8,
    },

    emptyTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },

    emptyDescription: {
        fontSize: 15,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 28,
    },

    storeButton: {
        borderRadius: 14,
        overflow: "hidden",
        elevation: 8,
    },

    storeButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 28,
        paddingVertical: 14,
        gap: 10,
    },

    storeButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    creatingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        alignItems: "center",
        justifyContent: "center",
    },

    creatingBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 36,
        alignItems: "center",
        minWidth: 260,
        elevation: 10,
    },

    creatingIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    creatingText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 6,
    },

    creatingSubtext: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
});
