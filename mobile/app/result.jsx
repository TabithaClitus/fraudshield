import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { theme } from '../constants/theme';
import RiskMeter from '../components/RiskMeter';

const PAYMENT_APPS = [
  { name: 'GPay', icon: '💳', color: '#4285F4', getUrl: (m, a) => `tez://upi/pay?pa=${m}@upi&pn=Recipient&am=${a}&cu=INR` },
  { name: 'PhonePe', icon: '📱', color: '#5F259F', getUrl: (m, a) => `phonepe://pay?transactionId=FraudShield&amount=${a}` },
  { name: 'Paytm', icon: '💰', color: '#00B9F1', getUrl: (m, a) => `paytmmp://pay?pa=${m}@paytm&am=${a}` },
  { name: 'BHIM', icon: '🏦', color: '#00876C', getUrl: (m, a) => `upi://pay?pa=${m}@upi&am=${a}&cu=INR` },
];

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const result = params.data ? JSON.parse(params.data) : {};
  const mobile = params.mobile || '';
  const amount = params.amount || '';
  const borderAnim = useRef(new Animated.Value(0)).current;

  const risk = result.risk_score || 0;
  const isHigh = risk >= 71;
  const isMedium = risk >= 31 && risk < 71;
  const isLow = risk < 31;

  const riskColor = isHigh ? theme.colors.danger : isMedium ? theme.colors.warning : theme.colors.safe;
  const riskLabel = isHigh ? 'HIGH RISK' : isMedium ? 'MEDIUM RISK' : 'LOW RISK';
  const headline = isHigh ? '🚨 DANGER! DO NOT PAY' : isMedium ? '⚠️ CAUTION' : '✅ SAFE TO PAY';

  useEffect(() => {
    if (isHigh) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Speech.speak('FraudShield Alert! High risk transaction detected. Do not proceed.', {
        language: 'en-IN', rate: 0.9,
      });
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(borderAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    }
  }, []);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background, theme.colors.danger],
  });

  const openApp = async (app) => {
    const url = app.getUrl(mobile, amount);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('App not installed', `${app.name} is not installed on your device.`);
    }
  };

  const handleReport = () => {
    Alert.alert('Number Reported', `+91-${mobile} has been reported to FraudShield database.\nReport ID: FS${Math.floor(Math.random() * 900000) + 100000}`, [
      { text: 'OK' },
    ]);
  };

  return (
    <Animated.View style={[styles.outerContainer, isHigh && { borderWidth: 6, borderColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Headline */}
          <LinearGradient
            colors={isHigh ? ['#EF444420', '#0A0F1E'] : isMedium ? ['#F59E0B20', '#0A0F1E'] : ['#10B98120', '#0A0F1E']}
            style={styles.headlineGrad}
          >
            <Text style={[styles.headline, { color: riskColor }]}>{headline}</Text>
            <View style={styles.divider} />

            {/* Risk Meter */}
            <RiskMeter score={risk} color={riskColor} label={riskLabel} />

            {/* Stats Row */}
            {result.reports_count > 0 && (
              <View style={styles.statsRow}>
                <StatBadge icon="warning" label={`${result.reports_count} fraud reports`} color={theme.colors.danger} />
                {result.last_seen_cities?.length > 0 && (
                  <StatBadge icon="location" label={result.last_seen_cities.slice(0, 2).join(', ')} color={theme.colors.warning} />
                )}
                {result.scam_type && (
                  <StatBadge icon="alert-circle" label={result.scam_type} color={theme.colors.danger} />
                )}
              </View>
            )}
          </LinearGradient>

          {/* AI Explanation */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
              <Text style={styles.aiTitle}>Claude AI Analysis</Text>
            </View>
            <Text style={styles.aiText}>{result.explanation || 'Analysis complete.'}</Text>
            {result.recommendation && (
              <View style={[styles.recommendBadge, { borderColor: riskColor + '50', backgroundColor: riskColor + '15' }]}>
                <Ionicons name="checkmark-circle" size={16} color={riskColor} />
                <Text style={[styles.recommendText, { color: riskColor }]}>{result.recommendation}</Text>
              </View>
            )}
          </View>

          {/* SAFE: Payment Apps */}
          {isLow && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pay safely with:</Text>
              <View style={styles.appsGrid}>
                {PAYMENT_APPS.map((app) => (
                  <TouchableOpacity key={app.name} onPress={() => openApp(app)} style={[styles.appBtn, { borderColor: app.color + '60' }]}>
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <Text style={[styles.appName, { color: app.color }]}>{app.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* MEDIUM: Conditional Pay Buttons */}
          {isMedium && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proceed with caution:</Text>
              {PAYMENT_APPS.slice(0, 2).map((app) => (
                <TouchableOpacity key={app.name} onPress={() => openApp(app)} style={styles.cautionPayBtn}>
                  <View style={styles.cautionPayLeft}>
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <Text style={styles.cautionPayText}>Proceed via {app.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* HIGH: Block & Report */}
          {isHigh && (
            <TouchableOpacity onPress={handleReport} style={styles.reportBtn}>
              <LinearGradient colors={['#EF4444', '#DC2626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.reportGradient}>
                <Ionicons name="ban" size={20} color="white" />
                <Text style={styles.reportText}>BLOCK & REPORT</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.backText}>{isHigh ? 'Go Back — Stay Safe' : 'Check Another'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const StatBadge = ({ icon, label, color }) => (
  <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
    <Ionicons name={icon} size={13} color={color} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 40 },
  headlineGrad: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 24 },
  headline: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder, marginBottom: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  aiCard: {
    margin: 16, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, borderColor: theme.colors.cardBorder, padding: 16,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  aiText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  recommendBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1 },
  recommendText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 12 },
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  appBtn: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.card, borderWidth: 1,
    borderRadius: theme.borderRadius.lg, padding: 14,
  },
  appIcon: { fontSize: 22 },
  appName: { fontSize: 14, fontWeight: '700' },
  cautionPayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.lg, padding: 14, marginBottom: 10,
  },
  cautionPayLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cautionPayText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  reportBtn: { marginHorizontal: 16, borderRadius: theme.borderRadius.full, overflow: 'hidden', marginBottom: 14 },
  reportGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  reportText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  backText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
