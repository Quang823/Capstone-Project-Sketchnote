# Hướng dẫn sử dụng Global Navigation Sidebar

## Cách sử dụng Sidebar Navigation trên mọi trang

### Bước 1: Wrap App với NavigationProvider (đã làm trong App.js)

Đảm bảo App.js đã được wrap với `NavigationProvider`:

```jsx
import { NavigationProvider } from './context/NavigationContext';
import GlobalSidebar from './components/navigation/GlobalSidebar';

export default function App() {
  return (
    <NavigationProvider>
      {/* Your app content */}
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
      
      {/* Global Sidebar - đặt ở đây để dùng cho tất cả màn hình */}
      <GlobalSidebar />
    </NavigationProvider>
  );
}
```

### Bước 2: Sử dụng Toggle Button trên bất kỳ trang nào

#### Ví dụ 1: Sử dụng cơ bản

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SidebarToggleButton from '../../components/navigation/SidebarToggleButton';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      {/* Đặt toggle button ở header */}
      <View style={styles.header}>
        <SidebarToggleButton />
        <Text style={styles.title}>My Screen</Text>
      </View>
      
      {/* Nội dung của trang */}
      <View style={styles.content}>
        <Text>Nội dung trang của bạn</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
```

#### Ví dụ 2: Tùy chỉnh màu và kích thước icon

```jsx
import SidebarToggleButton from '../../components/navigation/SidebarToggleButton';

<View style={styles.header}>
  {/* Tùy chỉnh màu icon và kích thước */}
  <SidebarToggleButton 
    iconColor="#EF4444" 
    iconSize={32}
    style={{ backgroundColor: '#FEF2F2' }}
  />
  <Text style={styles.title}>Custom Styled Button</Text>
</View>
```

#### Ví dụ 3: Đặt ở góc màn hình (floating button)

```jsx
import SidebarToggleButton from '../../components/navigation/SidebarToggleButton';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      {/* Nội dung của trang */}
      <Text>My Content</Text>
      
      {/* Floating toggle button ở góc trên bên trái */}
      <SidebarToggleButton 
        style={styles.floatingButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
});
```

#### Ví dụ 4: Sử dụng trong Header với React Navigation

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import SidebarToggleButton from '../../components/navigation/SidebarToggleButton';

export default function MyScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <SidebarToggleButton style={{ marginLeft: 8 }} />,
      headerTitle: 'My Screen',
    });
  }, [navigation]);

  return (
    <View>
      <Text>Screen Content</Text>
    </View>
  );
}
```

### Bước 3: Sử dụng Navigation Context (nếu cần)

Nếu bạn cần truy cập trực tiếp vào state hoặc functions của navigation:

```jsx
import { useNavigation } from '../../context/NavigationContext';

export default function MyScreen() {
  const { 
    toggleSidebar, 
    openSidebar, 
    closeSidebar, 
    sidebarOpen,
    activeNavItem,
    setActiveNavItem 
  } = useNavigation();

  const handleCustomAction = () => {
    // Mở sidebar
    openSidebar();
    
    // Hoặc đóng sidebar
    // closeSidebar();
    
    // Hoặc toggle
    // toggleSidebar();
  };

  return (
    <View>
      <Text>Sidebar is {sidebarOpen ? 'Open' : 'Closed'}</Text>
      <TouchableOpacity onPress={handleCustomAction}>
        <Text>Open Sidebar</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Tính năng

✅ **Toggle sidebar** - Mở/đóng sidebar bằng animation mượt mà
✅ **Global state** - Sidebar có thể được điều khiển từ bất kỳ đâu trong app
✅ **Auto-navigation** - Tự động điều hướng khi click vào menu items
✅ **Active state** - Hiển thị item đang active
✅ **Responsive** - Đóng sidebar sau khi navigation
✅ **Overlay** - Có overlay tối khi sidebar mở
✅ **User info** - Hiển thị thông tin user
✅ **Logout** - Có nút đăng xuất

## Props của SidebarToggleButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| style | Object | {} | Custom style cho button |
| iconColor | String | "#4F46E5" | Màu của icon menu |
| iconSize | Number | 28 | Kích thước của icon |

## Lưu ý

- `GlobalSidebar` chỉ cần đặt MỘT LẦN trong App.js
- `SidebarToggleButton` có thể đặt ở **BẤT KỲ** màn hình nào, bao nhiêu lần cũng được
- Sidebar sẽ tự động đóng sau khi navigation
- Có thể tùy chỉnh style của button theo nhu cầu
