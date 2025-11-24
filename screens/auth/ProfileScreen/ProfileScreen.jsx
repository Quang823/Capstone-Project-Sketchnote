import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  ImageBackground,
  useWindowDimensions,
  Easing,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../../context/AuthContext";
import { authService } from "../../../service/authService";
import { uploadToCloudinary } from "../../../service/cloudinary";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useToast } from "../../../hooks/use-toast";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";

const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const { toast } = useToast();
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // --- Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;
        const data = await authService.getMyProfile();

        setProfile((prev) => ({
          ...data,
          avatarUrl: prev?.avatarUrl || data.avatarUrl,
        }));

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (err) {
        toast({
          title: "Fetch profile failed",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.hasActiveSubscription) {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [profile?.hasActiveSubscription]);

  // --- Handle Avatar Upload ---
  const handleChooseAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast({
          title: "Permission denied",
          description: "Please allow access to your photos.",
          variant: "destructive",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;
      const fileUri = result.assets?.[0]?.uri;
      if (!fileUri) return;

      setUploading(true);
      const uploadResult = await uploadToCloudinary(fileUri);

      setUser((prev) => ({ ...prev, avatarUrl: uploadResult.secure_url }));
      setProfile((prev) => ({ ...prev, avatarUrl: uploadResult.secure_url }));

      toast({
        title: "Upload Successful!",
        description: "Avatar updated.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // --- Handle Save ---
  const handleSave = async () => {
    try {
      setSaving(true);
      await authService.updateUser(profile.id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      });

      setUser((prev) => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      }));

      toast({
        title: "Saved!",
        description: "Profile updated successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No profile found.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <SidebarToggleButton
        iconSize={26}
        iconColor="#1E40AF"
        style={styles.toggleButton}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763007145/z9ps3ywttozk9re6pszu.jpg",
          }}
          style={styles.headerBackground}
          imageStyle={{ opacity: 0.9 }}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>
              Manage your account details
            </Text>
          </View>
        </ImageBackground>

        {/* TWO COLUMNS */}
        <View
          style={[
            styles.twoColumnContainer,
            {
              flexDirection: isLargeScreen ? "row" : "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: height - 180,
            },
          ]}
        >
          {/* LEFT - BIG AVATAR */}
          <View style={styles.leftColumn}>
            <View style={styles.avatarContainer}>
              {profile?.hasActiveSubscription && (
                <Animated.View
                  style={[
                    styles.premiumRing,
                    {
                      transform: [
                        {
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumRingGradient}
                  />
                </Animated.View>
              )}
              <TouchableOpacity
                onPress={handleChooseAvatar}
                style={styles.avatarWrapper}
                activeOpacity={0.85}
              >
                <Image
                  source={{
                    uri: profile.avatarUrl || user.avatarUrl || "",
                  }}
                  style={styles.avatar}
                />
                {uploading && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleChooseAvatar}
              >
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.role}</Text>
            </View>
          </View>

          {/* RIGHT - FORM */}
          <View style={styles.rightColumn}>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(t) =>
                  setProfile((prev) => ({ ...prev, firstName: t }))
                }
              />

              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(t) =>
                  setProfile((prev) => ({ ...prev, lastName: t }))
                }
              />

              <Text style={styles.inputLabel}>
                Email{" "}
                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                  (cannot change)
                </Text>
              </Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.email}
                editable={false}
              />

              <Text style={styles.inputLabel}>Subscription Type</Text>
              <Text style={styles.input}>
                {profile.subscriptionType || "None"}
              </Text>

              <Text style={styles.inputLabel}>Expiration</Text>
              <Text style={styles.input}>
                {profile.subscriptionEndDate
                  ? new Date(profile.subscriptionEndDate).toLocaleString()
                  : "-"}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSave}>
              <LinearGradient
                colors={
                  saving ? ["#A5B4FC", "#93C5FD"] : ["#3B82F6", "#2563EB"]
                }
                style={styles.saveButton}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  toggleButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 10,
  },

  headerBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 40, fontFamily: "Pacifico-Regular", color: "#fff" },
  headerSubtitle: {
    fontSize: 25,
    fontFamily: "Pacifico-Regular",
    color: "#E2E8F0",
    marginTop: 4,
  },

  // TWO COLUMNS
  twoColumnContainer: {
    width: "100%",
    padding: 20,
    gap: 30,
  },
  leftColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rightColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  // Avatar
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    width: 420,
    height: 420,
    borderRadius: 240,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  avatar: { width: "100%", height: "100%" },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#3B82F6",
    borderRadius: 55,
    padding: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cameraIcon: { color: "#fff", fontSize: 34 },

  premiumRing: {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: 230,
    top: -20,
    left: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumRingGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 230,
  },

  userName: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1E3A8A",
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 4,
  },
  roleText: { color: "#2563EB", fontWeight: "600", fontSize: 18 },

  // Form
  formCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowOpacity: 0.1,
    marginRight: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1E3A8A",
  },
  disabledInput: {
    backgroundColor: "#E5E7EB",
    color: "#9CA3AF",
  },

  saveButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
