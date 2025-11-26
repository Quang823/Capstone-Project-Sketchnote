import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LazyImage from "../../../common/LazyImage";
import { orderService } from "../../../service/orderService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const isImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.trim().replace(/^`|`$/g, "");
  return /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(u);
};

export default function GalleryScreen() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    let mounted = true;
    const fetchPurchased = async () => {
      setLoading(true);
      try {
        const res = await orderService.getPurchasedTemplates();
        if (mounted) {
          setTemplates(Array.isArray(res) ? res : []);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }
      } catch (err) {
        if (mounted) setTemplates([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPurchased();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = templates.filter((t) =>
    activeFilter === "ALL"
      ? true
      : String(t.type).toUpperCase() === activeFilter
  );

  return (
    <View style={styles.container}>
      {/* Premium Header with Gradient Effect */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
            <View>
              <Text style={styles.headerTitle}>Gallery</Text>
              <Text style={styles.headerSubtitle}>
                {filtered.length} resources
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={[
                styles.filterTab,
                activeFilter === "ALL" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter("ALL")}
            >
              <Icon
                name="grid-view"
                size={20}
                color={activeFilter === "ALL" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "ALL" && styles.filterTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterTab,
                activeFilter === "ICONS" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter("ICONS")}
            >
              <Icon
                name="photo"
                size={20}
                color={activeFilter === "ICONS" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "ICONS" && styles.filterTextActive,
                ]}
              >
                Icons
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterTab,
                activeFilter === "TEMPLATES" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter("TEMPLATES")}
            >
              <Icon
                name="view-quilt"
                size={20}
                color={activeFilter === "TEMPLATES" ? "#FFFFFF" : "#64748B"}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "TEMPLATES" && styles.filterTextActive,
                ]}
              >
                Templates
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0862b0ff" />
          <Text style={styles.loadingText}>Loading resources...</Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                  <Icon name="collections" size={64} color="#0862b0ff" />
                </View>
                <Text style={styles.emptyTitle}>No Resources Yet</Text>
                <Text style={styles.emptyText}>
                  You haven't purchased any resources. Explore and buy now!
                </Text>
              </View>
            ) : (
              filtered.map((template) => {
                const isIcons = String(template.type).toUpperCase() === "ICONS";
                const cardStyle = isIcons
                  ? styles.iconCard
                  : styles.templateCard;
                return (
                  <View
                    key={template.resourceTemplateId}
                    style={styles.section}
                  >
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <View
                          style={[
                            styles.sectionIconWrapper,
                            isIcons ? styles.iconsBg : styles.templatesBg,
                          ]}
                        >
                          <Icon
                            name={isIcons ? "photo" : "view-quilt"}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View>
                          <Text style={styles.sectionTitle}>
                            {template.name}
                          </Text>
                          <Text style={styles.sectionSubtitle}>
                            {template.items?.length || 0} items
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.typeBadge,
                          isIcons ? styles.badgeIcons : styles.badgeTemplates,
                        ]}
                      >
                        <Text style={styles.typeText}>
                          {String(template.type).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.horizontalScroll}
                      contentContainerStyle={styles.horizontalScrollContent}
                    >
                      {(template.items || []).map((item, index) => (
                        <Pressable
                          key={
                            item.resourceItemId ||
                            `${template.resourceTemplateId}-${index}`
                          }
                          style={cardStyle}
                          android_ripple={{ color: "rgba(8, 98, 176, 0.1)" }}
                        >
                          <View style={styles.cardInner}>
                            {isImageUrl(item.imageUrl || item.itemUrl) ? (
                              <LazyImage
                                source={{
                                  uri: String(item.imageUrl || item.itemUrl)
                                    .trim()
                                    .replace(/^`|`$/g, ""),
                                }}
                                style={styles.resourceImage}
                              />
                            ) : (
                              <View style={styles.emptyThumb}>
                                <Icon
                                  name={isIcons ? "image" : "insert-drive-file"}
                                  size={40}
                                  color="#CBD5E1"
                                />
                              </View>
                            )}
                            <View style={styles.cardOverlay} />
                            <View style={styles.itemIndexBadge}>
                              <Text style={styles.itemIndexText}>
                                #{item.itemIndex ?? index + 1}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    paddingTop: (StatusBar.currentHeight || 0) + 16,
    paddingBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E7FF",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#1E40AF",
    marginTop: 2,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterTabActive: {
    backgroundColor: "#0862b0ff",
    borderColor: "#0862b0ff",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  sectionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconsBg: {
    backgroundColor: "#0862b0ff",
  },
  templatesBg: {
    backgroundColor: "#1065afff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f4085ff",
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeIcons: {
    backgroundColor: "#EEF2FF",
  },
  badgeTemplates: {
    backgroundColor: "#F5F3FF",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0862b0ff",
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    marginTop: 4,
    marginHorizontal: -4,
  },
  horizontalScrollContent: {
    paddingHorizontal: 4,
    gap: 14,
  },
  iconCard: {
    width: 130,
    height: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  templateCard: {
    width: 150,
    height: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardInner: {
    flex: 1,
    position: "relative",
  },
  resourceImage: {
    width: "100%",
    height: "100%",
  },
  emptyThumb: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  itemIndexBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  itemIndexText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
