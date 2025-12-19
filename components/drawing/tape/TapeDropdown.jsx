import React, { useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Switch,
    ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

// Tape patterns
const TAPE_PATTERNS = [
    { id: "diagonal", label: "Diagonal Stripes" },
    { id: "dots", label: "Dots" },
    { id: "grid", label: "Grid" },
    { id: "dashed-diagonal", label: "Dashed Diagonal" },
    { id: "double-dots", label: "Double Dots" },
    { id: "checkered", label: "Checkered" },
];

// Tape colors
const TAPE_COLORS = [
    "#7DD3FC", // Light Blue
    "#6EE7B7", // Mint
    "#FDA4AF", // Pink
    "#FCD34D", // Yellow
    "#FDBA74", // Orange
];

export default function TapeDropdown({
    visible,
    onClose,
    onSelectTape,
    onClearTapesOnPage,
    onClearTapesOnAllPages,
    tapeSettings,
    setTapeSettings,
}) {
    const [mode, setMode] = useState(tapeSettings?.mode || "line"); // "line" or "rectangle"
    const [showAllTapes, setShowAllTapes] = useState(tapeSettings?.showAll ?? true);
    const [selectedPattern, setSelectedPattern] = useState(tapeSettings?.pattern || "diagonal");
    const [thickness, setThickness] = useState(tapeSettings?.thickness || 4);
    const [selectedColor, setSelectedColor] = useState(tapeSettings?.color || TAPE_COLORS[2]);

    const handleApply = useCallback(() => {
        const settings = {
            mode,
            showAll: showAllTapes,
            pattern: selectedPattern,
            thickness,
            color: selectedColor,
        };
        setTapeSettings?.(settings);
        onSelectTape?.(settings);
        onClose?.();
    }, [mode, showAllTapes, selectedPattern, thickness, selectedColor, setTapeSettings, onSelectTape, onClose]);

    const renderPatternPreview = (patternId, isSelected) => {
        // Simple pattern preview using background color and border
        const baseStyle = {
            width: 60,
            height: 24,
            borderRadius: 4,
            backgroundColor: selectedColor + "40", // with alpha
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
            overflow: "hidden",
        };

        // Render pattern-specific decoration
        return (
            <View style={baseStyle}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: selectedColor + "60",
                        opacity: 0.8,
                    }}
                />
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.dropdown}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <Text style={styles.title}>Tape</Text>

                    {/* Mode Selection */}
                    <View style={styles.modeRow}>
                        <TouchableOpacity
                            style={[styles.modeButton, mode === "line" && styles.modeButtonActive]}
                            onPress={() => setMode("line")}
                        >
                            <View style={[styles.modeIcon, mode === "line" && styles.modeIconActive]}>
                                <MaterialCommunityIcons
                                    name="minus"
                                    size={24}
                                    color={mode === "line" ? "#3B82F6" : "#374151"}
                                />
                            </View>
                            <Text style={[styles.modeText, mode === "line" && styles.modeTextActive]}>
                                Draw straight line
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeButton, mode === "rectangle" && styles.modeButtonActive]}
                            onPress={() => setMode("rectangle")}
                        >
                            <View style={[styles.modeIcon, mode === "rectangle" && styles.modeIconActive]}>
                                <View style={styles.rectangleIcon}>
                                    <View style={styles.rectangleIconInner} />
                                </View>
                            </View>
                            <Text style={[styles.modeText, mode === "rectangle" && styles.modeTextActive]}>
                                Rectangle drawing
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Show All Tapes Toggle */}
                    <View style={styles.toggleRow}>
                        <Text style={styles.label}>Show all tapes</Text>
                        <Switch
                            value={showAllTapes}
                            onValueChange={setShowAllTapes}
                            trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
                            thumbColor={showAllTapes ? "#3B82F6" : "#f4f3f4"}
                        />
                    </View>

                    {/* Style Section */}
                    <Text style={styles.sectionTitle}>Style</Text>
                    <View style={styles.patternsGrid}>
                        {TAPE_PATTERNS.map((pattern) => (
                            <TouchableOpacity
                                key={pattern.id}
                                style={[
                                    styles.patternItem,
                                    selectedPattern === pattern.id && styles.patternItemSelected,
                                ]}
                                onPress={() => setSelectedPattern(pattern.id)}
                            >
                                {renderPatternPreview(pattern.id, selectedPattern === pattern.id)}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Thickness Section */}
                    <View style={styles.thicknessRow}>
                        <Text style={styles.label}>Thickness</Text>
                        <Text style={styles.thicknessValue}>{thickness.toFixed(2)}mm</Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={10}
                        value={thickness}
                        onValueChange={setThickness}
                        minimumTrackTintColor="#3B82F6"
                        maximumTrackTintColor="#E5E7EB"
                        thumbTintColor="#3B82F6"
                    />

                    {/* Color Section */}
                    <Text style={styles.sectionTitle}>Color</Text>
                    <View style={styles.colorsRow}>
                        {TAPE_COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorButton,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.colorButtonSelected,
                                ]}
                                onPress={() => setSelectedColor(color)}
                            >
                                {selectedColor === color && (
                                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApply}
                    >
                        <Text style={styles.applyButtonText}>Apply Tape Tool</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            onClearTapesOnPage?.();
                        }}
                    >
                        <Text style={styles.clearButtonText}>Clear tapes on current page</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.clearButton, { marginTop: 8 }]}
                        onPress={() => {
                            onClearTapesOnAllPages?.();
                        }}
                    >
                        <Text style={styles.clearButtonText}>Clear tapes on all pages</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)", // Lighter backdrop
        justifyContent: "center",
        alignItems: "center",
    },
    dropdown: {
        width: 600, // Increased width
        backgroundColor: "#FFFFFF", // White background
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827", // Dark text
        textAlign: "center",
        marginBottom: 16,
    },
    modeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
    },
    modeButton: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#F3F4F6", // Light gray
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    modeButtonActive: {
        borderColor: "#3B82F6",
        backgroundColor: "#EFF6FF", // Light blue bg
    },
    modeIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    modeIconActive: {
        backgroundColor: "#3B82F6",
    },
    rectangleIcon: {
        width: 28,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#FDA4AF",
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    rectangleIconInner: {
        width: "80%",
        height: 2,
        backgroundColor: "#FDA4AF",
        transform: [{ rotate: "-15deg" }],
    },
    modeText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#6B7280", // Gray text
        textAlign: "center",
    },
    modeTextActive: {
        color: "#3B82F6", // Blue text
        fontWeight: "600",
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
        marginTop: 8,
    },
    patternsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    patternItem: {
        borderRadius: 8,
        padding: 4,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    patternItemSelected: {
        borderColor: "#3B82F6",
        backgroundColor: "#EFF6FF", // Light blue bg
    },
    thicknessRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    thicknessValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
    },
    slider: {
        width: "100%",
        height: 40,
        marginBottom: 20,
    },
    colorsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    colorButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    colorButtonSelected: {
        borderColor: "#3B82F6", // Blue ring
        transform: [{ scale: 1.1 }],
    },
    applyButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    clearButton: {
        borderWidth: 1,
        borderColor: "#EF4444",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "#FEF2F2",
    },
    clearButtonText: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "600",
    },
});
