import { StyleSheet } from "react-native";

export const settingStyles = StyleSheet.create({
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
        paddingTop: 50,
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
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#334155",
    },
    rowValue: {
        fontSize: 14,
        color: "#64748B",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 4,
    },

    // Dark Mode Styles
    containerDark: {
        backgroundColor: "#0F172A",
    },
    headerDark: {
        backgroundColor: "#1E293B",
        borderBottomColor: "#334155",
    },
    headerTitleDark: {
        color: "#FFFFFF",
    },
    sectionDark: {
        backgroundColor: "#1E293B",
    },
    sectionTitleDark: {
        color: "#FFFFFF",
    },
    iconContainerDark: {
        backgroundColor: "#334155",
    },
    rowLabelDark: {
        color: "#F1F5F9",
    },
    rowValueDark: {
        color: "#94A3B8",
    },
    dividerDark: {
        backgroundColor: "#334155",
    },
});
