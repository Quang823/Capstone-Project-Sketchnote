import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const loginStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    overflow: "visible",
  },

  // Background
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  // Gradient Orbs
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

  // Floating elements
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

  // Content
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: width > 768 ? "row" : "column",
    alignItems: "center",
    justifyContent: width > 768 ? "center" : "flex-start",
    zIndex: 5,
  },

  // Branding
  brandingSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 60,
    paddingVertical: 60,
  },

  brandContent: {
    gap: 47,
    maxWidth: 600,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    resizeMode: "contain",
    backgroundColor: "white",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  logoText: {
    fontSize: 38,
    fontFamily: "Pacifico-Regular",
    color: "#1E3A8A",
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Pacifico-Regular",
  },

  heroContent: {
    gap: 12,
    alignSelf: "stretch",
    width: "100%",
  },
  heroTitle: {
    fontSize: width > 1024 ? 56 : 44,
    fontFamily: "Pacifico-Regular",
    color: "#0F172A",
    lineHeight: width > 1024 ? 64 : 50,
  },
  heroHighlight: {
    color: "#3B5BA0",
  },
  heroDescription: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#475569",
    lineHeight: 26,
    maxWidth: 520,
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

  // Form Section
  formSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: width > 768 ? 60 : 0,
    width: width > 768 ? "50%" : "100%",
  },

  formContainer: {
    width: "100%",
    maxWidth: 550,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 5,
    zIndex: 10,
  },

  formDecorator: {
    height: 4,
    backgroundColor: "#3B82F6",
  },

  // Header
  cardHeader: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59, 130, 246, 0.08)",
  },
  headerGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // Form
  form: {
    paddingHorizontal: 28,
    paddingVertical: 28,
    gap: 20,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    fontSize: 12,
    color: "#3B5BA0",
    fontWeight: "700",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  // ✅ Không còn shadow, chỉ đổi màu khi focus
  inputContainerFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
  },

  textInput: {
    flex: 1,
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "500",
  },
  passwordField: {
    paddingRight: 12,
  },
  eyeButton: {
    padding: 8,
    marginRight: -8,
  },

  // Buttons
  loginButtonWrapper: {
    marginTop: 8,
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },

  socialContainer: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  socialBtnPressed: {
    opacity: 0.7,
  },
  socialBtnGradient: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  socialBtnText: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "600",
  },

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  signupText: {
    fontSize: 14,
    color: "#64748B",
  },
  signupLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "700",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  backBtnText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});
