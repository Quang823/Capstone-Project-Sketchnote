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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../../context/AuthContext";
import { authService } from "../../../service/authService";
import { uploadToCloudinary } from "../../../service/cloudinary";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useToast } from "../../../hooks/use-toast";

const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const { toast } = useToast();

  // --- Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return;
        const data = await authService.getUserById(user.id);

        // ⚡ Giữ avatar mới nếu đã upload
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

  // --- Handle avatar upload ---
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

      // 🔹 Cập nhật context và profile cùng lúc
      setUser((prev) => ({ ...prev, avatarUrl: uploadResult.secure_url }));
      setProfile((prev) => ({ ...prev, avatarUrl: uploadResult.secure_url }));

      toast({
        title: "Upload Successful!",
        description: "Avatar has been updated!",
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

      // ⚡ Đồng bộ lại AuthContext với dữ liệu mới
      setUser((prev) => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      }));

      toast({
        title: "Save Successful!",
        description: "Profile updated successfully!",
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.center}>
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={handleChooseAvatar}
                activeOpacity={0.8}
                style={styles.avatarWrapper}
              >
                <Image
                  source={{
                    uri: profile.avatarUrl || user.avatarUrl || "",
                  }}
                  style={styles.avatar}
                  defaultSource={require("../../../assets/logo.png")}
                />
                {uploading && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChooseAvatar}
                style={styles.cameraButton}
                activeOpacity={0.8}
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

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profile.firstName}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, firstName: text }))
              }
              placeholder="Enter first name"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profile.lastName}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, lastName: text }))
              }
              placeholder="Enter last name"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.inputLabel}>
              Email{" "}
              <Text style={{ fontSize: 12, color: "#A0AEC0" }}>
                (can not change)
              </Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: "#E5E7EB", color: "#9CA3AF" },
              ]}
              value={profile.email}
              editable={false}
              placeholder="Enter email"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.inputLabel}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              value={profile.avatarUrl}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, avatarUrl: text }))
              }
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ["#A5B4FC", "#93C5FD"] : ["#3B82F6", "#2563EB"]}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    position: "relative",
  },
  toggleButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  scrollView: { backgroundColor: "#F8FAFC" },
  headerBackground: {
    width: "100%",
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: { fontSize: 15, color: "#E2E8F0" },
  contentContainer: {
    marginTop: -40,
    alignItems: "center",
    width: "100%",
  },
  avatarSection: { alignItems: "center", marginBottom: 30, width: "90%" },
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 65,
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
    top: -12,
    right: -12,
    backgroundColor: "#3B82F6",
    borderRadius: 22,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cameraIcon: { fontSize: 13, color: "#fff" },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 2,
  },
  roleText: { color: "#2563EB", fontWeight: "600", fontSize: 10 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  inputLabel: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
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
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorText: { color: "#6B7280" },
});
