import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { useProfile } from '../context/ProfileContext';

// Onboarding
import LoginScreen from '../screens/onboarding/LoginScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NamePhotoScreen from '../screens/onboarding/NamePhotoScreen';
import ProfessionalScreen from '../screens/onboarding/ProfessionalScreen';
import BioScreen from '../screens/onboarding/BioScreen';
import SkillsScreen from '../screens/onboarding/SkillsScreen';
import LinksScreen from '../screens/onboarding/LinksScreen';
import PreviewScreen from '../screens/onboarding/PreviewScreen';

// Main
import MyCardScreen from '../screens/main/MyCardScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import CollectedScreen from '../screens/main/CollectedScreen';
import ReviewsScreen from '../screens/main/ReviewsScreen';
import GameScreen from '../screens/main/GameScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  MyCard: ['💼', '💼'],
  Discover: ['📡', '📡'],
  Collected: ['🗂️', '🗂️'],
  Reviews: ['⭐', '⭐'],
  Game: ['🃏', '🃏'],
};

function TabIcon({ name, focused }) {
  const [active, inactive] = TAB_ICONS[name] || ['●', '○'];
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{focused ? active : inactive}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="MyCard" component={MyCardScreen} options={{ title: 'My Card' }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Discover' }} />
      <Tab.Screen name="Collected" component={CollectedScreen} options={{ title: 'Collected' }} />
      <Tab.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Reviews' }} />
      <Tab.Screen name="Game" component={GameScreen} options={{ title: 'Game' }} />
    </Tab.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="NamePhoto" component={NamePhotoScreen} />
      <Stack.Screen name="Professional" component={ProfessionalScreen} />
      <Stack.Screen name="Bio" component={BioScreen} />
      <Stack.Screen name="Skills" component={SkillsScreen} />
      <Stack.Screen name="Links" component={LinksScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { profile, loading } = useProfile();

  if (loading) return null;

  return (
    <NavigationContainer>
      {profile?.id ? <MainTabs /> : <OnboardingStack />}
    </NavigationContainer>
  );
}
