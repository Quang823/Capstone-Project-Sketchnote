import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { paymentService } from "../../../service/paymentService";
import { useTheme } from "../../../context/ThemeContext";
import getStyles from "./WithdrawalHistoryScreen.styles";

export default function WithdrawalHistoryScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Get styles based on theme
  const styles = getStyles(theme);

  // Theme colors for inline styles
  const isDark = theme === "dark";
  const colors = {
    primaryBlue: isDark ? "#60A5FA" : "#084F8C",
    primaryWhite: isDark ? "#FFFFFF" : "#084F8C",
    emptyIconColor: isDark ? "#475569" : "#CBD5E1",
    closeIconColor: isDark ? "#F1F5F9" : "#0F172A",
    loadingColor: isDark ? "#60A5FA" : "#084F8C",
  };

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const fetchHistory = async (pageNumber = 0) => {
    if (pageNumber === 0) {
      setLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const data = await paymentService.getWithdrawHistory(
        pageNumber,
        10,
        "createdAt",
        "DESC"
      );

      let newWithdrawals = [];
      let totalPages = 0;

      if (data && Array.isArray(data.content)) {
        newWithdrawals = data.content;
        totalPages = data.totalPages;
      } else if (Array.isArray(data)) {
        newWithdrawals = data;
        totalPages = 1;
      } else if (data && Array.isArray(data.result)) {
        newWithdrawals = data.result;
        totalPages = 1;
      }

      if (pageNumber === 0) {
        setWithdrawals(newWithdrawals);
      } else {
        setWithdrawals((prev) => [...prev, ...newWithdrawals]);
      }

      setHasMore(pageNumber + 1 < totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.warn("Failed to fetch withdrawal history", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !isFetchingMore && hasMore) {
      fetchHistory(page + 1);
    }
  };

  const formatCurrency = (n) => (n ?? 0).toLocaleString("vi-VN") + " đ";
  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
      case "APPROVED":
        return "#16A34A";
      case "PENDING":
      case "PROCESSING":
        return "#F59E0B";
      case "FAILED":
      case "REJECTED":
      case "CANCELLED":
        return "#DC2626";
      default:
        return "#64748B";
    }
  };

  const renderItem = ({ item }) => {
    const color = getStatusColor(item.status);
    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          setSelectedTx(item);
          setModalVisible(true);
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
          <Icon name="arrow-upward" size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Withdrawal</Text>
          <Text style={styles.cardDescription}>
            {item.bankName} - {item.bankAccountNumber}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amount, { color: color }]}>
            -{formatCurrency(item.amount)}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.badgeText, { color: color }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.primaryWhite} />
          </Pressable>
          <Text style={styles.headerTitle}>Withdrawal History</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* List */}
      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.loadingColor} />
        </View>
      ) : (
        <FlatList
          data={withdrawals}
          keyExtractor={(item) =>
            (item.id || item.withdrawalId || Math.random()).toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={colors.loadingColor} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon name="receipt" size={48} color={colors.emptyIconColor} />
              <Text style={styles.emptyText}>No withdrawal history found</Text>
            </View>
          }
        />
      )}

      {/* Modal Detail */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdrawal Details</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon name="close" size={26} color={colors.closeIconColor} />
              </Pressable>
            </View>

            {selectedTx && (
              <View>
                <View style={styles.modalIconSection}>
                  <View
                    style={[
                      styles.modalIcon,
                      {
                        backgroundColor: `${getStatusColor(
                          selectedTx.status
                        )}15`,
                      },
                    ]}
                  >
                    <Icon
                      name="arrow-upward"
                      size={40}
                      color={getStatusColor(selectedTx.status)}
                    />
                  </View>
                  <Text style={styles.modalLabel}>Withdrawal Amount</Text>
                  <Text style={styles.modalAmount}>
                    -{formatCurrency(selectedTx.amount)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${getStatusColor(
                            selectedTx.status
                          )}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: getStatusColor(selectedTx.status) },
                        ]}
                      >
                        {selectedTx.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedTx.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank Name</Text>
                    <Text style={styles.detailValue}>
                      {selectedTx.bankName}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Number</Text>
                    <Text style={styles.detailValue}>
                      {selectedTx.bankAccountNumber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Holder</Text>
                    <Text style={styles.detailValue}>
                      {selectedTx.bankAccountHolder}
                    </Text>
                  </View>

                  {selectedTx.note && (
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.detailLabel}>Note</Text>
                      <Text style={styles.detailValue}>{selectedTx.note}</Text>
                    </View>
                  )}
                </View>
              </View>
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
