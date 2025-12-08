import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    hasShared = false
}) {
    if (totalPages <= 1) return null;

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: hasShared ? 30 : 30,
            gap: 12,
        }}>
            {/* Previous Button */}
            <TouchableOpacity
                onPress={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: currentPage === 0 ? '#E5E7EB' : '#3B82F6',
                    minWidth: 80,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: currentPage === 0 ? 0 : 0.1,
                    shadowRadius: 4,
                    elevation: currentPage === 0 ? 0 : 2,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon
                        name="chevron-left"
                        size={18}
                        color={currentPage === 0 ? '#9CA3AF' : '#FFFFFF'}
                    />
                    <Text style={{
                        color: currentPage === 0 ? '#9CA3AF' : '#FFFFFF',
                        fontWeight: '600',
                        fontSize: 14,
                    }}>
                        Prev
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Page Info */}
            <View style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: '#F3F4F6',
                borderWidth: 1,
                borderColor: '#E5E7EB',
            }}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#374151',
                }}>
                    {currentPage + 1} / {totalPages}
                </Text>
            </View>

            {/* Next Button */}
            <TouchableOpacity
                onPress={() => onPageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: currentPage + 1 >= totalPages ? '#E5E7EB' : '#3B82F6',
                    minWidth: 80,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: currentPage + 1 >= totalPages ? 0 : 0.1,
                    shadowRadius: 4,
                    elevation: currentPage + 1 >= totalPages ? 0 : 2,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{
                        color: currentPage + 1 >= totalPages ? '#9CA3AF' : '#FFFFFF',
                        fontWeight: '600',
                        fontSize: 14,
                    }}>
                        Next
                    </Text>
                    <Icon
                        name="chevron-right"
                        size={18}
                        color={currentPage + 1 >= totalPages ? '#9CA3AF' : '#FFFFFF'}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}
