import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawingScreen from "../screens/drawing/DrawingScreen/DrawingScreen";
import LoginScreen from "../screens/auth/LoginScreen/LoginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawingScreen" component={DrawingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
