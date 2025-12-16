import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import getStyles from "./SketchNotePolicy.styles";
import { MaterialIcons } from "@expo/vector-icons";
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";
import ChatWidget from "../../components/ChatWidget";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const SketchNotePolicy = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isDark = theme === "dark";

  const [activeSection, setActiveSection] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const blobAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const sectionAnims = useRef(
    Array(7)
      .fill(0)
      .map(() => ({
        scale: new Animated.Value(1),
        rotation: new Animated.Value(0),
        height: new Animated.Value(0),
      }))
  ).current;

  const sections = [
    // ...existing code...
    {
      id: 1,
      icon: "security",
      title: "Privacy Protection",
      content:
        "Your sketches and notes are encrypted end-to-end. We never access, scan, or share your creative content without explicit permission. All data is stored securely on our servers with military-grade encryption.",
    },
    {
      id: 2,
      icon: "lock",
      title: "Data Security",
      content:
        "We implement industry-standard security measures including SSL encryption, secure authentication, and regular security audits. Your account is protected with optional two-factor authentication for enhanced security.",
    },
    {
      id: 3,
      icon: "visibility",
      title: "Information We Collect",
      content:
        "We collect minimal data: email address, device information, and usage analytics to improve app performance. Your sketches remain private unless you choose to share them publicly within the app.",
    },
    {
      id: 4,
      icon: "group",
      title: "Sharing & Collaboration",
      content:
        "When you share sketches with others, only invited users can access them. You maintain full control over sharing permissions and can revoke access at any time. Public sketches are subject to our community guidelines.",
    },
    {
      id: 5,
      icon: "description",
      title: "Your Rights",
      content:
        "You have the right to access, export, or delete your data at any time. Request a complete data export or account deletion directly from the app settings. We comply with GDPR and CCPA regulations.",
    },
    {
      id: 6,
      icon: "notifications",
      title: "Notifications",
      content:
        "We send notifications for collaboration updates, app improvements, and security alerts. You can customize notification preferences in settings. We never use your data for advertising purposes.",
    },
    {
      id: 7,
      icon: "auto-delete",
      title: "Data Retention",
      content:
        "Deleted sketches are permanently removed after 30 days. Backup copies are retained for disaster recovery but are never accessed. Account deletion removes all data within 90 days as per legal requirements.",
    },
  ];

  const keyPoints = [
    "Your sketches are always private by default",
    "No ads or third-party data selling",
    "Easy data export and account deletion",
    "24/7 security monitoring and protection",
    "Transparent updates to our policies",
    "GDPR and CCPA compliant",
  ];

  // Initial animations on mount
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating blob animations
    blobAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const toggleSection = (id, index) => {
    const isActive = activeSection === id;

    if (isActive) {
      // Collapse animation
      Animated.parallel([
        Animated.spring(sectionAnims[index].scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnims[index].rotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnims[index].height, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      setActiveSection(null);
    } else {
      // Expand animation
      Animated.parallel([
        Animated.spring(sectionAnims[index].scale, {
          toValue: 1.02,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnims[index].rotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnims[index].height, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      setActiveSection(id);
    }
  };

  const getBlobTransform = (index) => {
    const translateY = blobAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });
    return { transform: [{ translateY }] };
  };

  const getArrowRotation = (index) => {
    return sectionAnims[index].rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with animations */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: headerScale }],
            },
          ]}
        >
          <View style={styles.headerBackground}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765169645/Screen_Shot_2020-12-23_at_2.08.27_PM_lcfddn.webp",
              }}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <Animated.View
              style={[styles.blob, styles.blob1, getBlobTransform(0)]}
            />
            <Animated.View
              style={[styles.blob, styles.blob2, getBlobTransform(1)]}
            />
            <Animated.View
              style={[styles.blob, styles.blob3, getBlobTransform(2)]}
            />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LottieView
                source={require("../../assets/security.json")}
                autoPlay
                loop
                style={{ width: 80, height: 80, opacity: 0.8 }}
              />
            </View>
            <Text style={styles.headerTitle}>
              Sketch Note - Visual Note Taking App
            </Text>
            <View style={styles.divider} />
            <Text style={styles.headerSubtitle}>Privacy Policy & Terms</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Updated Dec 2025</Text>
            </View>
          </View>
        </Animated.View>

        {/* Content Container */}
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Introduction Box with gradient border */}
          <View style={styles.introBoxWrapper}>
            <View style={styles.introBox}>
              <View style={styles.introHeader}>
                <View style={styles.introBadge}>
                  <LottieView
                    source={require("../../assets/waving.json")}
                    autoPlay
                    loop
                    style={{ width: 70, height: 70 }}
                  />
                </View>
                <Text style={styles.introTitle}>Welcome to Sketch Note</Text>
              </View>
              <Text style={styles.introText}>
                At Sketch Note, we believe your creativity deserves the highest
                level of protection. This policy outlines how we handle your
                data with transparency and respect. We're committed to keeping
                your sketches, notes, and personal information secure while
                providing you with an exceptional creative experience.
              </Text>
            </View>
          </View>

          {/* Policy Sections with stagger animation */}
          <View style={styles.sectionsContainer}>
            {sections.map((section, index) => (
              <Animated.View
                key={section.id}
                style={[
                  styles.sectionCard,
                  {
                    transform: [{ scale: sectionAnims[index].scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.sectionButton}
                  onPress={() => toggleSection(section.id, index)}
                  activeOpacity={0.9}
                >
                  <View style={styles.sectionLeft}>
                    <View style={styles.sectionIconContainer}>
                      <View style={styles.sectionIconGlow} />
                      <MaterialIcons
                        name={section.icon}
                        size={28}
                        color={isDark ? "#60A5FA" : "#1976D2"}
                      />
                    </View>
                  </View>

                  <View style={styles.sectionTextContainer}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {activeSection === section.id && (
                      <Animated.View
                        style={{ opacity: sectionAnims[index].height }}
                      >
                        <Text style={styles.sectionContent}>
                          {section.content}
                        </Text>
                      </Animated.View>
                    )}
                  </View>

                  <Animated.View
                    style={[
                      styles.sectionArrow,
                      { transform: [{ rotate: getArrowRotation(index) }] },
                    ]}
                  >
                    <View style={styles.arrowCircle}>
                      <Text style={styles.arrowText}>▼</Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Key Points with modern design */}
          <View style={styles.keyPointsWrapper}>
            <View style={styles.keyPointsContainer}>
              <View style={styles.keyPointsHeader}>
                <View style={styles.keyPointsIconBg}>
                  <MaterialIcons name="star" size={26} color="#e9b637ff" />
                </View>
                <Text style={styles.keyPointsTitle}>Key Commitments</Text>
              </View>

              <View style={styles.pointsGrid}>
                {keyPoints.map((point, index) => (
                  <View key={index} style={styles.pointItem}>
                    <View style={styles.pointCheckWrapper}>
                      <View style={styles.pointCheck}>
                        <Text style={styles.pointCheckText}>✓</Text>
                      </View>
                    </View>
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Footer with CTA */}
          <View style={styles.footerWrapper}>
            <View style={styles.footer}>
              <View style={styles.footerIconBg}>
                <MaterialIcons
                  name="chat"
                  size={36}
                  color={isDark ? "#60A5FA" : "#4889faff"}
                />
              </View>
              <Text style={styles.footerTitle}>Need Help?</Text>
              <Text style={styles.footerText}>
                Questions about our privacy policy? We're here to help.
              </Text>
              <TouchableOpacity
                style={styles.contactButton}
                activeOpacity={0.8}
                onPress={() => setChatVisible(true)}
              >
                <Text style={styles.contactButtonText}>Contact Support</Text>
                <Text style={styles.contactButtonIcon}>→</Text>
              </TouchableOpacity>
              <Text style={styles.footerCopyright}>
                © 2025 Sketch Note. All rights reserved.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      <View style={styles.menuButtonWrapper}>
        <SidebarToggleButton
          iconSize={26}
          iconColor={isDark ? "#FFFFFF" : "#1E40AF"}
        />
      </View>
      {chatVisible && (
        <ChatWidget
          visible={chatVisible}
          onClose={() => setChatVisible(false)}
        />
      )}
    </View>
  );
};

export default SketchNotePolicy;
