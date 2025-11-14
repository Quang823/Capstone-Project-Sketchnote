// screens/auth/RegisterScreen.styles.jsx
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // === BACKGROUND (giữ nguyên) ===
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gradientOrb: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.12,
  },
  orbTop: {
    width: 500,
    height: 500,
    top: -200,
    right: -100,
    backgroundColor: "#3B82F6",
  },
  orbBottom: {
    width: 400,
    height: 400,
    bottom: -150,
    left: -100,
    backgroundColor: "#93C5FD",
  },
  orbRight: {
    width: 300,
    height: 300,
    top: "50%",
    right: -100,
    backgroundColor: "#60A5FA",
  },
  floatingElement: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.1,
  },
  float1: {
    width: 100,
    height: 100,
    top: "20%",
    left: "10%",
    backgroundColor: "#3B82F6",
  },
  float2: {
    width: 150,
    height: 150,
    top: "60%",
    right: "20%",
    backgroundColor: "#93C5FD",
  },
  float3: {
    width: 80,
    height: 80,
    bottom: "20%",
    left: "30%",
    backgroundColor: "#60A5FA",
  },

  // === CONTENT WRAPPER ===
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: width > 768 ? "row" : "column",
    alignItems: "center",
    justifyContent: width > 768 ? "center" : "flex-start",
    gap: width > 768 ? 24 : 16,
    zIndex: 5,
  },

  brandingSection: {
    flex: 1, // tăng nhẹ tỉ lệ để to hơn
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: width > 768 ? 20 : 0,
  },
  brandContent: {
    gap: 47,
    maxWidth: 600,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    justifyContent: width > 768 ? "flex-start" : "center",
  },
  logoImage: {
    width: 66,
    height: 66,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "white",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 40,
    fontFamily: "Pacifico-Regular",
    color: "#1E3A8A",
  },
  logoSubtext: {
    fontSize: 22,
    color: "#64748B",
    fontFamily: "Pacifico-Regular",
  },
  heroContent: {
    gap: 20,
    alignSelf: "stretch",
    width: "100%",
  },
  heroTitle: {
    fontSize: width > 1024 ? 50 : 40,
    fontFamily: "Pacifico-Regular",
    color: "#0F172A",
    lineHeight: width > 1024 ? 50 : 40,
  },
  heroHighlight: {
    color: "#3B5BA0",
  },
  heroDescription: {
    fontSize: 20,
    color: "#475569",
    lineHeight: 20,
    letterSpacing: 0.2,
    maxWidth: "100%",
    opacity: 0.9,
  },
  featuresContainer: {
    gap: 20,
    width: '100%',
    maxWidth: '100%',
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    shadowColor: "#93C5FD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  featureIconBg: {
    width: 50,
    height: 50,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#1E293B",
    flexShrink: 1,
    maxWidth: '100%',
  },
  featureDesc: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    flexShrink: 1,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  // === FORM (phải) ===
  formSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: width > 768 ? "50%" : "100%",
    maxWidth: 550,
    marginRight: width > 768 ? 10 : 0,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  formDecorator: {
    height: 3,
    backgroundColor: "#3B82F6",
  },

  // Header
  cardHeader: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardDescription: {
    fontSize: 18,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },

  // Form
  form: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 10,
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  inputContainerFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    flex: 1,
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "500",
  },
  passwordField: {
    paddingRight: 6,
  },
  eyeButton: {
    padding: 6,
    marginRight: -6,
  },

  // Button
  registerButtonWrapper: {
    marginTop: 4,
  },
  registerButton: {
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },

  // Social
  socialContainer: {
    flexDirection: "row",
    gap: 8,
  },
  socialBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  socialBtnPressed: {
    opacity: 0.7,
  },
  socialBtnGradient: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
  },
  socialBtnText: {
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "600",
  },

  // Links
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  signupText: {
    fontSize: 15,
    color: "#64748B",
  },
  signupLink: {
    fontSize: 15,
    color: "#3B82F6",
    fontWeight: "700",
  },
  backBtn: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  backBtnText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
});
