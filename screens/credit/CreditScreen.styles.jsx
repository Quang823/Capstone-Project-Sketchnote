import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const isTablet = width > 768;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },

    /* HEADER */
    header: {
        paddingHorizontal: 18,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Pacifico-Regular',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    backIcon: {
        marginRight: 8,
        marginTop: 12,
    },
    headerRightBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)'
    },
    headerRightText: {
        color: '#0f172a',
        fontWeight: '700',
    },

    /* BALANCE CARD */
    balanceCard: {
        margin: 20,
        padding: 24,
        borderRadius: 24,
        shadowColor: '#136bb8ff',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },

    balanceLabel: {
        fontSize: 14,
        color: '#e2e8f0',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    balanceSubtitle: {
        fontSize: 13,
        color: '#cbd5e1',
        marginBottom: 12,
    },
    balanceAmount: {
        fontSize: 42,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 12,
        letterSpacing: -1,
    },

    usedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        marginBottom: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    usedLabel: {
        fontSize: 13,
        color: '#cbd5e1',
        fontWeight: '500',
    },
    usedAmount: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '700',
    },

    topUpButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignSelf: 'flex-start',
        borderRadius: 999,
    },
    topUpText: {
        color: '#136bb8ff',
        fontWeight: '800',
    },
    /* SECTIONS */
    section: {
        paddingHorizontal: 18,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#0f172a',
    },
    viewAllText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },

    /* PACKAGES */
    /* PACKAGES - Horizontal Scroll */
    packagesScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 16,
    },
    packageWrapper: {
        width: 220,
        marginRight: 4,
    },
    packageCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        height: 320,
        justifyContent: 'space-between',
    },
    packageCardPopular: {
        borderColor: '#1887e8ff',
        shadowColor: '#136bb8ff',
        shadowOpacity: 0.25,
        elevation: 16,
        transform: [{ scale: 1.02 }],
    },
    packageName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#084F8C',
        marginBottom: 8,
        textAlign: 'center',
    },
    packageCredits: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0ea5e9',
        textAlign: 'center',
        marginBottom: 4,
    },
    packageBonus: {
        color: '#10b981',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 12,
    },
    packagePrice: {
        fontSize: 26,
        fontWeight: '900',
        marginVertical: 12,
        color: '#084F8C',
        textAlign: 'center',
    },

    buyButton: {
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buyButtonNormal: {
        backgroundColor: '#0ea5e9',
        shadowColor: '#0ea5e9',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buyButtonPopular: {
        backgroundColor: '#FFFFFF',
    },
    buyButtonText: {
        fontWeight: '800',
        fontSize: 16,
    },

    /* HISTORY */
    historyList: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    historyIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    historyDescription: {
        fontWeight: '600',
        color: '#0f172a',
    },
    historyDate: {
        fontSize: 12,
        color: '#64748b',
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyState: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 14,
        paddingVertical: 40,
        fontStyle: 'italic',
    },

    /* MODAL */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalBody: {
        width: '100%',
        alignItems: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    amountInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 18,
        marginBottom: 24,
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        textAlign: 'center',
        fontWeight: '600',
    },

    /* DISCOUNT TAG */
    discountTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 10,
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },

    /* MODAL DETAILS */
    modalPackageName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    modalPackageDesc: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    modalDetailRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalDetailLabel: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    modalDetailValue: {
        fontSize: 20,
        color: '#0f172a',
        fontWeight: '700',
    },
    modalOriginalPrice: {
        fontSize: 15,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    modalPrice: {
        fontSize: 24,
        color: '#3b82f6',
        fontWeight: '800',
    },
    modalSavingsContainer: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 24,
    },
    modalSavingsText: {
        color: '#15803d',
        fontWeight: '700',
        fontSize: 13,
    },
    modalConfirm: {
        width: '100%',
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalConfirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
