import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { BrowseScreen } from "../screens/BrowseScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { MyTripsScreen } from "../screens/MyTripsScreen";
import { OpportunityDetailScreen } from "../screens/OpportunityDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SignupScreen } from "../screens/SignupScreen";
import type { AuthStackParamList, BrowseStackParamList, MyTripsStackParamList, RootTabParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const BrowseStack = createNativeStackNavigator<BrowseStackParamList>();
const MyTripsStack = createNativeStackNavigator<MyTripsStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function BrowseNavigator() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerShown: false }}>
      <BrowseStack.Screen name="Browse" component={BrowseScreen} />
      <BrowseStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} options={{ headerShown: true, title: "" }} />
    </BrowseStack.Navigator>
  );
}

function MyTripsNavigator() {
  return (
    <MyTripsStack.Navigator screenOptions={{ headerShown: false }}>
      <MyTripsStack.Screen name="MyTripsList" component={MyTripsScreen} />
      <MyTripsStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} options={{ headerShown: true, title: "" }} />
    </MyTripsStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="BrowseTab" component={BrowseNavigator} options={{ title: "Browse" }} />
      <Tab.Screen name="MyTripsTab" component={MyTripsNavigator} options={{ title: "My Trips" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1a4d2e" />
      </View>
    );
  }

  return <NavigationContainer>{user ? <AppTabs /> : <AuthNavigator />}</NavigationContainer>;
}
