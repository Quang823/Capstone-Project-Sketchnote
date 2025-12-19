import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Switch,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

// Expanded Shape List
const SHAPES = [
    // Basic Lines
    { id: "line", icon: "minus", label: "Line" },
    { id: "arrow", icon: "arrow-right", label: "Arrow" },
    { id: "double_arrow", icon: "arrow-left-right", label: "Double Arrow" },
    { id: "curve", icon: "wave", label: "Curve" }, // Placeholder for curve

    // Basic Shapes
    { id: "rect", icon: "rectangle-outline", label: "Rectangle" },
    { id: "circle", icon: "circle-outline", label: "Circle" },
    { id: "triangle", icon: "triangle-outline", label: "Triangle" },
    { id: "right_triangle", icon: "triangle", label: "Right Triangle" }, // Icon approx

    // Polygons
    { id: "diamond", icon: "cards-diamond-outline", label: "Diamond" },
    { id: "pentagon", icon: "pentagon-outline", label: "Pentagon" },
    { id: "hexagon", icon: "hexagon-outline", label: "Hexagon" },
    { id: "octagon", icon: "octagon-outline", label: "Octagon" },
    { id: "star", icon: "star-outline", label: "Star" },

    // 3D / Advanced (Wireframe)
    { id: "cube", icon: "cube-outline", label: "Cube" },
    { id: "cylinder", icon: "cylinder", label: "Cylinder" },
];

// Standard Colors (matching Tape/Pen)
const SHAPE_COLORS = [
    "#000000", // Black
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
];

export default function ShapeDropdown({
    visible,
    onClose,
    shapeSettings,
    setShapeSettings,
}) {
    const [selectedShape, setSelectedShape] = useState(shapeSettings?.shape || "rect");
    const [thickness, setThickness] = useState(shapeSettings?.thickness || 2);
    const [selectedColor, setSelectedColor] = useState(shapeSettings?.color || "#000000");
    const [isFilled, setIsFilled] = useState(shapeSettings?.fill || false);

    // ✅ Sync local state with props when shapeSettings changes externally
    React.useEffect(() => {
        if (shapeSettings) {
            setSelectedShape(prev => shapeSettings.shape !== undefined ? shapeSettings.shape : prev);
            setThickness(prev => shapeSettings.thickness !== undefined ? shapeSettings.thickness : prev);
            setSelectedColor(prev => shapeSettings.color !== undefined ? shapeSettings.color : prev);
            setIsFilled(prev => shapeSettings.fill !== undefined ? shapeSettings.fill : prev);
        }
    }, [shapeSettings]);

    const handleApply = useCallback(() => {
        const settings = {
            shape: selectedShape,
            thickness,
            color: selectedColor,
            fill: isFilled,
        };
        setShapeSettings?.(settings);
        onClose?.();
    }, [selectedShape, thickness, selectedColor, isFilled, setShapeSettings, onClose]);

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
                    <Text style={styles.title}>Graph</Text>

                    {/* Shape Grid */}
                    <View style={styles.gridContainer}>
                        {SHAPES.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.gridItem,
                                    selectedShape === item.id && styles.gridItemActive,
                                ]}
                                onPress={() => {
                                    setSelectedShape(item.id);
                                    setShapeSettings?.({
                                        shape: item.id,
                                        thickness,
                                        color: selectedColor,
                                        fill: isFilled,
                                    });
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={24}
                                    color={selectedShape === item.id ? "#3B82F6" : "#374151"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Thickness Slider */}
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Thickness</Text>
                        <Text style={styles.valueText}>{thickness.toFixed(2)}mm</Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={10}
                        value={thickness}
                        onValueChange={setThickness}
                        onSlidingComplete={(val) => {
                            setShapeSettings?.({
                                shape: selectedShape,
                                thickness: val,
                                color: selectedColor,
                                fill: isFilled,
                            });
                        }}
                        minimumTrackTintColor="#3B82F6"
                        maximumTrackTintColor="#E5E7EB"
                        thumbTintColor="#3B82F6"
                    />

                    {/* Color Palette */}
                    <Text style={[styles.label, { marginTop: 12, marginBottom: 8 }]}>Color</Text>
                    <View style={styles.colorsRow}>
                        {SHAPE_COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorButton,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.colorButtonSelected,
                                ]}
                                onPress={() => {
                                    setSelectedColor(color);
                                    setShapeSettings?.({
                                        shape: selectedShape,
                                        thickness,
                                        color: color,
                                        fill: isFilled,
                                    });
                                }}
                            >
                                {selectedColor === color && (
                                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Graphic Fill Toggle */}
                    <View style={[styles.rowBetween, { marginTop: 8, marginBottom: 20 }]}>
                        <Text style={styles.label}>Graphic fill</Text>
                        <Switch
                            value={isFilled}
                            onValueChange={(val) => {
                                setIsFilled(val);
                                setShapeSettings?.({
                                    shape: selectedShape,
                                    thickness,
                                    color: selectedColor,
                                    fill: val,
                                });
                            }}
                            trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
                            thumbColor={isFilled ? "#3B82F6" : "#f4f3f4"}
                        />
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                        <Text style={styles.applyButtonText}>Close</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    dropdown: {
        width: 340,
        backgroundColor: "#FFFFFF",
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
        color: "#111827",
        textAlign: "center",
        marginBottom: 20,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        marginBottom: 20,
    },
    gridItem: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    gridItemActive: {
        backgroundColor: "#EFF6FF",
        borderColor: "#3B82F6",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
    valueText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    slider: {
        width: "100%",
        height: 40,
    },
    colorsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    colorButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    colorButtonSelected: {
        borderColor: "#3B82F6",
        transform: [{ scale: 1.1 }],
    },
    applyButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    applyButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});
