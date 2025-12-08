import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

    /* ============ HEADER ============ */
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        flex: 1,
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
        letterSpacing: -0.5,
    },

    /* ============ CONTENT ============ */
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },

    /* ============ NEW: SPLIT HALF SCREEN ============ */
    splitContainer: {
        flexDirection: 'row',
        margin: 20,
        gap: 12,
        height: 300,
    },
    balanceHalfCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#084F8C',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    balanceGradientHalf: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    balanceDecor1Half: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    balanceDecor2Half: {
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    balanceTopHalf: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    balanceLabelHalf: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceAmountHalf: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -1,
    },
    statsRowHalf: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 10,
        marginTop: 12,
    },
    statItemHalf: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValueHalf: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    statLabelHalf: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    statDividerHalf: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    quickBuyButtonHalf: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
        marginTop: 12,
    },
    quickBuyTextHalf: {
        fontSize: 14,
        fontWeight: '800',
        color: '#084F8C',
    },
    balanceGlowBlob: {
        position: 'absolute',
        top: -30,
        left: -20,
        width: 180,
        height: 180,
        borderRadius: 200,
        backgroundColor: 'rgba(255,255,255,0.15)',
        filter: 'blur(50px)',
    },

    balanceLottie: {
        position: 'absolute',
        top: 0,
        right: -3,
        width: 150,
        height: 150,
        opacity: 0.7,
    },

    balanceLabelHalf: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 6,
    },

    balanceAmountHalf: {
        fontSize: 36,
        fontWeight: '900',
        color: '#ffffff',
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 8,
    },

    balanceSubBright: {
        fontSize: 15,
        marginTop: 4,
        color: 'rgba(255,255,255,0.95)',
        letterSpacing: 1,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    balanceBackgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,        // chỉnh độ mờ ở đây
        zIndex: 0,
    },


    historyImageBackground: {
        ...StyleSheet.absoluteFillObject,
        transform: [{ scale: 1.05 }], // nhẹ nhàng nhìn sang
    },

    historyImageCard: {
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'flex-end',
        shadowColor: '#000',
        shadowOpacity: 0.45,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 15 },
        elevation: 18,
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    historyLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: -4,
        fontWeight: '600',
        letterSpacing: 3,
    },

    historyImageOverlay: {
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 32,
    },

    historyImageText: {
        fontSize: 40,
        fontFamily: 'Pacifico-Regular',
        color: '#fff',
        letterSpacing: 1.8,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 10,
    },

    historyArrow: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
    },
    historyBackgroundOverlayImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
        zIndex: 1,
    },

    /* ============ BALANCE CARD ============ */
    balanceCard: {
        margin: 20,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#084F8C',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
    },
    balanceGradient: {
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    balanceDecor1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    balanceDecor2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    balanceTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -2,
        marginBottom: 4,
    },
    balanceSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },
    balanceIcon: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Stats Row */
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },

    /* Quick Buy Button */
    quickBuyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    quickBuyText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#084F8C',
        letterSpacing: 0.3,
    },

    /* ============ SECTIONS ============ */
    section: {
        marginTop: 10,
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#084F8C",
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "500",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#dcdcdcff",
    },
    viewAllText: {
        color: "#3B82F6",
        fontSize: 13,
        fontWeight: "600",
        marginRight: 4,
    },

    /* ============ PACKAGES ============ */
    packagesScroll: {
        paddingLeft: 20,
        paddingRight: 20,
        gap: 16,
    },
    packageWrapper: {
        width: 280,
    },
    packageCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        position: 'relative',
    },
    packageCardPopular: {
        borderColor: '#084F8C',
        borderWidth: 3,
        backgroundColor: '#EFF6FF',
        shadowColor: '#084F8C',
        shadowOpacity: 0.2,
        elevation: 12,
    },

    /* Popular Badge */
    popularBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#084F8C',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        zIndex: 10,
        shadowColor: '#084F8C',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    popularText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 1,
    },

    /* Discount Tag */
    discountTag: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 10,
        shadowColor: '#ef4444',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },

    /* Package Content */
    packageIconContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    packageName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    creditsContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    packageCredits: {
        fontSize: 40,
        fontWeight: '900',
        color: '#084F8C',
        letterSpacing: -1,
        textAlign: 'center',
    },
    creditsLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    /* Savings Tag */
    savingsTag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#6ee7b7',
    },
    savingsText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#059669',
        letterSpacing: 0.3,
    },

    packageDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 10,
    },

    /* Price */
    priceContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    originalPrice: {
        fontSize: 14,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
        fontWeight: '600',
        marginBottom: 4,
    },
    packagePrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5,
    },

    /* Buy Button */
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#084F8C',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#084F8C',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    buyButtonPopular: {
        backgroundColor: '#063D6E',
        shadowColor: '#063D6E',
    },
    buyButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 0.5,
    },

    /* ============ HISTORY ============ */
    historyContainer: {
        marginHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#084F8C',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    historyIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    historyContent: {
        flex: 1,
    },
    historyDescription: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    historyDate: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    historyAmountContainer: {
        alignItems: 'flex-end',
    },
    historyAmount: {
        fontSize: 19,
        fontWeight: '900',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    historyAmountLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* Empty State */
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },

    /* ============ MODAL ============ */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 28,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: -10 },
        elevation: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalClose: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
        lineHeight: 22,
        marginBottom: 28,
    },

    /* Amount Input */
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        paddingHorizontal: 20,
        paddingVertical: 4,
        marginBottom: 20,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        paddingVertical: 12,
        textAlign: 'center',
    },
    inputSuffix: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
        marginLeft: 8,
    },

    /* Quick Amounts */
    quickAmounts: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    quickAmountBtn: {
        flex: 1,
        backgroundColor: '#EFF6FF',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        alignItems: 'center',
    },
    quickAmountText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#084F8C',
    },

    /* Package Details */
    packageDetails: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    detailRight: {
        alignItems: 'flex-end',
    },
    detailValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    detailOriginalPrice: {
        fontSize: 14,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
        fontWeight: '600',
        marginBottom: 2,
    },
    detailPrice: {
        fontSize: 22,
        fontWeight: '900',
        color: '#084F8C',
    },

    /* Savings Banner */
    savingsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#6ee7b7',
    },
    savingsBannerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: '#059669',
        lineHeight: 18,
    },

    /* Confirm Button */
    modalConfirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#084F8C',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        shadowColor: '#084F8C',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    modalConfirmText: {
        fontSize: 17,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },

    /* ============ LOADING ============ */
    loadingContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 16,
    },
});