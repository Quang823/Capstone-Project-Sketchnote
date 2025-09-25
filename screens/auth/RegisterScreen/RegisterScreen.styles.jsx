import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const registerStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  },

  // Background
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: "cover",
    opacity: 0.6,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Content Layout
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    flexDirection: width > 768 ? "row" : "column",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1152,
    marginHorizontal: "auto",
  },

  // Left Side - Branding
  brandingSection: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  brandContent: {
    gap: 24,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 24,
  },

  // Logo
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logoIcon: {
    
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4F46E5",
  },

  // Hero Content
  heroTitle: {
    fontSize: width > 768 ? 48 : 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  heroHighlight: {
    color: "#F59E0B",
  },
  heroDescription: {
    fontSize: 18,
    color: "#6B7280",
    maxWidth: 480,
  },

  // Features
  featuresGrid: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Right Side - Form
  formSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  // Register Card
  registerCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    padding: 32,
    width: width > 768 ? 400 : "100%",
  },
  cardHeader: {
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  cardDescription: {
    fontSize: 16,
    color: "#6B7280",
  },
  cardContent: {
    gap: 24,
  },

  // Form Elements
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },

  // Password Field
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    backgroundColor: "#FFFFFF",
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 15,
  },

  // Buttons
  registerButton: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Social Login
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  separatorText: {
    fontSize: 14,
    color: "#6B7280",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  socialButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "600",
  },

  // Login Prompt
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  loginLink: {
    color: "#4F46E5",
    fontWeight: "600",
  },
});