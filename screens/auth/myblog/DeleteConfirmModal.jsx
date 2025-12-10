import React from "react";
import { View, Text, Modal, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { useTheme } from "../../../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function DeleteConfirmModal({
    visible,
    onClose,
    onConfirm,
    title = "Delete Blog",
    message = "Are you sure you want to delete this blog post? This action cannot be undone.",
    blogTitle,
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
                    {/* Icon/Animation */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={isDark ? ['#450a0a', '#7f1d1d'] : ['#FEE2E2', '#FECACA']}
                            style={styles.iconCircle}
                        >
                            <Icon name="delete-forever" size={48} color="#DC2626" />
                        </LinearGradient>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>

                    {/* Blog Title Preview */}
                    {blogTitle && (
                        <View style={[styles.blogTitleContainer, isDark && styles.blogTitleContainerDark]}>
                            <Text style={[styles.blogTitleLabel, isDark && styles.blogTitleLabelDark]}>Deleting:</Text>
                            <Text style={[styles.blogTitleText, isDark && styles.blogTitleTextDark]} numberOfLines={2}>
                                "{blogTitle}"
                            </Text>
                        </View>
                    )}

                    {/* Message */}
                    <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>

                    {/* Warning Box */}
                    <View style={[styles.warningBox, isDark && styles.warningBoxDark]}>
                        <Icon name="warning" size={20} color={isDark ? "#fbbf24" : "#F59E0B"} />
                        <Text style={[styles.warningText, isDark && styles.warningTextDark]}>
                            This action cannot be undone
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            onPress={onClose}
                            style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                        >
                            <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            onPress={onConfirm}
                            style={styles.deleteButton}
                        >
                            <LinearGradient
                                colors={['#EF4444', '#DC2626']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.deleteButtonGradient}
                            >
                                <Icon name="delete" size={20} color="#FFFFFF" />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = {
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 32,
        maxWidth: 500,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    modalContainerDark: {
        backgroundColor: '#1E293B',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    titleDark: {
        color: '#F8FAFC',
    },
    blogTitleContainer: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#EF4444',
    },
    blogTitleContainerDark: {
        backgroundColor: '#0F172A',
    },
    blogTitleLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    blogTitleLabelDark: {
        color: '#94A3B8',
    },
    blogTitleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        lineHeight: 22,
    },
    blogTitleTextDark: {
        color: '#F8FAFC',
    },
    message: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    messageDark: {
        color: '#CBD5E1',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 12,
        marginBottom: 28,
        gap: 8,
    },
    warningBoxDark: {
        backgroundColor: '#451a03',
    },
    warningText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
        flex: 1,
    },
    warningTextDark: {
        color: '#fbbf24',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    cancelButtonDark: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
    },
    cancelButtonTextDark: {
        color: '#CBD5E1',
    },
    deleteButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    deleteButtonGradient: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
};
