import { StyleSheet,Platform  } from "react-native";

const DRAWER_WIDTH = 320;

export const drawerStyles = StyleSheet.create({
  // Overlay khi drawer mở
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 998,
  },
  
  // Navigation Drawer
  drawer: {
    position: 'absolute',
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    left: 0,
    top: 0,
  },
  
  // Header
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginLeft: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // User Info
  userInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Navigation Items
  drawerItems: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
    transition: 'all 0.2s ease',
  },
  drawerItemActive: {
    backgroundColor: '#EEF2FF',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#4F46E5',
  },
  drawerText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  drawerTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  
  // Footer
  drawerFooter: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

// Sidebar Styles
export const SIDEBAR_WIDTH = 260;

export const sidebarStyles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    height: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Pacifico-Regular',
    color: '#104D83',
    marginLeft: 10,
  },
  menuContainer: {
    flex: 1,
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  menuLabel: {
    marginLeft: 14,
    fontSize: 15.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    marginHorizontal: 12,
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    marginBottom: 12,
  },
  logoutText: {
    marginLeft: 12,
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15.5,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});