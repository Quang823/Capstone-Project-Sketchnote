import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { EMOJIS } from "./emojiList";
import { STATIC_STICKERS } from "./stickerList";

export default function StickerModal({ visible, onClose, onSelect }) {
  const [tab, setTab] = useState("emoji"); // ✅ default emoji tab

  const handleSelect = (value, type) => {
    if (!onSelect || !value) return;

    if (type === "emoji") {
      onSelect({
        id: `emoji-${Date.now()}`,
        tool: "emoji",
        text: value,
        fontFamily: "NotoColorEmoji-Regular",
        fontSize: 36,
        color: "#000",
        x: 120,
        y: 120,
        padding: 8,
      });
      onClose?.();
      return;
    }

    if (type === "static") {
      const uri =
        typeof value === "string"
          ? value
          : Image.resolveAssetSource(value)?.uri;

      if (!uri || typeof uri !== "string") {
        Alert.alert("Sticker error", "Invalid static sticker URI");
        return;
      }

      onSelect({
        id: `sticker-${Date.now()}`,
        tool: "sticker",
        uri,
        x: 100,
        y: 100,
        width: 90,
        height: 90,
        selected: false,
      });
      onClose?.();
      return;
    }
  };

  const TabButton = ({ type, icon, label }) => (
    <TouchableOpacity
      onPress={() => setTab(type)}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        backgroundColor: tab === type ? "#E8F0FE" : "#fff",
        borderBottomWidth: tab === type ? 3 : 1,
        borderBottomColor: tab === type ? "#007AFF" : "#eee",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: tab === type ? "#007AFF" : "#555",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        <View
          style={{
            width: "65%", // 🔹 nhỏ gọn hơn nữa
            height: "45%", // 🔹 thấp hơn
            backgroundColor: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              borderBottomWidth: 1,
              borderColor: "#eee",
              backgroundColor: "#f9fafb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
              Choose Sticker
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 18, color: "#007AFF" }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: "row" }}>
            <TabButton type="emoji" label="Emojis" />
            <TabButton type="static" label="Stickers" />
          </View>

          {/* Content */}
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {tab === "emoji" && (
              <ScrollView
                contentContainerStyle={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                {EMOJIS.map((emoji, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSelect(emoji, "emoji")}
                    style={{
                      margin: 5,
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {tab === "static" && (
              <ScrollView
                contentContainerStyle={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  padding: 8,
                }}
              >
                {STATIC_STICKERS.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSelect(uri, "static")}
                    style={{
                      margin: 6,
                      borderRadius: 10,
                      overflow: "hidden",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: 55, height: 55 }}
                      resizeMode="contain"
                      onError={() =>
                        Alert.alert("Error", `Failed to load: ${uri}`)
                      }
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
