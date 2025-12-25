import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  ImageBackground,
  useWindowDimensions,
  Easing,
  Modal,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../../context/AuthContext";
import { authService } from "../../../service/authService";
import { bankAccountService } from "../../../service/bankAccountService";
import { uploadToCloudinary } from "../../../service/cloudinary";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useToast } from "../../../hooks/use-toast";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import getStyles from "./ProfileScreen.styles";
import { useTheme } from "../../../context/ThemeContext";

const ProfileScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isDark = theme === "dark";

  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Bank account states
  const [banks, setBanks] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [addingAccount, setAddingAccount] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const buttonScaleAnim = useState(new Animated.Value(1))[0];
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

  // Fetch banks from VietQR
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksData = await bankAccountService.getBanks();
        setBanks(banksData);
      } catch (err) {
        console.warn("Failed to fetch banks:", err);
      }
    };
    fetchBanks();
  }, []);

  // Fetch user's bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        if (!user) return;
        const accounts = await bankAccountService.getBankAccounts();
        setBankAccounts(accounts);
      } catch (err) {
        console.warn("Failed to fetch bank accounts:", err);
      }
    };
    fetchBankAccounts();
  }, [user]);

  // Button press animation
  const handleButtonPressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

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
        allowsEditing: false,
        allowsMultipleSelection: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const fileUri = asset.uri;
      const fileSize = asset.fileSize;

      setUploading(true);

      const uploadResult = await uploadToCloudinary(fileUri, { fileSize });

      setUser((prev) => ({ ...prev, avatarUrl: uploadResult.secure_url }));
      setProfile((prev) => ({ ...prev, avatarUrl: uploadResult.secure_url }));

      toast({
        title: "Upload Successful!",
        description: `Avatar updated${uploadResult.format === "gif" ? " (animated)" : ""
          }.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description:
          err.message || "Failed to upload avatar. Please try again.",
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

  // --- Handle Add Bank Account ---
  const handleAddBankAccount = async () => {
    try {
      if (!selectedBank) {
        toast({
          title: "Validation Error",
          description: "Please select a bank",
          variant: "destructive",
        });
        return;
      }

      if (!accountNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter account number",
          variant: "destructive",
        });
        return;
      }

      if (!accountHolderName.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter account holder name",
          variant: "destructive",
        });
        return;
      }

      setAddingAccount(true);

      const accountData = {
        bankName: selectedBank.name,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        branch: selectedBank.shortName,
        logoUrl: selectedBank.logo,
        isDefault: true,
      };

      await bankAccountService.createBankAccount(accountData);

      const accounts = await bankAccountService.getBankAccounts();
      setBankAccounts(accounts);

      setAccountNumber("");
      setAccountHolderName("");
      setSelectedBank(null);
      setSearchQuery("");
      setShowBankModal(false);

      toast({
        title: "Success!",
        description: "Bank account added successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to add bank account",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setAddingAccount(false);
    }
  };

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0F172A" : "#F8FAFC"}
        />
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
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0F172A" : "#F8FAFC"}
        />
        <Text style={styles.errorText}>No profile found.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F172A" : "#F8FAFC"}
      />
      <SidebarToggleButton
        iconSize={26}
        iconColor={isDark ? "#FFFFFF" : "#1E40AF"}
        style={styles.toggleButton}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763007145/z9ps3ywttozk9re6pszu.jpg",
          }}
          style={styles.headerBackground}
          imageStyle={{ opacity: isDark ? 0.7 : 0.9 }}
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
                placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              />

              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(t) =>
                  setProfile((prev) => ({ ...prev, lastName: t }))
                }
                placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              />

              <Text style={styles.inputLabel}>
                Email{" "}
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? "#64748B" : "#9CA3AF",
                  }}
                >
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

              {/* Bank Account Section */}
              <View style={styles.bankAccountSection}>
                <View style={styles.bankAccountHeaderRow}>
                  <Text style={styles.inputLabel}>Bank Accounts</Text>

                  {/* Enhanced Add Bank Button */}
                  <Animated.View
                    style={[
                      styles.addBankButtonWrapper,
                      { transform: [{ scale: buttonScaleAnim }] },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setShowBankModal(true)}
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      activeOpacity={1}
                    >
                      <LinearGradient
                        colors={
                          isDark
                            ? ["#3B82F6", "#2563EB", "#1D4ED8"]
                            : ["#60A5FA", "#3B82F6", "#2563EB"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.addBankButton}
                      >
                        <View style={styles.addBankIconWrapper}>
                          <Text style={styles.addBankIcon}>+</Text>
                        </View>
                        <Text style={styles.addBankButtonText}>Add Bank</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {bankAccounts.length > 0 ? (
                  <View style={styles.bankAccountsList}>
                    {bankAccounts.map((account, index) => {
                      return (
                        <View key={index} style={styles.bankAccountCard}>
                          {/* Bank Logo */}
                          {account.logoUrl && (
                            <Image
                              source={{ uri: account.logoUrl }}
                              style={styles.bankAccountLogo}
                              contentFit="contain"
                            />
                          )}

                          {/* Account Info */}
                          <View style={styles.bankAccountInfo}>
                            <View style={styles.bankAccountHeader}>
                              <Text style={styles.bankName}>
                                {account.branch}
                                {account.bankName && (
                                  <Text style={styles.bankNameSeparator}>
                                    {" "}
                                    -{" "}
                                  </Text>
                                )}
                                <Text style={styles.bankFullNameText}>
                                  {account.bankName}
                                </Text>
                              </Text>
                            </View>
                            <View style={styles.accountDetails}>
                              <View style={styles.accountRow}>
                                <Text style={styles.accountLabel}>
                                  Account:
                                </Text>
                                <Text style={styles.accountNumber}>
                                  {account.accountNumber}
                                </Text>
                              </View>
                              <View style={styles.accountRow}>
                                <Text style={styles.accountLabel}>Holder:</Text>
                                <Text style={styles.accountHolder}>
                                  {account.accountHolderName}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Default Badge */}
                          {account.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultText}>⭐ Default</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noBankText}>
                    No bank accounts added yet
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSave}>
              <LinearGradient
                colors={
                  saving
                    ? isDark
                      ? ["#475569", "#334155"]
                      : ["#A5B4FC", "#93C5FD"]
                    : isDark
                      ? ["#3B82F6", "#2563EB"]
                      : ["#3B82F6", "#2563EB"]
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

      {/* Bank Account Modal */}
      <Modal
        visible={showBankModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowBankModal(false);
          setSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Bank Account</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowBankModal(false);
                  setSearchQuery("");
                  setSelectedBank(null);
                  setAccountNumber("");
                  setAccountHolderName("");
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Bank Selection */}
            <Text style={styles.modalInputLabel}>Select Bank</Text>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search bank name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            />

            {/* Bank List with Logos */}
            <ScrollView
              style={styles.bankListContainer}
              showsVerticalScrollIndicator={false}
            >
              {banks
                .filter(
                  (bank) =>
                    bank.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    bank.shortName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    bank.code.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((bank) => (
                  <TouchableOpacity
                    key={bank.id}
                    style={[
                      styles.bankItem,
                      selectedBank?.id === bank.id && styles.bankItemSelected,
                    ]}
                    onPress={() => setSelectedBank(bank)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: bank.logo }}
                      style={styles.bankLogo}
                      contentFit="contain"
                    />
                    <View style={styles.bankInfo}>
                      <Text style={styles.bankShortName}>{bank.shortName}</Text>
                      <Text style={styles.bankFullName} numberOfLines={2}>
                        {bank.name}
                      </Text>
                    </View>
                    {selectedBank?.id === bank.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Account Details Form */}
            <Text style={styles.modalInputLabel}>Account Number</Text>
            <TextInput
              style={styles.modalInput}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Enter account number"
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            />

            <Text style={styles.modalInputLabel}>Account Holder Name</Text>
            <TextInput
              style={styles.modalInput}
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder="Enter account holder name"
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowBankModal(false);
                  setSelectedBank(null);
                  setSearchQuery("");
                  setAccountNumber("");
                  setAccountHolderName("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddBankAccount}
                activeOpacity={0.7}
                disabled={addingAccount}
              >
                {addingAccount ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
