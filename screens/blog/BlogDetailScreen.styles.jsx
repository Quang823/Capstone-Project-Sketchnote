import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffffff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fafafaff",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fafafaff",
    },
    emptyText: {
        fontSize: 16,
        color: "#64748B",
        marginTop: 16,
        fontWeight: "600",
    },

    // Hero Section
    heroSection: {
        position: "relative",
        backgroundColor: "#0F172A",
    },
    heroImageContainer: {
        position: "relative",
    },
    heroImage: {
        width: "100%",
        resizeMode: "cover",
    },
    heroGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "60%",
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 30,
        width: 50,
        height: 50,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },
    heroContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 32,
        alignSelf: "center",
        width: "100%",
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
        gap: 6,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#3B82F6",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    title: {
        fontWeight: "800",
        color: "#FFFFFF",
        lineHeight: 44,
        marginBottom: 24,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },

    // Author Card
    authorCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    authorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#CBD5E1",
        marginHorizontal: 4,
    },

    // Content Wrapper - Reduced side padding
    contentWrapper: {
        alignSelf: "center",
        width: "100%",
        paddingHorizontal: isTablet ? 16 : 8,
        paddingTop: 32,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: "#FEF3C7",
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    summaryIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#92400E",
    },
    summaryText: {
        fontSize: 15,
        color: "#78350F",
        lineHeight: 24,
        fontWeight: "500",
    },

    // Section Card - Updated for Full Width
    sectionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 0,
        marginBottom: 24,
        marginHorizontal: isTablet ? 12 : 4,
        borderWidth: 0,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        overflow: "hidden",
        position: "relative",
    },

    sectionCardGradient: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        opacity: 0.55,
    },
    sectionContentContainer: {
        zIndex: 1,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 28,
    },
    sectionNumber: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#084F8C",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 18,
        shadowColor: "#084F8C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
    sectionNumberText: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFF",
    },
    sectionTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        letterSpacing: -0.6,
        lineHeight: 30,
    },
    sectionImageWrapper: {
        width: "50%",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    sectionImage: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
    },
    sectionContent: {
        fontSize: 16,
        color: "#334155",
        lineHeight: 28,
        textAlign: "justify",
        fontWeight: "500",
    },

    // End Marker - New Card Design
    endMarkerContainer: {
        paddingHorizontal: isTablet ? 16 : 8,
        paddingVertical: 22,
    },
    endMarkerCard: {
        borderRadius: 20,
        padding: 22,
        alignItems: "center",
        shadowColor: "#d5d5d5ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    endMarkerContent: {
        alignItems: "center",
    },
    endMarkerIconCircle: {
        width: 54,
        height: 54,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#d5d5d5ff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    endMarkerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 8,
        textAlign: "center",
    },
    endMarkerSubtext: {
        fontSize: 15,
        color: "#475569",
        textAlign: "center",
        fontWeight: "500",
    },

    // Comments Section
    commentsSection: {
        backgroundColor: "#FFFFFF",
        paddingTop: 0,
        paddingBottom: 40,
    },

    // Discussion Header - New
    discussionHeader: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginBottom: 24,
    },
    discussionHeaderContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    discussionIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#d5d5d5ff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    discussionTitleWrapper: {
        flex: 1,
    },
    discussionTitle: {
        fontSize: 24,
        fontFamily: "Pacifico-Regular",
        color: "#0F172A",
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    discussionSubtitle: {
        fontSize: 14,
        color: "#64748B",
        fontFamily: "Poppins_600SemiBold",
    },

    // Comment Input Card
    commentInputCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 14,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: "rgba(203,213,225,0.6)",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },

    inputAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: "#8db5ffff",
    },
    commentInputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    commentInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: "#0F172A",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    submitButton: {
        backgroundColor: "#EFF6FF",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#8db5ffff",
        shadowColor: "#d5d5d5ff",
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 5,
    },


    // Comments List
    commentsLoader: {
        paddingVertical: 32,
        alignItems: "center",
    },
    emptyComments: {
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyCommentsText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
    },
    emptyCommentsSubtext: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 4,
    },

    // Comment Item
    commentItem: {
        flexDirection: "row",
        marginBottom: 24,
    },
    commentAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 14,
        borderWidth: 2,
        borderColor: "rgba(59,130,246,0.45)",
    },

    commentContent: {
        flex: 1,
    },
    commentBubble: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },

    commentAuthor: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },

    commentTime: {
        fontSize: 12,
        color: "#94A3B8",
        marginLeft: 6,
    },

    commentText: {
        fontSize: 15,
        color: "#334155",
        lineHeight: 22,
    },

    // Comment Actions
    commentActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 8,
        paddingLeft: 4,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },
    deleteText: {
        color: "#EF4444",
    },

    // Edit
    editContainer: {
        marginTop: 8,
    },
    editInput: {
        fontSize: 15,
        color: "#334155",
        lineHeight: 22,
        minHeight: 60,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    editActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 12,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    editButtonSave: {
        backgroundColor: "#3B82F6",
        borderColor: "#3B82F6",
    },
    editButtonTextCancel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },
    editButtonTextSave: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
    },

    // Replies
    repliesContainer: {
        marginTop: 16,
        paddingLeft: 16,
        borderLeftWidth: 2,
        borderLeftColor: "#E2E8F0",
    },
    replyItem: {
        flexDirection: "row",
        marginBottom: 16,
    },
    replyAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        borderWidth: 2,
        borderColor: "#EFF6FF",
    },
    replyInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },
    replyInput: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 14,
        fontSize: 14,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        color: "#0F172A",
    },
    replySubmitButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },

    // NEW SECTION STYLES - Full Width Design
    sectionNumberBadge: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 8,
    },
    sectionNumberBadgeText: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 1,
    },

    fullWidthImageContainer: {
        width: "100%",
        height: isTablet ? 320 : 240,
        position: "relative",
    },
    fullWidthImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imageGradientOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40%",
    },

    sectionContentPadding: {
        padding: isTablet ? 32 : 24,
    },

    accentLine: {
        width: 60,
        height: 4,
        borderRadius: 2,
        marginBottom: 20,
    },

    sectionTitleNew: {
        fontSize: isTablet ? 28 : 24,
        fontWeight: "800",
        color: "#0F172A",
        letterSpacing: -0.5,
        lineHeight: isTablet ? 36 : 32,
        marginBottom: 16,
    },

    sectionContentNew: {
        fontSize: 17,
        color: "#334155",
        lineHeight: 30,
        fontWeight: "500",
        textAlign: "left",
    },
});
