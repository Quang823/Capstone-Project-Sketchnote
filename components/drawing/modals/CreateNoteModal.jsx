import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Popover from "react-native-popover-view";
import { LinearGradient } from "expo-linear-gradient";

export default function CreateNoteModal({
  visible,
  onClose,
  onSelectOption,
  fromRef,
}) {
  const options = [
    {
      id: "create_note",
      icon: "notebook-outline",
      label: "Create note",
      description: "Start with templates",
    },
    {
      id: "infinite_note",
      icon: "infinity",
      label: "Infinite note",
      description: "Unlimited canvas",
    },
    {
      id: "import_files",
      icon: "file-import-outline",
      label: "Import files",
      description: "PDF / PPT / DOC / EPUB / MOBI / AZTEC",
    },
    {
      id: "import_image",
      icon: "image-outline",
      label: "Import image",
      description: "Add image to canvas",
    },
    {
      id: "take_photo",
      icon: "camera-outline",
      label: "Take photo",
      description: "Capture with camera",
    },
    {
      id: "quick_note",
      icon: "lightning-bolt-outline",
      label: "Quick note",
      description: "Fast note taking",
    },
  ];

  return (
    <Popover
      isVisible={visible}
      fromView={fromRef}
      onRequestClose={onClose}
      placement="bottom"
      arrowSize={{ width: 16, height: 10 }}
      popoverStyle={styles.popover}
      backgroundStyle={styles.popoverBackground}
    >
      <View style={styles.container}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#1D4ED8", "#3B82F6", "#60A5FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
          <Text style={styles.title}>Create New</Text>
        </LinearGradient>

        {/* Options Scroll */}
        <ScrollView
          style={styles.optionsContainer}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={() => {
                onSelectOption(option.id);
                onClose();
              }}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.optionItem,
                    pressed && styles.optionItemPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#EFF6FF", "#F0F9FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={22}
                      color="#6366F1"
                    />
                  </LinearGradient>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {option.description && (
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#CBD5E1"
                  />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  popover: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  popoverBackground: {
    backgroundColor: "transparent",
  },
  container: {
    width: 340,
    maxHeight: 500,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "left",
    letterSpacing: 0.5,
  },
  optionsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    maxHeight: 380,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
    gap: 12,
  },
  optionItemPressed: {
    backgroundColor: "#f1f5ff",
    borderColor: "#6366F1",
    opacity: 0.9,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  optionDescription: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
