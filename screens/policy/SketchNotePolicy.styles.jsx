import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: '#F0F9FF',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 40,
    },

    // Header
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 60,
        paddingBottom: 50,
        paddingHorizontal: 25,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 15 },
                shadowOpacity: 0.25,
                shadowRadius: 25,
            },
            android: {
                elevation: 15,
            },
        }),
    },

    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    menuButtonWrapper: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },

    headerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.2,
    },

    blob: {
        position: 'absolute',
        borderRadius: 1000,
        opacity: 0.15,
    },

    blob1: {
        width: 280,
        height: 280,
        backgroundColor: '#2196F3',
        top: -100,
        left: -80,
    },

    blob2: {
        width: 220,
        height: 220,
        backgroundColor: '#03A9F4',
        bottom: -90,
        right: -70,
    },

    blob3: {
        width: 180,
        height: 180,
        backgroundColor: '#4FC3F7',
        top: '45%',
        left: '55%',
    },

    headerContent: {
        alignItems: 'center',
        zIndex: 2,
    },

    iconContainer: {
        width: 90,
        height: 90,
        backgroundColor: '#E3F2FD',
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        borderWidth: 3,
        borderColor: '#BBDEFB',
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    headerIcon: {
        fontSize: 50,
    },

    headerTitle: {
        fontSize: 42,
        fontFamily: 'Pacifico-Regular',
        color: '#0D47A1',
        marginBottom: 2,
        letterSpacing: -0.5,
    },

    divider: {
        width: 60,
        height: 4,
        backgroundColor: '#2196F3',
        borderRadius: 2,
        marginBottom: 12,
    },

    headerSubtitle: {
        fontSize: 25,
        color: '#1976D2',
        fontWeight: '600',
        marginBottom: 15,
    },

    badge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },

    badgeText: {
        fontSize: 12,
        color: '#1565C0',
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Content Container
    contentContainer: {
        padding: 20,
    },

    // Introduction Box
    introBoxWrapper: {
        marginBottom: 25,
        borderRadius: 24,
        padding: 3,
        backgroundColor: '#2196F3',
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 15,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    introBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 28,
    },

    introHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    introBadge: {
        width: 50,
        height: 50,
        backgroundColor: '#E3F2FD',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    introBadgeText: {
        fontSize: 24,
    },

    introTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: '#0D47A1',
    },

    introText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#546E7A',
        letterSpacing: 0.2,
    },

    // Sections
    sectionsContainer: {
        marginBottom: 25,
    },

    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#E3F2FD',
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },

    sectionButton: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 22,
    },

    sectionLeft: {
        marginRight: 16,
    },

    sectionIconContainer: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    sectionIconGlow: {
        position: 'absolute',
        width: 60,
        height: 60,
        backgroundColor: '#2196F3',
        borderRadius: 18,
        opacity: 0.12,
    },

    sectionIconText: {
        fontSize: 32,
        zIndex: 1,
    },

    sectionTextContainer: {
        flex: 1,
        paddingRight: 12,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0D47A1',
        marginBottom: 4,
        letterSpacing: 0.2,
    },

    sectionContent: {
        fontSize: 14,
        lineHeight: 22,
        color: '#546E7A',
        marginTop: 12,
        letterSpacing: 0.2,
    },

    sectionArrow: {
        justifyContent: 'center',
    },

    arrowCircle: {
        width: 36,
        height: 36,
        backgroundColor: '#E3F2FD',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowText: {
        fontSize: 12,
        color: '#1976D2',
        fontWeight: 'bold',
    },

    // Key Points
    keyPointsWrapper: {
        marginBottom: 25,
        borderRadius: 24,
        padding: 3,
        backgroundColor: '#2196F3', // Fallback for gradient
    },

    keyPointsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    keyPointsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    keyPointsIconBg: {
        width: 48,
        height: 48,
        backgroundColor: '#FFF3E0',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#FFE0B2',
    },

    keyPointsIcon: {
        fontSize: 24,
    },

    keyPointsTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: '800',
        color: '#0D47A1',
        letterSpacing: 0.2,
    },

    pointsGrid: {
        gap: 14,
    },

    pointItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F1F8FF',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },

    pointCheckWrapper: {
        marginRight: 14,
        paddingTop: 2,
    },

    pointCheck: {
        width: 32,
        height: 32,
        backgroundColor: '#2196F3',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    pointCheckText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    pointText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
        color: '#37474F',
        fontWeight: '500',
        letterSpacing: 0.2,
    },

    // Footer
    footerWrapper: {
        borderRadius: 24,
        padding: 3,
        backgroundColor: '#2196F3',
    },

    footer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 35,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    footerIconBg: {
        width: 70,
        height: 70,
        backgroundColor: '#E3F2FD',
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#BBDEFB',
    },

    footerIcon: {
        fontSize: 36,
    },

    footerTitle: {
        fontSize: 24,
        fontFamily: 'Pacifico-Regular',
        color: '#0D47A1',
        marginBottom: 5,
    },

    footerText: {
        fontSize: 15,
        color: '#546E7A',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
        paddingHorizontal: 10,
    },

    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 18,
        paddingHorizontal: 35,
        borderRadius: 50,
        marginBottom: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#2196F3',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginRight: 8,
    },

    contactButtonIcon: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },

    footerCopyright: {
        fontSize: 12,
        color: '#90A4AE',
        fontWeight: '500',
    },
});

export default styles;