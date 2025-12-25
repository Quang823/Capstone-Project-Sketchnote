import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Image,
    Switch,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CollaboratorManagementModal({
    visible,
    onClose,
    collaborators = [],
    currentUserId,
    isOwner,
    onUpdatePermission,
    loading = false,
}) {
    const [updatingUserId, setUpdatingUserId] = useState(null);

    // Filter out the owner from the list
    const filteredCollaborators = collaborators.filter(
        (c) => String(c.userId) !== String(currentUserId)
    );

    const handleTogglePermission = async (userId, currentEdited) => {
        if (!isOwner) return;

        setUpdatingUserId(userId);
        try {
            await onUpdatePermission(userId, !currentEdited);
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Manage Collaborators</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                            </View>
                        ) : filteredCollaborators.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="people-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyText}>No collaborators yet</Text>
                            </View>
                        ) : (
                            filteredCollaborators.map((collaborator) => (
                                <View key={collaborator.userId} style={styles.collaboratorItem}>
                                    {/* Avatar & Info */}
                                    <View style={styles.collaboratorInfo}>
                                        <Image
                                            source={{ uri: collaborator.avatarUrl }}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.textInfo}>
                                            <Text style={styles.email}>{collaborator.email}</Text>
                                            <Text style={styles.joinedDate}>
                                                Joined {new Date(collaborator.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Permission Toggle */}
                                    <View style={styles.permissionContainer}>
                                        <View style={styles.permissionLabel}>
                                            <Icon
                                                name={collaborator.edited ? "edit" : "visibility"}
                                                size={16}
                                                color={collaborator.edited ? "#10B981" : "#6B7280"}
                                            />
                                            <Text
                                                style={[
                                                    styles.permissionText,
                                                    collaborator.edited && styles.permissionTextActive,
                                                ]}
                                            >
                                                {collaborator.edited ? "Can Edit" : "View Only"}
                                            </Text>
                                        </View>
                                        {isOwner && (
                                            <Switch
                                                value={collaborator.edited}
                                                onValueChange={() =>
                                                    handleTogglePermission(
                                                        collaborator.userId,
                                                        collaborator.edited
                                                    )
                                                }
                                                disabled={updatingUserId === collaborator.userId}
                                                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                                                thumbColor={collaborator.edited ? "#3B82F6" : "#F3F4F6"}
                                            />
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Footer */}
                    {!isOwner && (
                        <View style={styles.footer}>
                            <Icon name="info-outline" size={16} color="#6B7280" />
                            <Text style={styles.footerText}>
                                Only the project owner can manage permissions
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        maxHeight: 400,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    collaboratorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    collaboratorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    textInfo: {
        marginLeft: 12,
        flex: 1,
    },
    email: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    joinedDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    permissionContainer: {
        alignItems: 'flex-end',
    },
    permissionLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    permissionText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    permissionTextActive: {
        color: '#10B981',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 6,
    },
});
