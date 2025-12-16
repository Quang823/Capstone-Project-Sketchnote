import React from "react";
import { View, Text, Switch, ScrollView, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { settingStyles } from "./SettingScreen.styles";
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";
import { useTheme } from "../../context/ThemeContext";
import NotificationButton from "../../components/common/NotificationButton";

export default function SettingScreen() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <View style={[settingStyles.container, isDark && settingStyles.containerDark]}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
            />

            {/* Header */}
            <View style={[settingStyles.header, isDark && settingStyles.headerDark]}>
                <View style={settingStyles.headerLeft}>
                    <SidebarToggleButton iconSize={28} iconColor={isDark ? "#FFFFFF" : "#084F8C"} />
                    <Text style={[settingStyles.headerTitle, isDark && settingStyles.headerTitleDark]}>
                        Settings
                    </Text>
                </View>
                <NotificationButton />
            </View>

            <ScrollView style={settingStyles.content}>
                {/* Appearance Section */}
                <View style={[settingStyles.section, isDark && settingStyles.sectionDark]}>
                    <Text style={[settingStyles.sectionTitle, isDark && settingStyles.sectionTitleDark]}>
                        Appearance
                    </Text>

                    <View style={settingStyles.row}>
                        <View style={settingStyles.rowLeft}>
                            <View style={[settingStyles.iconContainer, isDark && settingStyles.iconContainerDark]}>
                                <Icon name="dark-mode" size={22} color={isDark ? "#60A5FA" : "#64748B"} />
                            </View>
                            <Text style={[settingStyles.rowLabel, isDark && settingStyles.rowLabelDark]}>
                                Dark Mode
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#CBD5E1", true: "#3B82F6" }}
                            thumbColor={isDark ? "#FFFFFF" : "#F8FAFC"}
                        />
                    </View>
                </View>

                {/* General Section */}
                <View style={[settingStyles.section, isDark && settingStyles.sectionDark]}>
                    <Text style={[settingStyles.sectionTitle, isDark && settingStyles.sectionTitleDark]}>
                        General
                    </Text>

                    <View style={settingStyles.row}>
                        <View style={settingStyles.rowLeft}>
                            <View style={[settingStyles.iconContainer, isDark && settingStyles.iconContainerDark]}>
                                <Icon name="language" size={22} color={isDark ? "#60A5FA" : "#64748B"} />
                            </View>
                            <Text style={[settingStyles.rowLabel, isDark && settingStyles.rowLabelDark]}>
                                Language
                            </Text>
                        </View>
                        <Text style={[settingStyles.rowValue, isDark && settingStyles.rowValueDark]}>
                            English
                        </Text>
                    </View>

                    <View style={[settingStyles.divider, isDark && settingStyles.dividerDark]} />

                    <View style={settingStyles.row}>
                        <View style={settingStyles.rowLeft}>
                            <View style={[settingStyles.iconContainer, isDark && settingStyles.iconContainerDark]}>
                                <Icon name="notifications" size={22} color={isDark ? "#60A5FA" : "#64748B"} />
                            </View>
                            <Text style={[settingStyles.rowLabel, isDark && settingStyles.rowLabelDark]}>
                                Notifications
                            </Text>
                        </View>
                        <Icon name="chevron-right" size={24} color={isDark ? "#94A3B8" : "#CBD5E1"} />
                    </View>
                </View>

                {/* About Section */}
                <View style={[settingStyles.section, isDark && settingStyles.sectionDark]}>
                    <Text style={[settingStyles.sectionTitle, isDark && settingStyles.sectionTitleDark]}>
                        About
                    </Text>

                    <View style={settingStyles.row}>
                        <View style={settingStyles.rowLeft}>
                            <View style={[settingStyles.iconContainer, isDark && settingStyles.iconContainerDark]}>
                                <Icon name="info" size={22} color={isDark ? "#60A5FA" : "#64748B"} />
                            </View>
                            <Text style={[settingStyles.rowLabel, isDark && settingStyles.rowLabelDark]}>
                                Version
                            </Text>
                        </View>
                        <Text style={[settingStyles.rowValue, isDark && settingStyles.rowValueDark]}>
                            1.0.0
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
