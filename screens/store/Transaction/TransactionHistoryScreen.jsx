import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  FlatList,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const TABS = ["All", "Deposits", "Purchases", "Pending"];
const screenWidth = Dimensions.get("window").width;

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactions = [] } = route.params || {};

  const [activeTab, setActiveTab] = useState("All");
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;

  // Animate tab indicator
  const handleTabPress = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(translateX, {
      toValue: (screenWidth / 4) * index,
      useNativeDriver: true,
    }).start();
  };

  // Summary
  const totalDeposit = transactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalPurchase = transactions
    .filter((t) => t.type === "PURCHASE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalPending = transactions.filter((t) => t.status === "PENDING").length;

  // Filtered data
  const filteredData = transactions.filter((t) => {
    if (activeTab === "All") return true;
    if (activeTab === "Deposits") return t.type === "DEPOSIT";
    if (activeTab === "Purchases") return t.type === "PURCHASE";
    if (activeTab === "Pending") return t.status === "PENDING";
  });

  // Helpers
  const formatCurrency = (n) =>
    (n ?? 0).toLocaleString("vi-VN") + " VND";

  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderItem = ({ item }) => {
    const color =
      item.status === "SUCCESS"
        ? "#10B981"
        : item.status === "PENDING"
        ? "#F59E0B"
        : "#EF4444";

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          setSelectedTx(item);
          setModalVisible(true);
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
          <Icon
            name={item.type === "DEPOSIT" ? "account-balance-wallet" : "shopping-cart"}
            size={22}
            color={color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {item.type === "DEPOSIT"
              ? item.status === "PENDING"
                ? "Pending Deposit"
                : "Deposit"
              : "Purchase"}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          {item.orderCode && (
            <Text style={styles.cardCode}>Order: {item.orderCode}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amount, { color }]}>
            {item.type === "DEPOSIT" ? "+" : "-"}
            {formatCurrency(item.amount)}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${color}15`,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color }]}>{item.status}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Deposit</Text>
          <Text style={styles.summaryValue}>+{formatCurrency(totalDeposit)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Purchase</Text>
          <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
            -{formatCurrency(totalPurchase)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
            {totalPending}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX }],
            },
          ]}
        />
        {TABS.map((tab, index) => (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => handleTabPress(tab, index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.transactionId?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="receipt-long" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      {/* Modal Detail */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transaction Detail</Text>
            {selectedTx && (
              <>
                <Text style={styles.detailText}>
                  Type: {selectedTx.type}
                </Text>
                <Text style={styles.detailText}>
                  Status: {selectedTx.status}
                </Text>
                <Text style={styles.detailText}>
                  Amount: {formatCurrency(selectedTx.amount)}
                </Text>
                <Text style={styles.detailText}>
                  Date: {formatDate(selectedTx.createdAt)}
                </Text>
                {selectedTx.orderCode && (
                  <Text style={styles.detailText}>
                    Order Code: {selectedTx.orderCode}
                  </Text>
                )}
              </>
            )}
            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    margin: 12,
    borderRadius: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryValue: { fontSize: 15, fontWeight: "700", color: "#10B981" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: "hidden",
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  tabTextActive: { color: "#1D4ED8" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: screenWidth / 4,
    height: 3,
    backgroundColor: "#3B82F6",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  cardDate: { fontSize: 12, color: "#6B7280" },
  cardCode: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700" },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: "600" },

  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#9CA3AF", marginTop: 10, fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginBottom: 10 },
  detailText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  closeBtn: {
    marginTop: 16,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontWeight: "600" },
};
