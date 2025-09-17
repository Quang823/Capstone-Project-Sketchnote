import { View, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function HeaderToolbar({ onSelectTool }) {
  return (
    <View
      style={{
        backgroundColor: "#111827",
        paddingTop: 40,
        paddingBottom: 10,
        borderBottomWidth: 2, // 👈 thêm viền dưới
        borderBottomColor: "#374151", // 👈 màu xám đậm cho đẹp
      }}
    >
      {/* HÀNG 1: Header giống GoodNotes */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          justifyContent: "space-between",
        }}
      >
        {/* Left: Back + Camera + Crop + Mic */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={{ marginHorizontal: 6 }}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 6 }}>
            <Ionicons name="camera-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 6 }}>
            <MaterialIcons name="crop" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 6 }}>
            <Ionicons name="mic-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Right: Undo / Redo */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={{ marginHorizontal: 6 }}>
            <MaterialIcons name="undo" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 6 }}>
            <MaterialIcons name="redo" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
