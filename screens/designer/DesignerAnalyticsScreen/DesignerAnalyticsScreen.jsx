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
import { LinearGradient } from "expo-linear-gradient";
import { designerAnalyticsStyles } from "./DesignerAnalyticsScreen.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerAnalyticsScreen() {
  const navigation = useNavigation();
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [analyticsData, setAnalyticsData] = useState(null);

  // Mock data - thay thế bằng API call thực tế
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

  useEffect(() => {
    // Simulate API call
    setAnalyticsData(mockAnalyticsData);
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return (amount ?? 0).toLocaleString("vi-VN") + " VND";
  };

  const formatNumber = (number) => {
    return (number ?? 0).toLocaleString("vi-VN");
  };

  const getTimeRangeText = (range) => {
    switch (range) {
      case "7d":
        return "7 ngày qua";
      case "30d":
        return "30 ngày qua";
      case "90d":
        return "90 ngày qua";
      case "1y":
        return "1 năm qua";
      default:
        return "7 ngày qua";
    }
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? "#10B981" : "#EF4444";
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? "trending-up" : "trending-down";
  };

  if (!analyticsData) {
    return (
      <View style={designerAnalyticsStyles.container}>
        <View style={designerAnalyticsStyles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={designerAnalyticsStyles.headerTitle}>Thống kê</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={designerAnalyticsStyles.loadingContainer}>
          <Text>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={designerAnalyticsStyles.container}>
      {/* Header */}
      <View style={designerAnalyticsStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={designerAnalyticsStyles.headerTitle}>Thống kê</Text>
        <Pressable>
          <Icon name="more-vert" size={24} color="#1F2937" />
        </Pressable>
      </View>

      <ScrollView style={designerAnalyticsStyles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={designerAnalyticsStyles.timeRangeContainer}>
          <Text style={designerAnalyticsStyles.sectionTitle}>Khoảng thời gian</Text>
          <View style={designerAnalyticsStyles.timeRangeTabs}>
            {[
              { key: "7d", label: "7 ngày" },
              { key: "30d", label: "30 ngày" },
              { key: "90d", label: "90 ngày" },
              { key: "1y", label: "1 năm" },
            ].map((range) => (
              <Pressable
                key={range.key}
                style={[
                  designerAnalyticsStyles.timeRangeTab,
                  timeRange === range.key && designerAnalyticsStyles.timeRangeTabActive,
                ]}
                onPress={() => setTimeRange(range.key)}
              >
                <Text
                  style={[
                    designerAnalyticsStyles.timeRangeTabText,
                    timeRange === range.key && designerAnalyticsStyles.timeRangeTabTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Overview Cards */}
        <View style={designerAnalyticsStyles.overviewContainer}>
          <Text style={designerAnalyticsStyles.sectionTitle}>Tổng quan</Text>
          <View style={designerAnalyticsStyles.overviewGrid}>
            <View style={designerAnalyticsStyles.overviewCard}>
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerAnalyticsStyles.overviewGradient}
              >
                <Icon name="attach-money" size={32} color="#FFFFFF" />
                <Text style={designerAnalyticsStyles.overviewNumber}>
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </Text>
                <Text style={designerAnalyticsStyles.overviewLabel}>Tổng doanh thu</Text>
              </LinearGradient>
            </View>

            <View style={designerAnalyticsStyles.overviewCard}>
              <LinearGradient
                colors={["#F093FB", "#F5576C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerAnalyticsStyles.overviewGradient}
              >
                <Icon name="download" size={32} color="#FFFFFF" />
                <Text style={designerAnalyticsStyles.overviewNumber}>
                  {formatNumber(analyticsData.overview.totalDownloads)}
                </Text>
                <Text style={designerAnalyticsStyles.overviewLabel}>Tổng lượt tải</Text>
              </LinearGradient>
            </View>

            <View style={designerAnalyticsStyles.overviewCard}>
              <LinearGradient
                colors={["#4FACFE", "#00F2FE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerAnalyticsStyles.overviewGradient}
              >
                <Icon name="inventory" size={32} color="#FFFFFF" />
                <Text style={designerAnalyticsStyles.overviewNumber}>
                  {analyticsData.overview.totalProducts}
                </Text>
                <Text style={designerAnalyticsStyles.overviewLabel}>Sản phẩm</Text>
              </LinearGradient>
            </View>

            <View style={designerAnalyticsStyles.overviewCard}>
              <LinearGradient
                colors={["#43E97B", "#38F9D7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerAnalyticsStyles.overviewGradient}
              >
                <Icon name="star" size={32} color="#FFFFFF" />
                <Text style={designerAnalyticsStyles.overviewNumber}>
                  {analyticsData.overview.averageRating}
                </Text>
                <Text style={designerAnalyticsStyles.overviewLabel}>Đánh giá TB</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={designerAnalyticsStyles.metricsContainer}>
          <Text style={designerAnalyticsStyles.sectionTitle}>Hiệu suất</Text>
          
          {/* Revenue Performance */}
          <View style={designerAnalyticsStyles.metricCard}>
            <View style={designerAnalyticsStyles.metricHeader}>
              <View style={designerAnalyticsStyles.metricTitleContainer}>
                <Icon name="attach-money" size={24} color="#3B82F6" />
                <Text style={designerAnalyticsStyles.metricTitle}>Doanh thu</Text>
              </View>
              <View style={designerAnalyticsStyles.metricGrowth}>
                <Icon
                  name={getGrowthIcon(analyticsData.revenue.growth)}
                  size={16}
                  color={getGrowthColor(analyticsData.revenue.growth)}
                />
                <Text
                  style={[
                    designerAnalyticsStyles.metricGrowthText,
                    { color: getGrowthColor(analyticsData.revenue.growth) },
                  ]}
                >
                  {analyticsData.revenue.growth > 0 ? "+" : ""}
                  {analyticsData.revenue.growth}%
                </Text>
              </View>
            </View>
            <Text style={designerAnalyticsStyles.metricValue}>
              {formatCurrency(analyticsData.revenue.current)}
            </Text>
            <Text style={designerAnalyticsStyles.metricPrevious}>
              So với {getTimeRangeText(timeRange)}: {formatCurrency(analyticsData.revenue.previous)}
            </Text>
          </View>

          {/* Downloads Performance */}
          <View style={designerAnalyticsStyles.metricCard}>
            <View style={designerAnalyticsStyles.metricHeader}>
              <View style={designerAnalyticsStyles.metricTitleContainer}>
                <Icon name="download" size={24} color="#10B981" />
                <Text style={designerAnalyticsStyles.metricTitle}>Lượt tải</Text>
              </View>
              <View style={designerAnalyticsStyles.metricGrowth}>
                <Icon
                  name={getGrowthIcon(analyticsData.downloads.growth)}
                  size={16}
                  color={getGrowthColor(analyticsData.downloads.growth)}
                />
                <Text
                  style={[
                    designerAnalyticsStyles.metricGrowthText,
                    { color: getGrowthColor(analyticsData.downloads.growth) },
                  ]}
                >
                  {analyticsData.downloads.growth > 0 ? "+" : ""}
                  {analyticsData.downloads.growth}%
                </Text>
              </View>
            </View>
            <Text style={designerAnalyticsStyles.metricValue}>
              {formatNumber(analyticsData.downloads.current)}
            </Text>
            <Text style={designerAnalyticsStyles.metricPrevious}>
              So với {getTimeRangeText(timeRange)}: {formatNumber(analyticsData.downloads.previous)}
            </Text>
          </View>
        </View>

        {/* Top Products */}
        <View style={designerAnalyticsStyles.topProductsContainer}>
          <Text style={designerAnalyticsStyles.sectionTitle}>Sản phẩm hàng đầu</Text>
          {analyticsData.topProducts.map((product, index) => (
            <View key={product.id} style={designerAnalyticsStyles.topProductCard}>
              <View style={designerAnalyticsStyles.topProductRank}>
                <Text style={designerAnalyticsStyles.topProductRankText}>#{index + 1}</Text>
              </View>
              <View style={designerAnalyticsStyles.topProductInfo}>
                <Text style={designerAnalyticsStyles.topProductTitle}>{product.title}</Text>
                <View style={designerAnalyticsStyles.topProductStats}>
                  <View style={designerAnalyticsStyles.topProductStat}>
                    <Icon name="download" size={16} color="#6B7280" />
                    <Text style={designerAnalyticsStyles.topProductStatText}>
                      {formatNumber(product.downloads)} lượt tải
                    </Text>
                  </View>
                  <View style={designerAnalyticsStyles.topProductStat}>
                    <Icon name="attach-money" size={16} color="#6B7280" />
                    <Text style={designerAnalyticsStyles.topProductStatText}>
                      {formatCurrency(product.revenue)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={designerAnalyticsStyles.topProductGrowth}>
                <Icon
                  name={getGrowthIcon(product.growth)}
                  size={16}
                  color={getGrowthColor(product.growth)}
                />
                <Text
                  style={[
                    designerAnalyticsStyles.topProductGrowthText,
                    { color: getGrowthColor(product.growth) },
                  ]}
                >
                  {product.growth > 0 ? "+" : ""}
                  {product.growth}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Daily Stats Chart */}
        <View style={designerAnalyticsStyles.chartContainer}>
          <Text style={designerAnalyticsStyles.sectionTitle}>Biểu đồ 7 ngày qua</Text>
          <View style={designerAnalyticsStyles.chart}>
            {analyticsData.dailyStats.map((stat, index) => (
              <View key={index} style={designerAnalyticsStyles.chartBar}>
                <View
                  style={[
                    designerAnalyticsStyles.chartBarFill,
                    {
                      height: (stat.downloads / 200) * 100,
                      backgroundColor: index % 2 === 0 ? "#3B82F6" : "#10B981",
                    },
                  ]}
                />
                <Text style={designerAnalyticsStyles.chartBarLabel}>
                  {new Date(stat.date).getDate()}
                </Text>
                <Text style={designerAnalyticsStyles.chartBarValue}>{stat.downloads}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
