// screens/auth/RegisterScreen.jsx
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useToast } from "../../../hooks/use-toast";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../context/AuthContext";
import { MotiView } from "moti";
import LottieView from "lottie-react-native";
import AnimatedBackground from "../LoginScreen/AnimatedBackground";
import { registerStyles } from "./RegisterScreen.styles";
import { authService } from "../../../service/authService";
export default function RegisterScreen({ onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);

  const { toast } = useToast();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const buttonScale = useSharedValue(1);
  const rotateIcon = useSharedValue(0);
  const rotateConfirmIcon = useSharedValue(0);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateIcon.value}deg` }],
  }));

  const animatedConfirmIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateConfirmIcon.value}deg` }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withTiming(0.94, { duration: 100 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const handlePasswordToggle = () => {
    rotateIcon.value = withTiming(rotateIcon.value + 180, { duration: 300 });
    setShowPassword((prev) => !prev);
  };

  const handleConfirmPasswordToggle = () => {
    rotateConfirmIcon.value = withTiming(rotateConfirmIcon.value + 180, {
      duration: 300,
    });
    setShowConfirmPassword((prev) => !prev);
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
    }

    if (password !== confirmPassword) {
      return toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
    }

    setIsLoading(true);
    try {
      const payload = {
        email,
        password,
        firstName,
        lastName,
        avatarUrl: null,
      };

      const res = await authService.register(payload);

      // Backend có thể trả về { message, result, ... } → ta check message
      toast({
        title: res?.message || "Account created successfully!",
        variant: "success",
      });

      navigation.navigate("Login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    toast({ title: `Register with ${provider}`, description: "Coming soon" });
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#CFF4FF", "#DCEEFF", "#E6EBFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={registerStyles.container}
      >
        <AnimatedBackground />

        <View style={registerStyles.contentWrapper}>
          {/* LEFT: Branding */}
          {width > 768 && (
            <View style={registerStyles.brandingSection}>
              <View style={registerStyles.brandContent}>
                <View style={registerStyles.logoContainer}>
                  <Image
                    source={{
                      uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
                    }}
                    style={registerStyles.logoImage}
                  />
                  <View>
                    <Text style={registerStyles.logoText}>SketchNote</Text>
                    <Text style={registerStyles.logoSubtext}>
                      Visual Note Taking App
                    </Text>
                  </View>
                </View>

                <View style={registerStyles.heroContent}>
                  <Text style={registerStyles.heroTitle}>
                    Join the{"\n"}
                    <Text style={registerStyles.heroHighlight}>
                      Creative Revolution
                    </Text>
                  </Text>
                  {/* <Text style={registerStyles.heroDescription}>
                    Start turning your ideas into stunning visual notes. Fast,
                    intuitive, and powerful.
                  </Text> */}
                </View>

                <View style={registerStyles.featuresContainer}>
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600, delay: 100 }}
                    style={registerStyles.featureCard}
                  >
                    <View
                      style={[
                        registerStyles.featureIconBg,
                        { backgroundColor: "rgba(250, 204, 21, 0.15)" },
                      ]}
                    >
                      <Icon name="brush" size={35} color="#FACC15" />
                    </View>
                    <View>
                      <Text style={registerStyles.featureTitle}>
                        Draw. Create. Express
                      </Text>
                      <Text style={registerStyles.featureDesc}>
                        Natural sketching with smooth, pressure-sensitive tools.
                      </Text>
                    </View>
                  </MotiView>

                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600, delay: 250 }}
                    style={registerStyles.featureCard}
                  >
                    <View
                      style={[
                        registerStyles.featureIconBg,
                        { backgroundColor: "rgba(34,197,94,0.15)" },
                      ]}
                    >
                      <Icon name="groups" size={35} color="#22C55E" />
                    </View>
                    <View>
                      <Text style={registerStyles.featureTitle}>
                        Share & Inspire
                      </Text>
                      <Text style={registerStyles.featureDesc}>
                        Post sketches, follow other creators, and get inspired
                        !!!
                      </Text>
                    </View>
                  </MotiView>

                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600, delay: 400 }}
                    style={registerStyles.featureCard}
                  >
                    <View
                      style={[
                        registerStyles.featureIconBg,
                        { backgroundColor: "rgba(59,130,246,0.15)" },
                      ]}
                    >
                      <Icon name="shopping-bag" size={35} color="#3B82F6" />
                    </View>
                    <View>
                      <Text style={registerStyles.featureTitle}>
                        Sell Your Art
                      </Text>
                      <Text style={registerStyles.featureDesc}>
                        Turn sketches into digital collectibles and earn money.
                      </Text>
                    </View>
                  </MotiView>
                </View>
              </View>
            </View>
          )}

          {/* RIGHT: Form */}
          <View style={registerStyles.formSection}>
            <View style={registerStyles.formContainer}>
              <View style={registerStyles.formDecorator} />

              <View style={registerStyles.cardHeader}>
                <LottieView
                  source={require("../../../assets/Welcome.json")}
                  autoPlay
                  loop
                  style={{ width: 140, height: 50 }}
                />
                <Text style={registerStyles.cardDescription}>
                  Create your account and start sketching
                </Text>
              </View>

              <View style={registerStyles.form}>
                {/* First Name */}
                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>First Name</Text>
                  <View
                    style={[
                      registerStyles.inputContainer,
                      firstNameFocused && registerStyles.inputContainerFocused,
                    ]}
                  >
                    <TextInput
                      style={registerStyles.textInput}
                      placeholder="Enter your first name"
                      placeholderTextColor="#CBD5E1"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFirstNameFocused(true)}
                      onBlur={() => setFirstNameFocused(false)}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Last Name */}
                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>Last Name</Text>
                  <View
                    style={[
                      registerStyles.inputContainer,
                      lastNameFocused && registerStyles.inputContainerFocused,
                    ]}
                  >
                    <TextInput
                      style={registerStyles.textInput}
                      placeholder="Enter your last name"
                      placeholderTextColor="#CBD5E1"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setLastNameFocused(true)}
                      onBlur={() => setLastNameFocused(false)}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>Email Address</Text>
                  <View
                    style={[
                      registerStyles.inputContainer,
                      emailFocused && registerStyles.inputContainerFocused,
                    ]}
                  >
                    <TextInput
                      style={registerStyles.textInput}
                      placeholder="Enter your email (ex: sketchnote@gmail.com)"
                      placeholderTextColor="#CBD5E1"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>Password</Text>
                  <View
                    style={[
                      registerStyles.inputContainer,
                      passwordFocused && registerStyles.inputContainerFocused,
                    ]}
                  >
                    <TextInput
                      style={[
                        registerStyles.textInput,
                        registerStyles.passwordField,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#CBD5E1"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                    />
                    <Pressable
                      onPress={handlePasswordToggle}
                      style={registerStyles.eyeButton}
                    >
                      <Animated.View style={animatedIconStyle}>
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={18}
                          color="#3B5BA0"
                        />
                      </Animated.View>
                    </Pressable>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>Confirm Password</Text>
                  <View
                    style={[
                      registerStyles.inputContainer,
                      confirmPasswordFocused &&
                        registerStyles.inputContainerFocused,
                    ]}
                  >
                    <TextInput
                      style={[
                        registerStyles.textInput,
                        registerStyles.passwordField,
                      ]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#CBD5E1"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                      secureTextEntry={!showConfirmPassword}
                      editable={!isLoading}
                    />
                    <Pressable
                      onPress={handleConfirmPasswordToggle}
                      style={registerStyles.eyeButton}
                    >
                      <Animated.View style={animatedConfirmIconStyle}>
                        <Icon
                          name={
                            showConfirmPassword
                              ? "visibility-off"
                              : "visibility"
                          }
                          size={18}
                          color="#3B5BA0"
                        />
                      </Animated.View>
                    </Pressable>
                  </View>
                </View>

                {/* Register Button */}
                <Animated.View style={animatedButtonStyle}>
                  <Pressable
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleRegister}
                    disabled={isLoading}
                    style={registerStyles.registerButtonWrapper}
                  >
                    <LinearGradient
                      colors={["#3B5BA0", "#2563EB", "#3B5BA0"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={registerStyles.registerButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={registerStyles.buttonText}>
                          Create Account
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Divider */}
                <View style={registerStyles.divider}>
                  <View style={registerStyles.dividerLine} />
                  <Text style={registerStyles.dividerText}>
                    or continue with
                  </Text>
                  <View style={registerStyles.dividerLine} />
                </View>

                {/* Social */}
                <View style={registerStyles.socialContainer}>
                  <Pressable
                    onPress={() => handleSocialRegister("Google")}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      registerStyles.socialBtn,
                      pressed && registerStyles.socialBtnPressed,
                    ]}
                  >
                    <View style={registerStyles.socialBtnGradient}>
                      <Icon name="language" size={16} color="#3B5BA0" />
                      <Text style={registerStyles.socialBtnText}>Google</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSocialRegister("Apple")}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      registerStyles.socialBtn,
                      pressed && registerStyles.socialBtnPressed,
                    ]}
                  >
                    <View style={registerStyles.socialBtnGradient}>
                      <Icon name="phone-iphone" size={16} color="#3B5BA0" />
                      <Text style={registerStyles.socialBtnText}>Apple</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Sign In Link */}
                <View style={registerStyles.signupContainer}>
                  <Text style={registerStyles.signupText}>
                    Already have an account?
                  </Text>
                  <Pressable
                    onPress={() => navigation.navigate("Login")}
                    disabled={isLoading}
                  >
                    <Text style={registerStyles.signupLink}>Sign in</Text>
                  </Pressable>
                </View>

                {/* Back Button */}
                {onBack && (
                  <Pressable onPress={onBack} style={registerStyles.backBtn}>
                    <Text style={registerStyles.backBtnText}>Back</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}
