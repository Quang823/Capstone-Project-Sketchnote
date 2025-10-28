import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawingScreen from "../screens/drawing/DrawingScreen/DrawingScreen";
import LoginScreen from "../screens/auth/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen/RegisterScreen";
import HomeScreen from "../screens/home/HomeScreen/HomeScreen";
import CourseDetailScreen from "../screens/courses/CourseDetailScreen/CourseDetailScreen";
import CoursesScreen from "../screens/courses/CoursesScreen/CoursesScreen";
import LessonScreen from "../screens/courses/LessonScreen/LessonScreen";

import BlogScreen from "../screens/blog/BlogScreen";
import BlogDetailScreen from "../screens/blog/BlogDetailScreen";
import ResourceStoreScreen from "../screens/store/ResourceStoreScreen/ResourceStoreScreen";
import ResourceDetailScreen from "../screens/store/ResourceDetailScreen/ResourceDetailScreen";
import CartScreen from "../screens/store/CartScreen/CartScreen";
import CheckoutScreen from "../screens/store/CheckoutScreen/CheckoutScreen";
import WalletScreen from "../screens/store/WalletScreen/WalletScreen";
import MyBlogScreen from "../screens/auth/myblog/MyBlogScreen";
import CreateBlogScreen from "../screens/auth/myblog/create/CreateBlogScreen";
import UpdateBlogScreen from "../screens/auth/myblog/create/UpdateBlogScreen";
import PaymentWebViewScreen from "../screens/payment/PaymentWebViewScreen";
import PaymentSuccessScreen from "../screens/payment/PaymentSuccessScreen";
import PaymentFailedScreen from "../screens/payment/PaymentFailedScreen";

// Designer Screens
import DesignerHomeScreen from "../screens/designer/DesignerHomeScreen/DesignerHomeScreen";
import DesignerProductsScreen from "../screens/designer/DesignerProductsScreen/DesignerProductsScreen";
import DesignerAnalyticsScreen from "../screens/designer/DesignerAnalyticsScreen/DesignerAnalyticsScreen";
import DesignerQuickUploadScreen from "../screens/designer/DesignerQuickUploadScreen/DesignerQuickUploadScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DrawingScreen" component={DrawingScreen} />
      <Stack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
      <Stack.Screen name="CoursesScreen" component={CoursesScreen} />
      <Stack.Screen name="LessonScreen" component={LessonScreen} />
      <Stack.Screen name="BlogList" component={BlogScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="ResourceStore" component={ResourceStoreScreen} />
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="MyBlog" component={MyBlogScreen} />
      <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
      <Stack.Screen name="UpdateBlog" component={UpdateBlogScreen} />
      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
      <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentFailedScreen" component={PaymentFailedScreen} />
      
      {/* Designer Screens */}
      <Stack.Screen name="DesignerDashboard" component={DesignerHomeScreen} />
      <Stack.Screen name="DesignerProducts" component={DesignerProductsScreen} />
      <Stack.Screen name="DesignerAnalytics" component={DesignerAnalyticsScreen} />
      <Stack.Screen name="DesignerQuickUpload" component={DesignerQuickUploadScreen} />
    </Stack.Navigator>
  );
}
