import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawingScreen from "../screens/drawing/DrawingScreen/DrawingScreen";
import LoginScreen from "../screens/auth/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen/RegisterScreen";
import HomeScreen from "../screens/home/HomeScreen/HomeScreen";
import GuestHomeScreen from "../screens/home/GuestHomeScreen/GuestHomeScreen";
import CourseDetailScreen from "../screens/courses/CourseDetailScreen/CourseDetailScreen";
import CoursesScreen from "../screens/courses/CoursesScreen/CoursesScreen";
import LessonScreen from "../screens/courses/LessonScreen/LessonScreen";
import MyCoursesScreen from "../screens/courses/MyCoursesScreen/MyCoursesScreen";
import BankAccountsScreen from "../screens/BankAccountsScreen/BankAccountsScreen";
import BlogScreen from "../screens/blog/BlogScreen";
import BlogDetailScreen from "../screens/blog/BlogDetailScreen";
import ResourceStoreScreen from "../screens/store/ResourceStoreScreen/ResourceStoreScreen";
import ResourceDetailScreen from "../screens/store/ResourceDetailScreen/ResourceDetailScreen";
import CartScreen from "../screens/store/CartScreen/CartScreen";
import CheckoutScreen from "../screens/store/CheckoutScreen/CheckoutScreen";
import MyBlogScreen from "../screens/auth/myblog/MyBlogScreen";
import CreateBlogScreen from "../screens/auth/myblog/create/CreateBlogScreen";
import UpdateBlogScreen from "../screens/auth/myblog/create/UpdateBlogScreen";
import PaymentWebViewScreen from "../screens/payment/PaymentWebViewScreen";
import PaymentSuccessScreen from "../screens/payment/PaymentSuccessScreen";
import PaymentFailedScreen from "../screens/payment/PaymentFailedScreen";
import NoteSetupScreen from "../screens/note/NoteSetupScreenFinal";
import CustomNoteSetupScreen from "../screens/note/CustomNoteSetupScreen";
import TemplateSelectionScreen from "../screens/note/TemplateSelectionScreen";
import TransactionHistoryScreen from "../screens/store/Transaction/TransactionHistoryScreen";
import OrderHistoryScreen from "../screens/store/Order/OrderHistoryScreen";
import OrderSuccessScreen from "../screens/store/ResourceStoreScreen/Payment/OrderSuccessScreen";
import DesignerHomeScreen from "../screens/designer/DesignerHomeScreen/DesignerHomeScreen";
import DesignerProductsScreen from "../screens/designer/DesignerProductsScreen/DesignerProductsScreen";
import DesignerAnalyticsScreen from "../screens/designer/DesignerAnalyticsScreen/DesignerAnalyticsScreen";
import DesignerQuickUploadScreen from "../screens/designer/DesignerQuickUploadScreen/DesignerQuickUploadScreen";
import CreateVersionScreen from "../screens/designer/CreateVersionScreen/CreateVersionScreen";
import DesignerSubscription from "../screens/store/DesignerSubscription/DesignerSubscription";
import DesignerWalletScreen from "../screens/designer/DesignerWalletScreen/DesignerWalletScreen";
import ProfileScreen from "../screens/auth/ProfileScreen/ProfileScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen/VerifyEmailScreen";
import GalleryScreen from "../screens/drawing/GalleryScreen/GalleryScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import CreditScreen from "../screens/credit/CreditScreen";
import CreditTransactionHistoryScreen from "../screens/credit/CreditTransactionHistoryScreen";
import WithdrawalHistoryScreen from "../screens/designer/WithdrawalHistoryScreen/WithdrawalHistoryScreen";
import SketchNotePolicy from "../screens/policy/SketchNotePolicy";
import DesignerProfileScreen from "../screens/store/DesignerProfileScreen/DesignerProfileScreen";
import SettingScreen from "../screens/settings/SettingScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="GuestHome"
    >
      <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="NoteSetupScreen" component={NoteSetupScreen} />
      <Stack.Screen name="CustomNoteSetupScreen" component={CustomNoteSetupScreen} />
      <Stack.Screen name="TemplateSelectionScreen" component={TemplateSelectionScreen} />
      <Stack.Screen name="DrawingScreen" component={DrawingScreen} />
      <Stack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
      <Stack.Screen name="CoursesScreen" component={CoursesScreen} />
      <Stack.Screen name="LessonScreen" component={LessonScreen} />
      <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
      <Stack.Screen name="BlogList" component={BlogScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="ResourceStore" component={ResourceStoreScreen} />
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
      <Stack.Screen name="DesignerProfile" component={DesignerProfileScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="CreditScreen" component={CreditScreen} />
      <Stack.Screen name="CreditTransactionHistory" component={CreditTransactionHistoryScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
      <Stack.Screen
        name="DesignerSubscription"
        component={DesignerSubscription}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
      />
      <Stack.Screen name="MyBlog" component={MyBlogScreen} />
      <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
      <Stack.Screen name="UpdateBlog" component={UpdateBlogScreen} />
      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
      <Stack.Screen
        name="PaymentSuccessScreen"
        component={PaymentSuccessScreen}
      />
      <Stack.Screen
        name="PaymentFailedScreen"
        component={PaymentFailedScreen}
      />

      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ headerShown: false }}
      />

      {/* Designer Screens */}
      <Stack.Screen name="DesignerDashboard" component={DesignerHomeScreen} />
      <Stack.Screen
        name="DesignerProducts"
        component={DesignerProductsScreen}
      />
      <Stack.Screen
        name="DesignerAnalytics"
        component={DesignerAnalyticsScreen}
      />
      <Stack.Screen
        name="DesignerQuickUpload"
        component={DesignerQuickUploadScreen}
      />
      <Stack.Screen
        name="CreateVersionScreen"
        component={CreateVersionScreen}
      />


      <Stack.Screen name="DesignerWallet" component={DesignerWalletScreen} />
      <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} />
      <Stack.Screen name="Policy" component={SketchNotePolicy} />
      <Stack.Screen name="Settings" component={SettingScreen} />
    </Stack.Navigator>
  );
}
