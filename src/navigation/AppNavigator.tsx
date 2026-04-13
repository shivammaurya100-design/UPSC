import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';
import { colors, typography, spacing } from '../theme';

// Home stack screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { LearnHomeScreen } from '../screens/learn/LearnHomeScreen';
import { TopicListScreen } from '../screens/learn/TopicListScreen';
import { TopicDetailScreen } from '../screens/learn/TopicDetailScreen';
import { SyllabusBrowserScreen } from '../screens/learn/SyllabusBrowserScreen';
import { PracticeHomeScreen } from '../screens/practice/PracticeHomeScreen';
import { MCQPracticeScreen } from '../screens/practice/MCQPracticeScreen';
import { MCQReviewScreen } from '../screens/practice/MCQReviewScreen';
import { AnswerWritingScreen } from '../screens/practice/AnswerWritingScreen';
import { WeaknessFocusScreen } from '../screens/practice/WeaknessFocusScreen';
import { PracticeStatsDetailScreen } from '../screens/practice/PracticeStatsDetailScreen';
import { FlashcardDeckScreen } from '../screens/flashcards/FlashcardDeckScreen';
import { FlashcardPracticeScreen } from '../screens/flashcards/FlashcardPracticeScreen';
import { TestsHomeScreen } from '../screens/tests/TestsHomeScreen';
import { SectionalTestScreen } from '../screens/tests/SectionalTestScreen';
import { CurrentAffairsHomeScreen } from '../screens/currentAffairs/CurrentAffairsHomeScreen';
import { ArticleDetailScreen } from '../screens/currentAffairs/ArticleDetailScreen';

// Community screens
import { CommunityScreen } from '../screens/community/CommunityScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';

// Profile screens
import { ProfileHomeScreen } from '../screens/profile/ProfileHomeScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
};

// Home Stack — single entry point with all module screens
const HomeStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="Home" component={HomeScreen} />
    {/* Learn */}
    <Stack.Screen name="LearnHome" component={LearnHomeScreen} />
    <Stack.Screen name="TopicList" component={TopicListScreen} />
    <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
    <Stack.Screen name="SyllabusBrowser" component={SyllabusBrowserScreen} />
    {/* Practice */}
    <Stack.Screen name="PracticeHome" component={PracticeHomeScreen} />
    <Stack.Screen name="MCQPractice" component={MCQPracticeScreen} />
    <Stack.Screen name="MCQReview" component={MCQReviewScreen} />
    <Stack.Screen name="AnswerWriting" component={AnswerWritingScreen} />
    <Stack.Screen name="WeaknessFocus" component={WeaknessFocusScreen} />
    <Stack.Screen name="PracticeStatsDetail" component={PracticeStatsDetailScreen} />
    <Stack.Screen name="FlashcardDeck" component={FlashcardDeckScreen} />
    <Stack.Screen name="FlashcardPractice" component={FlashcardPracticeScreen} />
    {/* Tests */}
    <Stack.Screen name="TestsHome" component={TestsHomeScreen} />
    <Stack.Screen name="SectionalTest" component={SectionalTestScreen} />
    {/* Current Affairs */}
    <Stack.Screen name="CurrentAffairsHome" component={CurrentAffairsHomeScreen} />
    <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
  </Stack.Navigator>
);

// Community Stack
const CommunityStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="CommunityHome" component={CommunityScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator — 3 tabs only
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 85,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: typography.medium,
        marginTop: 4,
      },
      tabBarIcon: (props) => {
        const name = Object.keys(props).find((k) => k === 'route' || k === 'name') as string | undefined;
        const routeName = name ? String(props[name as keyof typeof props]) : '';
        const icons: Record<string, string> = {
          Home: '🏠',
          Community: '👥',
          Profile: '👤',
        };
        return <Text style={styles.tabIcon}>{icons[routeName] ?? '📱'}</Text>;
      },
    }}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Community" component={CommunityStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

// Root App Navigator
export const AppNavigator: React.FC = () => (
  <NavigationContainer theme={DarkTheme}>
    <MainTabs />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
  },
});
