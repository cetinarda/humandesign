import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { GATES } from '../data/gates';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { sunLongitude, moonLongitude, julianDay } from '../utils/ephemeris';
import { longitudeToGate } from '../utils/humanDesign';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'report' | 'profile') => void;
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 5) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export function HomeScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart } = useTasarimStore();

  const today = useMemo(() => {
    const jd = julianDay(new Date());
    const sun = longitudeToGate(sunLongitude(jd));
    const moon = longitudeToGate(moonLongitude(jd));
    return { sun, moon };
  }, []);

  if (!activeProfile) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.medallion}>✦</Text>
        <Text style={styles.emptyTitle}>Sakin Tasarım'a hoş geldin</Text>
        <Text style={styles.emptyDesc}>
          Doğum bilgilerinle kendine özel Human Design haritanı oluştur.
        </Text>
        <TouchableOpacity
          style={styles.emptyCTA}
          onPress={() => onNavigate('profile')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Profil oluştur"
        >
          <Text style={styles.emptyCTAText}>Profili Oluştur →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = chart ? TYPES[chart.type] : null;
  const a = chart ? AUTHORITIES[chart.authority] : null;
  const sunInfo = GATES[today.sun.gate];
  const moonInfo = GATES[today.moon.gate];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.dateLine}>
        {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
      </Text>
      <Text style={styles.greeting}>
        {greetingByHour()},{'\n'}{activeProfile.name}
      </Text>

      {/* Tek hero kart */}
      {chart && t && a && (
        <TouchableOpacity
          style={styles.hero}
          onPress={() => onNavigate('chart')}
          activeOpacity={0.92}
          accessibilityRole="button"
          accessibilityLabel={`${chart.type} haritana git`}
        >
          <Text style={styles.heroEmoji}>{t.emoji}</Text>
          <Text style={styles.heroType}>{chart.type}</Text>
          <Text style={styles.heroStrategy}>{chart.strategy}</Text>
          <Text style={styles.heroMeta}>
            {chart.profile} · {a.name.replace(' Yetki', '')}
          </Text>
          <View style={styles.heroCTA}>
            <Text style={styles.heroCTAText}>Tam haritayı gör →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Tek transit kartı — Sun + Moon yan yana */}
      <View style={styles.transit}>
        <Text style={styles.transitTitle}>Bugünün Transiti</Text>
        <View style={styles.transitRow}>
          <View style={styles.transitCol}>
            <Text style={styles.transitGlyph}>☉</Text>
            <Text style={[styles.transitGate, { color: Colors.gold }]}>
              {today.sun.gate}.{today.sun.line}
            </Text>
            <Text style={styles.transitName}>{sunInfo.name}</Text>
          </View>
          <View style={styles.transitDivider} />
          <View style={styles.transitCol}>
            <Text style={styles.transitGlyph}>☽</Text>
            <Text style={[styles.transitGate, { color: Colors.purpleSoft }]}>
              {today.moon.gate}.{today.moon.line}
            </Text>
            <Text style={styles.transitName}>{moonInfo.name}</Text>
          </View>
        </View>
        <Text style={styles.transitTheme}>
          {sunInfo.theme}
        </Text>
      </View>

      {/* İki kompakt link */}
      <View style={styles.linksRow}>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => onNavigate('chart')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Tam haritan"
        >
          <Text style={styles.linkEmoji}>✦</Text>
          <Text style={styles.linkLabel}>Harita</Text>
          <Text style={styles.linkSub}>Bodygraph ve detay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => onNavigate('report')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Haftalık rapor"
        >
          <Text style={styles.linkEmoji}>📜</Text>
          <Text style={styles.linkLabel}>Rapor</Text>
          <Text style={styles.linkSub}>Haftaya özel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },

  empty: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: Spacing.xl,
  },
  medallion: {
    fontSize: 64, color: Colors.gold, marginBottom: Spacing.lg, opacity: 0.85,
  },
  emptyTitle: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: Spacing.md, textAlign: 'center',
  },
  emptyDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.6, marginBottom: Spacing.xl,
  },
  emptyCTA: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  emptyCTAText: {
    color: Colors.background, fontWeight: Typography.weight.bold, fontSize: Typography.size.md,
  },

  dateLine: {
    fontSize: 11, letterSpacing: 1.5, color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.size.xxxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    lineHeight: Typography.size.xxxl * 1.15,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },

  hero: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    ...Shadows.gold,
  },
  heroEmoji: { fontSize: 44, marginBottom: 4 },
  heroType: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    fontWeight: Typography.weight.bold,
  },
  heroStrategy: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  heroMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  heroCTA: {
    marginTop: Spacing.lg,
  },
  heroCTAText: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
  },

  transit: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  transitTitle: {
    fontSize: 11, letterSpacing: 1.5, color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transitCol: { flex: 1, alignItems: 'center' },
  transitDivider: {
    width: 1, height: 56, backgroundColor: Colors.divider,
  },
  transitGlyph: {
    fontSize: 24, color: Colors.textSecondary, marginBottom: 2,
  },
  transitGate: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.font.serif,
    fontWeight: Typography.weight.bold,
  },
  transitName: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  transitTheme: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
    lineHeight: Typography.size.sm * 1.55,
  },

  linksRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  linkCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  linkEmoji: { fontSize: 28, marginBottom: 6 },
  linkLabel: {
    fontSize: Typography.size.md,
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  linkSub: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
