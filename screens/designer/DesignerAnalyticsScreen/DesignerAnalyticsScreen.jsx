// DesignerAnalyticsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./DesignerAnalyticsScreen.styles";
import { dashboardService } from "../../../service/dashboardService";



const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerAnalyticsScreen() {
  const navigation = useNavigation();
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState(null);
const [topTemplates, setTopTemplates] = useState([]);

  const mockAnalyticsData = {
    overview: {
      totalRevenue: 15200000,
      totalDownloads: 12500,
      totalProducts: 12,
      averageRating: 4.8,
    },
    revenue: {
      current: 15200000,
      previous: 12800000,
      growth: 18.75,
    },
    downloads: {
      current: 12500,
      previous: 9800,
      growth: 27.55,
    },
    topProducts: [
      {
        id: 1,
        title: "Business Presentation Template",
        downloads: 3200,
        revenue: 6400000,
        growth: 15.2,
      },
      {
        id: 2,
        title: "Social Media Post Template",
        downloads: 2800,
        revenue: 5600000,
        growth: 22.1,
      },
      {
        id: 3,
        title: "Infographic Template",
        downloads: 2100,
        revenue: 4200000,
        growth: 8.5,
      },
    ],
    dailyStats: [
      { date: "2024-01-15", downloads: 120, revenue: 240000 },
      { date: "2024-01-16", downloads: 95, revenue: 190000 },
      { date: "2024-01-17", downloads: 150, revenue: 300000 },
      { date: "2024-01-18", downloads: 180, revenue: 360000 },
      { date: "2024-01-19", downloads: 200, revenue: 400000 },
      { date: "2024-01-20", downloads: 165, revenue: 330000 },
      { date: "2024-01-21", downloads: 140, revenue: 280000 },
    ],
  };
  const fetchProductAnalytics = async () => {
    try {
      const res = await dashboardService.getTopTemplates();
     setTopTemplates(res);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setAnalyticsData(mockAnalyticsData);
    fetchProductAnalytics();
  }, [timeRange]);
 
  const formatCurrency = (amount) => {
    return (amount ?? 0).toLocaleString("vi-VN") + "₫";
  };

  const formatNumber = (number) => {
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + "k";
    }
    return (number ?? 0).toLocaleString("vi-VN");
  };

  const getTimeRangeText = (range) => {
    const map = {
      "7d": "7 ngày qua",
      "30d": "30 ngày qua",
      "90d": "90 ngày qua",
      "1y": "1 năm qua",
    };
    return map[range] || "7 ngày qua";
  };

  if (!analyticsData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Pressable>
          <Icon name="more-horiz" size={22} color="#111827" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <View style={styles.timeRangeTabs}>
            {[
              { key: "7d", label: "7D" },
              { key: "30d", label: "30D" },
              { key: "90d", label: "90D" },
              { key: "1y", label: "1Y" },
            ].map((range) => (
              <Pressable
                key={range.key}
                style={[
                  styles.timeRangeTab,
                  timeRange === range.key && styles.timeRangeTabActive,
                ]}
                onPress={() => setTimeRange(range.key)}
              >
                <Text
                  style={[
                    styles.timeRangeTabText,
                    timeRange === range.key && styles.timeRangeTabTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Overview Cards - 2x2 Grid */}
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Icon name="trending-up" size={18} color="#10B981" />
              <Text style={styles.overviewLabel}>Revenue</Text>
            </View>
            <Text style={styles.overviewNumber}>
              {formatCurrency(analyticsData.overview.totalRevenue)}
            </Text>
            <View style={styles.overviewFooter}>
              <Icon name="arrow-upward" size={12} color="#10B981" />
              <Text style={styles.overviewGrowth}>+18.75%</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Icon name="file-download" size={18} color="#3B82F6" />
              <Text style={styles.overviewLabel}>Downloads</Text>
            </View>
            <Text style={styles.overviewNumber}>
              {formatNumber(analyticsData.overview.totalDownloads)}
            </Text>
            <View style={styles.overviewFooter}>
              <Icon name="arrow-upward" size={12} color="#10B981" />
              <Text style={styles.overviewGrowth}>+27.55%</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Icon name="inventory-2" size={18} color="#F59E0B" />
              <Text style={styles.overviewLabel}>Products</Text>
            </View>
            <Text style={styles.overviewNumber}>
              {analyticsData.overview.totalProducts}
            </Text>
            <View style={styles.overviewFooter}>
              <Text style={styles.overviewSubtext}>Published</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Icon name="star" size={18} color="#F59E0B" />
              <Text style={styles.overviewLabel}>Rating</Text>
            </View>
            <Text style={styles.overviewNumber}>
              {analyticsData.overview.averageRating}
            </Text>
            <View style={styles.overviewFooter}>
              <Text style={styles.overviewSubtext}>Average</Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {analyticsData.dailyStats.map((stat, index) => {
                const maxDownloads = Math.max(...analyticsData.dailyStats.map(s => s.downloads));
                const heightPercent = (stat.downloads / maxDownloads) * 100;
                
                return (
                  <View key={index} style={styles.chartBar}>
                    <Text style={styles.chartBarValue}>{stat.downloads}</Text>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: stat.downloads > 150 ? '#6366F1' : '#E0E7FF',
                        },
                      ]}
                    />
                    <Text style={styles.chartBarLabel}>
                      {new Date(stat.date).getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
       {topTemplates.map((item, index) => (
  <View key={item.templateId} style={styles.productCard}>
    <View style={styles.productRank}>
      <Text style={styles.productRankText}>{index + 1}</Text>
    </View>

    <View style={styles.productInfo}>
      <Text style={styles.productTitle} numberOfLines={1}>
        {item.templateName}
      </Text>

      <View style={styles.productStats}>
        <View style={styles.productStat}>
          <Icon name="shopping-cart" size={14} color="#6B7280" />
          <Text style={styles.productStatText}>
            {item.soldCount}
          </Text>
        </View>

        <View style={styles.productStat}>
          <Icon name="attach-money" size={14} color="#6B7280" />
          <Text style={styles.productStatText}>
            {formatCurrency(item.revenue)}
          </Text>
        </View>
      </View>
    </View>

    {/* Không có growth từ API nên để dấu "-" */}
    <View style={styles.productGrowth}>
      <Icon name="trending-up" size={14} color="#6B7280" />
      <Text style={[styles.productGrowthText, { color: "#6B7280" }]}>
        —
      </Text>
    </View>
  </View>
))}

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}