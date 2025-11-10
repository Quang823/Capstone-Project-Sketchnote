import React, { createContext, useContext, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  
  // Animation values for sidebar
  const sidebarAnimation = useSharedValue(-320); // -DRAWER_WIDTH
  const overlayAnimation = useSharedValue(0);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Animate sidebar
    sidebarAnimation.value = withTiming(newState ? 0 : -320, { duration: 300 });
    overlayAnimation.value = withTiming(newState ? 0.5 : 0, { duration: 300 });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    sidebarAnimation.value = withTiming(-320, { duration: 300 });
    overlayAnimation.value = withTiming(0, { duration: 300 });
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    sidebarAnimation.value = withTiming(0, { duration: 300 });
    overlayAnimation.value = withTiming(0.5, { duration: 300 });
  };

  return (
    <NavigationContext.Provider
      value={{
        sidebarOpen,
        activeNavItem,
        setActiveNavItem,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        sidebarAnimation,
        overlayAnimation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
