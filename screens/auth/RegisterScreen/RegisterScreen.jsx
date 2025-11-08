import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
} from "react-native";
import { useToast } from "../../../hooks/use-toast";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import heroImage from "../../../assets/logo1.webp";
import { registerStyles } from "./RegisterScreen.styles";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../../service/authService";
import ImageUploader from "../../../common/ImageUploader";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { toast } = useToast();
  const navigation = useNavigation();

  // Animations: Fade-in và slide-up cho form
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.ease });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Hiệu ứng scale cho buttons khi press
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 150 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withTiming(1, { duration: 150 });
  };

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Please fill in all fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await authService.register({
        email,
        password,
        firstName,
        lastName,
        avatarUrl,
      });

      toast({
        title: "Register Successful! 🎨",
        description: "Welcome to SketchNote!",
      });

      navigation.navigate("Login");
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "Register Failed",
        description: error.message || "An error occurred while registering",
        variant: "destructive",
      });
    }
  };

  const handleSocialRegister = (provider) => {
    toast({
      title: `Register with ${provider}`,
      description: `Continue registering with ${provider}`,
    });
  };

  return (
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]} // Eye-catching gradient: light blue to light yellow
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={registerStyles.container}
    >
      {/* Background Hero Image with overlay gradient */}
      <ImageBackground source={heroImage} style={registerStyles.heroBackground}>
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]}
          style={registerStyles.heroOverlay}
        />
      </ImageBackground>

      {/* Main Content */}
      <ReanimatedView style={[registerStyles.contentWrapper, animatedStyle]}>
        {/* Left Side - Branding */}
        <View style={registerStyles.brandingSection}>
          <Shadow distance={8} startColor="#00000010" finalColor="#00000005">
            <View style={registerStyles.brandContent}>
              <View style={registerStyles.logoContainer}>
                <Icon
                  name="palette"
                  size={32}
                  color="#4F46E5"
                  style={registerStyles.logoIcon}
                />
                <Text style={registerStyles.logoText}>SketchNote</Text>
              </View>

              <Text style={registerStyles.heroTitle}>
                Start your creative journey{" "}
                <Text style={registerStyles.heroHighlight}>with SketchNote</Text>{" "}
                today!
              </Text>

              <Text style={registerStyles.heroDescription}>
                Convert your ideas into beautiful sketches and notes. 
                Join thousands of artists and creative thinkers on SketchNote.
              </Text>

              <View style={registerStyles.featuresGrid}>
                <View style={registerStyles.featureItem}>
                  <Icon
                    name="edit"
                    size={24}
                    color="#F59E0B"
                    style={registerStyles.featureIcon}
                  />
                  <Text style={registerStyles.featureText}>
                    Intuitive drawing tools
                  </Text>
                </View>
                <View style={registerStyles.featureItem}>
                  <Icon
                    name="star"
                    size={24}
                    color="#F59E0B"
                    style={registerStyles.featureIcon}
                  />
                  <Text style={registerStyles.featureText}>
                    Gợi ý thông minh  AI
                  </Text>
                </View>
              </View>
            </View>
          </Shadow>
        </View>

        {/* Right Side - Register Form */}
        <View style={registerStyles.formSection}>
          <Shadow distance={12} startColor="#00000020" finalColor="#00000005">
            <ReanimatedView
              style={[registerStyles.registerCard, animatedStyle]}
            >
              <View style={registerStyles.cardHeader}>
                <Text style={registerStyles.cardTitle}>Register Account</Text>
                <Text style={registerStyles.cardDescription}>
                  Create your account to start your creative journey
                </Text>
              </View>

              <View style={registerStyles.cardContent}>
                <View style={registerStyles.form}>
                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>First Name</Text>
                    <TextInput
                      style={registerStyles.input}
                      placeholder="Enter your first name"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Last Name</Text>
                    <TextInput
                      style={registerStyles.input}
                      placeholder="Enter your last name"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Email</Text>
                    <TextInput
                      style={registerStyles.input}
                      placeholder="example@gmail.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={registerStyles.inputGroup}>
                    <Text style={registerStyles.label}>Password</Text>
                    <View style={registerStyles.passwordContainer}>
                      <TextInput
                        style={registerStyles.passwordInput}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={registerStyles.passwordToggle}
                      >
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#4F46E5"
                        />
                      </Pressable>
                    </View>
                  </View>
                  
                  <ImageUploader onUploaded={setAvatarUrl} />

                  <Reanimated.View style={[animatedButtonStyle]}>
                    <Pressable
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={handleRegister}
                      style={registerStyles.registerButton}
                    >
                      <LinearGradient
                        colors={["#4F46E5", "#6366F1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={registerStyles.buttonGradient}
                      >
                        <Text style={registerStyles.buttonText}>
                          Create Account
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Reanimated.View>

                  <View style={registerStyles.separatorContainer}>
                    <View style={registerStyles.separator} />
                    <Text style={registerStyles.separatorText}>
                      or register with
                    </Text>
                    <View style={registerStyles.separator} />
                  </View>

                  <View style={registerStyles.socialButtons}>
                    <Reanimated.View style={[animatedButtonStyle]}>
                      <Pressable
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => handleSocialRegister("Google")}
                        style={registerStyles.socialButton}
                      >
                        <Text style={registerStyles.socialButtonText}>
                          Google
                        </Text>
                      </Pressable>
                    </Reanimated.View>
                    <Reanimated.View style={[animatedButtonStyle]}>
                      <Pressable
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => handleSocialRegister("Apple")}
                        style={registerStyles.socialButton}
                      >
                        <Text style={registerStyles.socialButtonText}>
                          Apple
                        </Text>
                      </Pressable>
                    </Reanimated.View>
                  </View>

                  <View style={registerStyles.loginPrompt}>
                    <Text>Already have an account? </Text>
                    <Pressable onPress={() => navigation.navigate("Login")}>
                      <Text style={registerStyles.loginLink}>Log in now</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </ReanimatedView>
          </Shadow>
        </View>
      </ReanimatedView>
    </LinearGradient>
  );
}