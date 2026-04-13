import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingRowProps {
  icon: string;
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
  isDestructive?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  description,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  isDestructive,
}) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={isSwitch}
    activeOpacity={isSwitch ? 1 : 0.7}
  >
    <View style={styles.settingLeft}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, isDestructive && styles.settingLabelDestructive]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
    </View>
    <View style={styles.settingRight}>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.surfaceElevated, true: 'rgba(99,102,241,0.4)' }}
          thumbColor={switchValue ? colors.primary : colors.textTertiary}
        />
      ) : (
        <View style={styles.settingRightContent}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Text style={styles.settingArrow}>→</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive' },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. All your data, progress, and subscription will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive' },
      ],
    );
  };

  return (
    <ScreenWrapper edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <SettingSection title="Account">
          <SettingRow
            icon="👤"
            label="Profile"
            description="Name, stage, target year"
            value="Rahul Sharma"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📧"
            label="Email"
            value="rahul@example.com"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="👑"
            label="Subscription"
            description="Pro plan · Active till Apr 2027"
            value="Pro"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications">
          <SettingRow
            icon="🔔"
            label="Push Notifications"
            description="New content, features, tips"
            isSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📅"
            label="Daily Reminders"
            description="Practice reminder at 7 AM"
            isSwitch
            switchValue={dailyReminders}
            onSwitchChange={setDailyReminders}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🔥"
            label="Streak Alerts"
            description="Warning if streak is about to break"
            isSwitch
            switchValue={streakAlerts}
            onSwitchChange={setStreakAlerts}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🏆"
            label="Weekly Summary"
            description="Performance recap every Sunday"
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
        </SettingSection>

        {/* Study Preferences */}
        <SettingSection title="Study Preferences">
          <SettingRow
            icon="🌙"
            label="Dark Mode"
            description="Dark theme for reduced eye strain"
            isSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📖"
            label="Font Size"
            value="Medium"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🔊"
            label="Sound Effects"
            description="Audio feedback on actions"
            isSwitch
            switchValue={soundEffects}
            onSwitchChange={setSoundEffects}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📳"
            label="Haptic Feedback"
            description="Vibration on interactions"
            isSwitch
            switchValue={hapticFeedback}
            onSwitchChange={setHapticFeedback}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="⏱️"
            label="Default MCQ Timer"
            value="40s"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📚"
            label="Daily Goal"
            value="45 min"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Data & Privacy */}
        <SettingSection title="Data & Privacy">
          <SettingRow
            icon="☁️"
            label="Cloud Sync"
            description="Sync progress across devices"
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📥"
            label="Download Content"
            description="Offline mode · 234 MB used"
            value="Manage"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🔒"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="📋"
            label="Terms of Service"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🛡️"
            label="Data & Security"
            description="Manage your data"
            onPress={() => {}}
          />
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <SettingRow
            icon="ℹ️"
            label="App Version"
            value="1.0.0"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="⭐"
            label="Rate the App"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="💬"
            label="Send Feedback"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🐛"
            label="Report a Bug"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Danger zone */}
        <SettingSection title="Account Actions">
          <SettingRow
            icon="📱"
            label="Linked Devices"
            description="2 devices connected"
            value="Manage"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="⚠️"
            label="Sign Out"
            onPress={handleLogout}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="🗑️"
            label="Delete Account"
            description="Permanent deletion"
            onPress={handleDeleteAccount}
            isDestructive
          />
        </SettingSection>

        {/* App footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>UPSC Pathfinder v1.0.0</Text>
          <Text style={styles.footerSubtext}>Built with ❤️ for UPSC aspirants</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: colors.textPrimary },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    fontWeight: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xxxl,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  settingIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  settingLabelDestructive: {
    color: colors.error,
  },
  settingDescription: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  settingRight: {},
  settingRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingValue: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  footerSubtext: {
    fontSize: typography.overline,
    color: colors.textTertiary,
  },
  bottomPadding: { height: spacing.xxxl },
});
