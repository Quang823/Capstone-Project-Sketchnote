import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { styles } from "./SketchDesignerApp.styles";

const { width } = Dimensions.get("window");

export default function SketchDesignerApp() {
  const navigation = useNavigation();

  const features = [
    { text: "10,000+ Templates học thuật", icon: "library-books", color: "#EFF6FF" },
    { text: "AI vẽ biểu đồ thông minh", icon: "auto-awesome", color: "#DBEAFE" },
    { text: "Xuất file 4K/8K chất lượng cao", icon: "high-quality", color: "#EFF6FF" },
    { text: "500GB Cloud lưu trữ", icon: "cloud-upload", color: "#DBEAFE" },
    { text: "Cộng tác nhóm realtime", icon: "groups", color: "#EFF6FF" },
    { text: "Hỗ trợ kỹ thuật 24/7", icon: "support-agent", color: "#DBEAFE" },
  ];

  const steps = [
    {
      title: "Bước 1: Chọn gói nâng cấp",
      description: "Chọn gói Designer Pro để mở khóa toàn bộ tính năng chuyên nghiệp cho sketchnote.",
      icon: "shopping-cart",
      color: "#3B82F6",
    },
    {
      title: "Bước 2: Thanh toán an toàn",
      description: "Hỗ trợ đa dạng phương thức: thẻ quốc tế, ví điện tử, Momo, ZaloPay và nhiều hơn nữa.",
      icon: "payment",
      color: "#60A5FA",
    },
    {
      title: "Bước 3: Kích hoạt tức thì",
      description: "Sau khi thanh toán thành công, tài khoản Designer của bạn được kích hoạt ngay lập tức.",
      icon: "bolt",
      color: "#2563EB",
    },
  ];

  const benefits = [
    "Truy cập không giới hạn mọi template",
    "Sử dụng AI để tạo biểu đồ tự động",
    "Xuất file với chất lượng 4K & 8K",
    "Lưu trữ cloud 500GB",
    "Công cụ cộng tác nhóm mạnh mẽ",
    "Priority support 24/7",
  ];


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <SidebarToggleButton iconSize={24} iconColor="#1F2937" />
          
        </View>
        <Text style={styles.headerTitle}>Designer Pro</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main Scroll */}
      <ScrollView
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chào mừng đến Designer Hub</Text>
          <Text style={{ 
            fontSize: width >= 768 ? 20 : 18, 
            color: "#4A5568", 
            lineHeight: width >= 768 ? 32 : 28,
            fontWeight: "600",
            marginBottom: 24,
          }}>
            Nâng cấp lên Designer Pro để bắt đầu việc kinh doanh template sketchnote của bạn. Tạo, bán và kiếm tiền từ những thiết kế độc đáo!
          </Text>
        </View>

        {/* Giới thiệu tính năng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lợi ích Designer Pro</Text>
          <View style={styles.featureGrid}>
            {features.map((item, idx) => (
              <View
                key={idx}
                style={[styles.featureBox, { backgroundColor: item.color }]}
              >
                <Icon name={item.icon} size={40} color="#2563EB" />
                <Text style={styles.featureText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Các bước nâng cấp */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quy trình nâng cấp đơn giản</Text>
          <View style={styles.stepList}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={[styles.stepIconContainer, { backgroundColor: step.color }]}>
                  <Icon name={step.icon} size={32} color="#FFFFFF" />
                </View>
                <View style={styles.stepTextWrap}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Phần giá và CTA */}
        <View style={styles.priceSection}>
          <View style={styles.priceCard}>
            <View style={styles.decorativeDots} />
            <View style={styles.priceHeader}>
              <Text style={styles.planName}>Designer Pro</Text>
              <View style={styles.saveBadge}>
                <Icon name="local-offer" size={16} color="#FFFFFF" />
                <Text style={styles.saveText}>Giảm 40%</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceValue}>299K</Text>
              <Text style={styles.priceSub}>/tháng</Text>
            </View>
            <View style={styles.trialBadge}>
              <Icon name="card-giftcard" size={20} color="#2563EB" />
              <Text style={styles.trialText}>Dùng thử miễn phí 7 ngày đầu tiên</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.buyBtn} activeOpacity={0.9}>
            <Text style={styles.buyText}>Nâng cấp ngay</Text>
            <Icon name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <Icon name="verified-user" size={20} color="#6366F1" />
            <Text style={styles.securityText}>
              Thanh toán an toàn & bảo mật 100%
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={{ 
          marginTop: 48, 
          padding: width >= 768 ? 32 : 24, 
          backgroundColor: "#F9FAFB",
          borderRadius: 20,
          borderWidth: 2,
          borderColor: "#E5E7EB",
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="info" size={24} color="#2563EB" />
            <Text style={{ 
              fontSize: width >= 768 ? 20 : 18, 
              fontWeight: "800", 
              color: "#1E40AF",
            }}>
              Lưu ý quan trọng
            </Text>
          </View>
          <Text style={{ 
            fontSize: width >= 768 ? 16 : 14, 
            color: "#4A5568",
            lineHeight: width >= 768 ? 24 : 22,
            fontWeight: "500",
          }}>
            • Gói Designer Pro được tự động gia hạn hàng tháng{"\n"}
            • Bạn có thể hủy bất cứ lúc nào mà không mất phí{"\n"}
            • Dùng thử 7 ngày đầu hoàn toàn miễn phí{"\n"}
            • Hỗ trợ hoàn tiền trong 14 ngày nếu không hài lòng
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
