import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LineChart, BarChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import getStyles from "./DesignerAnalyticsScreen.styles";
import { dashboardService } from "../../../service/dashboardService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import { useTheme } from "../../../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerAnalyticsScreen() {
  const navigation = useNavigation();
  const { setActiveNavItem } = useNavContext();
  const { theme } = useTheme();

  // Get styles based on theme
  const styles = getStyles(theme);

  // Theme colors for inline styles
  const isDark = theme === "dark";
  const colors = {
    primaryBlue: isDark ? "#60A5FA" : "#084F8C",
    primaryWhite: isDark ? "#FFFFFF" : "#084F8C",
    accentBlue: "#3B82F6",
    textMuted: isDark ? "#64748B" : "#94A3B8",
    textSecondary: isDark ? "#94A3B8" : "#64748B",
    emptyIconColor: isDark ? "#475569" : "#CBD5E1",
    loadingColor: isDark ? "#60A5FA" : "#3B82F6",
    chartLabelColor: isDark ? "rgba(148, 163, 184, 1)" : "rgba(71, 85, 105, 1)",
    chartLineColor: isDark ? "#334155" : "#E2E8F0",
    chartFillFrom: isDark ? "#60A5FA" : "#3B82F6",
    barChartColor: isDark ? "#0EA5E9" : "#0EA5E9",
  };

  const [activeNavItemLocal, setActiveNavItemLocal] = useState("analytics");

  useEffect(() => {
    setActiveNavItem("analytics");
    setActiveNavItemLocal("analytics");
  }, [setActiveNavItem]);

  const [groupBy, setGroupBy] = useState("month");
  const [salesData, setSalesData] = useState(null);
  const [topTemplates, setTopTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Date range states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Fetch sales report from API
  const fetchSalesReport = async () => {
    try {
      setLoading(true);

      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);

      const result = await dashboardService.getSalesReport(
        startStr,
        endStr,
        groupBy
      );

      setSalesData(result);
    } catch (error) {
      console.error("❌ Error fetching sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top templates
  const fetchTopTemplates = async () => {
    try {
      const res = await dashboardService.getTopTemplates();
      setTopTemplates(res);
    } catch (error) {
      console.error("Error fetching top templates:", error);
    }
  };

  // Fetch dashboard summary
  const fetchSummary = async () => {
    try {
      const res = await dashboardService.getDashboardSummaryDesigner();
      setSummary(res);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [groupBy, startDate, endDate]);

  useEffect(() => {
    fetchTopTemplates();
    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return (amount ?? 0).toLocaleString("vi-VN") + "₫";
  };

  const formatCurrencyCompact = (value) => {
    const amount = Number(value) || 0;
    if (amount >= 1_000_000_000)
      return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return `${Math.round(amount)}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Prepare chart data
  const processedCharts = React.useMemo(() => {
    if (!salesData?.data || salesData.data.length === 0) {
      return { timeline: null, ranking: null, insights: null };
    }

    const type = salesData.type;

    const formatEntry = (entry) => {
      const revenue = Number(entry.revenue) || 0;
      if (type === "monthly" || type === "month") {
        const monthValue = entry.month;
        if (!monthValue) return null;
        const [year, month] = monthValue.split("-");
        const monthNumber = parseInt(month, 10);
        return {
          shortLabel: `T${monthNumber}`,
          longLabel: `Month ${monthNumber} ${year}`,
          sortKey: `${monthValue}-01`,
          value: revenue,
        };
      }

      if (type === "daily" || type === "day") {
        const dateValue = entry.date;
        if (!dateValue) return null;
        const [year, month, day] = dateValue.split("-");
        return {
          shortLabel: `${day}/${month}`,
          longLabel: `${day}/${month}/${year}`,
          sortKey: dateValue,
          value: revenue,
        };
      }

      if (type === "yearly" || type === "year") {
        const yearValue = entry.year ?? entry.date ?? entry.period;
        if (!yearValue) return null;
        const yearText = String(yearValue);
        return {
          shortLabel: yearText.slice(-2),
          longLabel: `Year ${yearText}`,
          sortKey: `${yearText}-01-01`,
          value: revenue,
        };
      }

      return null;
    };

    const mapped = salesData.data
      .map(formatEntry)
      .filter(Boolean)
      .sort((a, b) => (a.sortKey > b.sortKey ? 1 : -1));

    if (mapped.length === 0) {
      return { timeline: null, ranking: null, insights: null };
    }

    const timelinePoints = mapped;

    const rankingPoints = [...mapped]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const timeline = {
      labels: timelinePoints.map((point) => point.shortLabel),
      datasets: [
        {
          data: timelinePoints.map((point) => point.value),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: ["Revenue"],
    };

    const ranking = rankingPoints.length
      ? {
          labels: rankingPoints.map((point) => point.shortLabel),
          datasets: [
            {
              data: rankingPoints.map((point) => point.value),
            },
          ],
        }
      : null;

    const insights = rankingPoints.length
      ? {
          bestPeriod: rankingPoints[0]?.longLabel || null,
          bestValue: rankingPoints[0]?.value || 0,
          lowestPeriod:
            rankingPoints.length > 1
              ? rankingPoints[rankingPoints.length - 1]?.longLabel || null
              : null,
          lowestValue:
            rankingPoints.length > 1
              ? rankingPoints[rankingPoints.length - 1]?.value || 0
              : null,
        }
      : null;

    return { timeline, ranking, insights, rankingDetails: rankingPoints };
  }, [salesData]);

  const timelineChartData = processedCharts.timeline;
  const comparisonChartData = processedCharts.ranking;
  const chartInsights = processedCharts.insights;
  const comparisonDetails = processedCharts.rankingDetails || [];

  const hasTimelineData = Boolean(
    timelineChartData?.datasets?.[0]?.data &&
      timelineChartData.datasets[0].data.some((value) => value > 0)
  );
  const hasComparisonData = Boolean(
    comparisonChartData?.datasets?.[0]?.data &&
      comparisonChartData.datasets[0].data.some((value) => value > 0)
  );

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!salesData?.data || salesData.data.length === 0) {
      return {
        totalRevenue: 0,
        avgRevenue: 0,
        maxRevenue: 0,
        trend: 0,
      };
    }

    const revenues = salesData.data.map((d) => Number(d.revenue) || 0);
    const totalRevenue = revenues.reduce((sum, r) => sum + r, 0);
    const avgRevenue = totalRevenue / revenues.length;
    const maxRevenue = Math.max(...revenues);

    // Calculate trend (last vs previous)
    let trend = 0;
    if (revenues.length >= 2) {
      const current = revenues[revenues.length - 1];
      const previous = revenues[revenues.length - 2];
      if (previous > 0) {
        trend = ((current - previous) / previous) * 100;
      }
    }

    return { totalRevenue, avgRevenue, maxRevenue, trend };
  }, [salesData]);

  // Chart config
  const getChartConfig = (type = "line") => ({
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      type === "bar"
        ? `rgba(14, 165, 233, ${opacity})`
        : `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => colors.chartLabelColor,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: isDark ? "#3B82F6" : "#1E40AF",
      fill: "#3B82F6",
    },
    fillShadowGradientFrom: colors.chartFillFrom,
    fillShadowGradientFromOpacity: 0.3,
    fillShadowGradientTo: colors.chartFillFrom,
    fillShadowGradientToOpacity: 0.05,
    propsForBackgroundLines: {
      stroke: colors.chartLineColor,
      strokeDasharray: "",
    },
    barPercentage: 0.7,
  });

  if (loading && !salesData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SidebarToggleButton
              iconSize={26}
              iconColor={colors.primaryWhite}
            />
            <Text style={styles.headerTitle}>Sales Analytics</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.loadingColor} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor={colors.primaryWhite} />
          <Text style={styles.headerTitle}>Sales Analytics</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.dateRangeContainer}>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Icon name="calendar-today" size={18} color={colors.accentBlue} />
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </Pressable>

            <Icon name="arrow-forward" size={18} color={colors.textMuted} />

            <Pressable
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Icon name="calendar-today" size={18} color={colors.accentBlue} />
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </Pressable>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleStartDateChange}
            maximumDate={endDate}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date()}
          />
        )}

        {/* Group By Selector */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Group By</Text>
          <View style={styles.filterButtons}>
            <Pressable
              style={[
                styles.filterButton,
                groupBy === "day" && styles.filterButtonActive,
              ]}
              onPress={() => setGroupBy("day")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  groupBy === "day" && styles.filterButtonTextActive,
                ]}
              >
                Daily
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterButton,
                groupBy === "month" && styles.filterButtonActive,
              ]}
              onPress={() => setGroupBy("month")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  groupBy === "month" && styles.filterButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterButton,
                groupBy === "year" && styles.filterButtonActive,
              ]}
              onPress={() => setGroupBy("year")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  groupBy === "year" && styles.filterButtonTextActive,
                ]}
              >
                Yearly
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Overview Cards - 2x2 Grid */}
        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, styles.cardOrange]}>
            <View style={styles.overviewHeader}>
              <Icon name="trending-up" size={20} color="#FFF" />
              <Text style={[styles.overviewLabel, { color: "#FFF" }]}>
                Total Revenue
              </Text>
            </View>
            <Text style={[styles.overviewNumber, { color: "#FFF" }]}>
              {formatCurrency(stats.totalRevenue)}
            </Text>
            <View style={styles.overviewFooter}>
              <Icon
                name={stats.trend >= 0 ? "arrow-upward" : "arrow-downward"}
                size={14}
                color="#FFF"
              />
              <Text style={[styles.overviewGrowth, { color: "#FFF" }]}>
                {stats.trend >= 0 ? "+" : ""}
                {stats.trend.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={[styles.overviewCard, styles.cardGreen]}>
            <View style={styles.overviewHeader}>
              <Icon name="show-chart" size={20} color="#FFF" />
              <Text style={[styles.overviewLabel, { color: "#FFF" }]}>
                Average
              </Text>
            </View>
            <Text style={[styles.overviewNumber, { color: "#FFF" }]}>
              {formatCurrency(stats.avgRevenue)}
            </Text>
            <View style={styles.overviewFooter}>
              <Text style={[styles.overviewSubtext, { color: "#E0F2FE" }]}>
                Per Period
              </Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Over Time</Text>
          <View style={styles.chartCard}>
            {loading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color={colors.loadingColor} />
              </View>
            ) : timelineChartData && hasTimelineData ? (
              <>
                <LineChart
                  data={timelineChartData}
                  width={SCREEN_WIDTH - 88}
                  height={240}
                  formatYLabel={formatCurrencyCompact}
                  fromZero
                  chartConfig={getChartConfig("line")}
                  bezier
                  yLabelsOffset={12}
                  segments={4}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
                {chartInsights?.bestPeriod && (
                  <View style={styles.chartInsightRow}>
                    <View style={styles.chartInsightCard}>
                      <Text style={styles.chartInsightLabel}>
                        Highest Revenue
                      </Text>
                      <Text style={styles.chartInsightValue}>
                        {formatCurrency(chartInsights.bestValue)}
                      </Text>
                      <Text style={styles.chartInsightSub}>
                        {chartInsights.bestPeriod}
                      </Text>
                    </View>
                    {chartInsights.lowestPeriod && (
                      <View
                        style={[
                          styles.chartInsightCard,
                          styles.chartInsightCardSecondary,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chartInsightLabel,
                            styles.chartInsightLabelSecondary,
                          ]}
                        >
                          Lowest Revenue
                        </Text>
                        <Text style={styles.chartInsightValue}>
                          {formatCurrency(chartInsights.lowestValue)}
                        </Text>
                        <Text style={styles.chartInsightSub}>
                          {chartInsights.lowestPeriod}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyChart}>
                <Icon
                  name="insert-chart"
                  size={56}
                  color={colors.emptyIconColor}
                />
                <Text style={styles.emptyChartText}>No data available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bar Chart */}
        {comparisonChartData && hasComparisonData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Comparison</Text>
            <View style={styles.chartCard}>
              <BarChart
                data={comparisonChartData}
                width={SCREEN_WIDTH - 88}
                height={240}
                fromZero
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...getChartConfig("bar"),
                  formatYLabel: (value) => formatCurrencyCompact(value),
                  formatXLabel: (value) => value,
                  style: {
                    borderRadius: 16,
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />

              {comparisonDetails.length > 0 && (
                <View style={styles.chartLegendList}>
                  {comparisonDetails.map((detail, index) => (
                    <View
                      key={detail.shortLabel}
                      style={styles.chartLegendItem}
                    >
                      <View style={styles.chartLegendLabelRow}>
                        <Icon
                          name="calendar-today"
                          size={16}
                          color={colors.accentBlue}
                        />
                        <Text style={styles.chartLegendLabel}>
                          {detail.longLabel || detail.shortLabel}
                        </Text>
                      </View>
                      <Text style={styles.chartLegendValue}>
                        {formatCurrency(detail.value)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
