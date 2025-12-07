import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
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

    /* TOP 2 COLUMNS */
    topWrapper: { padding: 20 },
    topWrapperRow: {
        flexDirection: "row",
        gap: 20,
    },
    topWrapperLimit: {
        width: "100%",
        alignSelf: "center",
    },

    leftCol: { flex: 1 },
    rightCol: { flex: 1, maxWidth: 450 },

    /* BALANCE CARD */
    balanceCardNew: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#084F8C",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 2,
        borderColor: "#E0E7FF",
        flex: 1,
    },

    balanceLabelNew: {
        fontSize: 15,
        color: "#64748B",
        fontWeight: "600",
    },

    balanceAmountNew: {
        fontSize: 38,
        fontWeight: "800",
        color: "#084F8C",
        marginTop: 6,
    },
    statsRowNew: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#E0E7FF",
    },
    statBox: {
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 8,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E0E7FF",
    },
    statValueNew: {
        fontSize: 16,
        fontWeight: "700",
        color: "#084F8C",
    },

    balanceHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    walletIconLarge: {
        alignItems: "center",
        justifyContent: "center",
    },

    walletLabel: {
        fontSize: 16,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
        marginTop: -4,
    },

    miniStats: {
        flexDirection: "row",
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(8, 79, 140, 0.1)",
    },

    miniStat: {
        flex: 1,
    },

    miniStatLabel: {
        fontSize: 11,
        color: "#64748B",
        marginBottom: 4,
    },

    miniStatValue: {
        fontSize: 15,
        color: "#084F8C",
        fontWeight: "700",
    },

    miniStatValueNegative: {
        fontSize: 15,
        color: "#EF4444",
        fontWeight: "700",
    },

    miniStatDivider: {
        width: 1,
        backgroundColor: "rgba(8, 79, 140, 0.15)",
        marginHorizontal: 12,
        height: "80%",
        alignSelf: "center",
    },

    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },

    withdrawButtonNew: {
        flex: 1,
        backgroundColor: "#084F8C",
        borderRadius: 16,
        paddingVertical: 14,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: "#084F8C",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    withdrawButtonTextNew: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    depositButtonNew: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 14,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        borderWidth: 2,
        borderColor: "#084F8C",
        shadowColor: "#084F8C",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    depositButtonTextNew: {
        fontSize: 15,
        fontWeight: "700",
        color: "#084F8C",
    },

    /* ACTION CARD */
    actionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#084F8C",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 2,
        borderColor: "#E0E7FF",
    },
    actionCardTitle: {
        fontSize: 15,
        color: "#084F8C",
        fontWeight: "600",
        marginBottom: 16,
    },

    actionList: { gap: 16 },
    oneActionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 16,
        backgroundColor: "#F8FAFF",
        // width sẽ được override trong JSX
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },

    actionCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
    },
    actionName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#084F8C",
    },

    /* RECENT TRANSACTIONS */
    historySection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    historySectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    recentCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    recentCardLimit: {
        alignSelf: "center",
        width: "100%",
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#084F8C",
    },
    transactionCount: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "500",
        marginTop: 4,
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

    transactionItemNew: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    transIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        borderWidth: 3,
        borderColor: "#e7e7e7ff",
    },
    transactionTitleNew: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 4,
    },
    transactionDateNew: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    transactionAmountNew: {
        fontSize: 16,
        fontWeight: "700",
    },
    transactionRightNew: {
        alignItems: "flex-end",
    },
    transactionBalanceNew: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 2,
    },
    statusBadgeNew: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    statusTextNew: {
        fontSize: 11,
        fontWeight: "600",
    },

    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 12,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: "92%",
        paddingBottom: 10,
        shadowColor: "#084F8C",
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 12,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E6E9F5",
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#084F8C",
    },

    modalBody: {
        padding: 24,
        flexGrow: 1, // cho ScrollView chiếm đủ không gian
    },

    /* INPUT LABEL */
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 6,
    },

    /* AMOUNT INPUT */
    amountInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        paddingHorizontal: 18,
        borderWidth: 1.5,
        borderColor: "#D4DAF3",
        backgroundColor: "#F8FAFF",
        borderRadius: 16,
    },
    currencySymbol: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        padding: 0,
    },

    /* QUICK AMOUNTS */
    quickAmountsNew: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    quickAmountButtonNew: {
        backgroundColor: "#F1F5FF",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    quickAmountTextNew: {
        color: "#084F8C",
        fontWeight: "700",
        fontSize: 14,
    },

    /* BANK GRID */
    bankGrid: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
    },
    bankGridItem: {
        flex: 1,
    },
    bankInfoLabel: {
        fontSize: 13,
        color: "#475569",
        marginBottom: 6,
        fontWeight: "600",
    },
    bankInfoInputNew: {
        backgroundColor: "#F8FAFF",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: "#D4DAF3",
        fontSize: 15,
        fontWeight: "600",
        color: "#0F172A",
    },

    /* NOTE BOX */
    noteContainerNew: {
        flexDirection: "row",
        backgroundColor: "#F1F5FF",
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    noteTextNew: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: "#475569",
        fontWeight: "500",
    },

    /* FOOTER */
    modalFooterNew: {
        flexDirection: "row",
        justifyContent: "center", // canh giữa
        paddingHorizontal: 20,
        gap: 60, // khoảng cách giữa 2 nút
    },

    buttonNew: {
        width: "28%", // mỗi nút khoảng 50%
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    cancelButtonNew: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    confirmButtonNew: {
        backgroundColor: "#084F8C",
        shadowColor: "#084F8C",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },

    buttonTextNew: {
        fontSize: 16,
        fontWeight: "700",
    },

    // Deposit Modal Styles
    amountSection: {
        marginBottom: 24,
    },
    amountLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 10,
    },
    amountInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: "#F8FAFC",
        marginBottom: 16,
    },
    currencySymbol: {
        fontSize: 18,
        color: "#1E293B",
        fontWeight: "700",
        marginRight: 8,
    },
    amountInput: {
        borderWidth: 0,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1E293B",
        fontWeight: "600",
        flex: 1,
    },
    quickAmounts: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    quickAmountButton: {
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    quickAmountButtonActive: {
        backgroundColor: "#60A5FA",
        borderColor: "#60A5FA",
    },
    quickAmountText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "600",
    },
    quickAmountTextActive: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    paymentSection: {
        marginBottom: 24,
    },
    paymentLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 12,
    },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
    },
    selectedPaymentMethod: {
        borderColor: "#60A5FA",
        backgroundColor: "#EFF6FF",
        borderWidth: 2,
    },
    paymentMethodLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    paymentIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    paymentName: {
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "700",
        marginBottom: 2,
    },
    paymentFee: {
        fontSize: 12,
        color: "#10B981",
        fontWeight: "600",
    },
});
