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
        activeOpacity={0.7}
      >
        {mainIcon}
      </TouchableOpacity>

      {/* Popover dropdown */}
      <Popover
        isVisible={showPopover}
        from={buttonRef}
        onRequestClose={() => setShowPopover(false)}
        placement="bottom"
        arrowStyle={{ backgroundColor: "#3b82f6" }}
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
              <Text
                style={[
                  styles.menuText,
                  tool === o.name && styles.activeMenuTest,
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menu: {
    backgroundColor: "#ffffff",
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  activeMenuItem: {
    backgroundColor: "#3b82f6",
  },
  menuText: {
    color: "#1f2937",
    marginLeft: 8,
    fontSize: 14,
  },
  activeMenuTest: {
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 14,
  },
});
