import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Popover from "react-native-popover-view";

export default function ToolGroup({ label, mainIcon, options, tool, setTool }) {
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef(null);

  const handleSelect = (name) => {
    setTool(name);
    setShowPopover(false);
  };

  return (
    <View>
      {/* Main Button */}
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.button,
          options.some((o) => o.name === tool) && styles.activeButton,
        ]}
        onPress={() => setShowPopover(true)}
      >
        {mainIcon}
      </TouchableOpacity>

      {/* Popover dropdown anchored to button */}
      <Popover
        isVisible={showPopover}
        from={buttonRef}
        onRequestClose={() => setShowPopover(false)}
        placement="bottom"
        arrowStyle={{ backgroundColor: "#1f2937" }}
      >
        <View style={styles.menu}>
          {options.map((o) => (
            <TouchableOpacity
              key={o.name}
              style={[
                styles.menuItem,
                tool === o.name && styles.activeMenuItem,
              ]}
              onPress={() => handleSelect(o.name)}
            >
              {o.icon}
              <Text style={styles.menuText}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  activeButton: {
    backgroundColor: "#2563eb",
    borderColor: "#3b82f6",
  },
  menu: {
    backgroundColor: "#1f2937",
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  activeMenuItem: {
    backgroundColor: "#2563eb",
  },
  menuText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },
});
