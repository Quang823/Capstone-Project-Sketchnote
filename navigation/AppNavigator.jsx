import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawingScreen from "../screens/drawing/DrawingScreen/DrawingScreen";
import LoginScreen from "../screens/auth/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen/RegisterScreen";
import HomeScreen from "../screens/home/HomeScreen/HomeScreen";
import CourseDetailScreen from "../screens/courses/CourseDetailScreen/CourseDetailScreen";
import CoursesScreen from "../screens/courses/CoursesScreen/CoursesScreen";
import LessonScreen from "../screens/courses/LessonScreen/LessonScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DrawingScreen" component={DrawingScreen} />
      <Stack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
      <Stack.Screen name="CoursesScreen" component={CoursesScreen} />
      <Stack.Screen name="LessonScreen" component={LessonScreen} />
    </Stack.Navigator>
  );
}
